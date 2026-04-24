#!/usr/bin/env node
/**
 * storybook-dev.mjs — launches `storybook dev` on the port specified by
 * `process.env.PORT`. Used by the top-level storybook script so that Portless
 * (which injects PORT) and the legacy PORT=6006 flow are both honored.
 */
import { spawn } from 'node:child_process';
import process from 'node:process';

import { forwardSignals } from '../../../scripts/lib/forward-signals.mjs';

const port = process.env.PORT || '6006';
const args = ['dev', '-p', port, ...process.argv.slice(2)];
const child = spawn('storybook', args, { stdio: 'inherit', shell: false });
forwardSignals(child);
