#!/usr/bin/env node
// Stable bin entry committed to the repo so `pnpm install` can always create
// the `node_modules/.bin/docs-toolkit` symlink, regardless of whether
// `tsc` has produced `dist/cli.js` yet. The real CLI lives at ../dist/cli.js
// and is built by `pnpm --filter backend.ai-docs-toolkit build` before use.
//
// See pnpm/pnpm#10524 for the upstream discussion of this pattern.
import '../dist/cli.js';
