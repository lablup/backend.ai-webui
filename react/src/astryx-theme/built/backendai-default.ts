/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 `astryx theme build` entry for the DEFAULT Backend.AI brand theme: the
 `default` family of `resources/theme.json`, brand role — read from the
 document itself, so the shipped JSON is the only place the brand values
 live. This file is read by the CLI only; runtime code imports the generated
 module (+ `.css`) through `./index.ts`, whose `__built: true` flag makes
 `<Theme>` skip runtime style injection.

 Regenerate after any recipe or theme.json change:

     cd react && pnpm exec astryx theme build src/astryx-theme/built/backendai-default.ts

 `scripts/verify.sh` runs the CLI's `--check` mode to fail on stale artifacts.

 Only the default brand theme is prebuilt. The admin/secondary nested themes
 and any operator override stay on the runtime-injection path: they are
 region-scoped (lazy by construction, ~19KB of style tags per instance) and
 this is a client-only SPA, so the built path buys first-paint stability only
 for the theme that is always active.
 */
import themeJson from '../../../../resources/theme.json';
import type { BAIThemeConfig } from '../../helper/customThemeConfig';
import { buildBackendAiTheme, themeOptionsFromConfig } from '../backendAiTheme';

export default buildBackendAiTheme(
  themeOptionsFromConfig(
    themeJson.theme as unknown as BAIThemeConfig,
    'brand',
    'default',
  ),
);
