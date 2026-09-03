/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type { BAIAppearanceConfig } from '../helper/customThemeConfig';
import {
  DEFAULT_THEME_FAMILY,
  resolveThemeFamilyCatalog,
  useCustomThemeConfig,
} from './useCustomThemeConfig';
import { renderHook } from '@testing-library/react';

// Avoid importing the real useBAISetting (which pulls in DefaultProviders and
// the whole app graph). Mirror its localStorage layout so tests can seed
// user settings (e.g. the preview draft) via setUserSetting below.
vi.mock('./useBAISetting', () => ({
  useBAISettingUserState: (key: string) => {
    const raw = localStorage.getItem(`backendaiwebui.settings.user.${key}`);
    return [raw ? JSON.parse(raw) : undefined, vi.fn()];
  },
}));

// Control what the appearance bootstrap "loaded" into the module-level store.
const mockGetCustomTheme = vi.fn();
vi.mock('../helper/customThemeConfig', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('../helper/customThemeConfig')>();
  return {
    ...actual,
    getCustomTheme: () => mockGetCustomTheme(),
  };
});

const baseConfig: BAIAppearanceConfig = {
  schemaVersion: 2,
  theme: {
    families: {
      default: {
        seeds: { accent: ['#FF7A00', '#DC6B03'] },
        headerBg: ['#FF9729', '#E88A28'],
      },
      stained: { seeds: { accent: ['#8b5cf6', '#7c3aed'] } },
      glass: { seeds: { accent: ['#007aff', '#0a84ff'] } },
    },
  },
  branding: {
    logo: { src: '', srcCollapsed: '' },
    familyLabels: { stained: 'Stained' },
  },
};

const setStored = (key: string, value: string) =>
  localStorage.setItem(`backendaiwebui.settings.${key}`, JSON.stringify(value));

const setUserSetting = (key: string, value: unknown) =>
  localStorage.setItem(
    `backendaiwebui.settings.user.${key}`,
    JSON.stringify(value),
  );

describe('useCustomThemeConfig', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    document.body.removeAttribute('data-theme-family');
    mockGetCustomTheme.mockReturnValue(baseConfig);
  });

  it('builds the catalog from theme.families with branding labels', () => {
    const { result } = renderHook(() => useCustomThemeConfig());
    expect(Object.keys(result.current.themeFamilies).sort()).toEqual([
      'default',
      'glass',
      'stained',
    ]);
    expect(result.current.themeFamilies.stained.label).toBe('Stained');
    expect(result.current.themeFamilies.glass.label).toBeUndefined();
    expect(result.current.activeThemeFamily).toBe(DEFAULT_THEME_FAMILY);
  });

  it('exposes the applied appearance document as-is', () => {
    const { result } = renderHook(() => useCustomThemeConfig());
    expect(result.current.rawThemeConfig).toEqual(baseConfig);
  });

  it('resolves the user-selected family from the localStorage mirror', () => {
    setStored('themeFamily', 'glass');
    const { result } = renderHook(() => useCustomThemeConfig());
    expect(result.current.activeThemeFamily).toBe('glass');
  });

  it('falls back to default when the selected family is absent', () => {
    setStored('themeFamily', 'nonexistent');
    const { result } = renderHook(() => useCustomThemeConfig());
    expect(result.current.activeThemeFamily).toBe(DEFAULT_THEME_FAMILY);
  });

  it('drops non-object family entries from the catalog', () => {
    mockGetCustomTheme.mockReturnValue({
      ...baseConfig,
      theme: {
        families: {
          ...baseConfig.theme?.families,
          broken: 'not-an-object',
        },
      },
    });
    const { result } = renderHook(() => useCustomThemeConfig());
    expect(Object.keys(result.current.themeFamilies).sort()).toEqual([
      'default',
      'glass',
      'stained',
    ]);
  });

  it('shows the edited draft and ignores the family selection in preview mode', () => {
    sessionStorage.setItem('isThemePreviewMode', 'true');
    const draft: BAIAppearanceConfig = {
      ...baseConfig,
      theme: {
        families: {
          default: { seeds: { accent: '#ABCDEF' } },
        },
      },
    };
    setUserSetting('custom_theme_config', draft);
    setStored('themeFamily', 'stained');
    const { result } = renderHook(() => useCustomThemeConfig());
    expect(result.current.activeThemeFamily).toBe(DEFAULT_THEME_FAMILY);
    expect(result.current.rawThemeConfig).toEqual(draft);
  });

  it('writes the data-theme-family attribute on body', () => {
    setStored('themeFamily', 'stained');
    renderHook(() => useCustomThemeConfig());
    expect(document.body.getAttribute('data-theme-family')).toBe('stained');
  });

  it('yields an empty catalog while the document is still loading', () => {
    mockGetCustomTheme.mockReturnValue(undefined);
    const { result } = renderHook(() => useCustomThemeConfig());
    expect(result.current.themeFamilies).toEqual({});
    expect(result.current.activeThemeFamily).toBe(DEFAULT_THEME_FAMILY);
    expect(result.current.rawThemeConfig).toBeUndefined();
  });
});

describe('resolveThemeFamilyCatalog', () => {
  it('returns an empty catalog for a document without families', () => {
    expect(resolveThemeFamilyCatalog(undefined)).toEqual({});
    expect(resolveThemeFamilyCatalog({ schemaVersion: 2 })).toEqual({});
  });
});
