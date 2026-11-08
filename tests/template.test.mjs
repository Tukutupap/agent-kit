import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import {
  existsSync,
  lstatSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  realpathSync,
  rmSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join, relative } from 'node:path';
import process from 'node:process';
import { test } from 'node:test';
import { checkKnowledge } from '../scripts/knowledge-check.mjs';
import { checkPullRequest } from '../scripts/pr-format-check.mjs';
import { COPIES, kit } from '../scripts/sync-skills.mjs';

// Regular files under a path. Symlinks are left out, since the template's
// point at folders that only exist once it's rendered.
const files = (path) => {
  const stat = lstatSync(path);
  if (stat.isSymbolicLink()) return [];
  return stat.isDirectory() ? readdirSync(path).flatMap((name) => files(join(path, name))) : [path];
};

test('the template carries the same skills and hook as the plugin', () => {
  for (const [from, to] of COPIES) {
    const source = files(from).map((file) => relative(from, file) || '.');
    const copy = existsSync(to) ? files(to).map((file) => relative(to, file) || '.') : [];
    assert.deepEqual(copy.sort(), source.sort(), 'Run npm run sync:skills');
    for (const name of source) {
      const a = name === '.' ? from : join(from, name);
      const b = name === '.' ? to : join(to, name);
      assert.equal(readFileSync(b, 'utf8'), readFileSync(a, 'utf8'), `${name}: run npm run sync:skills`);
    }
  }
});

// GitHub downloads the whole kit to run an action, and a symlink whose target
// doesn't exist in the kit makes that download fail for every check.
test('every symlink in the kit points at something in the kit', () => {
  const links = (path) => {
    const stat = lstatSync(path);
    if (stat.isSymbolicLink()) return [path];
    if (!stat.isDirectory() || path.endsWith('.git')) return [];
    return readdirSync(path).flatMap((name) => links(join(path, name)));
  };
  for (const link of links(kit)) {
    assert.ok(existsSync(link), `${relative(kit, link)} points at nothing`);
    assert.ok(!relative(kit, realpathSync(link)).startsWith('..'), `${relative(kit, link)} leaves the kit`);
  }
});

test('nothing in the kit names the product it came from', () => {
  for (const folder of ['template', 'plugin', 'checks', 'scripts']) {
    for (const file of files(join(kit, folder))) {
      if (file.endsWith('sync-skills.mjs')) continue;
      const text = readFileSync(file, 'utf8');
      assert.doesNotMatch(text, /bring[- ]?a[- ]?chef|\bchefs?\b/i, relative(kit, file));
    }
  }
});

test('the plugin and marketplace manifests agree', () => {
  const marketplace = JSON.parse(readFileSync(join(kit, '.claude-plugin/marketplace.json'), 'utf8'));
  const plugin = JSON.parse(readFileSync(join(kit, 'plugin/.claude-plugin/plugin.json'), 'utf8'));
  const hooks = JSON.parse(readFileSync(join(kit, 'plugin/hooks/hooks.json'), 'utf8'));
  const entry = marketplace.plugins.find((p) => p.name === plugin.name);
  assert.ok(entry, 'the marketplace lists the plugin');
  assert.equal(entry.version, plugin.version);
  assert.ok(existsSync(join(kit, entry.source, '.claude-plugin/plugin.json')));
  assert.ok(hooks.hooks.Stop);
  const pkg = JSON.parse(readFileSync(join(kit, 'package.json'), 'utf8'));
  assert.equal(pkg.version, plugin.version, 'package.json and the plugin share a version');
});

const copier = (() => {
  try {
    execFileSync('copier', ['--version'], { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
})();
const needCopier = process.env.REQUIRE_COPIER === 'true';
if (needCopier && !copier) throw new Error('REQUIRE_COPIER is set, but copier is not installed.');

const render = (answers) => {
  const out = mkdtempSync(join(tmpdir(), 'agent-kit-render-'));
  const data = Object.entries(answers).flatMap(([key, value]) => ['-d', `${key}=${value}`]);
  execFileSync('copier', ['copy', '--defaults', '--quiet', ...data, kit, out], { stdio: 'pipe' });
  return out;
};

const cases = [
  { name: 'repo skills with a board', answers: { board_number: 3, skills_from: 'repo' } },
  { name: 'plugin skills without a board', answers: { board_number: 0, skills_from: 'plugin' } },
];

for (const { name, answers } of cases) {
  test(`a project rendered with ${name} passes the kit's checks`, { skip: !copier }, () => {
    const out = render({ product_name: 'Sample Product', github_owner: 'someone', ...answers });
    try {
      assert.deepEqual(checkKnowledge(join(out, 'knowledge')), []);

      const rendered = files(out).filter((file) => !file.includes(`${join(out, '.git')}`));
      for (const file of rendered) {
        const text = readFileSync(file, 'utf8');
        // GitHub expressions (${{ }}) are expected. Anything else is a missed Jinja tag.
        assert.doesNotMatch(text.replace(/\$\{\{[^}]*\}\}/g, ''), /\{\{|\{%/, relative(out, file));
        assert.doesNotMatch(relative(out, file), /\{%|\{\{/);
      }

      const settings = JSON.parse(readFileSync(join(out, '.claude/settings.json'), 'utf8'));
      const workflows = readdirSync(join(out, '.github/workflows'));
      if (answers.skills_from === 'repo') {
        assert.ok(settings.hooks.Stop);
        assert.ok(existsSync(join(out, '.claude/skills/knowledge-review/SKILL.md')));
        assert.ok(existsSync(join(out, '.agents/hooks/knowledge-reminder.mjs')));
      } else {
        assert.equal(settings.enabledPlugins['agent-kit@agent-kit'], true);
        assert.ok(!existsSync(join(out, '.agents')));
        assert.ok(!existsSync(join(out, '.claude/skills/knowledge-review')));
      }
      assert.equal(workflows.includes('board-sync.yml'), answers.board_number > 0);

      // Every kit action a workflow calls exists in the kit.
      for (const workflow of workflows) {
        const text = readFileSync(join(out, '.github/workflows', workflow), 'utf8');
        for (const [, path] of text.matchAll(/uses: Tukutupap\/agent-kit\/([\w/-]+)@v1/g)) {
          assert.ok(existsSync(join(kit, path, 'action.yml')), `${workflow}: ${path}`);
        }
      }

      const template = readFileSync(join(out, '.github/pull_request_template.md'), 'utf8');
      assert.deepEqual(
        checkPullRequest({ title: 'Add a thing', body: template, template }).length > 0,
        true,
        'the unfilled template fails',
      );
    } finally {
      rmSync(out, { recursive: true, force: true });
    }
  });
}
