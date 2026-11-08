#!/usr/bin/env node
// Runs the kit's checks on the project in the current folder.
//   npx --yes github:Tukutupap/agent-kit#v1 knowledge-check
//   PR_TITLE=... PR_BODY=... npx --yes github:Tukutupap/agent-kit#v1 pr-check
import console from 'node:console';
import process from 'node:process';
import { main as knowledgeCheck } from '../scripts/knowledge-check.mjs';
import { main as prCheck } from '../scripts/pr-format-check.mjs';

const commands = {
  'knowledge-check': () => knowledgeCheck(process.cwd()),
  'pr-check': () => prCheck(process.cwd()),
};

const command = commands[process.argv[2]];
if (!command) {
  console.error(`Usage: agent-kit <${Object.keys(commands).join(' | ')}>`);
  process.exitCode = 2;
} else {
  process.exitCode = command();
}
