/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 The antd-parity data the Astryx theme recipe (`react/src/astryx-theme`) is
 built from: the vendored `@ant-design/colors` palette generator and the
 measured alignment tables. What is left of the theme-shim after the
 `useToken()` consumers moved onto `useTheme()` (FR-3605).
 */
export { generate, palette, presetDarkPalettes, presetPalettes, type GenerateOptions, } from './antdColors';
export { ANTD_ALIGN_TOKENS, ANTD_DARK_ALGORITHM_OUTPUT, ANTD_REVERSED_BAND_OVERLAYS, } from './antdParity';
export { BAI_SELF_COLOR_TOKENS, buildBaiCustomTokens, resolveDarkSeed, toSeedTuple, type BaiCustomTokenSeeds, type BrandSeedPair, } from './baiCustomTokens';
