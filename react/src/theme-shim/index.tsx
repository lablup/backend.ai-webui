/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 antd `theme.useToken()` shim — react-app entry (to-astryx ticket 10).

 The shim core moved to `packages/backend.ai-ui/src/theme-shim/` so BUI (a
 separate workspace package that cannot import from react/src) shares one
 implementation. This module only re-exports it: the 218 react/src files the
 ticket-09 codemod pointed at `../theme-shim` keep working unchanged, and the
 codemod keeps targeting this directory for react/src files.
 */
export {
  theme,
  useToken,
  buildTokens,
  ThemeShimProvider,
  type ThemeShimProviderProps,
  type BrandSeeds,
} from 'backend.ai-ui';
