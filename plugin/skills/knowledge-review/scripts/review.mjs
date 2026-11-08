// Lists what a knowledge review should look at. It only reads, and it can't
// decide anything: every line is a candidate for a person or agent to check.
// Run it from the project root:
//   node <this skill's folder>/scripts/review.mjs [last reviewed commit]
// The knowledge folder comes from agent-kit.json ("knowledge.root"), or is
// knowledge/ by default.
import { execFileSync } from 'node:child_process';
import console from 'node:console';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import process from 'node:process';

const run = (command, args) => {
  try {
    return execFileSync(command, args, {
      cwd: repo,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    });
  } catch {
    return null;
  }
};

// The project is wherever this runs from, not where the skill is installed,
// because the skill can live in a plugin outside the project.
const repo = (() => {
  try {
    return execFileSync('git', ['rev-parse', '--show-toplevel'], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
  } catch {
    return process.cwd();
  }
})();
const settings = (() => {
  try {
    return JSON.parse(readFileSync(join(repo, 'agent-kit.json'), 'utf8'));
  } catch {
    return {};
  }
})();
const root = (settings.knowledge?.root ?? 'knowledge').replace(/\/$/, '');
const knowledge = join(repo, root);
if (!existsSync(knowledge)) {
  console.error(`${root}/ wasn't found in ${repo}. Run this from the project root.`);
  process.exit(1);
}
// Dated records. They describe their own moment, so old claims in them are fine.
const RECORDS = [`${root}/archive/`, `${root}/sweeps/`];
const TEMPLATE = /-0+-template\.md$/;
// Paths in backticks that start with one of the project's own top-level folders.
const topFolders = readdirSync(repo, { withFileTypes: true })
  .filter((entry) => entry.isDirectory() && entry.name !== '.git' && entry.name !== 'node_modules')
  .map((entry) => entry.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
const REPO_PATH = new RegExp(
  `\`((?:${topFolders.join('|') || 'knowledge'})\\/[\\w@./()[\\]-]+)\``,
  'g',
);
// Files that count as code: anything outside the knowledge folder that isn't Markdown.
const isCode = (file) => file && !file.startsWith(`${root}/`) && !/\.md$/i.test(file);
const ID = /\b(GAP|ASM|ADR)[- ](\d{3,5})(-[b-z])?\b/g;
const STALE_WORDS =
  /before merge|not (?:yet )?deployed|until deployed|pending CI|this (?:change|PR|pull request|follow-up|task)\b|on a review branch|Wave \d|needs? owner confirmation/i;
const REPLACED_WORDS = /\bsupersede[sd]?\b|\boverrides?\b|replaced by/i;

const pages = (directory) =>
  readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return pages(path);
    return entry.name.endsWith('.md') ? [path] : [];
  });

const field = (text, name) => text.match(new RegExp(`^${name}: "?(.*?)"?$`, 'm'))?.[1] ?? null;
const words = (text) => text.split(/\s+/).filter(Boolean).length;
const section = (title, lines) => {
  console.log(`\n## ${title} (${lines.length})`);
  for (const line of lines) console.log(`- ${line}`);
};

const all = pages(knowledge)
  .filter((path) => !TEMPLATE.test(path))
  .map((path) => {
    const text = readFileSync(path, 'utf8');
    return { path, name: relative(repo, path), text };
  });
const live = all.filter((page) => !RECORDS.some((prefix) => page.name.startsWith(prefix)));
const gaps = live.filter((page) => page.name.startsWith(`${root}/launch/gaps/`));
const assumptions = live.filter((page) => page.name.startsWith(`${root}/decisions/asm/`));
const adrs = live.filter((page) => page.name.startsWith(`${root}/decisions/adr/`));
const statusOf = (page) => field(page.text, 'gap_status');
const adrStatusOf = (page) => field(page.text, 'adr_status');
const unresolved = gaps.filter((page) => statusOf(page) !== 'resolved');

const totals = new Map();
for (const page of all) {
  const area = relative(knowledge, page.path).split('/')[0];
  totals.set(area, (totals.get(area) ?? 0) + words(page.text));
}
console.log(
  `# Knowledge review candidates\n\n${all.length} pages, ${[...totals.values()].reduce((a, b) => a + b, 0)} words`,
);
console.log(
  `Gaps: ${gaps.length} (${unresolved.length} not resolved). Assumptions: ${assumptions.length}. ADRs: ${adrs.length}.`,
);
section(
  'Words by area',
  [...totals].sort((a, b) => b[1] - a[1]).map(([area, count]) => `${area}: ${count}`),
);
section(
  'Largest pages',
  [...all]
    .sort((a, b) => words(b.text) - words(a.text))
    .slice(0, 10)
    .map((page) => `${page.name}: ${words(page.text)}`),
);

