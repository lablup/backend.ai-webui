/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 Drop-in replacement for antd's `theme.useToken()` backed by Astryx tokens
 (to-astryx ticket 03; design measured and pixel-verified in the ticket-06
 spike, brand/dark decisions inherited from ticket 02).

 Codemod contract — token-consuming files change ONLY their import
 (`scripts/codemods/antd-theme-to-shim.mjs`):

     -import { Button, theme } from 'antd';
     +import { Button } from 'antd';
     +import { theme } from '../theme-shim';

 `useToken()` returns the same `{ token, hashId, theme }` shape and,
 critically, the same JS *types* antd returns: numbers for dimensions, colour
 strings for colours. It does NOT return `var(--x)` strings — 144 call sites
 do arithmetic / unit-suffixing / hex surgery on tokens (see astryxVars.ts).

 Value sources, per mapping.ts verdict:
   astryx   probed live from the Astryx CSS cascade (theme-neutral today; a
            real root `<Theme>`'s cascade automatically once one is mounted)
   aligned  ticket 02's ANTD_ALIGN_TOKENS (already pinned to antd values)
   brand    runtime seeds (resources/theme.json / user accent); dark side is
            antd's darkAlgorithm transform via the vendored palette()
   derive   antd's own palette algorithm over the brand seeds (vendored)
   self     ./selfTokens.ts [light, dark] pairs
 */
import { ANTD_ALIGN_TOKENS } from './antdParity';
import { resolveAstryxVars, resolveLightDark, rgbToHex } from './astryxVars';
import { TOKEN_MAP, type BrandSeedName } from './mapping';
import { SELF_TOKENS } from './selfTokens';
import { type BAIThemeToken } from './tokenType';
import {
  palette,
  presetDarkPalettes,
  presetPalettes,
} from './vendor/antdColors';
import {
  createContext,
  use,
  useEffect,
  useState,
  type PropsWithChildren,
} from 'react';

/**
 * The theme scope the shim probes under when no real Astryx root `<Theme>`
 * owns the document yet. theme-neutral's CSS is globally imported since
 * ticket 01 (react/src/index.css).
 */
const FALLBACK_SCOPE = 'neutral';

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

/** antd's default seeds, matching resources/theme.json's omissions. */
const FALLBACK_SEEDS: BrandSeeds = {
  colorPrimary: '#ff7a00',
  colorLink: '#ff7a00',
  colorError: '#ff4d4f',
  colorSuccess: '#00bd9b',
  colorWarning: '#faad14',
  colorInfo: '#028df2',
  fontFamily: "'Ubuntu', Roboto, sans-serif",
};

type Mode = 'light' | 'dark';

const SEED_NAMES: BrandSeedName[] = [
  'colorPrimary',
  'colorLink',
  'colorError',
  'colorSuccess',
  'colorWarning',
  'colorInfo',
];

const mergeSeeds = (raw?: Partial<BrandSeeds>): BrandSeeds =>
  ({
    ...FALLBACK_SEEDS,
    // resources/theme.json defines only a subset per mode (e.g. no
    // colorWarning in either block) — drop undefined keys so the fallback
    // seed survives instead of poisoning the palette generator.
    ...Object.fromEntries(
      Object.entries(raw ?? {}).filter(([, v]) => v !== undefined),
    ),
  }) as BrandSeeds;

/**
 * Build the full antd-compatible token object for the current cascade.
 * Called once per (mode, seeds, cascade-epoch) change — not per render and
 * not per token read. `_cascadeEpoch` is unused data-wise but participates in
 * memoization so a DOM cascade change (root `<Theme>` mount/swap) re-probes.
 */
export function buildTokens(
  mode: Mode,
  rawSeeds?: Partial<BrandSeeds>,
  _cascadeEpoch = 0,
): BAIThemeToken {
  const seeds = mergeSeeds(rawSeeds);

  // 1. every 'astryx' entry, resolved live from the CSS custom properties.
  const varSpec: Record<
    string,
    { var: string; kind: 'length' | 'color' | 'raw' | 'number' }
  > = {};
  for (const [name, e] of Object.entries(TOKEN_MAP)) {
    if (e.verdict === 'astryx' && e.var) {
      varSpec[name] = { var: e.var, kind: e.kind ?? 'length' };
    }
  }
  const out: Record<string, string | number> =
    typeof document === 'undefined'
      ? {}
      : resolveAstryxVars(varSpec, {
          mode,
          // When a real Astryx root <Theme> owns the document, read its
          // cascade; otherwise open the neutral scope on the probe host.
          scopeAttr: document.documentElement.hasAttribute('data-astryx-theme')
            ? null
            : FALLBACK_SCOPE,
        });

  // 2. 'aligned' entries — ticket 02 already pinned these Astryx variables to
  //    the antd values; consume that table directly instead of probing so the
  //    values hold even while only the neutral theme's CSS is loaded.
  for (const [name, e] of Object.entries(TOKEN_MAP)) {
    if (e.verdict !== 'aligned' || !e.var) continue;
    const pinned = (ANTD_ALIGN_TOKENS as Record<string, string>)[e.var];
    if (pinned === undefined) continue;
    if (e.kind === 'length') {
      out[name] = parseFloat(pinned);
    } else if (/^\d+(\.\d+)?ms$/.test(pinned)) {
      // antd formats durations in seconds ('0.3s').
      out[name] = `${parseFloat(pinned) / 1000}s`;
    } else {
      out[name] = resolveLightDark(pinned, mode);
    }
  }

  // 3. brand seeds. antd's map token for a seed is palette key 6 — in light
  //    that is the seed itself (hex-normalised), in dark it is the
  //    darkAlgorithm's transformed seed (#DC6B03 -> #be5e06 etc., matching
  //    ticket 02's measured ANTD_DARK_ALGORITHM_OUTPUT for every seed).
  const paletteOf = Object.fromEntries(
    SEED_NAMES.map((n) => [n, palette(seeds[n], mode)]),
  ) as Record<BrandSeedName, (key: number) => string>;
  for (const n of SEED_NAMES) {
    out[n] = paletteOf[n](6);
  }
  out.fontFamily = seeds.fontFamily;

  // 4. derived state families — antd's own algorithm (vendored), kept
  //    because Astryx has no per-status hover/bg/border ramp.
  for (const [name, e] of Object.entries(TOKEN_MAP)) {
    if (e.verdict !== 'derive') continue;
    if (e.derive) {
      const key =
        mode === 'dark' ? (e.derive.darkKey ?? e.derive.key) : e.derive.key;
      out[name] = paletteOf[e.derive.seed](key);
    } else if (e.preset) {
      const table =
        mode === 'dark' && e.preset.darkTable
          ? presetDarkPalettes
          : presetPalettes;
      out[name] = table[e.preset.hue]?.[e.preset.index] ?? '';
    }
  }

  // 5. tokens with no Astryx counterpart — ours.
  for (const [name, pair] of Object.entries(SELF_TOKENS)) {
    out[name] = pair[mode === 'dark' ? 1 : 0];
  }

  // 6. colours come back from the probe as `rgb()/rgba()`. antd hands out hex
  //    for opaque colours, and several sites do `token.colorPrimary.slice(1,
  //    3)` on the assumption of `#rrggbb`. Normalise opaque results to hex.
  for (const [name, e] of Object.entries(TOKEN_MAP)) {
    if (e.kind === 'color' && typeof out[name] === 'string') {
      const v = out[name] as string;
      if (v.startsWith('rgb(')) out[name] = rgbToHex(v);
    }
  }

  // 7. antd component tokens (`token.Layout?.headerBg`).
  if (seeds.components) Object.assign(out, seeds.components);

  return out as unknown as BAIThemeToken;
}

interface ShimValue {
  token: BAIThemeToken;
  hashId: string;
  theme: { id: number };
}

const ThemeShimContext = createContext<ShimValue | undefined>(undefined);

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
export const ThemeShimProvider = ({
  mode,
  seeds,
  children,
}: ThemeShimProviderProps) => {
  'use memo';
  // Re-resolve when the Astryx cascade changes out from under us — a root
  // <Theme> mounting/unmounting (it syncs `data-astryx-theme`/`data-theme`
  // to <html>) or a runtime theme swap. Cheapest reliable signal without
  // reaching into Astryx internals.
  const [epoch, setEpoch] = useState(0);
  useEffect(() => {
    const obs = new MutationObserver(() => setEpoch((n) => n + 1));
    obs.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme', 'data-astryx-theme', 'class', 'style'],
    });
    return () => obs.disconnect();
  }, []);

  const value: ShimValue = {
    token: buildTokens(mode, seeds, epoch),
    hashId: `bai-${mode}`,
    theme: { id: epoch },
  };

  return <ThemeShimContext value={value}>{children}</ThemeShimContext>;
};

