// Checks that knowledge/ is well-formed: headers, IDs, links and the index.
// It can't tell whether a page is still true. Reviews and sweeps do that.
// The folder layout comes from agent-kit.json (see scripts/config.mjs).
import console from 'node:console';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import { DEFAULTS, loadConfig } from './config.mjs';

// `status` is the Open Knowledge Format's lifecycle field, so a project's own
// states use other fields, such as gap_status and adr_status.
const OKF_STATUSES = ['draft', 'stable', 'deprecated'];

// New files are named by topic, and the name after the prefix is the ID:
// asm-client-ip.md is ASM-client-ip. Older files named by issue number, with a
// letter for a second file from one issue, still pass. Their numbers are padded
// to the folder's width and never padded past it.
export const numberPattern = ({ prefix, digits = 3 }) => {
  const lower = prefix.toLowerCase();
  return new RegExp(
    `^${lower}-(\\d{${digits}}|[1-9]\\d{${digits},})(-[b-z])?-[a-z0-9-]+\\.md$`,
  );
};

export const topicPattern = ({ prefix }) =>
  new RegExp(`^${prefix.toLowerCase()}-([a-z][a-z0-9]*(?:-[a-z0-9]+)*)\\.md$`);

// The ID a file name gives, or null if the name follows neither format.
// Templates have no ID of their own.
export const idFor = (rule, base) => {
  const topic = base.match(topicPattern(rule));
  if (topic) return { id: `${rule.prefix}-${topic[1]}`, template: topic[1] === 'template' };
  const numbered = base.match(numberPattern(rule));
  if (numbered) {
    return { id: `${rule.prefix}-${numbered[1]}${numbered[2] ?? ''}`, template: Number(numbered[1]) === 0 };
  }
  return null;
};

const pages = (directory) =>
  readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return pages(path);
    return entry.name.endsWith('.md') ? [path] : [];
  });

const header = (text) => {
  const match = text.replace(/\r\n/g, '\n').match(/^---\n([\s\S]*?)\n---\n/);
  if (!match) return null;
  const fields = {};
  for (const line of match[1].split('\n')) {
    const field = line.match(/^([a-z_]+): (.*)$/);
    if (field) fields[field[1]] = field[2].replace(/^"(.*)"$/, '$1');
  }
  return fields;
};

const linkProblems = (root, file, name, text) => {
  const prose = text.replace(/```[\s\S]*?```/g, '').replace(/`[^`\n]*`/g, '');
  return [...prose.matchAll(/\]\(([^)\s]+)\)/g)].flatMap(([, link]) => {
    const target = link.split('#')[0];
    if (!target || /^[a-z]+:/.test(target)) return [];
    const path = target.startsWith('/') ? join(root, target) : resolve(dirname(file), target);
    return existsSync(path) ? [] : [`${name}: broken link ${link}`];
  });
};

export function checkKnowledge(root, options = DEFAULTS.knowledge) {
  const numberedFolders = options.numbered ?? {};
  const notInIndex = options.notInIndex ?? [];
  const problems = [];
  const ids = new Map();
  if (!existsSync(root)) return [`${root}: folder missing`];
  const indexPath = join(root, 'index.md');
  const index = existsSync(indexPath) ? readFileSync(indexPath, 'utf8') : '';
  if (!index) problems.push('index.md: missing');

  for (const file of pages(root)) {
    const name = relative(root, file).split('\\').join('/');
    const text = readFileSync(file, 'utf8');
    problems.push(...linkProblems(root, file, name, text));
    if (name === 'index.md') continue;

    const fields = header(text);
    if (!fields) {
      problems.push(`${name}: no header`);
      continue;
    }
    for (const field of ['type', 'title', 'description']) {
      if (!fields[field]) problems.push(`${name}: header has no ${field}`);
    }

    const folder = dirname(name);
    const numbered = numberedFolders[folder];
    const base = name.slice(folder.length + 1);
    const named = numbered ? idFor(numbered, base) : null;
    if (numbered && !named) {
      problems.push(`${name}: file name doesn't follow the folder's format`);
    } else if (named && !named.template) {
      if (fields.id !== named.id) problems.push(`${name}: header id should be ${named.id}`);
      ids.set(named.id, [...(ids.get(named.id) ?? []), name]);
    }
    if (fields.status && !OKF_STATUSES.includes(fields.status)) {
      problems.push(`${name}: status must be one of ${OKF_STATUSES.join(', ')}`);
    }
    const state = numbered?.state;
    const isTemplate = Boolean(named?.template);
    if (state && !isTemplate && !state.values.includes(fields[state.field])) {
      problems.push(`${name}: ${state.field} must be one of ${state.values.join(', ')}`);
    }
    const replaced =
      (state && state.done && fields[state.field] === state.done) ||
      fields.superseded_by ||
      fields.adr_status === 'Superseded';
    if (replaced && fields.status !== 'deprecated') {
      problems.push(`${name}: a resolved or superseded page needs status: deprecated`);
    }
    if (!notInIndex.some((prefix) => name.startsWith(prefix))) {
      if (!index.includes(`(/${name})`)) problems.push(`${name}: not listed in index.md`);
    }
  }

  for (const [id, files] of ids) {
    if (files.length > 1) problems.push(`${id}: used by ${files.join(', ')}`);
  }
  return problems;
}

export function main(repo = process.cwd()) {
  const config = loadConfig(repo);
  const root = resolve(repo, config.knowledge.root);
  const problems = checkKnowledge(root, config.knowledge);
  for (const problem of problems) console.error(problem);
  if (problems.length) {
    console.error(
      `\n${problems.length} problem(s). See the rules in ${config.knowledge.root}/index.md.`,
    );
    return 1;
  }
  console.log(`${config.knowledge.root}/ is well-formed`);
  return 0;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  process.exitCode = main(process.argv[2] ? resolve(process.argv[2]) : process.cwd());
}
