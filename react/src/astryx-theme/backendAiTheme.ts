/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 PILOT PHASE 3 (cn-oss-removal / tickets 10 + 13) — the Backend.AI brand theme,
 built at RUNTIME with Astryx's official `defineTheme()`.

 This is the ticket-13 option-B probe. Phases 1 and 2 both reported the brand
 accent as a blocker because `@astryxdesign/theme-neutral` renders the accent as
 near-black (`--color-accent: light-dark(#262626, #ebebeb)`). The question is
 whether a theme constructed at boot from the deployment's own seed restores it.

 `defineTheme({ color: { accent } })` runs the HCT perceptual colour model over
 the seed and generates the whole accent ramp (accent, on-accent, text-accent,
 icon-accent, accent-muted, plus hover/active states). `<Theme>` then injects the
 generated CSS with `useInsertionEffect` at hydration — so an accent that is only
 known at runtime (read from `resources/theme.json`, or a user's chosen accent)
 is a first-class case, not a workaround.

 PENDING (ticket 06 dark-mode decision): the seeds below are taken verbatim from
 `resources/theme.json` — `#FF7A00` for light, `#DC6B03` for dark, which is what
 the deployment already ships. antd derives its dark palette from the light seed
 via `darkAlgorithm`; Astryx's HCT generator derives from whatever seed it is
 handed. Passing the theme.json dark seed keeps parity with today's UI; deriving
 both from one seed is the alternative and is NOT decided here.
*/
import { defineTheme } from '@astryxdesign/core/theme';
import { neutralTheme } from '@astryxdesign/theme-neutral';

/** Straight from `resources/theme.json` (light.token / dark.token colorPrimary). */
export const BAI_ACCENT_LIGHT = '#FF7A00';
export const BAI_ACCENT_DARK = '#DC6B03';

export interface BuildBrandThemeOptions {
  /** Deployment / user accent. Defaults to the Backend.AI orange. */
  accentLight?: string;
  accentDark?: string;
}

/**
 * Build the theme. Called at boot with whatever the deployment configured, so
 * the accent never has to be known at build time.
 */
export function buildBackendAiTheme({
  accentLight = BAI_ACCENT_LIGHT,
  accentDark = BAI_ACCENT_DARK,
}: BuildBrandThemeOptions = {}) {
  return defineTheme({
    // PILOT-DECISION / ticket 13 gotcha: `name` IS the theme's identity — it
    // becomes the `data-astryx-theme` attribute and the registry key. Two
    // `defineTheme()` calls that share a name produce two <Theme> providers
    // fighting over one attribute, and the FIRST one's CSS wins. A runtime
    // accent swap must therefore vary the name with the accent, or the swap
    // silently no-ops. This bit during the probe.
    name: `backendai-${accentLight.replace('#', '')}-${accentDark.replace('#', '')}`,
    // Start from neutral so only the accent family is regenerated.
    extends: neutralTheme,
    // Generates the full accent ramp from a single seed via HCT.
    color: { accent: accentLight },
    // The generator takes ONE accent, so the light/dark pair is expressed as a
    // [light, dark] tuple token override, which wins over the generated value.
    tokens: {
      '--color-accent': [accentLight, accentDark],
      '--color-text-accent': [accentLight, accentDark],
      '--color-icon-accent': [accentLight, accentDark],
      // Text/icons sitting ON the accent fill. Backend.AI orange is dark
      // enough for white at both ends.
      '--color-on-accent': ['#ffffff', '#ffffff'],
    },
  });
}

export const backendAiTheme = buildBackendAiTheme();

/** Alias used by `DefaultProviders`. */
export const backendAiBrandTheme = backendAiTheme;

/** `resources/theme.json` → `token.colorInfo`, what `ThemeAdminProvider` uses. */
export const BAI_ADMIN_LIGHT = '#028DF2';
export const BAI_ADMIN_DARK = '#009BDD';

/**
 * The admin-section accent, mirroring `ThemeAdminProvider`'s
 * `colorPrimary: usePrimaryColors().admin`.
 *
 * MEASURED (ticket 13, phase 3b): nesting works and is cleanly scoped — the
 * nested theme's attribute lands on a wrapper <div>, its CSS is `@scope`d to
 * that attribute, and sibling/parent regions keep the brand accent with ZERO
 * leakage in either direction.
 *
 * BUT: a nested `<Theme>` **does NOT inherit the parent's mode**. With no
 * `mode` prop it falls back to `system` (`color-scheme: light dark`), so an
 * admin region renders LIGHT inside a DARK app whenever the user's explicit
 * theme choice disagrees with the OS preference. `ThemeAdminProvider` already
 * solves this for antd by reading `isParentDark` off the parent ConfigProvider;
 * Astryx does not do the equivalent for you. **Always pass `mode` explicitly.**
 */
export const backendAiAdminTheme = buildBackendAiTheme({
  accentLight: BAI_ADMIN_LIGHT,
  accentDark: BAI_ADMIN_DARK,
});
