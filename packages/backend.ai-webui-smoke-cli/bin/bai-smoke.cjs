#!/usr/bin/env node
/* eslint-disable */
// Shim entrypoint for the `bai-smoke` CLI.
// Resolves to the compiled ESM bundle under ./dist/cli.js. The bin is .cjs so
// `npm`/`pnpm` can invoke it on Node versions that gate ESM bin scripts.
'use strict';

const { pathToFileURL } = require('node:url');
const path = require('node:path');

const target = path.resolve(__dirname, '..', 'dist', 'cli.js');

import(pathToFileURL(target).href).catch((err) => {
  // eslint-disable-next-line no-console
  console.error(
    '[bai-smoke] failed to load CLI bundle at',
    target,
    '\nDid you run `pnpm --filter backend.ai-webui-smoke-cli build`?\n',
  );
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});
