/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 Chooses between the precompiled brand theme (`astryx theme build` output —
 static CSS, `__built: true`, no runtime injection) and a runtime
 `defineTheme()` constructed from the operator's live `resources/theme.json`
 document (to-astryx ticket 02).

 Because a theme's name is a pure function of its CSS-affecting seeds (see
 the numbering rule in `backendAiTheme.ts`), "does the runtime config match
 what was baked?" reduces to a name comparison — computed WITHOUT calling
 `defineTheme()`, so no competing registration is ever created for the
 identical CSS.
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

if (
  import.meta.env?.DEV &&
  computeThemeName({ role: 'brand' }) !== builtBackendAiBrandTheme.name
) {
  // Stale wrapper/artifacts: the recipe changed but `astryx theme build` was
  // not re-run (or built/index.ts still points at old artifacts). The app
  // still renders correctly — the default config now takes the runtime
  // injection path — but ships dead prebuilt CSS. Fix per built/index.ts.
  // eslint-disable-next-line no-console -- dev-only module-scope diagnostic; no logger exists outside React here
  console.warn(
    '[astryx-theme] prebuilt brand theme is stale: ' +
      `built "${builtBackendAiBrandTheme.name}" != derived "${computeThemeName({ role: 'brand' })}". ` +
      'Re-run `astryx theme build` (see src/astryx-theme/built/index.ts).',
  );
}

/**
 * Resolve the theme for a role against the live appearance document's `theme`
 * half. `config` may be undefined while the document is still loading — the
 * shipped defaults apply, which for `brand` is exactly the prebuilt theme.
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
