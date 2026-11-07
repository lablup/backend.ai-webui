/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import PanelRangeSelect from './PanelRangeSelect';
import { RANGE_PRESETS } from './panelSettings';
import '@testing-library/jest-dom';
import { render, screen, within } from '@testing-library/react';
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

describe('PanelRangeSelect', () => {
  it('offers the 1 hour, 24 hours and 7 days presets', async () => {
    const user = userEvent.setup();
    render(<PanelRangeSelect aria-label="range" data-testid="range" />);
    await user.click(screen.getByTestId('range-start'));
    const presets = within(screen.getByTestId('range-presets'));
    expect(presets.getAllByRole('button', h)).toHaveLength(
      RANGE_PRESETS.length,
    );
  });

  it('stores a picked preset as its rolling range', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <PanelRangeSelect
        aria-label="range"
        data-testid="range"
        onChange={onChange}
      />,
    );
    await user.click(screen.getByTestId('range-start'));
    await user.click(
      screen.getByRole('button', {
        name: 'dashboard.settings.Last1Hour',
        ...h,
      }),
    );
    expect(onChange).toHaveBeenCalledWith('now-1h');
  });

  it("shows a preset's name in the compact box", () => {
    render(
      <PanelRangeSelect
        aria-label="range"
        data-testid="range"
        isCompactLabel
        value="now-7d"
      />,
    );
    expect(screen.getByTestId('range-start')).toHaveTextContent(
      'dashboard.settings.Last7Days',
    );
  });

  it('shows the ends of a stored fixed window', () => {
    const after = new Date(2026, 9, 29, 9, 30);
    const before = new Date(2026, 9, 30, 9, 30);
    render(
      <PanelRangeSelect
        aria-label="range"
        data-testid="range"
        isCompactLabel
        value={`${after.toISOString()}/${before.toISOString()}`}
      />,
    );
    expect(screen.getByTestId('range-start')).toHaveTextContent(
      '2026-10-29 09:30',
    );
    expect(screen.getByTestId('range-end')).toHaveTextContent(
      '2026-10-30 09:30',
    );
  });
});
