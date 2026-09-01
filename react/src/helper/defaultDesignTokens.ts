/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 `theme.getDesignToken({ algorithm })` without antd (to-astryx final-A).

 The Branding `FontFamilySettingItem` is a theme-ALGORITHM *producer* rather
 than a token consumer: it does not paint with a token, it shows the value a
 *cleared* field falls back to. antd answered that with
 `theme.getDesignToken({ algorithm: theme.defaultAlgorithm |
 theme.darkAlgorithm })`, i.e. "run the palette algorithm over antd's own
 stock seeds". These call sites were the last thing holding `import { theme }
 from 'antd'` in the app.

 The theme-shim's `buildTokens(mode, seeds)` is the same function: step 3 sets
 each seed token to `palette(seed, mode)(6)` from the vendored, parity-tested
 port of `@ant-design/colors`. Feeding it antd's stock seeds reproduces
 `getDesignToken` exactly for every colour these controls read — verified
 against the still-installed package:

     colorPrimary  light #1677ff  dark #1668dc
     colorLink     light #1677ff  dark #1668dc
     colorInfo     light #1677ff  dark #1668dc
     colorError    light #ff4d4f  dark #dc4446
     colorSuccess  light #52c41a  dark #49aa19
     colorWarning  light #faad14  dark #d89614

 Two deliberate differences, both the ratified visual-value policy rather than
 a regression:

 1. `colorText` is an `astryx`-verdict token, so it resolves from the live
    Astryx cascade (`--color-text-primary`) instead of antd's
    `rgba(0,0,0,0.88)` / `rgba(255,255,255,0.85)`. That is the value the app
    actually paints, which is what a "this is your fallback" swatch should
    show. (mapping.ts records the same drift for `colorText`.)
 2. `fontFamily` is a seed, not a derivation, so it is stated below. antd's
    stock stack is kept verbatim; it is what the field showed before.

 Component tokens (`token.Layout.headerBg`) are NOT covered — `getDesignToken`
 never returned them either, so the Branding "header background" swatch had no
 fallback before this change and still has none.
*/
import { buildTokens, type BrandSeeds } from 'backend.ai-ui';

/**
 * antd's `DesignToken`, reached through `buildTokens`' own signature. Naming
 * the type via `import type { DesignToken } from 'antd'` would put this file
 * straight back into the antd import graph — the gate reads import
 * specifiers, and a type-only one counts (P15).
 */
type DesignToken = ReturnType<typeof buildTokens>;

/**
 * antd's own seed tokens — what `getDesignToken()` uses when handed no
 * `token` override. NOT this deployment's brand seeds (those live in
 * `resources/theme.json` and are what the theme-shim's own `FALLBACK_SEEDS`
 * carry); these controls deliberately show the framework default.
 */
const ANTD_DEFAULT_SEEDS: BrandSeeds = {
  colorPrimary: '#1677ff',
  colorLink: '#1677ff',
  colorInfo: '#1677ff',
  colorError: '#ff4d4f',
  colorSuccess: '#52c41a',
  colorWarning: '#faad14',
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial,\n'Noto Sans', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol',\n'Noto Color Emoji'",
};

/**
 * `buildTokens` probes the CSS cascade on every call. These fallbacks are read
 * once per settings row (seven `ThemeColorPicker`s on the Branding page, each
 * asking for both modes), so memoise per mode. The cascade can change under us
 * when a root `<Theme>` swaps, but a *default*-seed snapshot is exactly the
 * part that does not follow the brand theme, so a static cache is honest here.
 */
const cache = new Map<'light' | 'dark', DesignToken>();

/** Drop-in for `theme.getDesignToken({ algorithm: <mode>Algorithm })`. */
export const getDefaultDesignToken = (mode: 'light' | 'dark'): DesignToken => {
  let tokens = cache.get(mode);
  if (!tokens) {
    tokens = buildTokens(mode, ANTD_DEFAULT_SEEDS);
    cache.set(mode, tokens);
  }
  return tokens;
};
