// Checks a release version before the Release workflow tags it: it must be
// X.Y.Z, match the three version files, and not be tagged already. Writes the
// tag and major tag to GITHUB_OUTPUT. Input: RELEASE_VERSION.
import { execFileSync } from 'node:child_process';
import console from 'node:console';
import { appendFileSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const kit = join(dirname(fileURLToPath(import.meta.url)), '..');
export const VERSION_FILES = [
  'package.json',
  'plugin/.claude-plugin/plugin.json',
  '.claude-plugin/marketplace.json',
];

const fileVersion = (file) => {
  const json = JSON.parse(readFileSync(join(kit, file), 'utf8'));
  return json.version ?? json.plugins?.find((p) => p.name === 'agent-kit')?.version;
};

export function checkRelease(version, { versions, tags }) {
  const problems = [];
  const match = String(version ?? '').trim().match(/^v?(\d+)\.(\d+)\.(\d+)$/);
  if (!match) return { problems: [`"${version}" isn't a version such as 1.0.1.`] };
  const plain = `${match[1]}.${match[2]}.${match[3]}`;
  for (const [file, found] of Object.entries(versions)) {
    if (found !== plain) problems.push(`${file} has version ${found}, not ${plain}.`);
  }
  const tag = `v${plain}`;
  if (tags.includes(tag)) problems.push(`${tag} is already tagged.`);
  return { problems, tag, major: `v${match[1]}` };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const versions = Object.fromEntries(VERSION_FILES.map((file) => [file, fileVersion(file)]));
  const tags = execFileSync('git', ['tag', '--list'], { cwd: kit, encoding: 'utf8' })
    .split('\n')
    .filter(Boolean);
  const { problems, tag, major } = checkRelease(process.env.RELEASE_VERSION, { versions, tags });
  for (const problem of problems) console.error(`::error::${problem}`);
  if (problems.length) process.exit(1);
  if (process.env.GITHUB_OUTPUT) appendFileSync(process.env.GITHUB_OUTPUT, `tag=${tag}\nmajor=${major}\n`);
  console.log(`Ready to release ${tag} and move ${major}.`);
}
