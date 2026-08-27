/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
*/
import BAITagList from './BAITagList';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

/**
 * FR-3707 — the `+N` overflow is a read-only peek at what did not fit, so it
 * behaves like a tooltip: hover to show, leave to hide. jsdom implements no
 * Popover API, so "is it open" is not observable here; what IS observable is
 * which control the trigger is wired as. A `Popover` trigger carries
 * `aria-haspopup` / `aria-expanded`; a `Tooltip` trigger does not.
 */
const ITEMS = [
  'a@example.com',
  'b@example.com',
  'c@example.com',
  'd@example.com',
];

const overflow = () => screen.getByText('+1');

describe('BAITagList overflow trigger', () => {
  it('defaults to hover in the chip variant', () => {
    render(<BAITagList items={ITEMS} />);
    const trigger = overflow().closest('button, [role="button"]') ?? overflow();
    expect(trigger).not.toHaveAttribute('aria-haspopup');
    expect(trigger).not.toHaveAttribute('aria-expanded');
  });

  it('defaults to hover in the text variant', () => {
    render(<BAITagList items={ITEMS} variant="text" />);
    const trigger = overflow().closest('button, [role="button"]') ?? overflow();
    expect(trigger).not.toHaveAttribute('aria-haspopup');
  });

  it('still latches open as a popover when trigger="click" is asked for', () => {
    render(<BAITagList items={ITEMS} trigger="click" />);
    const trigger = overflow().closest('button, [role="button"]');
    expect(trigger).toHaveAttribute('aria-haspopup');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  it('keeps the click affordance keyboard-reachable (Link renders a button)', () => {
    render(<BAITagList items={ITEMS} trigger="click" />);
    expect(overflow().closest('button')).toBeInTheDocument();
  });
});
