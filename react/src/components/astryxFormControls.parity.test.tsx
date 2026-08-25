/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
/**
 * Pins the antd behaviours the Astryx adapters had quietly stopped providing.
 * Each of these was invisible to `tsc` and to every existing test, because the
 * prop was still ACCEPTED — it just did nothing, or the control simply looked
 * pristine while the form said it was invalid.
 *
 *  - **validation status on the control.** antd's `Form.Item` published its
 *    merged status on `FormItemInputContext` and every antd control read it.
 *    No Astryx adapter did, so a failed rule printed a red message under a
 *    field with a normal border.
 *  - **clamp on blur.** antd's `InputNumber` clamped an out-of-range entry;
 *    Astryx's `NumberInput` rejects it (`onChange` never fires) and the pending
 *    text is dropped on blur, so the user's entry vanished.
 *  - **`maxLength`.** Not declared by Astryx, but spread onto the native
 *    `<input>` — so declaring it in the adapter is the whole fix.
 *  - **`tokenSeparators`.** Three call sites' own UI text instructs the user
 *    to separate values with a comma or space.
 *  - **focus survives the first failing keystroke.** Reflecting the status
 *    turned out to be able to REMOUNT the control (see the last describe).
 */
import { Form } from '../form-engine';
import {
  AstryxFormNumberInput,
  AstryxFormTagsInput,
  AstryxFormTextInput,
} from './astryxFormControls';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';

describe('AstryxFormTextInput — restored props', () => {
  it('lands `maxLength` on the native input', () => {
    render(<AstryxFormTextInput label="Email" maxLength={64} />);
    expect(screen.getByLabelText('Email')).toHaveAttribute('maxlength', '64');
  });

  it('lands `autoComplete` on the native input', () => {
    render(<AstryxFormTextInput label="Email" autoComplete="username" />);
    expect(screen.getByLabelText('Email')).toHaveAttribute(
      'autocomplete',
      'username',
    );
  });

  it('fires `onEnter` on a plain Enter', () => {
    const onEnter = vi.fn();
    render(<AstryxFormTextInput label="Email" onEnter={onEnter} />);
    fireEvent.keyDown(screen.getByLabelText('Email'), { key: 'Enter' });
    expect(onEnter).toHaveBeenCalledTimes(1);
  });

  it('swallows the Enter that COMMITS an IME candidate', () => {
    const onEnter = vi.fn();
    render(<AstryxFormTextInput label="Name" onEnter={onEnter} />);
    const input = screen.getByLabelText('Name');
    // Hangul/Kana/Pinyin: composition is open, and this Enter confirms the
    // candidate. antd guarded on `isComposing`; Astryx does not.
    fireEvent.compositionStart(input);
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onEnter).not.toHaveBeenCalled();
    // The next Enter, after the composition closed, is a real submit.
    fireEvent.compositionEnd(input);
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onEnter).toHaveBeenCalledTimes(1);
  });
});

