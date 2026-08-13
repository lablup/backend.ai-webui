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
export const ANTD_DESIGN_TOKEN_REFERENCE: Record<
  'light' | 'dark',
  Record<string, string>
> = {
  light: {
    fontFamily:
      "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial,\n'Noto Sans', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol',\n'Noto Color Emoji'",
    colorPrimary: '#ff7a00',
    colorLink: '#ff7a00',
    colorError: '#ff4d4f',
    colorSuccess: '#00bd9b',
    colorWarning: '#faad14',
    colorInfo: '#028df2',
    colorPrimaryHover: '#ff9729',
    colorPrimaryBg: '#fff6e6',
    colorLinkHover: '#ffb152',
    colorErrorHover: '#ff7875',
    colorErrorBg: '#fff2f0',
    colorErrorBorder: '#ffccc7',
    colorWarningHover: '#ffd666',
    colorWarningBg: '#fffbe6',
    colorWarningBorder: '#ffe58f',
    colorWarningBorderHover: '#ffd666',
    colorSuccessBorderHover: '#45d6b2',
    colorInfoBg: '#e6f9ff',
    red: '#F5222D',
    red5: '#ff4d4f',
    green5: '#73d13d',
    purple5: '#9254de',
    blue10: '#001d66',
  },
  dark: {
    fontFamily:
      "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial,\n'Noto Sans', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol',\n'Noto Color Emoji'",
    colorPrimary: '#be5e06',
    colorLink: '#be5e06',
    colorError: '#be3d3f',
    colorSuccess: '#068e76',
    colorWarning: '#d89614',
    colorInfo: '#0387bf',
    colorPrimaryHover: '#d37f25',
    colorPrimaryBg: '#502e0f',
    colorLinkHover: '#6e3b0c',
    colorErrorHover: '#d36664',
    colorErrorBg: '#261617',
    colorErrorBorder: '#502223',
    colorWarningHover: '#7c5914',
    colorWarningBg: '#2b2111',
    colorWarningBorder: '#594214',
    colorWarningBorderHover: '#7c5914',
    colorSuccessBorderHover: '#0c5548',
    colorInfoBg: '#111f27',
    red: '#F5222D',
    red5: '#a61d24',
    green5: '#3c8618',
    purple5: '#51258f',
    blue10: '#b7dcfa',
  },
};
