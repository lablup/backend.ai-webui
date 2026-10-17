/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
/**
 * The value contract: a preset commits its bit set, a Custom checkbox commits
 * exactly the checked bits, and the preset shown is derived from the bits.
 * The menu's own behaviour (hover intent, roving focus, flyout placement) is
 * Astryx's and is tested there. jsdom lacks the Popover API, so the mock
 * below is the one BAIComplexSelect.test uses, and a `[popover]` subtree
 * needs `{ hidden: true }` queries.
 */
import BAIEntitySharePermissionSelector, {
  normalizeEntitySharePermissionBits,
  toEntitySharePermissionChoice,
} from './BAIEntitySharePermissionSelector';
import { render, screen } from '@testing-library/react';
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

const h = { hidden: true } as const;
const trigger = () => screen.getByRole('button', { name: /Permission/ });
const presetRows = () =>
  screen
    .getAllByRole('menuitem', h)
    .filter((row) => row.getAttribute('aria-haspopup') === null);
const customRow = () =>
  screen.getByTestId('bai-entity-share-permission-custom');
const bitRows = () => screen.getAllByRole('menuitemcheckbox', h);

describe('toEntitySharePermissionChoice', () => {
  it('matches a preset as a set, whatever the order', () => {
    expect(toEntitySharePermissionChoice(['READ'])).toBe('READ_ONLY');
    expect(
      toEntitySharePermissionChoice(['SOFT_DELETE', 'READ', 'UPDATE']),
    ).toBe('READ_WRITE');
    expect(
      toEntitySharePermissionChoice([
        'READ',
        'UPDATE',
        'CREATE',
        'SOFT_DELETE',
        'HARD_DELETE',
      ]),
    ).toBe('FULL_ACCESS');
  });

  it('reads CUSTOM for any other set, the empty one included', () => {
    expect(toEntitySharePermissionChoice(['READ', 'UPDATE'])).toBe('CUSTOM');
    expect(toEntitySharePermissionChoice(['CREATE'])).toBe('CUSTOM');
    expect(toEntitySharePermissionChoice([])).toBe('CUSTOM');
    expect(toEntitySharePermissionChoice(null)).toBe('CUSTOM');
  });

  it('normalizes to flyout order without duplicates or unknown values', () => {
    expect(
      normalizeEntitySharePermissionBits(['READ', 'CREATE', 'READ', 'nope']),
    ).toEqual(['CREATE', 'READ']);
  });
});

describe('BAIEntitySharePermissionSelector', () => {
  it('names the trigger after the preset the bits match', () => {
    const { rerender } = render(
      <BAIEntitySharePermissionSelector label="Permission" value={['READ']} />,
    );
    expect(trigger()).toHaveTextContent('Read only');

    rerender(
      <BAIEntitySharePermissionSelector
        label="Permission"
        value={['READ', 'UPDATE', 'SOFT_DELETE']}
      />,
    );
    expect(trigger()).toHaveTextContent('Read & write');

    rerender(
      <BAIEntitySharePermissionSelector
        label="Permission"
        value={['CREATE', 'READ', 'UPDATE', 'SOFT_DELETE', 'HARD_DELETE']}
      />,
    );
    expect(trigger()).toHaveTextContent('Full access');

    rerender(
      <BAIEntitySharePermissionSelector
        label="Permission"
        value={['READ', 'UPDATE']}
      />,
    );
    expect(trigger()).toHaveTextContent('Custom');
  });

  it('lists the three presets as plain items, a divider and the Custom row in order', async () => {
    const user = userEvent.setup();
    render(
      <BAIEntitySharePermissionSelector label="Permission" value={['READ']} />,
    );
    await user.click(trigger());

    const rows = presetRows();
    expect(rows.map((row) => row.textContent)).toEqual([
      'Full access',
      'Read & write',
      'Read only',
    ]);
    expect(screen.queryAllByRole('menuitemradio', h)).toHaveLength(0);
    expect(screen.getByRole('separator', h)).toBeInTheDocument();
    expect(customRow()).toHaveTextContent('Custom');
  });

  it('commits a preset bit set and reports the preset', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <BAIEntitySharePermissionSelector
        label="Permission"
        value={['READ']}
        onChange={onChange}
      />,
    );
    await user.click(trigger());
    await user.click(presetRows()[1]);
    expect(onChange).toHaveBeenCalledWith(
      ['READ', 'UPDATE', 'SOFT_DELETE'],
      'READ_WRITE',
    );

    await user.click(trigger());
    await user.click(presetRows()[0]);
    expect(onChange).toHaveBeenLastCalledWith(
      ['CREATE', 'READ', 'UPDATE', 'SOFT_DELETE', 'HARD_DELETE'],
      'FULL_ACCESS',
    );
  });

  it('opens the Custom flyout with one checkbox per bit, the checked ones from the value', async () => {
    const user = userEvent.setup();
    render(
      <BAIEntitySharePermissionSelector
        label="Permission"
        value={['READ', 'UPDATE', 'SOFT_DELETE']}
      />,
    );
    await user.click(trigger());
    await user.click(customRow());

    const rows = bitRows();
    expect(rows.map((row) => row.textContent)).toEqual([
      'Create',
      'Read',
      'Update',
      'Soft delete',
      'Hard delete',
    ]);
    expect(rows.map((row) => row.getAttribute('aria-checked'))).toEqual([
      'false',
      'true',
      'true',
      'true',
      'false',
    ]);
  });

  it('commits exactly the checked bits from the flyout and derives the preset', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <BAIEntitySharePermissionSelector
        label="Permission"
        value={['READ']}
        onChange={onChange}
      />,
    );
    await user.click(trigger());
    await user.click(customRow());
    await user.click(bitRows()[2]); // Update
    expect(onChange).toHaveBeenCalledWith(['READ', 'UPDATE'], 'CUSTOM');
  });

  it('completes a preset from the flyout and reports it as that preset', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <BAIEntitySharePermissionSelector
        label="Permission"
        value={['READ', 'UPDATE']}
        onChange={onChange}
      />,
    );
    await user.click(trigger());
    await user.click(customRow());
    await user.click(bitRows()[3]); // Soft delete
    expect(onChange).toHaveBeenCalledWith(
      ['READ', 'UPDATE', 'SOFT_DELETE'],
      'READ_WRITE',
    );
  });

  it('keeps the last checked bit, since an empty list means no ceiling', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <BAIEntitySharePermissionSelector
        label="Permission"
        value={['READ']}
        onChange={onChange}
      />,
    );
    await user.click(trigger());
    await user.click(customRow());
    const read = bitRows()[1];
    expect(read).toHaveAttribute('aria-checked', 'true');
    expect(read).toHaveAttribute('aria-disabled', 'true');
    await user.click(read);
    expect(onChange).not.toHaveBeenCalled();
  });

  it('keeps its own bits when uncontrolled', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <BAIEntitySharePermissionSelector
        label="Permission"
        defaultValue={['READ', 'UPDATE', 'SOFT_DELETE']}
        onChange={onChange}
      />,
    );
    expect(trigger()).toHaveTextContent('Read & write');
    await user.click(trigger());
    await user.click(presetRows()[2]);
    expect(onChange).toHaveBeenCalledWith(['READ'], 'READ_ONLY');
    expect(trigger()).toHaveTextContent('Read only');
  });

  it('disables the trigger', () => {
    render(
      <BAIEntitySharePermissionSelector
        label="Permission"
        value={['READ']}
        isDisabled
      />,
    );
    expect(trigger()).toBeDisabled();
  });
});
