/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 Parity of the vendored `@ant-design/colors` port against a frozen capture of
 the upstream package (`antdColorsFixture.ts`). The Astryx theme recipe
 derives every brand-dependent `--bai-*` token and the dark-seed transform
 from this port, so a drift here is a visible brand-color drift.
 */
import {
  generate as vendoredGenerate,
  presetDarkPalettes as vendoredDarkPalettes,
  presetPalettes as vendoredPalettes,
} from './antdColors';
import {
  ANTD_COLORS_DARK_ON_BLACK_RAMPS,
  ANTD_COLORS_DARK_RAMPS,
  ANTD_COLORS_LIGHT_RAMPS,
  ANTD_COLORS_PRESET_DARK_PALETTES,
  ANTD_COLORS_PRESET_PALETTES,
  ANTD_COLORS_REFERENCE_SEEDS,
} from './antdColorsFixture';
import { describe, expect, it } from 'vitest';

/**
 * Every brand seed this repo ships (theme.json light + dark declarations),
 * plus `#1677ff` / greys to exercise the hue<60 branch and the achromatic
 * path. MUST stay in sync with the seeds `antdColorsFixture.ts` was captured
 * under — the fixture cannot be regenerated in-tree, so the assertion below
 * fails loudly if this list drifts.
 */
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
  it('covers exactly the seeds the frozen reference was captured for', () => {
    // Guards the frozen fixture: a seed present here but missing from the
    // capture would otherwise compare against `undefined` and pass vacuously.
    expect(REPO_SEEDS).toEqual([...ANTD_COLORS_REFERENCE_SEEDS]);
  });

  it('generate() matches upstream for light ramps', () => {
    for (const seed of REPO_SEEDS) {
      expect(ANTD_COLORS_LIGHT_RAMPS[seed]).toHaveLength(10);
      expect(vendoredGenerate(seed)).toEqual(ANTD_COLORS_LIGHT_RAMPS[seed]);
    }
  });

  it('generate() matches upstream for dark ramps (default + explicit bg)', () => {
    for (const seed of REPO_SEEDS) {
      expect(ANTD_COLORS_DARK_RAMPS[seed]).toHaveLength(10);
      expect(ANTD_COLORS_DARK_ON_BLACK_RAMPS[seed]).toHaveLength(10);
      expect(vendoredGenerate(seed, { theme: 'dark' })).toEqual(
        ANTD_COLORS_DARK_RAMPS[seed],
      );
      expect(
        vendoredGenerate(seed, { theme: 'dark', backgroundColor: '#000' }),
      ).toEqual(ANTD_COLORS_DARK_ON_BLACK_RAMPS[seed]);
    }
  });

  it('preset palettes match upstream tables', () => {
    // Both directions, so a hue dropped from either side is caught.
    expect(Object.keys(vendoredPalettes).sort()).toEqual(
      Object.keys(ANTD_COLORS_PRESET_PALETTES).sort(),
    );
    expect(Object.keys(vendoredDarkPalettes).sort()).toEqual(
      Object.keys(ANTD_COLORS_PRESET_DARK_PALETTES).sort(),
    );
    for (const hue of Object.keys(vendoredPalettes)) {
      expect(vendoredPalettes[hue]).toEqual(ANTD_COLORS_PRESET_PALETTES[hue]);
      expect(vendoredDarkPalettes[hue]).toEqual(
        ANTD_COLORS_PRESET_DARK_PALETTES[hue],
      );
    }
  });
});
