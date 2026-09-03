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
 * Astryx fallback for an undeclared seed. `--primary-5` is the one antd
 * ramp step still consumed (progress fills): `generate()` (default options)
 * over the mode's palette key-6 map color, per scheme, index 4.
 */
export declare const buildBaiCustomTokens: (seeds: BaiCustomTokenSeeds) => Record<string, string | [string, string]>;