/**
 * The mode/scope the document is actually painting in, for consumers that
 * render OUTSIDE `ThemeShimProvider`.
 *
 * A root Astryx `<Theme>` syncs BOTH `data-theme` (light|dark) and
 * `data-astryx-theme` (theme name) onto `<html>` precisely so that CSS which
 * escapes the provider subtree — portals, toast viewports, whole React roots
 * that are not ours — still resolves against the live cascade. This reads the
 * same two attributes, so the shim follows the document instead of guessing.
 *
 * Before that sync happens (or with no Astryx `<Theme>` at all) the name is
 * absent and `buildTokens` opens `FALLBACK_SCOPE` on its own probe host.
 */
const readDocumentScope = (): { mode: Mode; themeName: string } => {
  if (typeof document === 'undefined') {
    return { mode: 'light', themeName: '' };
  }
  const attr = document.documentElement.getAttribute('data-theme');
  const mode: Mode =
    attr === 'dark' || attr === 'light'
      ? attr
      : typeof window !== 'undefined' &&
          window.matchMedia?.('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
  return {
    mode,
    themeName: document.documentElement.getAttribute('data-astryx-theme') ?? '',
  };
};

/**
 * Provider-less fallback (tests, Storybook stories, harness pages, and any
 * app subtree mounted outside `DefaultProviders` — e.g. the route-level
 * `errorElement` / `BAIErrorBoundary`, which sit ABOVE the provider stack).
 *
 * Cached PER (mode, theme-name) rather than once-globally. The previous
 * single cached `'light'` entry made every such surface paint light tokens in
 * a dark document, and — because the entry was frozen at whatever the cascade
 * looked like on the very first `useToken()` call — usually the *neutral*
 * fallback scope rather than the brand theme (measured: `colorBgContainer`
 * `#FFFFFF`, `colorBgLayout` `#F1F4F7` while the page painted `#180F08`).
 *
 * No subscription is installed: `useToken()` is called per table cell, so a
 * per-call `useSyncExternalStore` would cost thousands of subscriptions to
 * serve a path the app root never takes. Reading the attributes at render
 * time is enough — a mode flip re-renders the tree that owns it.
 */
const fallbackCache = new Map<string, ShimValue>();

/** Drop-in for antd's `theme.useToken()`. */
export function useToken(): ShimValue {
  const ctx = use(ThemeShimContext);
  if (ctx) return ctx;
  const { mode, themeName } = readDocumentScope();
  const key = `${mode}|${themeName}`;
  let value = fallbackCache.get(key);
  if (!value) {
    value = {
      token: buildTokens(mode, FALLBACK_SEEDS),
      hashId: `bai-${mode}`,
      theme: { id: 0 },
    };
    fallbackCache.set(key, value);
  }
  return value;
}

/** `import { theme } from '../theme-shim'` — same call shape as antd's. */
export const theme = { useToken };

// Shared measured tables (consumed by react/src/astryx-theme/backendAiTheme.ts
// via the `backend.ai-ui` public entry — see antdParity.ts).
export { ANTD_ALIGN_TOKENS, ANTD_DARK_ALGORITHM_OUTPUT } from './antdParity';

// Palette algorithm (ticket 35). `vendor/antdColors.ts` was already a
// bit-identical port of `@ant-design/colors` (parity-tested in
// themeShim.test.ts) but was internal to the shim, so the two app call sites
// that needed `generate()` / `presetPalettes` kept importing the real package
// and held `@ant-design/colors` in react/'s PRODUCTION dependencies. Promoting
// the vendored copy to the public surface lets those call sites drop the
// package: the dependency is now dev-only (the parity test's reference
// implementation), which is exactly where a vendored-port baseline belongs.
export { generate, presetPalettes } from './vendor/antdColors';
export type { GenerateOptions } from './vendor/antdColors';

// Breakpoint system (ticket 08 gap component; policy in ticket 14): the JS
// side of the responsive policy. `Grid.useBreakpoint()` call sites convert by
// import swap to `useBAIBreakpoint`; `token.screen*`-as-px-constant sites
// read `BAI_BREAKPOINTS` instead of theme tokens.
export {
  BAI_BREAKPOINTS,
  BAI_BREAKPOINT_KEYS,
  BAI_BREAKPOINT_QUERIES,
  useBAIBreakpoint,
  useBAIActiveBreakpoint,
  type BAIBreakpointKey,
  type BAIScreenMap,
} from './breakpoints';
