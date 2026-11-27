/**
 * The Playwright entry point for a drill. `E2E_DRILL_FILE` names one scenario
 * module that exports a `drill`; it lives outside the repository and runs once.
 */
import { registerDrill } from './drill-test';
import type { Drill } from './types';
import path from 'node:path';

const file = process.env.E2E_DRILL_FILE?.trim();
if (!file) throw new Error('E2E_DRILL_FILE is not set (pnpm e2e:drill <file>)');

// Synchronous require: Playwright collects tests while the file loads.
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { drill } = require(path.resolve(file)) as { drill?: Drill };
if (!drill) throw new Error(`${file} does not export \`drill\``);

registerDrill(drill);
