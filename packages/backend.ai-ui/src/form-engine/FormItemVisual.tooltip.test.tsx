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
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

describe('BAIFormItemVisual — tooltip', () => {
  it('puts the tooltip text in an overlay layer, not in the label flow', () => {
    render(
      <BAIFormItemVisual label="Memory" tooltip="Computer memory is temporary.">
        <input aria-label="memory" />
      </BAIFormItemVisual>,
    );
    const text = screen.getByText('Computer memory is temporary.');
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
    render(
      <BAIFormItemVisual label="Memory" tooltip="Computer memory is temporary.">
        <input aria-label="memory" />
      </BAIFormItemVisual>,
    );
    const trigger = document.querySelector('[data-bai-form-item-tooltip]');
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
    expect(document.querySelector('[data-bai-form-item-tooltip]')).toBeNull();
  });

  it('uses antd’s `tooltip.icon` as the trigger glyph when given', () => {
    render(
      <BAIFormItemVisual
        label="Memory"
        tooltip="Computer memory is temporary."
        tooltipIcon={<span data-testid="custom-glyph">i</span>}
      >
        <input aria-label="memory" />
      </BAIFormItemVisual>,
    );
    expect(screen.getByTestId('custom-glyph')).toBeInTheDocument();
  });
});
