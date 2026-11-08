import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { checkPullRequest, isExempt, sections } from '../scripts/pr-format-check.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
// The template a project gets, and the page that explains it.
const template = readFileSync(join(root, 'template/.github/pull_request_template.md'), 'utf8');
const issueTemplate = readFileSync(join(root, 'template/.github/ISSUE_TEMPLATE/issue.md'), 'utf8');
const workflow = readFileSync(
  join(root, 'template/knowledge/decisions/issue-workflow.md.jinja'),
  'utf8',
);

const title = 'Keep dependency caches on main';
const filled = `## What this fixes

Fixes #288

## What changed

Added a workflow.

## Why

Caches were not shared.

## How it was checked

- [x] \`pnpm test:all\` passed

## What wasn't covered

Nothing.

## Knowledge

- [ ] Updated
- [x] Nothing needed updating, because: no knowledge changed
`;
const check = (body, name = title) => checkPullRequest({ title: name, body, template });

test('a filled-in description passes', () => {
  assert.deepEqual(check(filled), []);
});

test('a description edited in the browser passes', () => {
  assert.deepEqual(check(filled.replace(/\n/g, '\r\n')), []);
});

test('a renamed section fails', () => {
  const [problem] = check(filled.replace("## What wasn't covered", '## Not tested'));
  assert.match(problem, /^Sections: /);
  assert.match(problem, /Not tested/);
});

test('an extra section fails, but a deeper heading passes', () => {
  assert.match(check(`${filled}\n## Worth a look\n\nThis.\n`)[0], /^Sections: /);
  assert.deepEqual(check(filled.replace('Added a workflow.', '### Worth a look\n\nThis.')), []);
});

test('sections out of order fail', () => {
  const swapped = filled.replace('## What changed', '## TEMP').replace('## Why', '## What changed');
  assert.match(check(swapped.replace('## TEMP', '## Why'))[0], /^Sections: /);
});

test('an empty or missing description fails', () => {
  assert.match(check('')[0], /found none/);
  assert.match(check(null)[0], /found none/);
});

test('a section holding only a comment is empty', () => {
  const problems = check(filled.replace('Caches were not shared.', '<!-- Why -->'));
  assert.deepEqual(problems, ['Why: this section is empty.']);
});

test('the unfilled template fails', () => {
  const problems = check(template);
  assert.ok(problems.includes('What changed: this section is empty.'));
  assert.ok(problems.includes('What this fixes: add a "Fixes #N" line for every issue.'));
  assert.ok(problems.includes('Knowledge: tick one of the boxes.'));
});

test('a heading in a code block is not a section', () => {
  assert.deepEqual(
    check(filled.replace('Added a workflow.', 'Added:\n\n```md\n## Not a section\n```')),
    [],
  );
});

test('a title with an issue number or a prefix fails', () => {
  assert.match(check(filled, `${title} (#288)`)[0], /issue number/);
  assert.match(check(filled, 'fix: Keep caches')[0], /prefix/);
  assert.match(check(filled, 'test(api): Keep caches')[0], /prefix/);
});

test('only Dependabot is exempt by default', () => {
  assert.equal(isExempt('dependabot[bot]'), true);
  for (const author of ['Tukutupap', 'dependabot', 'claude[bot]', '', undefined])
    assert.equal(isExempt(author), false, `${author} should be checked`);
  assert.equal(isExempt('renovate[bot]', ['renovate[bot]']), true);
});

test('a template without the issue and knowledge sections only checks the general rules', () => {
  const plain = '## Summary\n\n## Testing\n';
  assert.deepEqual(
    checkPullRequest({ title, body: '## Summary\n\nA change.\n\n## Testing\n\nRan it.', template: plain }),
    [],
  );
});

test("the kit's own pull request template matches the one it ships", () => {
  assert.equal(readFileSync(join(root, '.github/pull_request_template.md'), 'utf8'), template);
});

test('the workflow page lists every section in both templates', () => {
  const body = issueTemplate.replace(/^---[\s\S]*?---\n/, '');
  for (const { name } of [...sections(template), ...sections(body)])
    assert.ok(workflow.includes(`| ${name} |`), `${name} is missing from the workflow page`);
});
