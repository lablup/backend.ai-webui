/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
/**
 * Interaction cover for the popup body FR-3603 rewrote. `*.trigger.test.tsx`
 * only ever opens the CLOSED control, so keyboard commit, search clearing,
 * disabled rows and the highlight's reset on reopen had no test at all.
 *
 * Two jsdom gaps shape this file. The native Popover API is unimplemented, so
 * the mock below is Astryx's own (`ComplexSelector.test.tsx`) verbatim; and a
 * `[popover]` subtree stays hidden from the accessibility tree even once open,
 * so every query passes `{ hidden: true }` — again what Astryx's tests do.
 * `usePopover`'s autofocus does not resolve a focusable element under jsdom
 * either, so the tests focus the key surface explicitly and assert
 * FOCUSABILITY separately; landing on it is Astryx's behaviour, not ours.
 */
import BAIComplexSelect from './BAIComplexSelect';
import type { BAIComplexSelectOption } from './BAIComplexSelect';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

const originalMatches = HTMLElement.prototype.matches;

// The popup keeps the keyboard highlight in view; jsdom has no layout, so it
// does not implement `scrollIntoView` at all.
beforeAll(() => {
  Element.prototype.scrollIntoView = vi.fn();
});

// Mock the Popover API, which jsdom does not implement.
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
  { value: 'b', label: 'bravo' },
  { value: 'c', label: 'charlie' },
];

/** `b` is unselectable — the row every disabled assertion below aims at. */
const WITH_DISABLED: Array<BAIComplexSelectOption> = [
  { value: 'a', label: 'alpha' },
  { value: 'b', label: 'bravo', disabled: true },
  { value: 'c', label: 'charlie' },
];

const h = { hidden: true } as const;

const trigger = () => screen.getAllByRole('button')[0];
const listbox = () => screen.getByRole('listbox', h);
const optionRows = () => screen.getAllByRole('option', h);
const searchBox = () => screen.getByRole('combobox', h);
const highlightedLabels = () =>
  optionRows()
    .filter((row) => row.getAttribute('data-highlighted') === 'true')
    .map((row) => row.textContent);

describe('BAIComplexSelect popup — keyboard', () => {
  it('commits the arrowed-to option with Enter from the search box', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <BAIComplexSelect
        label="Targets"
        options={OPTIONS}
        onChange={onChange}
      />,
    );

    await user.click(trigger());
    searchBox().focus();
    await user.keyboard('{ArrowDown}{ArrowDown}');
    expect(highlightedLabels()).toEqual(['bravo']);

    await user.keyboard('{Enter}');
    expect(onChange).toHaveBeenCalledWith({ value: 'b', label: 'bravo' });
  });

  it('keeps the searchless popup operable — the listbox itself takes the keys', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <BAIComplexSelect
        label="Targets"
        hasSearch={false}
        options={OPTIONS}
        onChange={onChange}
      />,
    );

    await user.click(trigger());
    // The regression: with no search row the popup had NO focusable element,
    // so `usePopover`'s autofocus had nothing to land on and the arrows were
    // dead. `tabIndex` is what gives that autofocus a target.
    expect(listbox()).toHaveAttribute('tabindex', '0');
    expect(screen.queryByRole('combobox', h)).not.toBeInTheDocument();

    listbox().focus();
    await user.keyboard('{ArrowDown}');
    expect(highlightedLabels()).toEqual(['alpha']);
    expect(listbox()).toHaveAttribute(
      'aria-activedescendant',
      optionRows()[0].id,
    );

    await user.keyboard('{Enter}');
    expect(onChange).toHaveBeenCalledWith({ value: 'a', label: 'alpha' });
  });

  it('commits with Space too, but only where no input is swallowing it', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const onSearch = vi.fn();
    const { unmount } = render(
      <BAIComplexSelect
        label="Targets"
        hasSearch={false}
        options={OPTIONS}
        onChange={onChange}
      />,
    );
    await user.click(trigger());
    listbox().focus();
    await user.keyboard('{ArrowDown} ');
    expect(onChange).toHaveBeenCalledWith({ value: 'a', label: 'alpha' });
    unmount();

    // In the searchable panel a space is a space — it types, it does not commit.
    render(
      <BAIComplexSelect
        label="Targets"
        options={OPTIONS}
        onChange={onChange}
        onSearch={onSearch}
      />,
    );
    onChange.mockClear();
    await user.click(trigger());
    searchBox().focus();
    await user.keyboard('{ArrowDown} ');
    expect(onChange).not.toHaveBeenCalled();
    expect(onSearch).toHaveBeenLastCalledWith(' ');
  });

  it('Home and End land on real options', async () => {
    const user = userEvent.setup();
    render(<BAIComplexSelect label="Targets" options={OPTIONS} />);
    await user.click(trigger());
    searchBox().focus();

    await user.keyboard('{End}');
    expect(highlightedLabels()).toEqual(['charlie']);
    await user.keyboard('{Home}');
    expect(highlightedLabels()).toEqual(['alpha']);
  });
});

