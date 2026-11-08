import assert from 'node:assert/strict';
import { test } from 'node:test';
import { checkRelease } from '../scripts/release-check.mjs';

const versions = { 'package.json': '1.0.1', 'plugin.json': '1.0.1' };

test('a matching, untagged version is released with its major tag', () => {
  assert.deepEqual(checkRelease('1.0.1', { versions, tags: ['v1', 'v1.0.0'] }), {
    problems: [],
    tag: 'v1.0.1',
    major: 'v1',
  });
  assert.equal(checkRelease('v1.0.1', { versions, tags: [] }).tag, 'v1.0.1');
});

test('a tagged, mismatched or malformed version is refused', () => {
  assert.match(checkRelease('1.0.1', { versions, tags: ['v1.0.1'] }).problems[0], /already tagged/);
  assert.match(checkRelease('1.1.0', { versions, tags: [] }).problems[0], /not 1\.1\.0/);
  for (const bad of ['1.0', 'v1', '1.0.1; rm -rf /', '', undefined]) {
    assert.match(checkRelease(bad, { versions, tags: [] }).problems[0], /isn't a version/);
  }
});
