/**
 * Proves the override channel is LIVE, not just populated (FR-3511).
 *
 * `buildAstryxOverrides` keeps string values only, so a catalog in the wrong
 * shape produces `undefined` here while every other check stays green. These
 * tests assert what `InternationalizationProvider` actually receives.
 */
import { buildAstryxOverrides } from './astryxOverrides';
import { i18n } from './index';
import enUpstream from '@astryxdesign/core/locales/en.json';
import { describe, expect, it } from 'vitest';

const UPSTREAM_KEYS = Object.keys(enUpstream);

/** Every language BUI registers, in the order `index.ts` declares them. */
const TRANSLATED_LANGS = [
  'ko',
  'de',
  'el',
  'es',
  'fi',
  'fr',
  'id',
  'it',
  'ja',
  'mn',
  'ms',
  'pl',
  'pt-BR',
  'pt',
  'ru',
  'th',
  'tr',
  'vi',
  'zh-CN',
  'zh-TW',
];

describe('buildAstryxOverrides', () => {
  it.each(TRANSLATED_LANGS)(
    '%s resolves to a full flat string catalog',
    (lng) => {
      const overrides = buildAstryxOverrides(i18n, lng);
      expect(overrides).toBeDefined();
      const catalog = overrides![lng];
      expect(Object.keys(catalog)).toHaveLength(UPSTREAM_KEYS.length);
      expect(
        Object.values(catalog).every((v) => typeof v === 'string' && v !== ''),
      ).toBe(true);
    },
  );

  it('keys the catalog by the full "@astryx.*" key Astryx looks up', () => {
    const catalog = buildAstryxOverrides(i18n, 'ko')!.ko;
    expect(catalog['@astryx.table.noData']).toBe('데이터 없음');
    expect(catalog['@astryx.pagination.next']).toBe('다음 페이지로 이동');
  });

  it('leaves en on the shipped upstream catalog', () => {
    expect(buildAstryxOverrides(i18n, 'en')).toBeUndefined();
  });

  it('returns undefined for a language BUI does not register', () => {
    expect(buildAstryxOverrides(i18n, 'xx')).toBeUndefined();
  });
});