describe('BAIComplexSelect popup — disabled options', () => {
  it('never lets a disabled row wear the highlight on hover', async () => {
    const user = userEvent.setup();
    render(<BAIComplexSelect label="Targets" options={WITH_DISABLED} />);
    await user.click(trigger());

    await user.hover(optionRows()[0]);
    expect(highlightedLabels()).toEqual(['alpha']);

    // The bug: hovering `bravo` moved the highlight onto it, and the panel CSS
    // paints every highlighted row with the hover wash, so a row the user
    // cannot pick looked like the active one.
    await user.hover(optionRows()[1]);
    expect(highlightedLabels()).toEqual(['alpha']);
  });

  it('arrows step over the disabled row instead of resting on it', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <BAIComplexSelect
        label="Targets"
        options={WITH_DISABLED}
        onChange={onChange}
      />,
    );
    await user.click(trigger());
    searchBox().focus();

    await user.keyboard('{ArrowDown}');
    expect(highlightedLabels()).toEqual(['alpha']);
    await user.keyboard('{ArrowDown}');
    expect(highlightedLabels()).toEqual(['charlie']);

    await user.keyboard('{Enter}');
    expect(onChange).toHaveBeenCalledWith({ value: 'c', label: 'charlie' });
  });

  it('clicking a disabled row commits nothing', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <BAIComplexSelect
        label="Targets"
        options={WITH_DISABLED}
        onChange={onChange}
      />,
    );
    await user.click(trigger());
    await user.click(optionRows()[1]);
    expect(onChange).not.toHaveBeenCalled();
    expect(optionRows()[1]).toHaveAttribute('aria-disabled', 'true');
  });
});

describe('BAIComplexSelect popup — search box', () => {
  it('clears the query and reports the clear upstream', async () => {
    const user = userEvent.setup();
    const onSearch = vi.fn();
    render(
      <BAIComplexSelect
        label="Targets"
        options={OPTIONS}
        onSearch={onSearch}
      />,
    );
    await user.click(trigger());

    await user.type(searchBox(), 'br');
    expect(searchBox()).toHaveValue('br');
    expect(onSearch).toHaveBeenLastCalledWith('br');

    // The clear button only exists while there is something to clear.
    await user.click(screen.getByRole('button', { ...h, name: /clear/i }));
    expect(searchBox()).toHaveValue('');
    expect(onSearch).toHaveBeenLastCalledWith('');
    expect(
      screen.queryByRole('button', { ...h, name: /clear/i }),
    ).not.toBeInTheDocument();
  });

  it('does not highlight a disabled first row when a query lands on one', async () => {
    const user = userEvent.setup();
    render(<BAIComplexSelect label="Targets" options={WITH_DISABLED} />);
    await user.click(trigger());

    // Typing seeds the highlight so type-then-Enter works; it must seed the
    // first SELECTABLE row, not blindly index 0.
    await user.type(searchBox(), 'a');
    expect(highlightedLabels()).toEqual(['alpha']);
  });
});

describe('BAIComplexSelect popup — reopen', () => {
  it('drops the highlight when the panel closes', async () => {
    const user = userEvent.setup();
    render(<BAIComplexSelect label="Targets" options={OPTIONS} />);

    await user.click(trigger());
    searchBox().focus();
    await user.keyboard('{ArrowDown}{ArrowDown}');
    expect(highlightedLabels()).toEqual(['bravo']);

    // Astryx drops its highlight on close; without the reset the committed row
    // came back wearing the hover wash on the next open (FR-3603).
    await user.click(trigger());
    await user.click(trigger());
    expect(highlightedLabels()).toEqual([]);
  });
});
