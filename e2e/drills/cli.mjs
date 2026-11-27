#!/usr/bin/env node
/**
 * `pnpm e2e:drill <file>` — run one drill file once against a server that is
 * already up. The file lives outside the repository; the report lands at
 * e2e/drill-report/<id>/index.html. Args after `--` go to Playwright untouched.
 */
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..', '..');
const config = path.join('e2e', 'playwright.drill.config.ts');

const argv = process.argv.slice(2);
const separator = argv.indexOf('--');
const own = separator < 0 ? argv : argv.slice(0, separator);
const extra = separator < 0 ? [] : argv.slice(separator + 1);
const flags = own.filter((arg) => arg.startsWith('-'));
const files = own.filter((arg) => !arg.startsWith('-'));

function usage(code) {
  (code === 0 ? console.log : console.error)(
    'Usage: pnpm e2e:drill <path/to/scenario.drill.ts> [--headed] [-- <playwright args>]',
  );
  process.exit(code);
}

if (flags.includes('--help') || flags.includes('-h')) usage(0);
const unknown = flags.filter((flag) => flag !== '--headed');
if (unknown.length) {
  console.error(`Unknown option: ${unknown.join(', ')}`);
  usage(2);
}
if (files.length !== 1) usage(2);

const result = spawnSync(
  'pnpm',
  ['exec', 'playwright', 'test', '-c', config, ...flags, ...extra],
  {
    cwd: root,
    stdio: 'inherit',
    env: { ...process.env, E2E_DRILL_FILE: path.resolve(files[0]) },
  },
);
console.log('\nDrill report: e2e/drill-report/<id>/index.html');
process.exit(result.status ?? 1);
