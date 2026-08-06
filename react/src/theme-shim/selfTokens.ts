/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 SPIKE (06-theme-token-layer): tokens with NO Astryx counterpart.

 These 19 names are ours to own. The values below are Ant Design's
 *current* computed values for this repo's theme (resources/theme.json seed,
 default + dark algorithm), captured with `theme.getDesignToken()`, so day-1
 parity is exact and every later change is a deliberate design decision rather
 than an accident of the migration.

 Generated — regenerate with scripts/spike-gen-self-tokens.mjs.
*/

/** [light, dark] — the same tuple shape Astryx uses for its own tokens. */
export const SELF_TOKENS: Record<string, [string | number, string | number]> = {
  borderRadiusXS: [2, 2],
  controlHeightSM: [24, 24],
  lineHeight: [1.5714285714285714, 1.5714285714285714],
  colorTextTertiary: ['rgba(0,0,0,0.45)', 'rgba(255,255,255,0.45)'],
  colorTextQuaternary: ['rgba(0,0,0,0.25)', 'rgba(255,255,255,0.25)'],
  colorTextLabel: ['rgba(0,0,0,0.65)', 'rgba(255,255,255,0.65)'],
  colorTextDescription: ['rgba(0,0,0,0.45)', 'rgba(255,255,255,0.45)'],
  colorTextPlaceholder: ['rgba(0,0,0,0.25)', 'rgba(255,255,255,0.25)'],
  colorFill: ['rgba(0,0,0,0.15)', 'rgba(255,255,255,0.18)'],
  colorFillSecondary: ['rgba(0,0,0,0.06)', '#262626'],
  colorFillTertiary: ['rgba(0,0,0,0.04)', 'rgba(255,255,255,0.08)'],
  colorFillQuaternary: ['rgba(0,0,0,0.02)', 'rgba(255,255,255,0.04)'],
  colorFillContent: ['rgba(0,0,0,0.06)', '#262626'],
  colorFillAlter: ['rgba(0,0,0,0.02)', 'rgba(255,255,255,0.04)'],
  colorBgContainerDisabled: ['rgba(0,0,0,0.04)', 'rgba(255,255,255,0.08)'],
  colorBgSpotlight: ['rgba(0,0,0,0.85)', '#424242'],
  screenXS: [480, 480],
  screenSM: [576, 576],
  zIndexPopupBase: [1000, 1000],
};
