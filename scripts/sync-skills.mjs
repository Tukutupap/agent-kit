// Copies the plugin's skills and hook script into the Copier template, for
// projects that keep them in the repository instead of using the plugin.
// The plugin is the source; run `npm run sync:skills` after changing it. The
// kit's tests fail when the two differ.
import console from 'node:console';
import { cpSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

export const kit = join(dirname(fileURLToPath(import.meta.url)), '..');
// Copier leaves this folder out for projects that use the plugin (copier.yml).
export const COPY_ROOT = join(kit, 'template', '.agents');
export const COPIES = [
  [join(kit, 'plugin/skills'), join(COPY_ROOT, 'skills')],
  [join(kit, 'plugin/hooks/knowledge-reminder.mjs'), join(COPY_ROOT, 'hooks/knowledge-reminder.mjs')],
];

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  rmSync(COPY_ROOT, { recursive: true, force: true });
  for (const [from, to] of COPIES) cpSync(from, to, { recursive: true });
  console.log('Copied the plugin skills and hook into the template.');
}
