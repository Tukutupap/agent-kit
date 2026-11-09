import assert from 'node:assert/strict';
import { test } from 'node:test';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { merge, DEFAULTS } from '../scripts/config.mjs';
import { checkKnowledge, idFor, numberPattern, topicPattern } from '../scripts/knowledge-check.mjs';

// Every page needs a description, so fixtures get one unless a test passes null.
const page = (fields, body = '# Page\n') =>
  `---\n${Object.entries({ description: 'One sentence.', ...fields })
    .filter(([, value]) => value !== null)
    .map(([key, value]) => `${key}: ${value}`)
    .join('\n')}\n---\n\n${body}`;

const check = (files, options) => {
  const root = mkdtempSync(join(tmpdir(), 'knowledge-'));
  try {
    for (const [name, text] of Object.entries(files)) {
      mkdirSync(dirname(join(root, name)), { recursive: true });
      writeFileSync(join(root, name), text);
    }
    return checkKnowledge(root, options);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
};

const asm = page({ type: 'Assumption', id: 'ASM-001', title: 'One' });
const gap = page({ type: 'Gap', id: 'GAP-001', title: 'One', gap_status: 'open' });

const kit = join(dirname(fileURLToPath(import.meta.url)), '..');

test("the kit's own knowledge folder passes", () => {
  assert.deepEqual(checkKnowledge(join(kit, 'knowledge')), []);
});


test('a well-formed folder passes', () => {
  assert.deepEqual(
    check({
      'index.md': '[Guide](/lessons/guide.md)',
      'lessons/guide.md': page({ type: 'Lesson', title: 'Guide' }),
      'decisions/asm/asm-001-one.md': asm,
      'launch/gaps/gap-001-one.md': gap,
    }),
    [],
  );
});

test('two files with the same number fail', () => {
  const problems = check({
    'index.md': 'Index',
    'decisions/asm/asm-001-one.md': asm,
    'decisions/asm/asm-001-two.md': asm,
  });
  assert.equal(problems.length, 1);
  assert.match(problems[0], /ASM-001: used by/);
});

test('a number above 999 passes', () => {
  assert.deepEqual(
    check({
      'index.md': 'Index',
      'decisions/asm/asm-1234-one.md': page({ type: 'Assumption', id: 'ASM-1234', title: 'One' }),
    }),
    [],
  );
});

test('a second file from one issue passes with a letter', () => {
  assert.deepEqual(
    check({
      'index.md': 'Index',
      'decisions/asm/asm-298-one.md': page({ type: 'Assumption', id: 'ASM-298', title: 'One' }),
      'decisions/asm/asm-298-b-two.md': page({ type: 'Assumption', id: 'ASM-298-b', title: 'Two' }),
    }),
    [],
  );
});

test('two files with the same letter fail', () => {
  const second = page({ type: 'Assumption', id: 'ASM-298-b', title: 'Two' });
  const problems = check({
    'index.md': 'Index',
    'decisions/asm/asm-298-b-one.md': second,
    'decisions/asm/asm-298-b-two.md': second,
  });
  assert.equal(problems.length, 1);
  assert.match(problems[0], /ASM-298-b: used by/);
});

test('a lettered file needs the letter in its header id', () => {
  const problems = check({
    'index.md': 'Index',
    'decisions/asm/asm-298-b-two.md': page({ type: 'Assumption', id: 'ASM-298', title: 'Two' }),
  });
  assert.match(problems[0], /header id should be ASM-298-b/);
});

test('a number padded past the usual width fails', () => {
  const problems = check({
    'index.md': 'Index',
    'decisions/asm/asm-0298-one.md': page({ type: 'Assumption', id: 'ASM-0298', title: 'One' }),
  });
  assert.match(problems[0], /doesn't follow the folder's format/);
});

test('a header id that does not match the file name fails', () => {
  const problems = check({ 'index.md': 'Index', 'decisions/asm/asm-002-two.md': asm });
  assert.match(problems[0], /header id should be ASM-002/);
});

test('a file name outside the format fails', () => {
  const problems = check({ 'index.md': 'Index', 'launch/gaps/rwy-001-one.md': gap });
  assert.match(problems[0], /doesn't follow the folder's format/);
});

test('a missing header or title fails', () => {
  const problems = check({
    'index.md': '[A](/a.md) [B](/b.md)',
    'a.md': '# No header\n',
    'b.md': page({ type: 'Lesson' }),
  });
  assert.deepEqual(problems.sort(), ['a.md: no header', 'b.md: header has no title']);
});

test('an unknown gap status fails', () => {
  const problems = check({
    'index.md': 'Index',
    'launch/gaps/gap-001-one.md': page({
      type: 'Gap',
      id: 'GAP-001',
      title: 'One',
      gap_status: 'done',
    }),
  });
  assert.deepEqual(problems, [
    'launch/gaps/gap-001-one.md: gap_status must be one of open, resolved',
  ]);
});

test('status only takes the OKF lifecycle values', () => {
  const problems = check({
    'index.md': '[Guide](/lessons/guide.md)',
    'lessons/guide.md': page({ type: 'Lesson', title: 'Guide', status: 'open' }),
  });
  assert.deepEqual(problems, ['lessons/guide.md: status must be one of draft, stable, deprecated']);
});

test('resolved gaps and superseded pages must be deprecated', () => {
  const resolved = { type: 'Gap', id: 'GAP-001', title: 'One', gap_status: 'resolved' };
  const replaced = { type: 'Assumption', id: 'ASM-001', title: 'One', superseded_by: 'ASM-002' };
  assert.deepEqual(
    check({
      'index.md': 'Index',
      'launch/gaps/gap-001-one.md': page(resolved),
      'decisions/asm/asm-001-one.md': page(replaced),
    }).sort(),
    [
      'decisions/asm/asm-001-one.md: a resolved or superseded page needs status: deprecated',
      'launch/gaps/gap-001-one.md: a resolved or superseded page needs status: deprecated',
    ],
  );
  assert.deepEqual(
    check({
      'index.md': 'Index',
      'launch/gaps/gap-001-one.md': page({ ...resolved, status: 'deprecated' }),
      'decisions/asm/asm-001-one.md': page({ ...replaced, status: 'deprecated' }),
    }),
    [],
  );
});

test('broken links fail, relative or from the folder root', () => {
  const problems = check({
    'index.md': '[A](/lessons/a.md)',
    'lessons/a.md': page({ type: 'Lesson', title: 'A' }, '[B](b.md) [C](/lessons/c.md)'),
  });
  assert.deepEqual(problems.sort(), [
    'lessons/a.md: broken link /lessons/c.md',
    'lessons/a.md: broken link b.md',
  ]);
});

test('links in code and web links are ignored', () => {
  const body = '`[Old](old.md)`\n\n```\n[Old](old.md)\n```\n\n[Web](https://example.com/old.md)';
  assert.deepEqual(
    check({
      'index.md': '[A](/lessons/a.md)',
      'lessons/a.md': page({ type: 'Lesson', title: 'A' }, body),
    }),
    [],
  );
});

test('a page missing from the index fails, unless its folder is exempt', () => {
  const problems = check({
    'index.md': 'Index',
    'lessons/a.md': page({ type: 'Lesson', title: 'A' }),
    'decisions/asm/asm-001-one.md': asm,
    'sweeps/2026-11-06-1530-api.md': page({ type: 'Report', title: 'API sweep' }),
  });
  assert.deepEqual(problems, ['lessons/a.md: not listed in index.md']);
});

test('a page without a description fails', () => {
  const problems = check({
    'index.md': '[Guide](/lessons/guide.md)',
    'lessons/guide.md': page({ type: 'Lesson', title: 'Guide', description: null }),
  });
  assert.deepEqual(problems, ['lessons/guide.md: header has no description']);
});

test('the folder map comes from the options', () => {
  const options = merge(DEFAULTS.knowledge, {
    numbered: {
      'product/features': null,
      'decisions/rfc': { prefix: 'RFC', digits: 2 },
    },
  });
  assert.deepEqual(Object.keys(options.numbered).sort(), [
    'decisions/adr',
    'decisions/asm',
    'decisions/rfc',
    'launch/gaps',
  ]);
  const rfc = page({ type: 'Decision', id: 'RFC-07', title: 'Seven' });
  assert.deepEqual(
    check({ 'index.md': '[R](/decisions/rfc/rfc-07-seven.md)', 'decisions/rfc/rfc-07-seven.md': rfc }, options),
    [],
  );
  // Feature pages are no longer numbered, so any name passes, but they need the index.
  assert.deepEqual(
    check({ 'index.md': 'Index', 'product/features/search.md': page({ type: 'Product', title: 'S' }) }, options),
    ['product/features/search.md: not listed in index.md'],
  );
});

test('numbered names follow the width', () => {
  const pattern = numberPattern({ prefix: 'ADR', digits: 4 });
  assert.match('adr-0001-one.md', pattern);
  assert.match('adr-12345-one.md', pattern);
  assert.match('adr-0001-b-one.md', pattern);
  assert.doesNotMatch('adr-001-one.md', pattern);
  assert.doesNotMatch('adr-01234-one.md', pattern);
});

test('a page named by topic passes, with the topic as its id', () => {
  const problems = check({
    'index.md': 'Index',
    'decisions/asm/asm-client-ip-behind-a-proxy.md': page({
      type: 'Assumption',
      id: 'ASM-client-ip-behind-a-proxy',
      title: 'Client IP',
    }),
    'decisions/asm/asm-001-one.md': asm,
  });
  assert.deepEqual(problems, []);
});

test('a page named by topic needs that topic as its id', () => {
  const problems = check({
    'index.md': 'Index',
    'decisions/asm/asm-client-ip.md': page({ type: 'Assumption', id: 'ASM-001', title: 'Client IP' }),
  });
  assert.deepEqual(problems, ['decisions/asm/asm-client-ip.md: header id should be ASM-client-ip']);
});

test('topic names are lowercase words joined by hyphens', () => {
  const pattern = topicPattern({ prefix: 'ASM' });
  assert.match('asm-client-ip.md', pattern);
  assert.match('asm-v2-search.md', pattern);
  assert.doesNotMatch('asm-Client-IP.md', pattern);
  assert.doesNotMatch('asm-client--ip.md', pattern);
  assert.doesNotMatch('asm-client-ip-.md', pattern);
  assert.doesNotMatch('asm-client_ip.md', pattern);
  assert.equal(idFor({ prefix: 'ADR', digits: 4 }, 'adr-0298-b-search.md').id, 'ADR-0298-b');
  assert.equal(idFor({ prefix: 'ADR', digits: 4 }, 'adr-search-engine.md').id, 'ADR-search-engine');
});

test('templates under either name have no id or state', () => {
  const template = page({ type: 'Gap', id: 'GAP-topic', title: 'Short title' });
  for (const name of ['gap-template.md', 'gap-000-template.md']) {
    assert.deepEqual(check({ 'index.md': 'Index', [`launch/gaps/${name}`]: template }), []);
  }
});

test('a missing folder fails', () => {
  assert.match(checkKnowledge('/nonexistent/knowledge')[0], /folder missing/);
});
