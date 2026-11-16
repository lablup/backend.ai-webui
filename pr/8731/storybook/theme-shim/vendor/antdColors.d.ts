/**
 @license
 Vendored from `@ant-design/colors@7.2.1` (MIT, (c) ant-design) and the minimal
 HSV/mix internals of its dependency `@ant-design/fast-color@2.0.6` (MIT).

 Why vendored (to-astryx ticket 03): `@ant-design/*` packages are inside the
 antd removal scope, but the theme shim (`../index.tsx`) keeps antd's own
 palette derivation for the 17 state-family tokens Astryx has no ramp for
 (`colorPrimaryHover`, `colorErrorBg`, …). This file makes that derivation
 self-contained so the shim survives `@ant-design/colors` removal.

 Parity contract: output is bit-identical to `@ant-design/colors@7.2.1` — the
 same stepping constants, the same rounding points, the same hex formatting.
 This was originally asserted against the still-installed package; the package
 has since been dropped, so `../themeShim.test.ts` now asserts it against
 `../antdColorsFixture.ts`, the frozen capture of that version's real output.
 The contract is unchanged — this port targets 7.2.1, not "latest".
 */
export interface GenerateOptions {
    theme?: 'dark' | 'default';
    backgroundColor?: string;
}
/**
 * antd's 10-step palette generator. `generate(seed)` yields the light ramp
 * (index 5 === the seed); `generate(seed, {theme: 'dark'})` yields the dark
 * ramp (each step mixed into the dark background, default `#141414`).
 */
export declare function generate(color: string, opts?: GenerateOptions): string[];
export declare const presetPalettes: Record<string, string[]>;
export declare const presetDarkPalettes: Record<string, string[]>;
/**
 * antd-equivalent color palette for a seed: `palette(seed, mode)(key)` returns
 * exactly what antd's `generateColorPalettes(seed)[key]` returns under the
 * default (light) / dark algorithm. Note dark uses the generator's default
 * `#141414` background — this is how `#DC6B03` becomes the measured `#be5e06`
 * (`palette(seed, 'dark')(6)`), i.e. antd's darkAlgorithm seed transform.
 */
export declare function palette(seed: string, mode: 'light' | 'dark'): (key: number) => string;
