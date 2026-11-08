import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import { decide, needsReminder } from '../plugin/hooks/knowledge-reminder.mjs';

test('code without knowledge changes needs a reminder', () => {
  assert.deepEqual(needsReminder(['src/a.ts', 'README.md'], 'knowledge'), {
    code: ['src/a.ts'],
    remind: true,
  });
  assert.equal(needsReminder(['src/a.ts', 'knowledge/lessons/a.md'], 'knowledge').remind, false);
  assert.equal(needsReminder(['README.md', 'docs/a.md'], 'knowledge').remind, false);
  assert.equal(needsReminder([], 'knowledge').remind, false);
});

test('it reminds once per set of changes, and never while already continuing', () => {
  const repo = mkdtempSync(join(tmpdir(), 'agent-kit-hook-'));
  const git = (...args) =>
    execFileSync('git', ['-c', 'user.name=t', '-c', 'user.email=t@t', ...args], {
      cwd: repo,
      stdio: 'ignore',
    });
  try {
    git('init', '-q', '-b', 'main');
    mkdirSync(join(repo, 'knowledge'));
    writeFileSync(join(repo, 'knowledge/index.md'), '# Index\n');
    git('add', '-A');
    git('commit', '-qm', 'start');
    git('checkout', '-qb', 'work');

    const session = `test-${Date.now()}`;
    const input = { session_id: session, cwd: repo };
    assert.equal(decide(input), null, 'nothing changed yet');

    writeFileSync(join(repo, 'app.js'), 'x\n');
    assert.equal(decide({ ...input, stop_hook_active: true }), null);
    assert.equal(decide(input, { AGENT_KIT_KNOWLEDGE_REMINDER: 'off' }), null);
    const first = decide(input);
    assert.equal(first.decision, 'block');
    assert.match(first.reason, /app\.js/);
    assert.equal(decide(input), null, 'the same changes are not reminded twice');

    writeFileSync(join(repo, 'other.js'), 'y\n');
    assert.equal(decide(input)?.decision, 'block', 'new changes are reminded');

    git('add', '-A');
    git('commit', '-qm', 'code');
    writeFileSync(join(repo, 'knowledge/lesson.md'), 'z\n');
    assert.equal(decide({ ...input, session_id: `${session}-b` }), null, 'knowledge changed too');
  } finally {
    rmSync(repo, { recursive: true, force: true });
  }
});

test('a folder without knowledge/ is left alone', () => {
  const repo = mkdtempSync(join(tmpdir(), 'agent-kit-hook-'));
  try {
    execFileSync('git', ['init', '-q'], { cwd: repo });
    writeFileSync(join(repo, 'app.js'), 'x\n');
    assert.equal(decide({ session_id: 'none', cwd: repo }), null);
  } finally {
    rmSync(repo, { recursive: true, force: true });
  }
});
