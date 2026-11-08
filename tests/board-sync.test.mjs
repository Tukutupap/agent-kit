import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  boardTarget,
  parseClosingIssues,
  parseIssueList,
  pickOption,
  run,
} from '../scripts/board-sync.mjs';

test('reads numbers, hashes, commas and ranges', () => {
  assert.deepEqual(
    parseIssueList('418 #419, 420\n426-428 #430-#431'),
    [418, 419, 420, 426, 427, 428, 430, 431],
  );
  assert.deepEqual(parseIssueList('  '), []);
  assert.deepEqual(parseIssueList('5 5 5'), [5]);
});

test('refuses anything that is not an issue number', () => {
  assert.throws(() => parseIssueList('418; rm -rf /'), /isn't an issue number/);
  assert.throws(() => parseIssueList('0'), /isn't an issue number/);
  assert.throws(() => parseIssueList('20-10'), /backwards/);
  assert.throws(() => parseIssueList('1-500'), /too long/);
});

test('finds the issues a pull request closes', () => {
  const body = [
    'Fixes #418',
    'fixes #419 and closes #420',
    'Resolved: #421',
    'Related to #500',
    'Fixes other/repo#12',
    'Fixes #418',
  ].join('\n');
  assert.deepEqual(parseClosingIssues(body), [418, 419, 420, 421]);
  assert.deepEqual(parseClosingIssues(undefined), []);
});

const status = {
  name: 'Status',
  options: [
    { id: 'a', name: 'In progress' },
    { id: 'b', name: 'In review' },
  ],
};

test('matches options loosely and leaves unchanged fields alone', () => {
  assert.equal(pickOption(status, 'in-review').id, 'b');
  assert.equal(pickOption(status, 'IN PROGRESS').id, 'a');
  assert.equal(pickOption(status, ''), null);
  assert.equal(pickOption(status, 'unchanged'), null);
  assert.throws(() => pickOption(status, 'Shipped'), /Options: In progress, In review/);
});

test('skips without a token unless one is required', async () => {
  assert.equal(await run({ BOARD_ISSUES: '418', BOARD_STATUS: 'In review' }), 0);
  await assert.rejects(
    run({ BOARD_ISSUES: '418', BOARD_STATUS: 'In review', BOARD_REQUIRE_TOKEN: 'true' }),
    /PROJECT_TOKEN is not set/,
  );
});

test('does nothing when a pull request closes no issues', async () => {
  assert.equal(await run({ BOARD_PR_BODY: 'No closing lines here', PROJECT_TOKEN: 'unused' }), 0);
});

test('an empty issue list falls back to the pull request description', async () => {
  assert.equal(await run({ BOARD_ISSUES: '', BOARD_PR_BODY: '', PROJECT_TOKEN: 'unused' }), 0);
});

test('the board defaults to the repository owner and needs a number', () => {
  assert.deepEqual(boardTarget({ GITHUB_REPOSITORY: 'someone/app', BOARD_NUMBER: '3' }), {
    repoOwner: 'someone',
    repoName: 'app',
    owner: 'someone',
    number: 3,
  });
  assert.equal(
    boardTarget({ GITHUB_REPOSITORY: 'someone/app', BOARD_NUMBER: '1', BOARD_OWNER: 'an-org' })
      .owner,
    'an-org',
  );
  assert.throws(() => boardTarget({ GITHUB_REPOSITORY: 'someone/app' }), /BOARD_NUMBER/);
  assert.throws(() => boardTarget({ GITHUB_REPOSITORY: 'someone/app', BOARD_NUMBER: '0' }), /BOARD_NUMBER/);
  assert.throws(() => boardTarget({ BOARD_NUMBER: '1' }), /GITHUB_REPOSITORY/);
});
