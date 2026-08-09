import './backendai-default-built.css';

/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 Stable entry over the `astryx theme build` artifacts (to-astryx ticket 02).

 The CLI names the generated `.js`/`.d.ts` after the THEME NAME (which embeds
 the seed hash — see the numbering rule in `../backendAiTheme.ts`), so their
 filenames churn whenever the recipe or seeds change. Everything else imports
 this wrapper instead, so a rebuild only touches this one import line.

 After changing seeds or bumping `THEME_NAME_REV`:
   1. cd react && pnpm exec astryx theme build \
        src/astryx-theme/built/backendai-default.ts \
        -o src/astryx-theme/built/backendai-default-built.css
   2. Update the import below to the newly generated module, delete the old
      `bai-r*-*.{js,d.ts,variants.d.ts}` artifacts.
   3. `backendAiTheme.test.ts` fails if this wrapper and the current recipe
      drift apart (built name ≠ derived default name), and
      `scripts/verify.sh` runs the CLI's `--check` for artifact staleness.
 */
export { baiR8DefaultBrandH48p6jtTheme as builtBackendAiBrandTheme } from './bai-r8-default-brand-h48p6jt';
