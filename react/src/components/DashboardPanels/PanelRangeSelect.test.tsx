/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import PanelRangeSelect, {
  inputValueOf,
  storedRangeOf,
} from './PanelRangeSelect';
import { windowRange } from './timeRange';
import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

vi.mock('react-i18next', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-i18next')>();
  return {
    ...actual,
    useTranslation: () => ({ t: (key: string) => key }),
  };
});

const h = { hidden: true };
const DAY = 24 * 60 * 60 * 1000;
// Whole minutes, so the input's minute-precision strings round-trip it.
const END = Math.floor((Date.now() - DAY) / 60_000) * 60_000;
const windowOf = (days: number) =>
  windowRange({
    after: new Date(END - days * DAY).toISOString(),
    before: new Date(END).toISOString(),
  });

const renderOpen = async (value?: string) => {
  const user = userEvent.setup();
  const onChange = vi.fn();
  render(
    <PanelRangeSelect
      aria-label="range"
      data-testid="range"
      value={value}
      onChange={onChange}
    />,
  );
  await user.click(screen.getByTestId('range'));
  return { user, onChange };
};

describe('PanelRangeSelect', () => {
  it('stores a picked preset as the preset, so it keeps rolling', async () => {
    const { user, onChange } = await renderOpen('now-1h');
    const preset = await screen.findByRole('button', {
      name: 'dashboard.settings.Last7Days',
      ...h,
    });
    expect(preset).toBeEnabled();
    await user.click(preset);

    await waitFor(() => expect(onChange).toHaveBeenCalledWith('now-7d'));
  });

  it('does not apply a range longer than 7 days', async () => {
    const { onChange } = await renderOpen(windowOf(8));

    expect(await screen.findByTestId('range-apply')).toBeDisabled();
    expect(onChange).not.toHaveBeenCalled();
  });
});

describe('storedRangeOf', () => {
  const NOW = END + DAY;

  it('stores a range equal to a preset as the preset', () => {
    expect(storedRangeOf(inputValueOf('now-24h', NOW), NOW)).toBe('now-24h');
  });

  it('recognises a preset as it was offered, after the minute moved on', () => {
    const offered = inputValueOf('now-1h', NOW);
    expect(
      storedRangeOf(offered, NOW + 60_000, new Map([['now-1h', offered]])),
    ).toBe('now-1h');
  });

  it('stores any other range as a fixed window, and rejects one over 7 days', () => {
    expect(storedRangeOf(inputValueOf(windowOf(2), NOW), NOW)).toBe(
      windowOf(2),
    );
    expect(storedRangeOf(inputValueOf(windowOf(8), NOW), NOW)).toBeNull();
  });
});
