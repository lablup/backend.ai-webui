/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import '../../__test__/matchMedia.mock.js';
import ThemeAccentColorPicker from './ThemeAccentColorPicker';
import { fireEvent, render, screen } from '@testing-library/react';

const { setAccent, getAccent } = vi.hoisted(() => {
  const state: { accent?: { light?: string; dark?: string } } = {};
  return {
    setAccent: vi.fn(),
    getAccent: Object.assign(() => state.accent, {
      seed: (accent?: { light?: string; dark?: string }) => {
        state.accent = accent;
      },
    }),
  };
});

vi.mock('../hooks/useBAISetting', () => ({
  useBAISettingUserState: () => [getAccent(), setAccent],
}));

vi.mock('../hooks/useCustomThemeConfig', () => ({
  useCustomThemeConfig: () => ({
    activeThemeFamily: 'default',
    themeFamilies: {
      default: {
        light: { token: { colorPrimary: '#FF7A00' } },
        dark: { token: { colorPrimary: '#DC6B03' } },
      },
    },
  }),
}));

vi.mock('react-i18next', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-i18next')>();
  return {
    ...actual,
    useTranslation: () => ({ t: (key: string) => key }),
  };
});

// Stub only `BAIColorPicker`: jsdom can't drive a popover + native colour
// input, and the subject under test is ThemeAccentColorPicker's write logic
// (setSchemeAccent), not the widget's internals. The stub exposes the
// change/clear callbacks as buttons.
//
// `onChangeComplete` now takes the hex STRING directly — antd's `Color`
// object (and the `.toHexString()` every call site immediately did to it)
// went away with the antd `ColorPicker`; see BAIColorPicker's header.
vi.mock('backend.ai-ui', async (importOriginal) => {
  const actual = await importOriginal<typeof import('backend.ai-ui')>();
  return {
    ...actual,
    BAIColorPicker: ({
      'data-testid': testId,
      value,
      onChangeComplete,
      onClear,
    }: {
      'data-testid'?: string;
      value?: unknown;
      onChangeComplete?: (hex: string) => void;
      onClear?: () => void;
    }) => (
      <div data-testid={testId}>
        <span data-testid={`${testId}-value`}>{String(value)}</span>
        <button
          data-testid={`${testId}-change`}
          onClick={() => onChangeComplete?.('#123456')}
        />
        <button data-testid={`${testId}-clear`} onClick={() => onClear?.()} />
      </div>
    ),
  };
});

describe('ThemeAccentColorPicker setSchemeAccent write path', () => {
  beforeEach(() => {
    setAccent.mockClear();
    getAccent.seed(undefined);
  });

  it('merges a new scheme color into the existing accent setting', () => {
    getAccent.seed({ dark: '#33bb44' });
    render(<ThemeAccentColorPicker />);
    fireEvent.click(
      screen.getByTestId('theme-accent-color-picker-light-change'),
    );
    expect(setAccent).toHaveBeenCalledWith({
      dark: '#33bb44',
      light: '#123456',
    });
  });

  it('clearing one scheme drops just that key and keeps the other', () => {
    getAccent.seed({ light: '#11aa22', dark: '#33bb44' });
    render(<ThemeAccentColorPicker />);
    fireEvent.click(
      screen.getByTestId('theme-accent-color-picker-light-clear'),
    );
    expect(setAccent).toHaveBeenCalledWith({ dark: '#33bb44' });
  });

  it('clearing the last overridden scheme deletes the whole setting', () => {
    getAccent.seed({ light: '#11aa22' });
    render(<ThemeAccentColorPicker />);
    fireEvent.click(
      screen.getByTestId('theme-accent-color-picker-light-clear'),
    );
    expect(setAccent).toHaveBeenCalledWith(undefined);
  });

  it('falls back to the family-owned color when no accent is set', () => {
    render(<ThemeAccentColorPicker />);
    expect(
      screen.getByTestId('theme-accent-color-picker-light-value').textContent,
    ).toBe('#FF7A00');
    expect(
      screen.getByTestId('theme-accent-color-picker-dark-value').textContent,
    ).toBe('#DC6B03');
  });
});
