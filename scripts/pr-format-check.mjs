// Checks a pull request's title and description against the project's format.
// The required sections come from the project's pull request template, so the
// two can't disagree. Inputs come from the environment, never the command
// line, so nothing a person typed into a pull request is run as a command:
//   PR_TITLE, PR_BODY, PR_AUTHOR
import console from 'node:console';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import { DEFAULTS, loadConfig } from './config.mjs';

const clean = (text) =>
  text
    .replace(/\r\n/g, '\n')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/```[\s\S]*?```/g, '');

/** The `##` sections of a description, in order. Deeper headings stay inside them. */
export const sections = (text) =>
  clean(text)
    .split(/^## /m)
    .slice(1)
    .map((part) => {
      const end = part.indexOf('\n');
      return end === -1
        ? { name: part.trim(), content: '' }
        : { name: part.slice(0, end).trim(), content: part.slice(end + 1).trim() };
    });

export const isExempt = (author, exempt = DEFAULTS.pullRequests.exemptAuthors) =>
  Boolean(author) && exempt.includes(author);

// Two sections from the kit's template have extra rules. A project that renames
// or drops them keeps only the general rules: every section present, in order,
// and filled in.
const ISSUE_SECTION = 'What this fixes';
const KNOWLEDGE_SECTION = 'Knowledge';

export function checkPullRequest({ title, body, template }) {
  const problems = [];
  if (/#\d/.test(title)) problems.push('Title: take out the issue number. It goes in the body.');
  if (/^[a-z]+(\([^)]*\))?!?: /i.test(title))
    problems.push('Title: take out the prefix, such as "fix:" or "test(api):".');

  const expected = sections(template).map((section) => section.name);
  const found = sections(body ?? '');
  const names = found.map((section) => section.name);
  if (names.join('\n') !== expected.join('\n')) {
    problems.push(
      `Sections: expected ${expected.join(', ')}, in that order, but found ${names.join(', ') || 'none'}. Put anything extra under a ### heading.`,
    );
    return problems;
  }

  const content = Object.fromEntries(found.map((section) => [section.name, section.content]));
  for (const name of expected) if (!content[name]) problems.push(`${name}: this section is empty.`);
  if (ISSUE_SECTION in content && !/\bFixes #\d+/i.test(content[ISSUE_SECTION]))
    problems.push(`${ISSUE_SECTION}: add a "Fixes #N" line for every issue.`);
  if (KNOWLEDGE_SECTION in content && !/^- \[x\] /im.test(content[KNOWLEDGE_SECTION]))
    problems.push(`${KNOWLEDGE_SECTION}: tick one of the boxes.`);
  return problems;
}

export function main(repo = process.cwd(), env = process.env) {
  const config = loadConfig(repo);
  if (isExempt(env.PR_AUTHOR, config.pullRequests.exemptAuthors)) {
    console.log(`Skipped: pull requests from ${env.PR_AUTHOR} can't use the template.`);
    return 0;
  }
  const templatePath = resolve(repo, config.pullRequests.template);
  if (!existsSync(templatePath)) {
    console.error(`${config.pullRequests.template} is missing, so there's no format to check.`);
    return 1;
  }
  const problems = checkPullRequest({
    title: env.PR_TITLE ?? '',
    body: env.PR_BODY ?? '',
    template: readFileSync(templatePath, 'utf8'),
  });
  for (const problem of problems) console.error(problem);
  if (problems.length) {
    console.error(`See ${config.pullRequests.template} and the pull request format in knowledge/.`);
    return 1;
  }
  console.log('Pull request format is correct.');
  return 0;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  process.exitCode = main(process.argv[2] ? resolve(process.argv[2]) : process.cwd());
}
