/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import PanelRangeSelect from './PanelRangeSelect';
import { RANGE_PRESETS } from './panelSettings';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
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
  it('offers the presets only', async () => {
    const user = userEvent.setup();
    render(<PanelRangeSelect aria-label="range" />);
    await user.click(screen.getAllByRole('combobox', h)[0]);
    expect(screen.getAllByRole('option', h)).toHaveLength(RANGE_PRESETS.length);
  });

  it('picks a preset', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<PanelRangeSelect aria-label="range" onChange={onChange} />);
    await user.click(screen.getAllByRole('combobox', h)[0]);
    await user.click(
      screen.getByRole('option', {
        name: 'dashboard.settings.Last1Hour',
        ...h,
      }),
    );
    expect(onChange).toHaveBeenCalledWith('now-1h');
  });
});
