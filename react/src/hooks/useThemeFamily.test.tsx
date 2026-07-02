/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type {
  CustomThemeConfig,
  ThemeFamilyConfig,
} from '../helper/customThemeConfig';
import { DEFAULT_THEME_FAMILY, useThemeFamily } from './useThemeFamily';
import { renderHook } from '@testing-library/react';

// Avoid importing the real useBAISetting (which pulls in DefaultProviders and
// the whole app graph). Mirror its localStorage layout so tests can seed
// user settings (e.g. custom_primary_color) via setUserSetting below.
vi.mock('./useBAISetting', () => ({
  useBAISettingUserState: (key: string) => {
    const raw = localStorage.getItem(`backendaiwebui.settings.user.${key}`);
    return [raw ? JSON.parse(raw) : undefined, vi.fn()];
  },
}));

// Control what theme.json / theme-families.json "loaded" into the
// module-level caches.
const mockGetCustomTheme = vi.fn();
const mockGetBuiltinThemeFamilies = vi.fn();
vi.mock('../helper/customThemeConfig', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('../helper/customThemeConfig')>();
  return {
    ...actual,
    getCustomTheme: () => mockGetCustomTheme(),
    getBuiltinThemeFamilies: () => mockGetBuiltinThemeFamilies(),
  };
});

// Product-owned built-ins (resources/theme-families.json).
const builtinFamilies: Record<string, ThemeFamilyConfig> = {
  stained: {
    light: { token: { colorPrimary: '#8b5cf6' } },
    dark: { token: { colorPrimary: '#7c3aed' } },
    label: 'Stained',
  },
  glass: {
    light: { token: { colorPrimary: '#007aff' } },
    dark: { token: { colorPrimary: '#0a84ff' } },
  },
};

// Operator-owned theme.json (no families of its own by default).
const baseConfig: CustomThemeConfig = {
  light: { token: { colorPrimary: '#FF7A00' } },
  dark: { token: { colorPrimary: '#DC6B03' } },
  logo: { src: '', srcCollapsed: '' },
  defaultFamily: 'default',
};

const setStored = (key: string, value: string) =>
  localStorage.setItem(`backendaiwebui.settings.${key}`, JSON.stringify(value));

const setUserSetting = (key: string, value: string) =>
  localStorage.setItem(
    `backendaiwebui.settings.user.${key}`,
    JSON.stringify(value),
  );

describe('useThemeFamily', () => {
  beforeEach(() => {
    localStorage.clear();
    document.body.removeAttribute('data-theme-family');
    mockGetCustomTheme.mockReturnValue(baseConfig);
    mockGetBuiltinThemeFamilies.mockReturnValue(builtinFamilies);
  });

  it('synthesizes a catalog with the default family plus built-in families', () => {
    const { result } = renderHook(() => useThemeFamily());
    expect(Object.keys(result.current.families).sort()).toEqual([
      'default',
      'glass',
      'stained',
    ]);
    expect(result.current.family).toBe(DEFAULT_THEME_FAMILY);
  });

  it('resolves the user-selected family', () => {
    setStored('themeFamily', 'glass');
    const { result } = renderHook(() => useThemeFamily());
    expect(result.current.family).toBe('glass');
    expect(result.current.activeThemeFamily?.light?.token?.colorPrimary).toBe(
      '#007aff',
    );
  });

  it('lets operator families extend and override built-ins', () => {
    mockGetCustomTheme.mockReturnValue({
      ...baseConfig,
      families: {
        corporate: {
          light: { token: { colorPrimary: '#123456' } },
          dark: { token: { colorPrimary: '#654321' } },
        },
        stained: {
          light: { token: { colorPrimary: '#000000' } },
          dark: { token: { colorPrimary: '#111111' } },
        },
      },
    });
    setStored('themeFamily', 'stained');
    const { result } = renderHook(() => useThemeFamily());
    expect(Object.keys(result.current.families).sort()).toEqual([
      'corporate',
      'default',
      'glass',
      'stained',
    ]);
    // Operator entry with the same key wins over the built-in one.
    expect(result.current.activeThemeFamily?.light?.token?.colorPrimary).toBe(
      '#000000',
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

  it('applies the custom primary color without mutating the source config', () => {
    setStored('themeFamily', 'stained');
    setUserSetting('custom_primary_color', '#11aa22');
    const { result } = renderHook(() => useThemeFamily());
    const config = result.current.activeThemeFamily;
    expect(config?.light?.token?.colorPrimary).toBe('#11aa22');
    expect(config?.light?.token?.colorLink).toBe('#11aa22');
    expect(
      (config?.light?.components?.Layout as { headerBg?: string } | undefined)
        ?.headerBg,
    ).toBe('#11aa22');
    expect(config?.dark?.token?.colorPrimary).toBe('#11aa22');
    // Source family config is untouched (cloneDeep before _.set).
    expect(builtinFamilies.stained.light.token?.colorPrimary).toBe('#8b5cf6');
  });

  it('writes the data-theme-family attribute on body', () => {
    setStored('themeFamily', 'stained');
    renderHook(() => useThemeFamily());
    expect(document.body.getAttribute('data-theme-family')).toBe('stained');
  });

  it('backward compat: no built-ins and no operator families yields a single-entry catalog', () => {
    mockGetBuiltinThemeFamilies.mockReturnValue(undefined);
    mockGetCustomTheme.mockReturnValue({
      light: { token: { colorPrimary: '#FF7A00' } },
      dark: { token: { colorPrimary: '#DC6B03' } },
      logo: { src: '', srcCollapsed: '' },
    });
    const { result } = renderHook(() => useThemeFamily());
    expect(Object.keys(result.current.families)).toEqual(['default']);
    expect(result.current.family).toBe('default');
    expect(result.current.activeThemeFamily?.light?.token?.colorPrimary).toBe(
      '#FF7A00',
    );
  });
});
