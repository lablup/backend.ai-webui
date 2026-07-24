/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import {
  SUPPORTED_LANGUAGES,
  detectBrowserLanguage,
  resolveInitialLanguage,
} from './resolveInitialLanguage';
import { afterEach, describe, expect, it, vi } from 'vitest';

const mockNavigatorLanguage = (lang: string | undefined) => {
  if (lang === undefined) {
    vi.stubGlobal('navigator', undefined);
    return;
  }
  vi.stubGlobal('navigator', { language: lang });
};

describe('resolveInitialLanguage', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('returns the stored value when it is an explicit supported choice', () => {
    mockNavigatorLanguage('en-US');
    expect(resolveInitialLanguage('ko')).toBe('ko');
    expect(resolveInitialLanguage('zh-CN')).toBe('zh-CN');
  });

  it('ignores the legacy "default" sentinel and falls back to browser detection', () => {
    mockNavigatorLanguage('ko-KR');
    expect(resolveInitialLanguage('default')).toBe('ko');
  });

  it('ignores null / undefined / empty stored values', () => {
    mockNavigatorLanguage('ko');
    expect(resolveInitialLanguage(null)).toBe('ko');
    expect(resolveInitialLanguage(undefined)).toBe('ko');
    expect(resolveInitialLanguage('')).toBe('ko');
  });

  it('ignores an unsupported stored value and falls back to browser detection', () => {
    mockNavigatorLanguage('ja');
    // 'xx' is not in SUPPORTED_LANGUAGES
    expect(resolveInitialLanguage('xx')).toBe('ja');
  });

  it('matches the full locale when supported (e.g. zh-CN)', () => {
    mockNavigatorLanguage('zh-CN');
    expect(detectBrowserLanguage()).toBe('zh-CN');
    expect(resolveInitialLanguage(undefined)).toBe('zh-CN');
  });

  it('falls back to the base language when the full locale is not supported (e.g. ko-KR -> ko)', () => {
    mockNavigatorLanguage('ko-KR');
    expect(detectBrowserLanguage()).toBe('ko');
    expect(resolveInitialLanguage(undefined)).toBe('ko');
  });

  it('returns "en" when neither the full locale nor the base language is supported', () => {
    mockNavigatorLanguage('xx-YY');
    expect(detectBrowserLanguage()).toBe('en');
    expect(resolveInitialLanguage(undefined)).toBe('en');
  });

  it('is SSR-safe when navigator is undefined', () => {
    mockNavigatorLanguage(undefined);
    expect(detectBrowserLanguage()).toBe('en');
    expect(resolveInitialLanguage(undefined)).toBe('en');
  });

  it('returns "en" when navigator.language is an empty string', () => {
    mockNavigatorLanguage('');
    expect(detectBrowserLanguage()).toBe('en');
  });

  it('tries candidates in order and returns the first explicit supported choice', () => {
    mockNavigatorLanguage('fr');
    expect(resolveInitialLanguage('ko', 'ja')).toBe('ko');
    expect(resolveInitialLanguage(null, 'ja')).toBe('ja');
    // the 'default' sentinel and unsupported codes are skipped, not honored
    expect(resolveInitialLanguage('default', 'ja')).toBe('ja');
    expect(resolveInitialLanguage(undefined, 'xx')).toBe('fr');
  });

  it('falls back to browser detection when called with no candidates', () => {
    mockNavigatorLanguage('ko-KR');
    expect(resolveInitialLanguage()).toBe('ko');
  });

  it('exposes the full supported-language list', () => {
    expect(SUPPORTED_LANGUAGES).toContain('en');
    expect(SUPPORTED_LANGUAGES).toContain('ko');
    expect(SUPPORTED_LANGUAGES).toContain('zh-CN');
    expect(SUPPORTED_LANGUAGES).toContain('pt-BR');
  });
});
