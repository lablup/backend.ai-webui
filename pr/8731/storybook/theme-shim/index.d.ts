import { BAIThemeToken } from './tokenType';
import { PropsWithChildren } from '../../../../../../../setup-pnpm/node_modules/.bin/store/v11/links/@/react/19.2.8/01dc110d7f872a8caacc052aa0e86f46609c662315b6d5b76a7913331f487dd1/node_modules/react';
/** The brand seeds the deployment owns (resources/theme.json + user accent). */
export interface BrandSeeds {
    colorPrimary: string;
    colorLink: string;
    colorError: string;
    colorSuccess: string;
    colorWarning: string;
    colorInfo: string;
    fontFamily: string;
    /** antd component tokens, e.g. `{ Layout: { headerBg, headerHeight } }`. */
    components?: Record<string, Record<string, string | number>>;
}
type Mode = 'light' | 'dark';
/**
 * Build the full antd-compatible token object for the current cascade.
 * Called once per (mode, seeds, cascade-epoch) change — not per render and
 * not per token read. `_cascadeEpoch` is unused data-wise but participates in
 * memoization so a DOM cascade change (root `<Theme>` mount/swap) re-probes.
 */
export declare function buildTokens(mode: Mode, rawSeeds?: Partial<BrandSeeds>, _cascadeEpoch?: number): BAIThemeToken;
interface ShimValue {
    token: BAIThemeToken;
    hashId: string;
    theme: {
        id: number;
    };
}
export interface ThemeShimProviderProps extends PropsWithChildren {
    mode: Mode;
    seeds?: Partial<BrandSeeds>;
}
/**
 * Mount once near the app root (under the repo's `ThemeModeProvider` /
 * `useCustomThemeConfig`). Renders no DOM and mutates no document-level
 * attributes — the probe is self-contained (see astryxVars.ts) — so mounting
 * it cannot change any rendering by itself.
 */
export declare const ThemeShimProvider: ({ mode, seeds, children, }: ThemeShimProviderProps) => import("react").JSX.Element;
/** Drop-in for antd's `theme.useToken()`. */
export declare function useToken(): ShimValue;
/** `import { theme } from '../theme-shim'` — same call shape as antd's. */
export declare const theme: {
    useToken: typeof useToken;
};
export { ANTD_ALIGN_TOKENS, ANTD_DARK_ALGORITHM_OUTPUT, ANTD_REVERSED_BAND_OVERLAYS, } from './antdParity';
export { generate, presetPalettes } from './vendor/antdColors';
export type { GenerateOptions } from './vendor/antdColors';
export { BAI_BREAKPOINTS, BAI_BREAKPOINT_KEYS, BAI_BREAKPOINT_QUERIES, useBAIBreakpoint, useBAIActiveBreakpoint, type BAIBreakpointKey, type BAIScreenMap, } from './breakpoints';
