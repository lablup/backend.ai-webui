/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
/**
 * What BAISelect took over from the removed BAISelector re-export (ADR 0017).
 */
import BAISelect from './BAISelect';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeAll, describe, expect, it, vi } from 'vitest';

// The popup keeps the keyboard highlight in view; jsdom has no layout.
beforeAll(() => {
  Element.prototype.scrollIntoView = vi.fn();
});

const trigger = () =>
  document.querySelector<HTMLElement>("button[aria-haspopup='listbox']");

describe('BAISelect as the single select', () => {
  it('names the control with aria-label, over the placeholder', () => {
    render(
      <BAISelect
        aria-label="Scheduler"
        placeholder="Pick one"
        options={[{ label: 'FIFO', value: 'fifo' }]}
      />,
    );
    expect(
      screen.getByRole('button', { name: /Scheduler/ }),
    ).toBeInTheDocument();
  });

  it('draws an option description on the default row', async () => {
    render(
      <BAISelect
        aria-label="Permission"
        showSearch={false}
        options={[
          { label: 'Read only', value: 'ro', description: 'Cannot write' },
        ]}
      />,
    );
    await userEvent.click(trigger()!);
    expect(await screen.findByText('Cannot write')).toBeInTheDocument();
  });

  it('renders labelRender on the closed trigger', () => {
    render(
      <BAISelect
        aria-label="Preset"
        value="a"
        options={[{ label: 'Alpha', value: 'a' }]}
        labelRender={(option) => <strong>{`Chosen ${option.label}`}</strong>}
      />,
    );
    expect(screen.getByText('Chosen Alpha')).toBeInTheDocument();
  });

  it('emits undefined when the value is cleared', async () => {
    const onChange = vi.fn();
    render(
      <BAISelect
        aria-label="Policy"
        allowClear
        value="a"
        onChange={onChange}
        options={[{ label: 'Alpha', value: 'a' }]}
      />,
    );
    await userEvent.click(screen.getByRole('button', { name: /clear/i }));
    expect(onChange).toHaveBeenCalledWith(undefined, undefined);
  });

  it('shows no clear button while nothing is selected', () => {
    render(
      <BAISelect
        aria-label="Policy"
        allowClear
        options={[{ label: 'Alpha', value: 'a' }]}
      />,
    );
    expect(
      screen.queryByRole('button', { name: /clear/i }),
    ).not.toBeInTheDocument();
  });
});
