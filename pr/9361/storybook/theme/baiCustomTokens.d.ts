/** A seed declared per scheme; `dark` is the DECLARED value, pre-transform. */
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
/**
 * Map a declared dark seed to the value antd's darkAlgorithm rendered for it:
 * the measured table for the shipped seeds, the vendored palette for any
 * other 6-digit hex (the same computation the shim ran live), and verbatim
 * passthrough for anything the generator cannot parse.
 */
export declare const resolveDarkSeed: (seed: string) => string;
/** Resolve tuple = [light seed, darkAlgorithm output of the dark seed]. */
export declare const toSeedTuple: (pair: BrandSeedPair) => [string, string];
/** antd's neutral text/fill alpha ramp and the preset steps still consumed. */
export declare const BAI_SELF_COLOR_TOKENS: Record<string, [string, string]>;
/**
 * The full `--bai-*` set for one seed set. Each brand-derived token has an
 * Astryx fallback for an undeclared seed. `--bai-primary-5` is the one antd
 * ramp step still consumed (progress fills): `generate()` (default options)
 * over the mode's palette key-6 map color, per scheme, index 4.
 */
export declare const buildBaiCustomTokens: (seeds: BaiCustomTokenSeeds) => Record<string, string | [string, string]>;
