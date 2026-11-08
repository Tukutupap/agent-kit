#!/usr/bin/env node
// Sets Status and Priority on a project's board (a GitHub Projects board owned
// by an organization or a user) for a list of issues or pull requests.
//
// Claude cloud sessions can't reach GitHub's GraphQL API or the Projects REST
// API, but they can start a workflow in their repository. The Board sync
// workflow runs this script with a project-scoped token (PROJECT_TOKEN), so
// any session can keep the board current. See the issue workflow page in the
// project's knowledge/, "Keeping the board in sync".
//
// Inputs come from the environment, never from the command line, so nothing
// typed into a pull request is run as a command:
//   BOARD_ISSUES    issue numbers, such as "418 419, #420 426-429"
//   BOARD_STATUS    a Status option name, or empty / "unchanged"
//   BOARD_PRIORITY  a Priority option name, or empty / "unchanged"
//   BOARD_PR_BODY   instead of BOARD_ISSUES: a pull request description, whose
//                   "Fixes #N" lines name the issues
//   PROJECT_TOKEN   token with Projects read and write for the board's owner
//   GITHUB_REPOSITORY  owner/name, set by Actions
//   BOARD_NUMBER    the board's number, required
//   BOARD_OWNER     the organization or user that owns the board (default:
//                   the repository's owner)
//   BOARD_REQUIRE_TOKEN  "true" to fail instead of skipping without a token

import console from 'node:console';
import { appendFileSync } from 'node:fs';
import process from 'node:process';
import { pathToFileURL } from 'node:url';

const MAX_ISSUES = 100;

