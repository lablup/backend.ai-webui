/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 Theme-shim parity tests (to-astryx ticket 03).

 1. The vendored palette code (vendor/antdColors.ts) must be bit-identical to
    the still-installed `@ant-design/colors` — that is the whole point of the
    vendor step. When the npm package is removed, freeze these as fixed
    expected values.
 2. The dark seed transform must reproduce ticket 02's MEASURED
    ANTD_DARK_ALGORITHM_OUTPUT table (the settled dark-mode decision).
 3. buildTokens' non-probed verdicts (brand/derive/aligned/self) must match
    antd's own `theme.getDesignToken()` for this repo's seeds. Probed
    ('astryx') values need a real browser cascade and are covered by the
    ticket's pixel A/B instead.
 */
import {
  ANTD_ALIGN_TOKENS,
  ANTD_DARK_ALGORITHM_OUTPUT,
} from '../astryx-theme/backendAiTheme';
import { resolveLightDark } from './astryxVars';
import { buildTokens } from './index';
import { TOKEN_MAP } from './mapping';
import {
  generate as vendoredGenerate,
  palette,
  presetDarkPalettes as vendoredDarkPalettes,
  presetPalettes as vendoredPalettes,
} from './vendor/antdColors';
import {
  generate as upstreamGenerate,
  presetDarkPalettes as upstreamDarkPalettes,
  presetPalettes as upstreamPalettes,
} from '@ant-design/colors';
import { theme as antdTheme } from 'antd';
import { describe, expect, it } from 'vitest';

/** Every brand seed this repo ships (theme.json light + dark declarations). */
const REPO_SEEDS = [
  '#FF7A00',
  '#DC6B03',
  '#028DF2',
  '#009BDD',
  '#00BD9B',
  '#03A487',
  '#FF4D4F',
  '#DC4446',
  '#FAAD14',
  // exercises the hue<60 branch and greys
  '#1677ff',
  '#666666',
  '#000000',
  '#ffffff',
];

describe('vendored @ant-design/colors parity', () => {
  it('generate() matches upstream for light ramps', () => {
    for (const seed of REPO_SEEDS) {
      expect(vendoredGenerate(seed)).toEqual(upstreamGenerate(seed));
    }
  });

  it('generate() matches upstream for dark ramps (default + explicit bg)', () => {
    for (const seed of REPO_SEEDS) {
      expect(vendoredGenerate(seed, { theme: 'dark' })).toEqual(
        upstreamGenerate(seed, { theme: 'dark' }),
      );
      expect(
        vendoredGenerate(seed, { theme: 'dark', backgroundColor: '#000' }),
      ).toEqual(
        upstreamGenerate(seed, { theme: 'dark', backgroundColor: '#000' }),
      );
    }
  });

  it('preset palettes match upstream tables', () => {
    for (const hue of Object.keys(vendoredPalettes)) {
      expect(vendoredPalettes[hue]).toEqual([...upstreamPalettes[hue]]);
      expect(vendoredDarkPalettes[hue]).toEqual([...upstreamDarkPalettes[hue]]);
    }
  });
});

describe('dark seed transform (ticket 02 settled decision)', () => {
  it('palette(seed, dark)(6) reproduces the measured darkAlgorithm outputs', () => {
    for (const [declared, rendered] of Object.entries(
      ANTD_DARK_ALGORITHM_OUTPUT,
    )) {
      expect(palette(declared, 'dark')(6)).toBe(rendered);
    }
  });
});

describe('resolveLightDark', () => {
  it('resolves the pinned antd shadow recipe per mode', () => {
    const recipe = ANTD_ALIGN_TOKENS['--shadow-med'];
    const light = resolveLightDark(recipe, 'light');
    const dark = resolveLightDark(recipe, 'dark');
    expect(light).toBe(
      '0 6px 16px 0 rgba(0,0,0,0.08), 0 3px 6px -4px rgba(0,0,0,0.12), 0 9px 28px 8px rgba(0,0,0,0.05)',
    );
    expect(dark).toBe(
      '0 6px 16px 0 rgba(255,255,255,0.016), 0 3px 6px -4px rgba(255,255,255,0.024), 0 9px 28px 8px rgba(255,255,255,0.01)',
    );
    expect(light).not.toContain('light-dark');
  });

  it('passes through streams without light-dark()', () => {
    expect(resolveLightDark('0 1px 2px #000', 'dark')).toBe('0 1px 2px #000');
  });
});

describe('buildTokens vs antd getDesignToken (non-probed verdicts)', () => {
  // The exact seeds resources/theme.json declares per mode.
  const seedsFor = (mode: 'light' | 'dark') =>
    mode === 'light'
      ? {
          colorPrimary: '#FF7A00',
          colorLink: '#FF7A00',
          colorInfo: '#028DF2',
          colorSuccess: '#00BD9B',
          colorError: '#FF4D4F',
        }
      : {
          colorPrimary: '#DC6B03',
          colorLink: '#DC6B03',
          colorInfo: '#009BDD',
          colorSuccess: '#03A487',
          colorError: '#DC4446',
        };

  const CHECK_VERDICTS = new Set(['brand', 'derive']);

  for (const mode of ['light', 'dark'] as const) {
    it(`matches antd for every brand/derive token (${mode})`, () => {
      const antdTokens = antdTheme.getDesignToken({
        token: seedsFor(mode),
        algorithm:
          mode === 'dark'
            ? antdTheme.darkAlgorithm
            : antdTheme.defaultAlgorithm,
      }) as unknown as Record<string, string | number>;
      const shimTokens = buildTokens(mode, seedsFor(mode)) as unknown as Record<
        string,
        string | number
      >;

      const mismatches: string[] = [];
      for (const [name, entry] of Object.entries(TOKEN_MAP)) {
        if (!CHECK_VERDICTS.has(entry.verdict)) continue;
        if (name === 'fontFamily') continue; // shim: theme.json owns it
        if (
          String(shimTokens[name]).toLowerCase() !==
          String(antdTokens[name]).toLowerCase()
        ) {
          mismatches.push(
            `${name}: shim=${shimTokens[name]} antd=${antdTokens[name]}`,
          );
        }
      }
      expect(mismatches).toEqual([]);
    });
  }

  it('pins the aligned metric tokens to the antd values', () => {
    const t = buildTokens('light') as unknown as Record<
      string,
      string | number
    >;
    expect(t.borderRadiusLG).toBe(8);
    expect(t.fontSizeLG).toBe(16);
    expect(t.fontSizeHeading5).toBe(16);
    expect(t.fontSizeHeading1).toBe(38);
    expect(t.motionDurationSlow).toBe('0.3s');
  });
});
