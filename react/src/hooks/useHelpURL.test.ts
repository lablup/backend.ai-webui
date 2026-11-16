/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { checkSettingUrls } from '../diagnostics/rules/settingsRules';
import { getDefaultLoginConfig } from '../helper/loginConfig';
import {
  buildManualBaseURL,
  HOSTED_MANUAL_ROOT,
  useHelpURL,
} from './useHelpURL';
import { renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

const effective = vi.hoisted(() => ({ manualUrl: '' }));

vi.mock('../components/DefaultProviders', () => ({
  useCurrentLanguage: () => ['ko'],
}));
vi.mock('./index', () => ({
  useWebUILocation: () => ({ search: '' }),
}));
vi.mock('./useRouteScope', () => ({
  useCurrentMenuKey: () => '',
}));
vi.mock('./useWebUIConfig', () => ({
  useEffectiveLoginConfig: () => effective,
}));

describe('buildManualBaseURL', () => {
  it('opens the hosted manual when no manual URL is set', () => {
    expect(buildManualBaseURL('', '26.10.1', 'ko')).toBe(
      `${HOSTED_MANUAL_ROOT}/26.10/ko/`,
    );
  });

  it('uses the next channel for a prerelease and English for other languages', () => {
    expect(buildManualBaseURL('', '26.11.0-alpha.1', 'de')).toBe(
      `${HOSTED_MANUAL_ROOT}/next/en/`,
    );
  });

  it('replaces the root with the configured mirror', () => {
    expect(
      buildManualBaseURL(' https://docs.example.com/manual/ ', '26.10.1', 'ja'),
    ).toBe('https://docs.example.com/manual/26.10/ja/');
  });

  it('drops a query and a fragment from the mirror root', () => {
    expect(
      buildManualBaseURL(
        'https://docs.example.com/manual?lang=x#top',
        '26.10.1',
        'ko',
      ),
    ).toBe('https://docs.example.com/manual/26.10/ko/');
    expect(
      buildManualBaseURL('https://docs.example.com/#/', '26.10.1', 'ko'),
    ).toBe('https://docs.example.com/26.10/ko/');
  });

  it('ignores a value that is not an http(s) URL', () => {
    expect(buildManualBaseURL('docs.example.com', '26.10.1', 'en')).toBe(
      `${HOSTED_MANUAL_ROOT}/26.10/en/`,
    );
    expect(buildManualBaseURL('javascript:alert(1)', '26.10.1', 'en')).toBe(
      `${HOSTED_MANUAL_ROOT}/26.10/en/`,
    );
  });

  it('ignores a URL that carries a user name or password', () => {
    for (const value of [
      'https://user:secret@docs.example.com',
      'https://user@docs.example.com/manual',
    ]) {
      expect(buildManualBaseURL(value, '26.10.1', 'en'), value).toBe(
        `${HOSTED_MANUAL_ROOT}/26.10/en/`,
      );
    }
  });

  it('accepts exactly the values System Settings diagnostics accept', () => {
    for (const value of [
      'https:docs.example.com',
      'http://a b',
      'https://[bad',
      'ftp://docs.example.com',
      'https://user:secret@docs.example.com',
      'https://docs.example.com/manual',
    ]) {
      const usesMirror = !buildManualBaseURL(value, '26.10.1', 'en').startsWith(
        HOSTED_MANUAL_ROOT,
      );
      const flagged =
        checkSettingUrls({ ...getDefaultLoginConfig(), manualUrl: value })
          .length > 0;
      expect(usesMirror, value).toBe(!flagged);
    }
  });
});

describe('useHelpURL', () => {
  const originalVersion = globalThis.packageVersion;
  afterEach(() => {
    globalThis.packageVersion = originalVersion;
    effective.manualUrl = '';
  });

  it('reads manualUrl from the effective login config', () => {
    globalThis.packageVersion = '26.10.1';
    effective.manualUrl = 'https://docs.example.com/manual';
    const { result } = renderHook(() => useHelpURL());
    expect(
      result.current.startsWith('https://docs.example.com/manual/26.10/ko/'),
    ).toBe(true);
  });
});
