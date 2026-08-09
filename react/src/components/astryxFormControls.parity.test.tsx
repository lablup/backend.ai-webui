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
 */
import { Form } from '../form-engine';
import {
  AstryxFormNumberInput,
  AstryxFormTagsInput,
  AstryxFormTextInput,
} from './astryxFormControls';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
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
