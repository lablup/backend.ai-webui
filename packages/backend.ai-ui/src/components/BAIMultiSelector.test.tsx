/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import BAIMultiSelector from './BAIMultiSelector';
import BAISelect from './BAISelect';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const options = [
  { value: 'interactive', label: 'Interactive' },
  { value: 'batch', label: 'Batch' },
  { value: 'inference', label: 'Inference' },
  { value: 'system', label: 'System' },
  { value: 'training', label: 'Training' },
];
const allValues = options.map((option) => option.value);
const allLabels = 'Interactive, Batch, Inference, System, Training';

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

describe('multi-select trigger tooltip (#10951)', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('BAIMultiSelector lists every selected label by default', () => {
    render(
      <BAIMultiSelector
        aria-label="Session types"
        options={options}
        value={allValues}
      />,
    );
    hoverTrigger('Session types');
    expect(screen.getByRole('tooltip')).toHaveTextContent(allLabels);
  });

  it('BAIMultiSelector shows no tooltip with showSelectedOptionsTooltip={false}', () => {
    render(
      <BAIMultiSelector
        aria-label="Session types"
        showSelectedOptionsTooltip={false}
        options={options}
        value={allValues}
      />,
    );
    hoverTrigger('Session types');
    expect(screen.queryByRole('tooltip')).toBeNull();
  });

  it('BAISelect mode="multiple" gets the tooltip, and passes showSelectedOptionsTooltip through', () => {
    const { unmount } = render(
      <BAISelect
        mode="multiple"
        aria-label="Session types"
        options={options}
        value={allValues}
      />,
    );
    hoverTrigger('Session types');
    expect(screen.getByRole('tooltip')).toHaveTextContent(allLabels);
    unmount();

    render(
      <BAISelect
        mode="multiple"
        aria-label="Session types"
        showSelectedOptionsTooltip={false}
        options={options}
        value={allValues}
      />,
    );
    hoverTrigger('Session types');
    expect(screen.queryByRole('tooltip')).toBeNull();
  });
});
