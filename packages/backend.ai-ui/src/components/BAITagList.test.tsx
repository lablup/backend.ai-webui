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

// Astryx `Badge` wraps its label in an inner <span> to ellipsize it (core
// 0.5.1), so the text node is never the trigger element itself. Resolve up to
// the element that actually carries the trigger's role and focusability —
// asserting on the inner span would pass vacuously.
const trigger = () =>
  overflow().closest<HTMLElement>('button, [role="button"], [tabindex]') ??
  overflow();

describe('BAITagList overflow trigger', () => {
  it('defaults to hover in the chip variant', () => {
    render(<BAITagList items={ITEMS} />);
    expect(trigger()).not.toHaveAttribute('aria-haspopup');
    expect(trigger()).not.toHaveAttribute('aria-expanded');
  });

  it('defaults to hover in the text variant', () => {
    render(<BAITagList items={ITEMS} variant="text" />);
    expect(trigger()).not.toHaveAttribute('aria-haspopup');
  });

  it('still latches open as a popover when trigger="click" is asked for', () => {
    render(<BAITagList items={ITEMS} trigger="click" />);
    expect(trigger()).toHaveAttribute('aria-haspopup');
    expect(trigger()).toHaveAttribute('aria-expanded', 'false');
  });

  it('keeps the click affordance keyboard-reachable (Link renders a button)', () => {
    render(<BAITagList items={ITEMS} trigger="click" />);
    expect(overflow().closest('button')).toBeInTheDocument();
  });

  // HoverCard's `focusTrigger="auto"` only attaches to a naturally focusable
  // element, so a trigger that is not one never opens for a keyboard user.
  // `chip` gets that from `Link` (a <button>); `text` renders a bare <span>
  // and needs the explicit tabindex.
  it.each([
    ['chip', undefined],
    ['text', 'text'],
  ] as const)('keeps the %s hover trigger focusable', (_name, variant) => {
    render(<BAITagList items={ITEMS} variant={variant} />);
    const el = trigger();
    expect(el.tagName === 'BUTTON' || el.tabIndex >= 0).toBe(true);
  });

  // The overflow list is a list of VALUES, so it belongs on a card surface.
  // This project pins `.astryx-tooltip` to antd's `colorBgSpotlight` — dark in
  // BOTH schemes — so a Tooltip here reads as a black box in light mode
  // (FR-3707). HoverCard mounts its layer lazily; Tooltip and Popover both
  // render one up front, which is what makes the swap observable in jsdom.
  it('does not put the overflow list in a Tooltip', () => {
    render(<BAITagList items={ITEMS} />);
    expect(document.querySelector('[role="tooltip"]')).toBeNull();
    expect(document.querySelectorAll('[popover]')).toHaveLength(0);
  });
});
