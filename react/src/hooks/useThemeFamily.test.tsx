/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type { CustomThemeConfig } from '../helper/customThemeConfig';
import { DEFAULT_THEME_FAMILY, useThemeFamily } from './useThemeFamily';
import { renderHook } from '@testing-library/react';

// Avoid importing the real useBAISetting (which pulls in DefaultProviders and
// the whole app graph). The preview-mode branch only needs a stub here.
vi.mock('./useBAISetting', () => ({
  useBAISettingUserState: () => [undefined, vi.fn()],
}));

// Control what theme.json "loaded" into the module-level cache.
const mockGetCustomTheme = vi.fn();
vi.mock('../helper/customThemeConfig', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('../helper/customThemeConfig')>();
  return { ...actual, getCustomTheme: () => mockGetCustomTheme() };
});

const baseConfig: CustomThemeConfig = {
  light: { token: { colorPrimary: '#FF7A00' } },
  dark: { token: { colorPrimary: '#DC6B03' } },
  logo: { src: '', srcCollapsed: '' },
  families: {
    stained: {
      light: { token: { colorPrimary: '#8b5cf6' } },
      dark: { token: { colorPrimary: '#7c3aed' } },
      label: 'Stained',
      headerScheme: 'dark',
    },
    glass: {
      light: { token: { colorPrimary: '#007aff' } },
      dark: { token: { colorPrimary: '#0a84ff' } },
      headerScheme: 'light',
    },
  },
  defaultFamily: 'default',
};

const setStored = (key: string, value: string) =>
  localStorage.setItem(`backendaiwebui.settings.${key}`, JSON.stringify(value));

describe('useThemeFamily', () => {
  beforeEach(() => {
    localStorage.clear();
    document.body.removeAttribute('data-theme-family');
    mockGetCustomTheme.mockReturnValue(baseConfig);
  });

  it('synthesizes a catalog with the default family plus operator families', () => {
    const { result } = renderHook(() => useThemeFamily());
    expect(Object.keys(result.current.families).sort()).toEqual([
      'default',
      'glass',
      'stained',
    ]);
    expect(result.current.family).toBe(DEFAULT_THEME_FAMILY);
  });

  it('resolves the user-selected family and exposes its headerScheme', () => {
    setStored('themeFamily', 'glass');
    const { result } = renderHook(() => useThemeFamily());
    expect(result.current.family).toBe('glass');
    expect(result.current.headerScheme).toBe('light');
    expect(result.current.activeThemeConfig?.light?.token?.colorPrimary).toBe(
      '#007aff',
    );
  });

  it('falls back to default when the selected family is absent', () => {
    setStored('themeFamily', 'nonexistent');
    const { result } = renderHook(() => useThemeFamily());
    expect(result.current.family).toBe(DEFAULT_THEME_FAMILY);
  });

  it('honors operator defaultFamily when the user has no selection', () => {
    mockGetCustomTheme.mockReturnValue({
      ...baseConfig,
      defaultFamily: 'stained',
    });
    const { result } = renderHook(() => useThemeFamily());
    expect(result.current.family).toBe('stained');
  });

  it('applies a sanitized custom accent without mutating the source config', () => {
    setStored('themeFamily', 'stained');
    setStored('themeAccent', '#11AA22');
    const { result } = renderHook(() => useThemeFamily());
    const config = result.current.activeThemeConfig;
    expect(config?.light?.token?.colorPrimary).toBe('#11aa22');
    expect(config?.light?.token?.colorLink).toBe('#11aa22');
    expect(
      (config?.light?.components?.Layout as { headerBg?: string } | undefined)
        ?.headerBg,
    ).toBe('#11aa22');
    expect(config?.dark?.token?.colorPrimary).toBe('#11aa22');
    // Source family config is untouched (cloneDeep before _.set).
    expect(baseConfig.families?.stained.light.token?.colorPrimary).toBe(
      '#8b5cf6',
    );
  });

  it('writes the data-theme-family attribute on body', () => {
    setStored('themeFamily', 'stained');
    renderHook(() => useThemeFamily());
    expect(document.body.getAttribute('data-theme-family')).toBe('stained');
  });

  it('backward compat: a config without families yields a single-entry catalog', () => {
    mockGetCustomTheme.mockReturnValue({
      light: { token: { colorPrimary: '#FF7A00' } },
      dark: { token: { colorPrimary: '#DC6B03' } },
      logo: { src: '', srcCollapsed: '' },
    });
    const { result } = renderHook(() => useThemeFamily());
    expect(Object.keys(result.current.families)).toEqual(['default']);
    expect(result.current.family).toBe('default');
    expect(result.current.activeThemeConfig?.light?.token?.colorPrimary).toBe(
      '#FF7A00',
    );
  });
});