describe('AstryxFormNumberInput — clamp on blur', () => {
  it('clamps an over-max entry instead of reverting it', () => {
    const onChange = vi.fn();
    render(
      <AstryxFormNumberInput
        label="Port"
        value={80}
        min={1}
        max={65535}
        onChange={onChange}
      />,
    );
    fireEvent.blur(screen.getByLabelText('Port'), {
      target: { value: '70000' },
    });
    expect(onChange).toHaveBeenCalledWith(65535);
  });

  it('clamps an under-min entry', () => {
    const onChange = vi.fn();
    render(
      <AstryxFormNumberInput
        label="Port"
        value={80}
        min={1}
        max={65535}
        onChange={onChange}
      />,
    );
    fireEvent.blur(screen.getByLabelText('Port'), { target: { value: '-5' } });
    expect(onChange).toHaveBeenCalledWith(1);
  });

  it('leaves an in-range entry alone', () => {
    const onChange = vi.fn();
    render(
      <AstryxFormNumberInput
        label="Port"
        value={80}
        min={1}
        max={65535}
        onChange={onChange}
      />,
    );
    fireEvent.blur(screen.getByLabelText('Port'), { target: { value: '443' } });
    expect(onChange).not.toHaveBeenCalled();
  });

  it('rounds a decimal in an UNBOUNDED integer-only field', () => {
    // Astryx's parser rejects a decimal exactly the way it rejects an
    // out-of-range value, so without `isIntegerOnly` counting as a repairable
    // constraint the entry would vanish on blur. FR-3634.
    const onChange = vi.fn();
    render(
      <AstryxFormNumberInput
        label="Replicas"
        value={2}
        isIntegerOnly
        onChange={onChange}
      />,
    );
    fireEvent.blur(screen.getByLabelText('Replicas'), {
      target: { value: '3.5' },
    });
    expect(onChange).toHaveBeenCalledWith(4);
  });

  it('leaves a whole number alone in an unbounded integer-only field', () => {
    const onChange = vi.fn();
    render(
      <AstryxFormNumberInput
        label="Replicas"
        value={2}
        isIntegerOnly
        onChange={onChange}
      />,
    );
    fireEvent.blur(screen.getByLabelText('Replicas'), {
      target: { value: '7' },
    });
    expect(onChange).not.toHaveBeenCalled();
  });
});

describe('AstryxFormTagsInput — tokenSeparators', () => {
  it('splits a committed entry on the configured separators', () => {
    const onChange = vi.fn();
    render(
      <AstryxFormTagsInput
        label="Ports"
        // The value the Tokenizer would hand back for `"8080,9090 7070"`:
        // `hasCreate` commits the whole typed string as ONE token, because
        // Astryx exposes no paste/input hook to split it at entry time. The
        // adapter takes it apart on the way into the form — which is the
        // outcome antd's `tokenSeparators` produced.
        value={['8080,9090 7070']}
        onChange={onChange}
        tokenSeparators={[',', ' ']}
      />,
    );
    // Re-emitting the current value is what any Tokenizer edit does.
    const combobox = screen.getByRole('combobox', { name: /Ports/ });
    fireEvent.focus(combobox);
    fireEvent.keyDown(combobox, { key: 'Backspace' });
    expect(onChange).toHaveBeenCalled();
    for (const call of onChange.mock.calls) {
      expect(call[0]).not.toContain('8080,9090 7070');
    }
  });

  it('leaves entries intact when no separators are configured', () => {
    const onChange = vi.fn();
    render(
      <AstryxFormTagsInput label="Tags" value={['a,b']} onChange={onChange} />,
    );
    expect(screen.getByRole('combobox', { name: /Tags/ })).toBeInTheDocument();
  });

  /*
   * QA-FINDINGS Q-31 — the separator must cut a token WHILE TYPING, not only
   * on Enter. Measured before the fix: typing `10,20 30` at 120ms/key left the
   * whole string in the input and produced zero tokens.
   *
   * The trailing `30` is deliberately still pending here: antd's
   * `tokenSeparators` cut on the SEPARATOR, so text with no trailing separator
   * stays in the search input until Enter, in antd and here alike.
   */
  it('commits a token on the separator keystroke, with no Enter', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const Harness = () => {
      const [tags, setTags] = useState<Array<string>>([]);
      return (
        <AstryxFormTagsInput
          label="GIDs"
          value={tags}
          onChange={(next) => {
            setTags(next);
            onChange(next);
          }}
          tokenSeparators={[',', ' ']}
        />
      );
    };
    render(<Harness />);
    const combobox = screen.getByRole('combobox', { name: /GIDs/ });
    await user.click(combobox);
    await user.type(combobox, '10,20 30');

    await waitFor(() => {
      expect(onChange).toHaveBeenCalledTimes(2);
    });
    expect(onChange.mock.calls.at(-1)?.[0]).toEqual(['10', '20']);
    // The separator characters themselves are never typed into the field.
    expect(combobox).toHaveValue('30');
  });

  it('swallows a separator pressed with nothing to commit', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <AstryxFormTagsInput
        label="GIDs"
        value={[]}
        onChange={onChange}
        tokenSeparators={[',', ' ']}
      />,
    );
    const combobox = screen.getByRole('combobox', { name: /GIDs/ });
    await user.click(combobox);
    await user.type(combobox, ',, ');
    expect(onChange).not.toHaveBeenCalled();
    expect(combobox).toHaveValue('');
  });
});

