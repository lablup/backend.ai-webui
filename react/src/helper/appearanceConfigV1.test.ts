/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import {
  isV1AppearanceConfig,
  migrateV1AppearanceConfig,
} from './appearanceConfigV1';
import { pickValidAppearanceConfig } from './customThemeConfig';
import Ajv from 'ajv';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const schema = JSON.parse(
  readFileSync(
    resolve(
      dirname(fileURLToPath(import.meta.url)),
      '../../../resources/theme.schema.json',
    ),
    'utf8',
  ),
);
const validate = new Ajv({ allErrors: true }).compile(schema);

/** The v1 document Backend.AI shipped until FR-3605, trimmed to what converts. */
const V1_DOCUMENT = {
  $schema: './theme.schema.json',
  fontFamily: "'Ubuntu', Roboto, sans-serif",
  light: {
    token: {
      colorPrimary: '#FF7A00',
      colorLink: '#FF7A00',
      colorText: '#141414',
      colorInfo: '#028DF2',
      colorError: '#FF4D4F',
      colorSuccess: '#00BD9B',
      screenXXL: 1920,
    },
    components: {
      Tag: { borderRadiusSM: 1 },
      Layout: { lightSiderBg: '#FFF', siderBg: '#141414', headerBg: '#FF9729' },
      Table: { headerBg: '#E3E3E3' },
    },
  },
  dark: {
    token: {
      colorPrimary: '#DC6B03',
      colorLink: '#DC6B03',
      colorText: '#FFF',
      colorInfo: '#009BDD',
      colorError: '#DC4446',
      colorSuccess: '#03A487',
    },
    components: {
      Layout: { siderBg: '#141414', headerBg: '#E88A28' },
    },
  },
  logo: {
    src: '/manifest/brand-white.svg',
    srcCollapsed: '/manifest/brand-mark-white.svg',
    size: { width: 159, height: 24 },
  },
  sider: { theme: 'dark' },
  branding: { companyName: 'Lablup Inc.', brandName: 'Backend.AI' },
};

describe('isV1AppearanceConfig', () => {
  it('recognizes an antd-shaped document', () => {
    expect(isV1AppearanceConfig(V1_DOCUMENT)).toBe(true);
    expect(isV1AppearanceConfig({ logo: { src: '/logo.svg' } })).toBe(true);
  });

  it('leaves a v2 document alone, with or without its schemaVersion', () => {
    expect(
      isV1AppearanceConfig({
        schemaVersion: 2,
        theme: { families: { default: {} } },
      }),
    ).toBe(false);
    expect(isV1AppearanceConfig({ theme: { families: { default: {} } } })).toBe(
      false,
    );
  });

  it('rejects what is not an appearance document at all', () => {
    expect(isV1AppearanceConfig({ foo: 'bar' })).toBe(false);
    expect(isV1AppearanceConfig([])).toBe(false);
    expect(isV1AppearanceConfig('{}')).toBe(false);
    expect(isV1AppearanceConfig(undefined)).toBe(false);
  });
});

