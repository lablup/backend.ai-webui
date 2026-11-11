/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import {
  buiLocaleLoaders,
  getLoadedBuiLocale,
  loadBuiLocale,
} from './bui-language';
import { SUPPORTED_LANGUAGES } from './resolveInitialLanguage';
import dayjs from 'dayjs';
import { describe, expect, it } from 'vitest';

// Runs the real `backend.ai-ui/locale/*` modules (no mock, FR-2985), so a
// module that stops resolving fails here instead of in every DefaultProviders test.
describe('buiLocaleLoaders', () => {
  it('covers exactly the supported languages', () => {
    expect(Object.keys(buiLocaleLoaders).sort()).toEqual(
      [...SUPPORTED_LANGUAGES].sort(),
    );
  });

  it('loads a real BAILocale for every supported language', async () => {
    for (const language of SUPPORTED_LANGUAGES) {
      const locale = await loadBuiLocale(language);
      expect(locale.lang, language).toBe(language);
      if (language === 'en') continue;
      expect(Object.keys(locale.astryxLocale ?? {}), language).not.toHaveLength(
        0,
      );
    }
  });
});

describe('loadBuiLocale', () => {
  it('has English synchronously, without a load', () => {
    expect(getLoadedBuiLocale('en')?.lang).toBe('en');
  });

  it('returns one promise per language and caches the result', async () => {
    const first = loadBuiLocale('ja');
    expect(loadBuiLocale('ja')).toBe(first);
    const locale = await first;
    expect(getLoadedBuiLocale('ja')).toBe(locale);
  });

  it('falls back to English for an unsupported code', async () => {
    expect((await loadBuiLocale('default')).lang).toBe('en');
  });

  it('registers the dayjs locale, including region codes dayjs lowercases', async () => {
    const previous = dayjs.locale();
    try {
      for (const language of ['ko', 'pt-BR', 'zh-CN', 'zh-TW'] as const) {
        await loadBuiLocale(language);
        dayjs.locale(language);
        expect(dayjs.locale(), language).toBe(language.toLowerCase());
      }
    } finally {
      dayjs.locale(previous);
    }
  });
});
