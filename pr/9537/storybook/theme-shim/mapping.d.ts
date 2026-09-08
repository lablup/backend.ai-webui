/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 The antd -> Astryx token mapping table (to-astryx ticket 03, from the
 ticket-06 spike).

 Every one of the 99 antd design-token names the repo actually references
 gets a resolution here. Verdicts:

   'astryx'   exact Astryx counterpart                  -> resolved live from CSS
   'aligned'  Astryx counterpart whose value ticket 02 pinned to the antd
              value (`ANTD_ALIGN_TOKENS` in ../astryx-theme/backendAiTheme.ts)
              -> taken from that table, NOT probed, so the value is correct
              even while only the neutral theme's CSS is in the cascade
   'derive'   computed from a brand seed with antd's own palette algorithm
              (vendored in ./vendor/antdColors.ts)
   'brand'    owned by resources/theme.json + user accent -> runtime seeds;
              dark side goes through antd's darkAlgorithm seed transform
              (= `palette(seed, 'dark')(6)`, reproducing ticket 02's measured
              ANTD_DARK_ALGORITHM_OUTPUT table for every seed)
   'self'     no Astryx counterpart                      -> our own light/dark pair
              (./selfTokens.ts)
 */
export type Verdict = 'astryx' | 'aligned' | 'derive' | 'brand' | 'self';
/** The six runtime-configurable brand seeds (resources/theme.json). */
export type BrandSeedName = 'colorPrimary' | 'colorLink' | 'colorError' | 'colorSuccess' | 'colorWarning' | 'colorInfo';
export interface MapEntry {
    verdict: Verdict;
    /** Astryx CSS custom property (verdict astryx | aligned). */
    var?: string;
    kind?: 'length' | 'color' | 'raw' | 'number';
    /**
     * verdict 'derive' — antd palette-key lookup over a brand seed:
     * `palette(seed, mode)(key)` (see vendor/antdColors.ts). `darkKey`
     * overrides the key in dark mode where antd's dark derivative diverges
     * (e.g. `colorPrimaryBg` = colorPrimaryBorder in dark).
     */
    derive?: {
        seed: BrandSeedName;
        key: number;
        darkKey?: number;
    };
    /**
     * verdict 'derive' — fixed antd preset-hue table lookup.
     * `darkTable: true` reads presetDarkPalettes in dark mode (the `redN`
     * steps); bare hues (`token.red`) are NOT dark-transformed by antd.
     */
    preset?: {
        hue: string;
        index: number;
        darkTable?: boolean;
    };
    note?: string;
}
export declare const TOKEN_MAP: Record<string, MapEntry>;
/** antd component tokens reached through `token.Layout?.*` (8 refs, 4 files). */
export declare const COMPONENT_TOKEN_KEYS: readonly ["Layout"];
