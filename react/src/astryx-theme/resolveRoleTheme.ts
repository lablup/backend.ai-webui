/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 Chooses between the precompiled brand theme (`astryx theme build` output —
 static CSS, `__built: true`, no runtime injection) and a runtime
 `defineTheme()` constructed from the live appearance document.

 Because a theme's name is a pure function of its CSS-affecting seeds (see
 the numbering rule in `backendAiTheme.ts`), "does the runtime document match
 what was baked?" reduces to a name comparison — computed WITHOUT calling
 `defineTheme()`, so no competing registration is ever created for the
 identical CSS. `scripts/verify.sh` runs the CLI's `--check` so the artifact
 cannot go stale against `resources/theme.json`.
 */
import type { BAIThemeConfig } from '../helper/customThemeConfig';
import {
  type BrandThemeRole,
  buildBackendAiTheme,
  computeThemeName,
  themeOptionsFromConfig,
} from './backendAiTheme';
import { builtBackendAiBrandTheme } from './built';
import type { DefinedTheme } from '@astryxdesign/core/theme';

/**
 * Resolve the theme for a role against the live appearance document's `theme`
 * half. With no document (the bootstrap found no usable `theme.json`) the
 * recipe runs without brand seeds: Astryx's neutral theme plus the recipe's
 * structural parity pins, no Backend.AI colors.
 */
export function resolveRoleTheme(
  config: BAIThemeConfig | undefined,
  role: BrandThemeRole,
  family = 'default',
): DefinedTheme {
  const options = themeOptionsFromConfig(config, role, family);
  if (computeThemeName(options) === builtBackendAiBrandTheme.name) {
    return builtBackendAiBrandTheme;
  }
  return buildBackendAiTheme(options);
}
