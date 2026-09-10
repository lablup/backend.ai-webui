/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { buiLanguages } from './bui-language';
import { SUPPORTED_LANGUAGES } from './resolveInitialLanguage';
import { describe, expect, it } from 'vitest';

// This module used to be replaced wholesale by a hand-written Vitest mock
// (FR-2985). The assertions below fail loudly if the real `backend.ai-ui/locale/*`
// modules stop resolving, instead of taking out every test that loads
// `DefaultProviders`.
describe('buiLanguages', () => {
  it('covers exactly the supported languages', () => {
    expect(Object.keys(buiLanguages).sort()).toEqual(
      [...SUPPORTED_LANGUAGES].sort(),
    );
  });

  it('loads a real BAILocale for every supported language', () => {
    SUPPORTED_LANGUAGES.forEach((language) => {
      const locale = buiLanguages[language];
      expect(locale.lang, language).toBeTruthy();
      expect(Object.keys(locale.astryxLocale ?? {}), language).not.toHaveLength(
        0,
      );
    });
  });
});
