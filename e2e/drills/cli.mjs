#!/usr/bin/env node
/**
 * `pnpm e2e:drill <id>` — run one drill against a server that is already up.
 *
 *   pnpm e2e:drill --list        list the drills, in run order
 *   pnpm e2e:drill folder-invitation [--headed] [-- --repeat-each=...]
 *   pnpm e2e:drill --all         run every drill in order
 *
 * The same command repeats the same scenario; the report lands at the same
 * path every time (e2e/drill-report/<id>/index.html). Args after `--` go to
 * Playwright untouched.
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
const names = own.filter((arg) => !arg.startsWith('-'));

function usage(code) {
  const lines = [
    'Usage: pnpm e2e:drill <id> [--headed] [-- <playwright args>]',
    '       pnpm e2e:drill --list',
    '       pnpm e2e:drill --all',
    'The drills are listed by `--list` (e2e/drills/catalog.ts is the listing).',
  ];
  (code === 0 ? console.log : console.error)(lines.join('\n'));
  process.exit(code);
}

function playwright(args, env = {}) {
  return spawnSync(
    'pnpm',
    ['exec', 'playwright', 'test', '-c', config, ...args, ...extra],
    {
      cwd: root,
      stdio: 'inherit',
      env: { ...process.env, ...env },
    },
  );
}

if (flags.includes('--help') || flags.includes('-h')) usage(0);
const forwarded = flags.filter((flag) => flag === '--headed');
const unknown = flags.filter(
  (flag) => !['--list', '--all', '--headed'].includes(flag),
);
if (unknown.length) {
  console.error(`Unknown option: ${unknown.join(', ')}`);
  usage(2);
}

if (flags.includes('--list')) {
  if (names.length) usage(2);
  const result = playwright(['--list'], { E2E_DRILL: '' });
  process.exit(result.status ?? 1);
}

if (flags.includes('--all')) {
  if (names.length) usage(2);
  const result = playwright(forwarded, { E2E_DRILL: '' });
  const report = path.join('e2e', 'drill-report', 'all', 'index.html');
  console.log(`\nDrill report: ${report}`);
  process.exit(result.status ?? 1);
}

if (names.length !== 1) usage(2);
// No id pre-check here: catalog.ts is the single listing, and the spec throws
// a clear error (with the known ids) for a value it does not select.
const id = names[0];

const result = playwright(forwarded, { E2E_DRILL: id });
const report = path.join('e2e', 'drill-report', id, 'index.html');
console.log(`\nDrill report: ${report}`);
process.exit(result.status ?? 1);
