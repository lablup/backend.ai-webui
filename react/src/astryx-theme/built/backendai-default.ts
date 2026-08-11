/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 `astryx theme build` entry for the DEFAULT Backend.AI brand theme
 (to-astryx ticket 02). This file is read by the CLI only — runtime code
 imports the generated `./backendai-default.js` (+ `.css`) instead, whose
 `__built: true` flag makes `<Theme>` skip runtime style injection.

 Regenerate after any recipe/seed change:

     cd react && pnpm exec astryx theme build src/astryx-theme/built/backendai-default.ts

 `scripts/verify.sh` runs the CLI's `--check` mode to fail on stale artifacts.

 Only the default brand theme is prebuilt. The admin/secondary nested themes
 and any runtime theme.json override stay on the runtime-injection path:
 they are region-scoped (lazy by construction, ~19KB of style tags per
 instance) and this is a client-only SPA, so the built path buys first-paint
 stability only for the theme that is always active. (PILOT-DECISION,
 ticket 02.)
 */
import { backendAiBrandTheme } from '../backendAiTheme';

export default backendAiBrandTheme;