describe('Form.Item status reaches the control', () => {
  it('paints the control with the item’s error status', async () => {
    const Harness = () => {
      const [form] = Form.useForm();
      return (
        <Form form={form}>
          <Form.Item
            name="email"
            label="Email"
            rules={[{ required: true, message: 'Please enter Email' }]}
          >
            <AstryxFormTextInput label="Email" />
          </Form.Item>
          <button
            type="button"
            onClick={() => form.validateFields().catch(() => {})}
          >
            submit
          </button>
        </Form>
      );
    };
    render(<Harness />);
    fireEvent.click(screen.getByText('submit'));
    await waitFor(() => {
      expect(screen.getByText('Please enter Email')).toBeInTheDocument();
    });
    // antd painted the control's border from the item's status. Astryx
    // reflects the same thing as `data-status` on the input wrapper
    // (`themeProps('text-input', { status })`).
    const input = screen.getByLabelText('Email');
    const wrapper = input.closest('.astryx-text-input');
    expect(wrapper).not.toBeNull();
    expect(wrapper?.getAttribute('data-status')).toBe('error');
  });
});

describe('the control is not remounted when its status changes', () => {
  /**
   * Regression: typing into ANY field carrying `rules` lost focus after the
   * first character.
   *
   * `useFormControlStatusProps` used to return `{}` while the field was
   * pristine and `{ status, statusVariant: 'detached' }` once a rule failed.
   * Astryx's `Field` renders `{children}` inside an extra `<div>` when
   * `statusVariant === 'attached'` (its default, i.e. what `{}` selects) and
   * as a bare fragment otherwise — so the first keystroke swapped the element
   * structure at the control's position, React unmounted the subtree, and the
   * new `<input>` was a different DOM node with no focus. Characters 2..n went
   * to `<body>`.
   *
   * The login screen's endpoint field is the reported instance (its rule is
   * `pattern: /^https?:\/\//`, which a half-typed URL fails), so the harness
   * below is that field.
   */
  const EndpointHarness = () => {
    const [form] = Form.useForm();
    return (
      <Form form={form}>
        <Form.Item
          name="api_endpoint"
          rules={[
            {
              pattern: /^https?:\/\/(.*)/,
              message: 'Endpoint must start with http:// or https://',
            },
          ]}
        >
          <AstryxFormTextInput label="Endpoint" />
        </Form.Item>
      </Form>
    );
  };

  it('keeps focus and accumulates every character while the value is invalid', async () => {
    const user = userEvent.setup();
    render(<EndpointHarness />);
    const input = screen.getByLabelText('Endpoint');
    await user.click(input);
    expect(document.activeElement).toBe(input);

    // Every one of these leaves the field invalid, so the status stays
    // 'error' for characters 2..n and flips on character 1 — the exact
    // transition that used to remount.
    await user.keyboard('http:/x');

    await waitFor(() => {
      expect(screen.getByLabelText('Endpoint')).toHaveValue('http:/x');
    });
    // Same DOM node throughout, and it never lost focus.
    expect(screen.getByLabelText('Endpoint')).toBe(input);
    expect(document.activeElement).toBe(input);
  });

  it('keeps focus across the invalid -> valid transition too', async () => {
    const user = userEvent.setup();
    render(<EndpointHarness />);
    const input = screen.getByLabelText('Endpoint');
    await user.click(input);
    await user.keyboard('http://a.b');

    await waitFor(() => {
      expect(screen.getByLabelText('Endpoint')).toHaveValue('http://a.b');
    });
    expect(screen.getByLabelText('Endpoint')).toBe(input);
    expect(document.activeElement).toBe(input);
  });
});
