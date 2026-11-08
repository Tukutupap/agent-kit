#!/usr/bin/env node
// Claude Code Stop hook. When the agent is about to stop with code changed on
// this branch but nothing changed in knowledge/, it asks the agent once to
// check whether the knowledge base needs updating (AGENTS.md section 2).
//
// It reminds once per set of changed files, so an agent that decides nothing
// needed updating can stop on the next try. It never fails the session: any
// error means no reminder. Set AGENT_KIT_KNOWLEDGE_REMINDER=off to turn it off.
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import process from 'node:process';
import { pathToFileURL } from 'node:url';

const git = (cwd, args) =>
  execFileSync('git', args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });

const tryGit = (cwd, args) => {
  try {
    return git(cwd, args);
  } catch {
    return null;
  }
};

// Files changed on this branch since it left the default branch, plus
// anything not committed yet.
export function changedFiles(repo) {
  const files = new Set();
  const base =
    ['origin/HEAD', 'origin/main', 'main', 'origin/master', 'master']
      .map((ref) => tryGit(repo, ['merge-base', 'HEAD', ref])?.trim())
      .find(Boolean) ?? null;
  if (base) {
    for (const file of (tryGit(repo, ['diff', '--name-only', base, 'HEAD']) ?? '').split('\n')) {
      if (file) files.add(file);
    }
  }
  const status = tryGit(repo, ['status', '--porcelain', '--untracked-files=all']) ?? '';
  for (const line of status.split('\n')) {
    if (!line.trim()) continue;
    const path = line.slice(3);
    files.add(path.includes(' -> ') ? path.split(' -> ')[1] : path);
  }
  return [...files].map((file) => file.replace(/^"(.*)"$/, '$1')).sort();
}

export function knowledgeRoot(repo) {
  try {
    const settings = JSON.parse(readFileSync(join(repo, 'agent-kit.json'), 'utf8'));
    return (settings.knowledge?.root ?? 'knowledge').replace(/\/$/, '');
  } catch {
    return 'knowledge';
  }
}

// Code is anything outside the knowledge folder that isn't Markdown.
export function needsReminder(files, root) {
  const inKnowledge = (file) => file.startsWith(`${root}/`);
  const code = files.filter((file) => !inKnowledge(file) && !/\.md$/i.test(file));
  return { code, remind: code.length > 0 && !files.some(inKnowledge) };
}

export function decide(input, env = process.env) {
  if (env.AGENT_KIT_KNOWLEDGE_REMINDER === 'off' || input.stop_hook_active) return null;
  const repo = tryGit(input.cwd || process.cwd(), ['rev-parse', '--show-toplevel'])?.trim();
  if (!repo) return null;
  const root = knowledgeRoot(repo);
  if (!existsSync(join(repo, root))) return null;
  const { code, remind } = needsReminder(changedFiles(repo), root);
  if (!remind) return null;

  // Remind once for each set of changed files in a session.
  const stateDir = join(tmpdir(), 'agent-kit-knowledge-reminder');
  const key = createHash('sha256')
    .update(`${input.session_id ?? ''}\n${repo}`)
    .digest('hex')
    .slice(0, 16);
  const fingerprint = createHash('sha256').update(code.join('\n')).digest('hex');
  const stateFile = join(stateDir, key);
  if (existsSync(stateFile) && readFileSync(stateFile, 'utf8') === fingerprint) return null;
  mkdirSync(stateDir, { recursive: true });
  writeFileSync(stateFile, fingerprint);

  const sample = code.slice(0, 5).join(', ') + (code.length > 5 ? `, and ${code.length - 5} more` : '');
  return {
    decision: 'block',
    reason:
      `Code changed on this branch (${sample}), but nothing in ${root}/ did. ` +
      `Before finishing, check AGENTS.md section 2: add or update the pages this change needs ` +
      `(an assumption, ADR, gap, feature page or lesson), or say in the pull request why nothing needed updating. ` +
      `This reminder shows once for these changes.`,
  };
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  try {
    const input = JSON.parse(readFileSync(0, 'utf8') || '{}');
    const result = decide(input);
    if (result) process.stdout.write(JSON.stringify(result));
  } catch {
    // A reminder is never worth breaking the session for.
  }
  process.exit(0);
}
