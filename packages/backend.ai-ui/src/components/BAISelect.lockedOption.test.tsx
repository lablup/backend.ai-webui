/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
/**
 * A selected `disabled` option is locked in multiple mode: no clear path may
 * drop it (FR-3989 — the user's PERSONAL project in the user edit modal).
 */
import BAISelect from './BAISelect';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeAll, describe, expect, it, vi } from 'vitest';

beforeAll(() => {
  Element.prototype.scrollIntoView = vi.fn();
});

const options = [
  { value: 'personal', label: 'Personal', disabled: true },
  { value: 'general', label: 'General' },
];

const clearButton = () => screen.queryByRole('button', { name: /clear/i });

describe('BAISelect locked (disabled) options in multiple mode', () => {
  it('keeps a locked value when the selection is cleared', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <BAISelect
        label="Projects"
        mode="multiple"
        allowClear
        options={options}
        value={['personal', 'general']}
        onChange={onChange}
      />,
    );

    const clear = clearButton();
    expect(clear).not.toBeNull();
    await user.click(clear!);

    expect(onChange).toHaveBeenCalledWith(['personal'], undefined);
  });

  it('offers no clear button when only locked values are selected', () => {
    render(
      <BAISelect
        label="Projects"
        mode="multiple"
        allowClear
        options={options}
        value={['personal']}
        onChange={vi.fn()}
      />,
    );

    expect(clearButton()).toBeNull();
  });

  it('does not deselect a locked option from the list', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <BAISelect
        label="Projects"
        mode="multiple"
        options={options}
        value={['personal', 'general']}
        onChange={onChange}
      />,
    );

    await user.click(screen.getAllByRole('button')[0]);
    await user.click(screen.getByRole('option', { name: /Personal/ }));

    expect(onChange).not.toHaveBeenCalled();
  });
});
