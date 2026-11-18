/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { checkSettingUrls } from '../diagnostics/rules/settingsRules';
import { getDefaultLoginConfig } from '../helper/loginConfig';
import {
  buildHostedManualBaseURL,
  HOSTED_MANUAL_ROOT,
  resolveHelpURL,
  useHelpURL,
  useOpenHelp,
} from './useHelpURL';
import { renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

const effective = vi.hoisted(() => ({ manualUrl: null as string | null }));
const route = vi.hoisted(() => ({
  menuKey: '',
  scope: 'project' as 'project' | 'projectAdmin' | 'admin',
}));

vi.mock('../components/DefaultProviders', () => ({
  useCurrentLanguage: () => ['ko'],
}));
vi.mock('./index', () => ({
  useWebUILocation: () => ({ search: '' }),
}));
vi.mock('./useRouteScope', () => ({
  useCurrentMenuKey: () => route.menuKey,
  useRouteScope: () => route.scope,
}));
vi.mock('./useWebUIConfig', () => ({
  useEffectiveLoginConfig: () => effective,
}));

describe('buildHostedManualBaseURL', () => {
  it('uses the release major.minor and a published language', () => {
    expect(buildHostedManualBaseURL('26.10.1', 'ko')).toBe(
      `${HOSTED_MANUAL_ROOT}/26.10/ko/`,
    );
  });

  it('uses the next channel for a prerelease and English for other languages', () => {
    expect(buildHostedManualBaseURL('26.11.0-alpha.1', 'de')).toBe(
      `${HOSTED_MANUAL_ROOT}/next/en/`,
    );
  });
});

describe('resolveHelpURL', () => {
  const hosted = `${HOSTED_MANUAL_ROOT}/26.10/en/session_page.html`;

  it('opens the hosted page when no manual URL is set', () => {
    expect(resolveHelpURL(null, hosted)).toBe(hosted);
  });

  it('hides help when the manual URL is empty', () => {
    expect(resolveHelpURL('', hosted)).toBeNull();
    expect(resolveHelpURL('   ', hosted)).toBeNull();
  });

  it('opens a configured URL as is', () => {
    expect(
      resolveHelpURL(' https://docs.example.com/manual?lang=ko#top ', hosted),
    ).toBe('https://docs.example.com/manual?lang=ko#top');
  });

  it('keeps the hosted page for a value that is not an http(s) URL', () => {
    expect(resolveHelpURL('docs.example.com', hosted)).toBe(hosted);
    expect(resolveHelpURL('javascript:alert(1)', hosted)).toBe(hosted);
  });

  it('keeps the hosted page for a URL that carries a user name or password', () => {
    for (const value of [
      'https://user:secret@docs.example.com',
      'https://user@docs.example.com/manual',
    ]) {
      expect(resolveHelpURL(value, hosted), value).toBe(hosted);
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
      const usesValue = resolveHelpURL(value, hosted) !== hosted;
      const flagged =
        checkSettingUrls({ ...getDefaultLoginConfig(), manualUrl: value })
          .length > 0;
      expect(usesValue, value).toBe(!flagged);
    }
  });
});

describe('useHelpURL', () => {
  const originalVersion = globalThis.packageVersion;
  afterEach(() => {
    globalThis.packageVersion = originalVersion;
    effective.manualUrl = null;
    route.menuKey = '';
    route.scope = 'project';
  });

  it('opens the hosted manual for the current version and language by default', () => {
    globalThis.packageVersion = '26.10.1';
    const { result } = renderHook(() => useHelpURL());
    expect(result.current?.startsWith(`${HOSTED_MANUAL_ROOT}/26.10/ko/`)).toBe(
      true,
    );
  });

  it.each([
    ['projectAdmin', 'project_admin.html#project-admin-dashboard'],
    ['admin', 'admin_menu.html#admin-dashboard'],
  ] as const)('opens the %s dashboard section of the manual', (scope, path) => {
    globalThis.packageVersion = '26.10.1';
    route.menuKey = 'admin-dashboard';
    route.scope = scope;
    const { result } = renderHook(() => useHelpURL());
    expect(result.current).toBe(`${HOSTED_MANUAL_ROOT}/26.10/ko/${path}`);
  });

  it('reads manualUrl from the effective login config', () => {
    effective.manualUrl = 'https://docs.example.com/manual';
    const { result } = renderHook(() => useHelpURL());
    expect(result.current).toBe('https://docs.example.com/manual');
  });

  it('gives no opener when the manual URL is empty', () => {
    effective.manualUrl = '';
    const { result } = renderHook(() => useOpenHelp());
    expect(result.current).toBeNull();
  });
});
