#!/usr/bin/env node
/**
 * storybook-dev.mjs — launches `storybook dev` on the port specified by
 * `process.env.PORT`. Portless injects PORT at runtime; running this script
 * without Portless is unsupported and fails loudly.
 */
import { spawn } from 'node:child_process';
import process from 'node:process';

const port = process.env.PORT;
if (!port) {
  console.error(
    '[storybook-dev] PORT is not set. Run via `pnpm run storybook` (Portless).',
  );
  process.exit(1);
}
const args = ['dev', '-p', port, ...process.argv.slice(2)];
const child = spawn('storybook', args, { stdio: 'inherit', shell: false });
child.on('exit', (code, signal) => {
  if (signal) process.kill(process.pid, signal);
  else process.exit(code ?? 0);
});
for (const sig of ['SIGINT', 'SIGTERM']) {
  process.on(sig, () => {
    if (!child.killed) child.kill(sig);
  });
}
