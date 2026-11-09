/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import BAIMultiSelector from './BAIMultiSelector';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeAll, describe, expect, it, vi } from 'vitest';

beforeAll(() => {
  Element.prototype.scrollIntoView = vi.fn();
});

const OPTIONS = [
  { value: 'a', label: 'Alpha' },
  { value: 'b', label: 'Bravo' },
  { value: 'c', label: 'Charlie' },
  { value: 'd', label: 'Delta' },
];
const ALL = ['a', 'b', 'c', 'd'];

const hoverTrigger = async () => {
  vi.useFakeTimers({ shouldAdvanceTime: true });
  try {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    await user.hover(screen.getByRole('combobox'));
    await act(async () => {
      vi.advanceTimersByTime(500);
    });
  } finally {
    vi.useRealTimers();
  }
};

describe('BAIMultiSelector selection tooltip', () => {
  it('names every selection when the trigger shows "+N"', async () => {
    render(
      <BAIMultiSelector
        aria-label="Menus"
        options={OPTIONS}
        value={ALL}
        onChange={() => {}}
      />,
    );
    expect(screen.getByRole('combobox')).toHaveTextContent(
      'Alpha, Bravo, Charlie, +1',
    );
    await hoverTrigger();
    expect(await screen.findByRole('tooltip')).toHaveTextContent(
      'Alpha, Bravo, Charlie, Delta',
    );
  });

  it('adds no tooltip or description when every selection fits', async () => {
    render(
      <BAIMultiSelector
        aria-label="Menus"
        options={OPTIONS}
        value={['a', 'b']}
        onChange={() => {}}
      />,
    );
    expect(screen.getByRole('combobox')).not.toHaveAttribute(
      'aria-describedby',
    );
    await hoverTrigger();
    expect(screen.queryByRole('tooltip')).toBeNull();
  });

  it('shows no tooltip while disabled', async () => {
    render(
      <BAIMultiSelector
        aria-label="Menus"
        options={OPTIONS}
        value={ALL}
        onChange={() => {}}
        disabled
      />,
    );
    await hoverTrigger();
    expect(screen.queryByRole('tooltip')).toBeNull();
  });

  it('shows no tooltip for a custom trigger text', async () => {
    render(
      <BAIMultiSelector
        aria-label="Menus"
        options={OPTIONS}
        value={ALL}
        onChange={() => {}}
        formatValue={(items) => `${items.length} menus`}
      />,
    );
    await hoverTrigger();
    expect(screen.queryByRole('tooltip')).toBeNull();
  });

  it('follows an uncontrolled selection', async () => {
    const user = userEvent.setup();
    render(
      <BAIMultiSelector
        aria-label="Menus"
        options={OPTIONS}
        defaultValue={['a', 'b', 'c']}
      />,
    );
    await user.click(screen.getByRole('combobox'));
    await user.click(await screen.findByRole('option', { name: 'Delta' }));
    await user.keyboard('{Escape}');
    expect(screen.getByRole('combobox')).toHaveTextContent('+1');
    await hoverTrigger();
    expect(await screen.findByRole('tooltip')).toHaveTextContent(
      'Alpha, Bravo, Charlie, Delta',
    );
  });

  it('empties the selection when a set value is cleared', async () => {
    const { rerender } = render(
      <BAIMultiSelector aria-label="Menus" options={OPTIONS} value={ALL} />,
    );
    rerender(
      <BAIMultiSelector
        aria-label="Menus"
        options={OPTIONS}
        value={undefined}
      />,
    );
    expect(screen.getByRole('combobox')).not.toHaveTextContent('+1');
    await hoverTrigger();
    expect(screen.queryByRole('tooltip')).toBeNull();
  });
});
