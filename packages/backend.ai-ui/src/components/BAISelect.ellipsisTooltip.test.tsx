/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import BAISelect from './BAISelect';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const longLabel = 'cr.backend.ai/stable/python-tensorflow:2.15-py311-cuda12.3';
const options = [
  { value: 'long', label: longLabel },
  { value: 'short', label: 'Short' },
];

// The trigger is a combobox, or a button when the listbox has a search box.
const hoverTrigger = (name: string) => {
  const trigger =
    screen.queryAllByRole('combobox', { name })[0] ??
    screen.getAllByRole('button', { name: new RegExp(name) })[0];
  fireEvent.pointerEnter(trigger);
  fireEvent.mouseEnter(trigger);
  fireEvent.focus(trigger);
  act(() => {
    vi.runAllTimers();
  });
};

// jsdom lays nothing out; ui-common reads clipping as scrollWidth > clientWidth.
const stubClipping = (isClipped: boolean) => {
  vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(100);
  vi.spyOn(HTMLElement.prototype, 'scrollWidth', 'get').mockReturnValue(
    isClipped ? 300 : 100,
  );
};

describe('BAISelect truncated value tooltip (#11446)', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('shows the whole label of a truncated value by default', () => {
    stubClipping(true);
    render(<BAISelect aria-label="Image" options={options} value="long" />);
    hoverTrigger('Image');
    expect(screen.getByRole('tooltip')).toHaveTextContent(longLabel);
  });

  it('shows no tooltip when showTooltipOnEllipsis is false', () => {
    stubClipping(true);
    render(
      <BAISelect
        aria-label="Image"
        showTooltipOnEllipsis={false}
        options={options}
        value="long"
      />,
    );
    hoverTrigger('Image');
    expect(screen.queryByRole('tooltip')).toBeNull();
  });

  it('shows no tooltip while the label fits', () => {
    stubClipping(false);
    render(<BAISelect aria-label="Image" options={options} value="short" />);
    hoverTrigger('Image');
    expect(screen.queryByRole('tooltip')).toBeNull();
  });
});
