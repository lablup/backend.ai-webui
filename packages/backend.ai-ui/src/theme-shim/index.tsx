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
import {
  palette,
  presetDarkPalettes,
  presetPalettes,
} from './vendor/antdColors';
import type { GlobalToken } from 'antd';
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
): GlobalToken {
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

  return out as unknown as GlobalToken;
}

interface ShimValue {
  token: GlobalToken;
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
 * Provider-less fallback (tests, plain Storybook stories): computed once and
 * cached — these contexts never mount a real Astryx root `<Theme>`, so
 * re-probing per render would only add cost (BUI tables call `useToken()`
 * per cell), never a different answer.
 */
let fallbackValue: ShimValue | undefined;

/** Drop-in for antd's `theme.useToken()`. */
export function useToken(): ShimValue {
  const ctx = use(ThemeShimContext);
  if (ctx) return ctx;
  fallbackValue ??= {
    token: buildTokens('light', FALLBACK_SEEDS),
    hashId: 'bai-light',
    theme: { id: 0 },
  };
  return fallbackValue;
}

/** `import { theme } from '../theme-shim'` — same call shape as antd's. */
export const theme = { useToken };

// Shared measured tables (consumed by react/src/astryx-theme/backendAiTheme.ts
// via the `backend.ai-ui` public entry — see antdParity.ts).
export { ANTD_ALIGN_TOKENS, ANTD_DARK_ALGORITHM_OUTPUT } from './antdParity';
