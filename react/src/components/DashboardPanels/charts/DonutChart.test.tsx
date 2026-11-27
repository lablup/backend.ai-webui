/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import DonutChart, { donutTotal } from './DonutChart';
import { fireEvent, render, screen } from '@testing-library/react';
import { beforeAll, describe, expect, it, vi } from 'vitest';

beforeAll(() => {
  // jsdom has no ResizeObserver; the chart only measures with it.
  window.ResizeObserver ??= class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof ResizeObserver;
});

const ROWS = [
  { key: 'session', label: 'Session', value: 3, percent: 75 },
  { key: 'other', label: 'Other types', value: 1, percent: 25 },
];
const LABELS = { name: 'Type', value: 'Failed', percent: 'Share' };

describe('DonutChart legend rows', () => {
  it('are focusable buttons reporting their key when the chart takes a row click', () => {
    const onRowClick = vi.fn();
    render(
      <DonutChart
        rows={ROWS}
        label="Failures"
        emptyText="None"
        columnLabels={LABELS}
        onRowClick={onRowClick}
      />,
    );
    const other = screen.getByRole('button', { name: /Other types/ });
    other.focus();
    expect(document.activeElement).toBe(other);
    fireEvent.click(other);
    expect(onRowClick).toHaveBeenCalledWith('other');
  });

  it('stay plain lines otherwise', () => {
    render(
      <DonutChart
        rows={ROWS}
        label="Failures"
        emptyText="None"
        columnLabels={LABELS}
      />,
    );
    expect(screen.queryByRole('button', { name: /Session/ })).toBeNull();
  });
});

describe('donutTotal', () => {
  it('sums the rows when no total is passed', () => {
    expect(donutTotal(ROWS)).toBe(4);
    expect(
      donutTotal(ROWS.map((row) => ({ ...row, value: 0, percent: 0 }))),
    ).toBe(0);
  });

  it('is "-" when a row was denied', () => {
    expect(
      donutTotal([...ROWS, { ...ROWS[1], key: 'x', isUnknown: true }]),
    ).toBe('-');
  });

  it('keeps an explicit total', () => {
    expect(donutTotal(ROWS, 10)).toBe(10);
    expect(donutTotal(ROWS, '-')).toBe('-');
  });
});
