/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
/**
 * The lazy palette chunk — and the artifacts it builds — are warmed from the
 * trigger's mount, so neither the first open nor the first keystroke pays for
 * them. It lives in its own file because the assertion is that the palette
 * module is evaluated at all, which a suite that imports it directly (as
 * `GlobalSearchPalette.test.tsx` does) can no longer observe.
 */
import GlobalSearchPaletteButton from './GlobalSearchPaletteButton';
import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

const loadPaletteModule = vi.fn();
const warmGlobalSearch = vi.fn();

vi.mock('./GlobalSearchPalette', () => {
  loadPaletteModule();
  return { default: () => null, warmGlobalSearch };
});

const i18nInstance = { language: 'en' };

vi.mock('react-i18next', async (importOriginal) => ({
  ...(await importOriginal<typeof import('react-i18next')>()),
  useTranslation: () => ({ t: (key: string) => key, i18n: i18nInstance }),
}));

vi.mock('../../hooks/useThemeMode', () => ({
  useThemeMode: () => ({ isDarkMode: false, setThemeMode: vi.fn() }),
}));

vi.mock('../../hooks/useBAISetting', () => ({
  useBAISettingUserState: () => [true, vi.fn()],
}));

describe('GlobalSearchPaletteButton chunk preload', () => {
  it('warms the palette chunk on mount, without opening the palette', async () => {
    render(<GlobalSearchPaletteButton />);

    // Rendering the trigger must not pull the chunk in synchronously; the
    // effect does, once the header is idle.
    expect(loadPaletteModule).not.toHaveBeenCalled();

    await waitFor(() => expect(loadPaletteModule).toHaveBeenCalled());
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'webui.menu.Search' }),
    ).toBeInTheDocument();
  });

  it('warms the search artifacts in the same idle pass, for this i18n instance', async () => {
    render(<GlobalSearchPaletteButton />);

    await waitFor(() => expect(warmGlobalSearch).toHaveBeenCalled());
    expect(warmGlobalSearch).toHaveBeenCalledWith(i18nInstance);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
