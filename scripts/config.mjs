// Reads a project's agent-kit.json and fills in the defaults, so a project
// only writes down what it changes. The defaults are the layout the kit's
// template creates.
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

export const CONFIG_FILE = 'agent-kit.json';

export const DEFAULTS = {
  knowledge: {
    root: 'knowledge',
    // Folders with one ID per file. New files are named by topic, and the prefix
    // starts the ID. `digits` is the width of older files named by issue number.
    // The key keeps its old name so existing agent-kit.json files still work.
    numbered: {
      'decisions/adr': { prefix: 'ADR', digits: 4 },
      'decisions/asm': { prefix: 'ASM', digits: 3 },
      'launch/gaps': {
        prefix: 'GAP',
        digits: 3,
        state: { field: 'gap_status', values: ['open', 'resolved'], done: 'resolved' },
      },
      'product/features': { prefix: 'FEA', digits: 3 },
    },
    // Too many files to list by hand, so the index points at the folder instead.
    notInIndex: ['decisions/asm/', 'launch/gaps/', 'sweeps/'],
  },
  pullRequests: {
    template: '.github/pull_request_template.md',
    // Bots that write their own title and description. GitHub logins can't
    // contain "[", so a person can't take one of these names.
    exemptAuthors: ['dependabot[bot]'],
  },
};

const isObject = (value) => value && typeof value === 'object' && !Array.isArray(value);

// Objects merge key by key. Arrays and values replace the default. A numbered
// folder set to null is removed.
export function merge(base, override) {
  if (!isObject(base) || !isObject(override)) return override === undefined ? base : override;
  const result = { ...base };
  for (const [key, value] of Object.entries(override)) {
    if (value === null) delete result[key];
    else result[key] = merge(base[key], value);
  }
  return result;
}

export function loadConfig(repo, file = join(repo, CONFIG_FILE)) {
  if (!existsSync(file)) return DEFAULTS;
  let parsed;
  try {
    parsed = JSON.parse(readFileSync(file, 'utf8'));
  } catch (error) {
    throw new Error(`${file} isn't valid JSON: ${error.message}`);
  }
  return merge(DEFAULTS, parsed);
}
