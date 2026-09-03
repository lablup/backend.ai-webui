/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 The custom token layer of the Backend.AI Astryx theme (FR-3605).

 These carry the values the retired theme-shim used to compute at runtime
 for the antd vocabulary Astryx has no token for: the brand link/info
 seeds, the per-status bg/border/hover tints, and antd's neutral text/fill
 alpha ramp. The tints are `color-mix()` references over the pinned base
 tokens, so they follow an operator rebrand without any palette code. A seed
 the document does not declare falls back to an Astryx `var()` reference, so
 the token never goes missing. Shared by the app recipe
 (`react/src/astryx-theme/backendAiTheme.ts`) and the Storybook brand theme
 so the two cannot drift. Consumers read them via `useTheme().token()`.
 */
/** A seed declared per scheme; both sides are applied as declared. */
export interface BrandSeedPair {
    light: string;
    dark: string;
}
export type BaiCustomTokenSeeds = {
    accent?: BrandSeedPair;
    info?: BrandSeedPair;
    link?: BrandSeedPair;
    headerBg?: BrandSeedPair;
    error?: BrandSeedPair;
    success?: BrandSeedPair;
    warning?: BrandSeedPair;
};
/** The declared pair as a `[light, dark]` tuple. */
export declare const toSeedTuple: (pair: BrandSeedPair) => [string, string];
/** antd's neutral text/fill alpha ramp and the preset steps still consumed. */
export declare const BAI_SELF_COLOR_TOKENS: Record<string, [string, string]>;
/**
 * The full custom token set for one seed set. Each brand-derived token has an
 * Astryx fallback for an undeclared seed. `--primary-5` is the accent ramp
 * step still consumed by progress fills.
 */
export declare const buildBaiCustomTokens: (seeds: BaiCustomTokenSeeds) => Record<string, string | [string, string]>;
