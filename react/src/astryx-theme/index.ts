/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 Backend.AI brand theme package for Astryx (to-astryx ticket 02).

 - `backendAiTheme` — pure builders, seeds, dark-tuple table, name rule.
 - `resolveRoleTheme` — prebuilt-vs-runtime resolution against theme.json.
 - `AstryxBrandTheme` / `AstryxAdminTheme` / `AstryxSecondaryTheme` /
   `AstryxReverseTheme` — the provider adapters (mode-explicit; nested
   Themes do not inherit mode).
 */
export * from './backendAiTheme';
export { resolveRoleTheme } from './resolveRoleTheme';
export { builtBackendAiBrandTheme } from './built';
export { default as AstryxBrandTheme } from './AstryxBrandTheme';
export { default as AstryxAdminTheme } from './AstryxAdminTheme';
export { default as AstryxReverseTheme } from './AstryxReverseTheme';
export { default as AstryxSecondaryTheme } from './AstryxSecondaryTheme';
