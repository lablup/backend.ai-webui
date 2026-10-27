/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
/**
 * The adapter's mapping onto ui-common's PagedSelector. The panel's own
 * behaviour (keyboard, highlight, empty state, paging) is PagedSelector's and
 * is tested in ui-common. jsdom lacks the Popover API, so the mock below is
 * Astryx's own, and a `[popover]` subtree needs `{ hidden: true }` queries.
 */
import BAIComplexSelect from './BAIComplexSelect';
import type { BAIComplexSelectOption } from './BAIComplexSelect';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

const originalMatches = HTMLElement.prototype.matches;

beforeAll(() => {
  Element.prototype.scrollIntoView = vi.fn();
});

beforeEach(() => {
  HTMLElement.prototype.showPopover = vi.fn(function (this: HTMLElement) {
    this.setAttribute('popover-open', '');
    const event = new Event('toggle');
    Object.defineProperty(event, 'newState', { value: 'open' });
    this.dispatchEvent(event);
  });
  HTMLElement.prototype.hidePopover = vi.fn(function (this: HTMLElement) {
    this.removeAttribute('popover-open');
    const event = new Event('toggle');
    Object.defineProperty(event, 'newState', { value: 'closed' });
    this.dispatchEvent(event);
  });
  Object.defineProperty(HTMLElement.prototype, 'matches', {
    configurable: true,
    value: function (this: HTMLElement, selector: string): boolean {
      if (selector === ':popover-open') {
        return this.hasAttribute('popover-open');
      }
      return originalMatches.call(this, selector);
    },
  });
});

const OPTIONS: Array<BAIComplexSelectOption> = [
  { value: 'a', label: 'alpha' },
  { value: 'b', label: 'bravo', disabled: true },
  { value: 'c', label: 'charlie', extra: <span>extra-c</span> },
];

const h = { hidden: true } as const;
const trigger = () => screen.getAllByRole('button')[0];
const optionRows = () => screen.getAllByRole('option', h);
const triggerText = () => trigger()?.textContent?.trim() ?? '';

describe('BAIComplexSelect value mapping', () => {
  it('emits the picked option as { label, value } in single mode', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <BAIComplexSelect label="Target" options={OPTIONS} onChange={onChange} />,
    );
    await user.click(trigger());
    await user.click(optionRows()[2]);
    expect(onChange).toHaveBeenCalledWith({ value: 'c', label: 'charlie' });
  });

  it('emits the whole labelled selection in multiple mode', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <BAIComplexSelect
        label="Targets"
        multiple
        options={OPTIONS}
        value={[{ value: 'z', label: 'zulu (other page)' }]}
        onChange={onChange}
      />,
    );
    await user.click(trigger());
    await user.click(optionRows()[0]);
    expect(onChange).toHaveBeenCalledWith([
      { value: 'z', label: 'zulu (other page)' },
      { value: 'a', label: 'alpha' },
    ]);
  });

  it('names a selected value that is not among the options from its label', () => {
    render(
      <BAIComplexSelect
        label="Target"
        options={OPTIONS}
        value={{ value: 'z', label: 'zulu' }}
      />,
    );
    expect(triggerText()).toContain('zulu');
  });

  it('keeps the multiple-mode trigger in labels form, "+N" past maxTriggerTokens', () => {
    render(
      <BAIComplexSelect
        label="Targets"
        multiple
        maxTriggerTokens={2}
        options={OPTIONS}
        value={[
          { value: 'a', label: 'alpha' },
          { value: 'c', label: 'charlie' },
          { value: 'z', label: 'zulu' },
        ]}
      />,
    );
    expect(triggerText()).toContain('alpha, charlie, +1');
  });

  it('clears to null, or to [] when multiple, with allowClear', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const { rerender } = render(
      <BAIComplexSelect
        label="Target"
        allowClear
        options={OPTIONS}
        value={{ value: 'a', label: 'alpha' }}
        onChange={onChange}
      />,
    );
    await user.click(screen.getByRole('button', { name: /clear/i }));
    expect(onChange).toHaveBeenLastCalledWith(null);

    rerender(
      <BAIComplexSelect
        label="Target"
        allowClear
        multiple
        options={OPTIONS}
        value={[{ value: 'a', label: 'alpha' }]}
        onChange={onChange}
      />,
    );
    await user.click(screen.getByRole('button', { name: /clear/i }));
    expect(onChange).toHaveBeenLastCalledWith([]);
  });
});

describe('BAIComplexSelect option and panel mapping', () => {
  it('maps `disabled` and `extra` onto the rows', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <BAIComplexSelect label="Target" options={OPTIONS} onChange={onChange} />,
    );
    await user.click(trigger());
    expect(optionRows()[1]).toHaveAttribute('aria-disabled', 'true');
    await user.click(optionRows()[1]);
    expect(onChange).not.toHaveBeenCalled();
    expect(optionRows()[2]).toHaveTextContent('extra-c');
  });

  it('reports search keystrokes through onSearch', async () => {
    const user = userEvent.setup();
    const onSearch = vi.fn();
    render(
      <BAIComplexSelect label="Target" options={OPTIONS} onSearch={onSearch} />,
    );
    await user.click(trigger());
    await user.type(screen.getByRole('combobox', h), 'br');
    expect(onSearch).toHaveBeenLastCalledWith('br');
  });

  it('fires endReached and atBottomStateChange at the threshold', async () => {
    const user = userEvent.setup();
    const endReached = vi.fn();
    const atBottomStateChange = vi.fn();
    render(
      <BAIComplexSelect
        label="Target"
        options={OPTIONS}
        endReached={endReached}
        atBottomThreshold={50}
        atBottomStateChange={atBottomStateChange}
      />,
    );
    await user.click(trigger());
    const listbox = screen.getByRole('listbox', h);
    Object.defineProperties(listbox, {
      scrollHeight: { configurable: true, value: 500 },
      clientHeight: { configurable: true, value: 200 },
      scrollTop: { configurable: true, value: 260 },
    });
    fireEvent.scroll(listbox);
    expect(endReached).toHaveBeenCalledTimes(1);
    expect(atBottomStateChange).toHaveBeenLastCalledWith(true);
  });

  it('shows the total with `total`, and `emptyContent` for an empty list', async () => {
    const user = userEvent.setup();
    const { rerender } = render(
      <BAIComplexSelect label="Target" options={OPTIONS} total={42} />,
    );
    await user.click(trigger());
    expect(screen.getAllByText(/42/, { ignore: '[aria-live]' })).not.toEqual(
      [],
    );

    rerender(
      <BAIComplexSelect
        label="Target"
        options={[]}
        isLoading
        emptyContent={<span>pick a scope first</span>}
      />,
    );
    expect(screen.getByRole('listbox', h)).toHaveTextContent(
      'pick a scope first',
    );
  });
});
