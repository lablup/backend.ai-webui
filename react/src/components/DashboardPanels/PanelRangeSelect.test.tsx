/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import PanelRangeSelect from './PanelRangeSelect';
import { windowRange } from './timeRange';
import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

vi.mock('react-i18next', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-i18next')>();
  return {
    ...actual,
    useTranslation: () => ({
      t: (key: string, options?: { days?: number }) =>
        options?.days === undefined ? key : `${key}:${options.days}`,
    }),
  };
});

const h = { hidden: true };
const DAY = 24 * 60 * 60 * 1000;
// Whole minutes, so the picker's minute-precision inputs round-trip it.
const END = Math.floor((Date.now() - DAY) / 60_000) * 60_000;
const EIGHT_DAYS = windowRange({
  after: new Date(END - 8 * DAY).toISOString(),
  before: new Date(END).toISOString(),
});

/** Opens "Custom range" prefilled with the stored 8-day window and presses Apply. */
const applyEightDays = async (maxDays?: number) => {
  const user = userEvent.setup();
  const onChange = vi.fn();
  render(
    <PanelRangeSelect
      aria-label="range"
      value={EIGHT_DAYS}
      maxDays={maxDays}
      onChange={onChange}
    />,
  );
  await user.click(screen.getAllByRole('combobox', h)[0]);
  await user.click(
    await screen.findByRole('option', {
      name: 'dashboard.settings.CustomRange',
      ...h,
    }),
  );
  await user.click(
    await screen.findByRole('button', { name: 'button.Apply', ...h }),
  );
  return onChange;
};

describe('PanelRangeSelect custom range cap', () => {
  it('rejects an 8-day range on a card capped at 7 days', async () => {
    const onChange = await applyEightDays(7);

    expect(
      await screen.findByText('dashboard.settings.RangeTooLong:7'),
    ).toBeInTheDocument();
    expect(
      screen.getByText('dashboard.settings.CustomRangeHelp:7'),
    ).toBeInTheDocument();
    expect(onChange).not.toHaveBeenCalled();
  });

  it('accepts an 8-day range on a card with the 90-day cap', async () => {
    const onChange = await applyEightDays();

    await waitFor(() => expect(onChange).toHaveBeenCalledWith(EIGHT_DAYS));
    expect(
      screen.queryByText('dashboard.settings.RangeTooLong:90'),
    ).not.toBeInTheDocument();
  });
});

describe('PanelRangeSelect presets only', () => {
  it('offers no custom range when the card allows 0 days', async () => {
    const user = userEvent.setup();
    render(<PanelRangeSelect aria-label="range" maxDays={0} />);
    await user.click(screen.getAllByRole('combobox', h)[0]);
    expect(
      screen.queryByRole('option', {
        ...h,
        name: 'dashboard.settings.CustomRange',
      }),
    ).not.toBeInTheDocument();
    expect(screen.getAllByRole('option', h).length).toBeGreaterThan(0);
  });
});