export function parseIssueList(text) {
  const numbers = new Set();
  for (const part of String(text ?? '').split(/[\s,]+/)) {
    const token = part.trim().replace(/^#/, '');
    if (!token) continue;
    const range = token.match(/^(\d+)-#?(\d+)$/);
    if (range) {
      const from = Number(range[1]);
      const to = Number(range[2]);
      if (to < from || to - from >= MAX_ISSUES) {
        throw new Error(`Range "${part}" is backwards or too long.`);
      }
      for (let n = from; n <= to; n += 1) numbers.add(n);
      continue;
    }
    if (!/^\d+$/.test(token) || Number(token) < 1) {
      throw new Error(`"${part}" isn't an issue number or a range such as 418-434.`);
    }
    numbers.add(Number(token));
  }
  if (numbers.size > MAX_ISSUES) {
    throw new Error(`At most ${MAX_ISSUES} issues at a time.`);
  }
  return [...numbers].sort((a, b) => a - b);
}

// Issues a pull request closes, from GitHub's closing keywords. Only issues in
// this repository count, so "Fixes other/repo#12" is ignored.
export function parseClosingIssues(body) {
  const numbers = new Set();
  const pattern = /\b(?:close[sd]?|fix(?:e[sd])?|resolve[sd]?)\s*:?\s+#(\d+)\b/gi;
  for (const match of String(body ?? '').matchAll(pattern)) {
    numbers.add(Number(match[1]));
  }
  return [...numbers].sort((a, b) => a - b);
}

// Matches a requested option to the field's options, ignoring case, spaces and
// dashes. Empty or "unchanged" means leave the field alone.
export function pickOption(field, wanted) {
  const value = String(wanted ?? '').trim();
  if (!value || value.toLowerCase() === 'unchanged') return null;
  const key = (s) => s.toLowerCase().replace(/[\s_-]+/g, '');
  const option = field.options.find((o) => key(o.name) === key(value));
  if (!option) {
    const names = field.options.map((o) => o.name).join(', ');
    throw new Error(`${field.name} has no option "${value}". Options: ${names}.`);
  }
  return option;
}

// Which repository the issues are in, and which board to update.
export function boardTarget(env) {
  const [repoOwner, repoName] = String(env.GITHUB_REPOSITORY ?? '').split('/');
  if (!repoOwner || !repoName) throw new Error('GITHUB_REPOSITORY must be set, as owner/name.');
  const number = Number(env.BOARD_NUMBER);
  if (!Number.isInteger(number) || number < 1) {
    throw new Error('BOARD_NUMBER must be the board\'s number, such as 1.');
  }
  return { repoOwner, repoName, owner: env.BOARD_OWNER || repoOwner, number };
}

async function graphql(token, query, variables) {
  const response = await globalThis.fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: {
      authorization: `Bearer ${token}`,
      'content-type': 'application/json',
      'user-agent': 'agent-kit-board-sync',
    },
    body: JSON.stringify({ query, variables }),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok || payload.errors) {
    const message = payload.errors?.map((e) => e.message).join('; ') || response.statusText;
    throw new Error(`GitHub GraphQL failed (${response.status}): ${message}`);
  }
  return payload.data;
}

const PROJECT_QUERY = `
  query ($owner: String!, $number: Int!) {
    repositoryOwner(login: $owner) {
      ... on ProjectV2Owner {
        projectV2(number: $number) {
          id
          title
          fields(first: 50) {
            nodes {
              ... on ProjectV2SingleSelectField { id name options { id name } }
            }
          }
        }
      }
    }
  }`;

const ITEM_QUERY = `
  query ($owner: String!, $name: String!, $number: Int!) {
    repository(owner: $owner, name: $name) {
      issueOrPullRequest(number: $number) {
        ... on Issue { id title projectItems(first: 20) { nodes { id project { id } } } }
        ... on PullRequest { id title projectItems(first: 20) { nodes { id project { id } } } }
      }
    }
  }`;

const ADD_ITEM = `
  mutation ($projectId: ID!, $contentId: ID!) {
    addProjectV2ItemById(input: { projectId: $projectId, contentId: $contentId }) { item { id } }
  }`;

const SET_FIELD = `
  mutation ($projectId: ID!, $itemId: ID!, $fieldId: ID!, $optionId: String!) {
    updateProjectV2ItemFieldValue(input: {
      projectId: $projectId, itemId: $itemId, fieldId: $fieldId,
      value: { singleSelectOptionId: $optionId }
    }) { projectV2Item { id } }
  }`;

function summary(lines) {
  const text = lines.join('\n');
  console.log(text);
  if (process.env.GITHUB_STEP_SUMMARY) {
    appendFileSync(process.env.GITHUB_STEP_SUMMARY, `${text}\n`);
  }
}

export async function run(env = process.env) {
  // A workflow passes every input, empty or not, so an empty issue list means
  // the issues come from the pull request description.
  const fromPr = !String(env.BOARD_ISSUES ?? '').trim() && env.BOARD_PR_BODY !== undefined;
  const issues = fromPr ? parseClosingIssues(env.BOARD_PR_BODY) : parseIssueList(env.BOARD_ISSUES);
  if (issues.length === 0) {
    summary(['No issues to update.']);
    return 0;
  }

  const token = env.PROJECT_TOKEN;
  if (!token) {
    const message =
      'PROJECT_TOKEN is not set, so the board was not updated. See the issue workflow page in knowledge/.';
    if (env.BOARD_REQUIRE_TOKEN === 'true') throw new Error(message);
    summary([`::warning::${message}`]);
    return 0;
  }

  const { repoOwner, repoName, owner, number } = boardTarget(env);

  const data = await graphql(token, PROJECT_QUERY, { owner, number });
  const project = data.repositoryOwner?.projectV2;
  if (!project)
    throw new Error(`Project ${number} of ${owner} wasn't found, or the token can't see it.`);
  const fields = project.fields.nodes.filter((f) => f && f.options);
  const field = (name) => {
    const found = fields.find((f) => f.name.toLowerCase() === name);
    if (!found) throw new Error(`The board has no "${name}" field.`);
    return found;
  };

  const changes = [];
  const status = pickOption(field('status'), env.BOARD_STATUS);
  if (status) changes.push({ field: field('status'), option: status });
  const priority = pickOption(field('priority'), env.BOARD_PRIORITY);
  if (priority) changes.push({ field: field('priority'), option: priority });

  const lines = [`## Board sync: ${project.title}`, ''];
  let failures = 0;
  for (const issue of issues) {
    try {
      const found = await graphql(token, ITEM_QUERY, {
        owner: repoOwner,
        name: repoName,
        number: issue,
      });
      const content = found.repository?.issueOrPullRequest;
      if (!content) throw new Error('not found');
      let item = content.projectItems.nodes.find((n) => n.project.id === project.id);
      let added = false;
      if (!item) {
        const result = await graphql(token, ADD_ITEM, {
          projectId: project.id,
          contentId: content.id,
        });
        item = result.addProjectV2ItemById.item;
        added = true;
      }
      for (const change of changes) {
        await graphql(token, SET_FIELD, {
          projectId: project.id,
          itemId: item.id,
          fieldId: change.field.id,
          optionId: change.option.id,
        });
      }
      const set =
        changes.map((c) => `${c.field.name} ${c.option.name}`).join(', ') || 'nothing changed';
      lines.push(`- #${issue}: ${added ? 'added to the board, ' : ''}${set}`);
    } catch (error) {
      failures += 1;
      lines.push(`- #${issue}: failed, ${error.message}`);
    }
  }
  summary(lines);
  return failures === 0 ? 0 : 1;
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  run().then(
    (code) => process.exit(code),
    (error) => {
      console.error(`::error::${error.message}`);
      process.exit(1);
    },
  );
}
