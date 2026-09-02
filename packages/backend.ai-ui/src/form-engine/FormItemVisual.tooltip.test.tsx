/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
/**
 * Pins the reversal of the ticket-05 PILOT-DECISION that rendered
 * `Form.Item tooltip` INLINE in the label row.
 *
 * That decision was taken because the only tooltip available then was antd's,
 * and this shell must not import antd. The consequence was visible on 33 call
 * sites: the session launcher's "Resource allocation" card printed three
 * paragraphs of help text between "Memory" and its input. Astryx's own
 * `Tooltip` makes a real one free of that dependency, so the hint is a
 * hover/focus target again — antd's actual behaviour.
 *
 * What is asserted is the CONTRACT, not the popup: the help text must not be
 * in the label's own text, and there must be a trigger to reveal it. Whether
 * the popup renders is Astryx's business and needs a real layout engine.
 */
import BAIFormItemVisual from './FormItemVisual';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const HELP = 'Computer memory is temporary.';

const renderMemoryItem = () =>
  render(
    <BAIFormItemVisual label="Memory" tooltip={HELP}>
      <input aria-label="memory" />
    </BAIFormItemVisual>,
  );

const tooltipTrigger = () =>
  document.querySelector<HTMLElement>('[data-bai-form-item-tooltip]');

describe('BAIFormItemVisual — tooltip', () => {
  it('puts the tooltip text in an overlay layer, not in the label flow', () => {
    renderMemoryItem();
    const text = screen.getByText(HELP);
    // jsdom implements neither the Popover API nor CSS anchor positioning, so
    // Astryx's layer sits in the tree and reads as "visible" here. What makes
    // it a TOOLTIP rather than inline prose is the pair of attributes the
    // browser acts on: `role="tooltip"` and `popover`, which keeps it out of
    // the flow until hover/focus opens it. Before the fix the help text was a
    // bare `<span>` in the label with neither.
    const layer = text.closest('[role="tooltip"]');
    expect(layer).not.toBeNull();
    expect(layer?.hasAttribute('popover')).toBe(true);
  });

  it('renders a focusable trigger after the label', () => {
    renderMemoryItem();
    const trigger = tooltipTrigger();
    expect(trigger).not.toBeNull();
    expect(trigger?.getAttribute('tabindex')).toBe('0');
    // The glyph, not the prose.
    expect(trigger?.textContent).toBe('');
    expect(trigger?.querySelector('svg')).not.toBeNull();
  });

  it('renders no trigger when there is no tooltip', () => {
    render(
      <BAIFormItemVisual label="Memory">
        <input aria-label="memory" />
      </BAIFormItemVisual>,
    );
    expect(tooltipTrigger()).toBeNull();
  });

  it('uses antd’s `tooltip.icon` as the trigger glyph when given', () => {
    render(
      <BAIFormItemVisual
        label="Memory"
        tooltip={HELP}
        tooltipIcon={<span data-testid="custom-glyph">i</span>}
      >
        <input aria-label="memory" />
      </BAIFormItemVisual>,
    );
    expect(screen.getByTestId('custom-glyph')).toBeInTheDocument();
  });
});

/*
 FR-3680 — guards `react/patches/@astryxdesign__core@0.5.2.patch`: the tip must
 survive the pointer landing on its own surface (mechanism in the commit body).
 jsdom has no Popover API, so Astryx falls back to `style.display`.
*/
describe('BAIFormItemVisual — tooltip stays open on its own surface (FR-3680)', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  const advance = (ms: number) => {
    act(() => {
      vi.advanceTimersByTime(ms);
    });
  };
  const expectOpen = (tip: HTMLElement) =>
    expect(tip.style.display).toBe('block');
  const expectClosed = (tip: HTMLElement) =>
    expect(tip.style.display).toBe('none');

  // The browser's order for a pointer moving from A to B:
  // mouseout(A) → mouseleave(A) → mouseover(B) → mouseenter(B).
  // Raw events on purpose: RTL's `fireEvent.mouseLeave` fires a second
  // `mouseout` AFTER `mouseleave`, the reversed order the bug never sees.
  const moveTo = (from: HTMLElement, to: HTMLElement) => {
    act(() => {
      from.dispatchEvent(
        new MouseEvent('mouseout', { bubbles: true, relatedTarget: to }),
      );
      from.dispatchEvent(new MouseEvent('mouseleave', { relatedTarget: to }));
      to.dispatchEvent(
        new MouseEvent('mouseover', { bubbles: true, relatedTarget: from }),
      );
      to.dispatchEvent(new MouseEvent('mouseenter', { relatedTarget: from }));
    });
  };

  // Open by hover, then park the pointer on the tip.
  const openOverTip = () => {
    renderMemoryItem();
    const trigger = tooltipTrigger() as HTMLElement;
    const tip = screen.getByRole('tooltip', { hidden: true });
    moveTo(document.body, trigger);
    advance(300);
    expectOpen(tip);
    moveTo(trigger, tip);
    advance(500);
    expectOpen(tip);
    return { trigger, tip };
  };

  it('survives the pointer travelling onto the tip and a click on its text', () => {
    const { tip } = openOverTip();
    fireEvent.mouseDown(tip);
    fireEvent.click(tip);
    advance(500);
    expectOpen(tip);
  });

  it('closes once the pointer leaves the tip for elsewhere', () => {
    const { tip } = openOverTip();
    moveTo(tip, document.body);
    advance(500);
    expectClosed(tip);
  });

  it('lets the pointer return to the trigger and leave from there', () => {
    const { trigger, tip } = openOverTip();
    moveTo(tip, trigger);
    advance(500);
    expectOpen(tip);
    moveTo(trigger, document.body);
    advance(500);
    expectClosed(tip);
  });
});
