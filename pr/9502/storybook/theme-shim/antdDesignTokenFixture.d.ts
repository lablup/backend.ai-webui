/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 FROZEN REFERENCE — antd's own `theme.getDesignToken()` output for this
 repo's brand seeds, captured from antd 6.5.0 at the moment the dependency was
 removed (to-astryx final switch).

 `themeShim.test.ts` used to compute this side live, with
 `import { theme as antdTheme } from 'antd'`. That was the right shape while
 antd was installed — the test proved the shim reproduced the real thing
 rather than a transcription of it — and the file's own header always said
 "when the npm package is removed, freeze these as fixed expected values".
 This is that freeze. It is the ONE test import that kept antd in
 `devDependencies` after every render was converted.

 Covers exactly the token names whose `mapping.ts` verdict is `brand` or
 `derive` — the values the shim COMPUTES (from seeds, through the vendored
 palette algorithm) rather than probes from the CSS cascade. Probed
 (`astryx`) and pinned (`aligned`) verdicts are covered separately.

 Regenerating is not possible without reinstalling antd, and should not be
 needed: these are historical constants, not a moving target. If the shim
 stops matching them, the shim changed — investigate that, do not edit this
 table.
 */
export declare const ANTD_DESIGN_TOKEN_REFERENCE: Record<'light' | 'dark', Record<string, string>>;
