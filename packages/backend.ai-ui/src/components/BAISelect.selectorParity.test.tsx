/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
/**
 * BAISelect is ui-common `Selector` under the BAI name (ADR 0042): its props
 * reach `Selector` unchanged, plus the project defaults and `autoSelectOption`.
 */
import { Form, FormItem, type FormInstance } from '../form-engine';
import BAISelect from './BAISelect';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
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
        hasSearch={false}
        options={[
          { label: 'Read only', value: 'ro', description: 'Cannot write' },
        ]}
      />,
    );
    await userEvent.click(trigger()!);
    expect(await screen.findByText('Cannot write')).toBeInTheDocument();
  });

  it('has search on unless hasSearch is false', async () => {
    const { unmount } = render(
      <BAISelect
        aria-label="Scheduler"
        options={[{ label: 'FIFO', value: 'fifo' }]}
      />,
    );
    await userEvent.click(trigger()!);
    await screen.findByRole('listbox');
    expect(document.querySelector('input')).not.toBeNull();
    unmount();

    render(
      <BAISelect
        aria-label="Scheduler"
        hasSearch={false}
        options={[{ label: 'FIFO', value: 'fifo' }]}
      />,
    );
    await userEvent.click(trigger()!);
    await screen.findByRole('listbox');
    expect(document.querySelector('input')).toBeNull();
  });

  it('reports popup open and close', async () => {
    const onOpenChange = vi.fn();
    render(
      <BAISelect
        aria-label="Scheduler"
        hasSearch={false}
        onOpenChange={onOpenChange}
        options={[{ label: 'FIFO', value: 'fifo' }]}
      />,
    );
    expect(onOpenChange).not.toHaveBeenCalled();

    await userEvent.click(trigger()!);
    await waitFor(() => expect(onOpenChange).toHaveBeenLastCalledWith(true));

    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(onOpenChange).toHaveBeenLastCalledWith(false));
    expect(onOpenChange).toHaveBeenCalledTimes(2);
  });

  it('renders renderValue on the closed trigger', () => {
    render(
      <BAISelect
        aria-label="Preset"
        value="a"
        options={[{ label: 'Alpha', value: 'a' }]}
        renderValue={(option) => <strong>{`Chosen ${option.label}`}</strong>}
      />,
    );
    expect(screen.getByText('Chosen Alpha')).toBeInTheDocument();
  });

  it('selects an option inside a section and reports its value', async () => {
    const onChange = vi.fn();
    render(
      <BAISelect
        aria-label="Environments"
        hasSearch={false}
        value="pytorch"
        onChange={onChange}
        options={[
          {
            type: 'section',
            title: 'Stable',
            options: [
              { label: 'PyTorch', value: 'pytorch' },
              { label: 'TensorFlow', value: 'tensorflow' },
            ],
          },
        ]}
      />,
    );
    await userEvent.click(trigger()!);
    await userEvent.click(
      await screen.findByRole('option', { name: 'TensorFlow' }),
    );
    expect(onChange).toHaveBeenCalledWith('tensorflow');
  });

  it('emits null when the value is cleared', async () => {
    const onChange = vi.fn();
    render(
      <BAISelect
        aria-label="Policy"
        hasClear
        value="a"
        onChange={onChange}
        options={[{ label: 'Alpha', value: 'a' }]}
      />,
    );
    await userEvent.click(screen.getByRole('button', { name: /clear/i }));
    expect(onChange).toHaveBeenCalledWith(null);
  });

  it.each([undefined, ''])(
    'shows no clear button while the value is %j',
    (value) => {
      render(
        <BAISelect
          aria-label="Policy"
          hasClear
          value={value}
          options={[{ label: 'Alpha', value: 'a' }]}
        />,
      );
      expect(
        screen.queryByRole('button', { name: /clear/i }),
      ).not.toBeInTheDocument();
    },
  );

  it('fills an empty Form.Item with the first option with autoSelectOption', async () => {
    const formRef = React.createRef<FormInstance>();
    render(
      <Form ref={formRef}>
        <FormItem name="kernel" label="Kernel">
          <BAISelect
            autoSelectOption
            options={[
              { type: 'section', title: 'Main', options: [{ value: 'k1' }] },
              { value: 'k2' },
            ]}
          />
        </FormItem>
      </Form>,
    );
    await waitFor(() =>
      expect(formRef.current?.getFieldValue('kernel')).toBe('k1'),
    );
  });

  it('keeps the user choice on a controlled select with autoSelectOption', async () => {
    const onChange = vi.fn();
    const Controlled = () => {
      const [value, setValue] = React.useState<string | null>();
      return (
        <BAISelect
          aria-label="Kernel"
          hasSearch={false}
          autoSelectOption
          value={value}
          onChange={(next) => {
            onChange(next);
            setValue(next);
          }}
          options={[{ value: 'k1' }, { value: 'k2' }]}
        />
      );
    };
    render(<Controlled />);
    await waitFor(() => expect(onChange).toHaveBeenCalledWith('k1'));
    await userEvent.click(trigger()!);
    await userEvent.click(await screen.findByRole('option', { name: 'k2' }));
    expect(trigger()).toHaveTextContent('k2');
    expect(onChange).toHaveBeenCalledTimes(2);
  });

  it('leaves an uncontrolled select alone with autoSelectOption', async () => {
    const onChange = vi.fn();
    render(
      <BAISelect
        aria-label="Kernel"
        hasSearch={false}
        autoSelectOption
        onChange={onChange}
        options={[{ value: 'k1' }, { value: 'k2' }]}
      />,
    );
    await userEvent.click(trigger()!);
    await userEvent.click(await screen.findByRole('option', { name: 'k2' }));
    expect(onChange).toHaveBeenCalledWith('k2');
    expect(onChange).not.toHaveBeenCalledWith('k1');
    expect(trigger()).toHaveTextContent('k2');
  });

  it('leaves a set value alone with autoSelectOption', () => {
    const onChange = vi.fn();
    render(
      <BAISelect
        aria-label="Kernel"
        autoSelectOption
        value="k2"
        onChange={onChange}
        options={[{ value: 'k1' }, { value: 'k2' }]}
      />,
    );
    expect(onChange).not.toHaveBeenCalled();
  });
});
