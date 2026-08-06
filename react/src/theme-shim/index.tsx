/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 SPIKE (06-theme-token-layer): a drop-in replacement for antd's `theme.useToken()`
 backed by Astryx tokens.

 Codemod contract — the 290 files that consume design tokens change ONLY their
 import:

     -import { Button, theme } from 'antd';
     +import { Button } from 'antd';
     +import { theme } from '@/theme-shim';

 `useToken()` returns the same `{ token, hashId, theme }` shape and, critically,
 the same JS *types* antd returns: numbers for dimensions, colour strings for
 colours. It does NOT return `var(--x)` strings — see astryxVars.ts for why.
*/
import { resolveAstryxVars, rgbToHex } from './astryxVars';
import { TOKEN_MAP } from './mapping';
import { SELF_TOKENS } from './selfTokens';
import {
  generate,
  presetPalettes,
  presetDarkPalettes,
} from '@ant-design/colors';
import type { GlobalToken } from 'antd';
import {
  createContext,
  use,
  useEffect,
  useState,
  type PropsWithChildren,
} from 'react';

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

function rampFor(seed: string, mode: Mode, bg: string) {
  return generate(seed, {
    theme: mode === 'dark' ? 'dark' : 'default',
    backgroundColor: bg,
  });
}

/**
 * Build the full antd-compatible token object for the current cascade.
 * Called once per (mode, seeds) change — not per render, not per token read.
 */
export function buildTokens(mode: Mode, rawSeeds: BrandSeeds): GlobalToken {
  // resources/theme.json defines only a subset per mode (e.g. no colorWarning
  // in either block) — fill the gaps so `generate()` never sees `undefined`.
  const seeds: BrandSeeds = {
    ...FALLBACK_SEEDS,
    ...Object.fromEntries(
      Object.entries(rawSeeds ?? {}).filter(([, v]) => v !== undefined),
    ),
  } as BrandSeeds;
  // 1. every 'astryx' / 'drift' entry, resolved from live CSS custom properties
  const varSpec: Record<
    string,
    { var: string; kind: 'length' | 'color' | 'raw' | 'number' }
  > = {};
  for (const [name, e] of Object.entries(TOKEN_MAP)) {
    if ((e.verdict === 'astryx' || e.verdict === 'drift') && e.var) {
      varSpec[name] = { var: e.var, kind: e.kind ?? 'length' };
    }
  }
  const resolved =
    typeof document === 'undefined' ? {} : resolveAstryxVars(varSpec);

  const out: Record<string, string | number> = { ...resolved };

  // 2. brand seeds
  const bg = mode === 'dark' ? '#000' : '#fff';
  out.colorPrimary = seeds.colorPrimary;
  out.colorLink = seeds.colorLink;
  out.colorError = seeds.colorError;
  out.colorSuccess = seeds.colorSuccess;
  out.colorWarning = seeds.colorWarning;
  out.colorInfo = seeds.colorInfo;
  out.fontFamily = seeds.fontFamily;

  // 3. derived state families — antd's algorithm, kept because Astryx has no
  //    per-status hover/active/border ramp (only `-muted` + 2 overlay levels).
  const ramps: Record<string, string[]> = {
    colorPrimary: rampFor(seeds.colorPrimary, mode, bg),
    colorLink: rampFor(seeds.colorLink, mode, bg),
    colorError: rampFor(seeds.colorError, mode, bg),
    colorSuccess: rampFor(seeds.colorSuccess, mode, bg),
    colorWarning: rampFor(seeds.colorWarning, mode, bg),
    colorInfo: rampFor(seeds.colorInfo, mode, bg),
  };
  for (const [name, e] of Object.entries(TOKEN_MAP)) {
    if (e.verdict !== 'derive' || !e.formula) continue;
    const m = e.formula.match(
      /^(?:ramp\((\w+)\)|presetRamp\("(\w+)"\))(\[\d+\])$/,
    );
    if (!m) continue;
    const idx = parseInt(m[3].slice(1, -1), 10);
    if (m[1]) {
      out[name] = ramps[m[1]]?.[idx] ?? '';
    } else {
      // Preset hues are FIXED tables in antd, not `generate()` output — using
      // the tables keeps day-1 parity exact.
      // antd leaves the bare preset hues (`token.red`) untransformed in dark
      // mode; only the `*5`-style steps come from the dark table.
      const palettes = (
        mode === 'dark' && /\d$/.test(name)
          ? presetDarkPalettes
          : presetPalettes
      ) as Record<string, string[]>;
      out[name] = palettes[m[2]]?.[idx] ?? '';
    }
  }

  // 4. tokens with no Astryx counterpart — ours
  for (const [name, pair] of Object.entries(SELF_TOKENS)) {
    out[name] = pair[mode === 'dark' ? 1 : 0];
  }

  // 5. colours come back from the probe as `rgb()/rgba()`. antd hands out hex
  //    for opaque colours, and 4 sites do `token.colorPrimary.slice(1, 3)` on
  //    the assumption of `#rrggbb`. Normalise opaque results to hex.
  for (const [name, e] of Object.entries(TOKEN_MAP)) {
    if (e.kind === 'color' && typeof out[name] === 'string') {
      const v = out[name] as string;
      if (v.startsWith('rgb(')) out[name] = rgbToHex(v);
    }
  }

  // 6. antd component tokens (`token.Layout?.headerBg`)
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
 * Mount once, inside Astryx's `<Theme>` (so the probe reads the right cascade)
 * and under the repo's existing `ThemeModeProvider` / `useCustomThemeConfig`.
 */
export const ThemeShimProvider = ({
  mode,
  seeds,
  children,
}: ThemeShimProviderProps) => {
  'use memo';
  // `seeds` comes straight from resources/theme.json, whose `dark` block only
  // overrides a subset (no colorWarning). Drop undefined keys so the fallback
  // seed survives instead of poisoning `generate()`. Plain value — the React
  // Compiler memoizes it (see .claude/rules/react-compiler-memoization.md).
  const merged = {
    ...FALLBACK_SEEDS,
    ...Object.fromEntries(
      Object.entries(seeds ?? {}).filter(([, v]) => v !== undefined),
    ),
  } as BrandSeeds;

  // Astryx's own DOM contract: `html[data-theme]` drives `color-scheme` (which
  // is what resolves every `light-dark()` token), and `[data-astryx-theme]`
  // opens the `@scope` block that carries the theme's colour values. In a real
  // migration this is what Astryx's `<Theme>` component writes; here we write it
  // directly so the shim can be evaluated without adopting Astryx components.
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', mode);
    document.documentElement.setAttribute('data-astryx-theme', 'neutral');
  }, [mode]);

  // Re-resolve when the Astryx theme swaps at runtime (the `<Theme>` provider
  // injects a new stylesheet; a MutationObserver on <html>/<body> attrs is the
  // cheapest signal that does not require Astryx internals).
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
    token: buildTokens(mode, merged),
    hashId: `bai-${mode}`,
    theme: { id: epoch },
  };

  return <ThemeShimContext value={value}>{children}</ThemeShimContext>;
};

/** Drop-in for antd's `theme.useToken()`. */
export function useToken(): ShimValue {
  const ctx = use(ThemeShimContext);
  if (ctx) return ctx;
  // Provider-less fallback (tests, Storybook): resolve on the spot.
  return {
    token: buildTokens('light', FALLBACK_SEEDS),
    hashId: 'bai-light',
    theme: { id: 0 },
  };
}

/** `import { theme } from '@/theme-shim'` — same call shape as antd's. */
export const theme = { useToken };