describe('migrateV1AppearanceConfig', () => {
  const migrated = migrateV1AppearanceConfig(V1_DOCUMENT);

  it('produces a document the schema and the loader accept', () => {
    expect(validate(migrated), JSON.stringify(validate.errors)).toBe(true);
    expect(pickValidAppearanceConfig(migrated, 'test')).toBeDefined();
  });

  it('maps antd tokens to the default family seeds as [light, dark] tuples', () => {
    expect(migrated?.theme?.families?.default?.seeds).toEqual({
      accent: ['#FF7A00', '#DC6B03'],
      link: ['#FF7A00', '#DC6B03'],
      info: ['#028DF2', '#009BDD'],
      error: ['#FF4D4F', '#DC4446'],
      success: ['#00BD9B', '#03A487'],
    });
  });

  it('carries the dark values over as declared', () => {
    expect(migrated?.theme?.families?.default?.seeds?.accent?.[1]).toBe(
      '#DC6B03',
    );
  });

  it('moves headerBg, fontFamily, sider mode, logo and names', () => {
    expect(migrated?.theme?.families?.default?.headerBg).toEqual([
      '#FF9729',
      '#E88A28',
    ]);
    expect(migrated?.theme?.fontFamily).toBe("'Ubuntu', Roboto, sans-serif");
    expect(migrated?.theme?.siderMode).toBe('dark');
    expect(migrated?.branding?.logo).toEqual(V1_DOCUMENT.logo);
    expect(migrated?.branding?.companyName).toBe('Lablup Inc.');
    expect(migrated?.branding?.brandName).toBe('Backend.AI');
  });

  it('drops the v1 keys no v2 consumer reads', () => {
    const json = JSON.stringify(migrated);
    for (const dropped of [
      'colorText',
      'screenXXL',
      'siderBg',
      'lightSiderBg',
      'Tag',
      'Table',
      'token',
      'components',
    ]) {
      expect(json).not.toContain(dropped);
    }
  });

  it('converts extra families and lifts their label into familyLabels', () => {
    const doc = migrateV1AppearanceConfig({
      ...V1_DOCUMENT,
      families: {
        // v1 synthesized the default family from the top-level light/dark.
        default: { light: { token: { colorPrimary: '#000000' } } },
        stained: {
          light: { token: { colorPrimary: '#123456' } },
          dark: { token: { colorPrimary: '#654321' } },
          label: 'Stained',
        },
      },
    });
    expect(validate(doc), JSON.stringify(validate.errors)).toBe(true);
    expect(doc?.theme?.families?.stained?.seeds?.accent).toEqual([
      '#123456',
      '#654321',
    ]);
    expect(doc?.theme?.families?.default?.seeds?.accent).toEqual([
      '#FF7A00',
      '#DC6B03',
    ]);
    expect(doc?.branding?.familyLabels).toEqual({ stained: 'Stained' });
  });

  it('keeps one value per scheme as a plain string', () => {
    const doc = migrateV1AppearanceConfig({
      light: { token: { colorPrimary: '#ABCDEF' } },
      dark: { token: { colorPrimary: '#ABCDEF' } },
    });
    expect(doc?.theme?.families?.default?.seeds?.accent).toBe('#ABCDEF');
  });

  it('applies a light-only value to both schemes', () => {
    const doc = migrateV1AppearanceConfig({
      light: { token: { colorPrimary: '#ABCDEF' } },
    });
    expect(doc?.theme?.families?.default?.seeds?.accent).toBe('#ABCDEF');
  });

  it('expands a 3-digit seed and drops one the seed vocabulary cannot hold', () => {
    const doc = migrateV1AppearanceConfig({
      light: {
        token: {
          colorPrimary: '#f80',
          colorError: 'rgba(255, 0, 0, 0.5)',
          colorSuccess: 'green',
        },
      },
    });
    expect(validate(doc), JSON.stringify(validate.errors)).toBe(true);
    expect(doc?.theme?.families?.default?.seeds).toEqual({
      accent: '#ff8800',
    });
  });

  it('keeps a non-hex headerBg, which is applied verbatim', () => {
    const doc = migrateV1AppearanceConfig({
      light: { components: { Layout: { headerBg: 'rgba(20, 20, 20, 0.6)' } } },
    });
    expect(validate(doc), JSON.stringify(validate.errors)).toBe(true);
    expect(doc?.theme?.families?.default?.headerBg).toBe(
      'rgba(20, 20, 20, 0.6)',
    );
  });

  it('omits siderMode when the v1 document left the sider on auto', () => {
    const doc = migrateV1AppearanceConfig({
      ...V1_DOCUMENT,
      sider: { theme: 'auto' },
    });
    expect(doc?.theme?.siderMode).toBeUndefined();
  });

  it('drops logo keys the v2 schema does not declare', () => {
    const doc = migrateV1AppearanceConfig({
      logo: { src: '/logo.svg', menuBg: '#FFFFFF' },
    });
    expect(validate(doc), JSON.stringify(validate.errors)).toBe(true);
    expect(doc?.branding?.logo).toEqual({ src: '/logo.svg' });
  });

  it('returns undefined for anything that is not a v1 document', () => {
    expect(migrateV1AppearanceConfig({ schemaVersion: 2 })).toBeUndefined();
    expect(migrateV1AppearanceConfig(null)).toBeUndefined();
  });
});