section(
  'Gaps still needing review',
  gaps.filter((page) => statusOf(page) === 'needs-review').map((page) => page.name),
);

const known = new Set(
  [...gaps, ...assumptions, ...adrs].map((page) => field(page.text, 'id') ?? '').filter(Boolean),
);
for (const page of adrs) {
  const number = page.name.match(/adr-(\d+)/)?.[1];
  if (number) known.add(`ADR-${number}`);
}
const deadIds = [];
const deadPaths = [];
for (const page of [
  ...live,
  ...['AGENTS.md', 'CLAUDE.md']
    .filter((name) => existsSync(join(repo, name)))
    .map((name) => ({ name, text: readFileSync(join(repo, name), 'utf8') })),
]) {
  // The index explains numbering with made-up IDs.
  const ids = page.name === `${root}/index.md` ? [] : page.text.matchAll(ID);
  for (const [, kind, number, letter = ''] of ids) {
    const id = `${kind}-${number}${letter}`;
    if (!known.has(id) && !/^(GAP|ASM|ADR)-0+$/.test(id)) deadIds.push(`${page.name}: ${id}`);
  }
  for (const [, path] of page.text.matchAll(REPO_PATH)) {
    const clean = path.replace(/\/$/, '');
    const ignored = run('git', ['check-ignore', '-q', clean]) !== null;
    if (!/[<*]|\.\.\./.test(path) && !existsSync(join(repo, clean)) && !ignored) {
      deadPaths.push(`${page.name}: ${path}`);
    }
  }
}
section('IDs that no longer exist', [...new Set(deadIds)]);
section('Repository paths that no longer exist', [...new Set(deadPaths)]);

const closedOutput = run('gh', [
  'issue',
  'list',
  '--state',
  'closed',
  '--limit',
  '2000',
  '--json',
  'number',
  '-q',
  '.[].number',
]);
if (closedOutput === null) {
  console.log('\n## Gaps whose issues are all closed\n- Skipped: the gh command is not available.');
} else {
  const closed = new Set(closedOutput.split('\n').filter(Boolean));
  const referenced = (text) => [
    ...new Set([...text.matchAll(/(?:\/issues\/|#)(\d{2,4})\b/g)].map((match) => match[1])),
  ];
  section(
    'Gaps whose issues are all closed',
    unresolved.flatMap((page) => {
      const issues = referenced(page.text);
      return issues.length && issues.every((number) => closed.has(number))
        ? [`${page.name}: ${issues.map((number) => `#${number}`).join(', ')}`]
        : [];
    }),
  );
}

const mentions = (page, pattern) =>
  page.text
    .replace(/^---\n[\s\S]*?\n---\n/, '')
    .split('\n')
    .filter((line) => pattern.test(line))
    .map((line) => `${page.name}: ${line.trim().slice(0, 140)}`);

section(
  'Assumptions or ADRs that mention replacing something, with no superseded mark',
  [...assumptions, ...adrs]
    .filter(
      (page) => !field(page.text, 'superseded_by') && !/superseded/i.test(adrStatusOf(page) ?? ''),
    )
    .flatMap((page) => mentions(page, REPLACED_WORDS)),
);
section(
  'Wording that goes stale',
  [...gaps.filter((page) => statusOf(page) !== 'resolved'), ...assumptions, ...adrs]
    .filter((page) => !field(page.text, 'superseded_by'))
    .flatMap((page) => mentions(page, STALE_WORDS)),
);

const since = process.argv[2];
if (since) {
  const log = run('git', ['log', '--format=%h %s', `${since}..HEAD`]);
  const commits = (log ?? '').split('\n').filter(Boolean);
  const silent = commits.filter((commit) => {
    const files = run('git', ['show', '--name-only', '--format=', commit.split(' ')[0]]) ?? '';
    return (
      files.split('\n').some(isCode) && !files.split('\n').some((file) => file.startsWith(`${root}/`))
    );
  });
  section(`Code changes since ${since} that left knowledge/ alone`, silent);
  const changed = run('git', ['diff', '--name-only', since, 'HEAD']) ?? '';
  section(
    `Code files changed since ${since}`,
    changed.split('\n').filter((file) => isCode(file) && !/(^|\/)(tests?|__tests__)\//.test(file)),
  );
  section(`All commits since ${since}`, commits);
}
