/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 FR-3683 — a failed SUBMIT must land the user on the first invalid field.

 What is pinned here:
   - `form.submit()` scrolls and focuses; a bare `validateFields()` never does
     (validating is not submitting);
   - the item is found without relying on the control's `id` — the test
     control drops it, as Astryx inputs do;
   - "first" is DOM order, not field REGISTRATION order;
   - the switch is off until `<Form scrollToFirstError>` says otherwise;
   - the scroll never yanks the focus away from a user who is mid-edit.
 */
import { Form } from './engine';
import type { FormInstance } from './interface';
import { act, render } from '@testing-library/react';
import * as React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

/** Like an Astryx input: whatever `id` comes in is replaced by its own. */
const Input: React.FC<any> = ({
  value = '',
  onChange,
  id: _ignored,
  ...rest
}) => {
  const ownId = React.useId();
  return <input id={ownId} value={value} onChange={onChange} {...rest} />;
};

const scrollIntoView = vi.fn();

/** The scrolled item's field id — what the resolver picked. */
function scrolledField(): string | null | undefined {
  const node = scrollIntoView.mock.instances[0] as HTMLElement | undefined;
  return node?.getAttribute('data-bai-form-item-id');
}

function controlOf(fieldId: string): HTMLInputElement {
  return document.querySelector<HTMLInputElement>(
    `[data-bai-form-item-id="${fieldId}"] input`,
  )!;
}

beforeEach(() => {
  scrollIntoView.mockClear();
  // jsdom implements no scrolling at all.
  Element.prototype.scrollIntoView = scrollIntoView;
});

interface Props {
  formRef: (form: FormInstance) => void;
  scrollToFirstError?: boolean;
  /** Renders `late` ABOVE `early` while registering it after. */
  reverseDom?: boolean;
}

const TestForm: React.FC<Props> = ({
  formRef,
  scrollToFirstError,
  reverseDom,
}) => {
  const [form] = Form.useForm();
  formRef(form);

  const early = (
    <Form.Item
      key="early"
      name="early"
      label="Early"
      rules={[{ required: true }]}
    >
      <Input />
    </Form.Item>
  );
  const late = (
    <Form.Item key="late" name="late" label="Late" rules={[{ required: true }]}>
      <Input />
    </Form.Item>
  );

  return (
    <Form form={form} scrollToFirstError={scrollToFirstError}>
      {reverseDom ? [late, early] : [early, late]}
    </Form>
  );
};

/** A layout-only `Form.Item` around a button — `ImportRepoForm`'s shape. */
const FormWithButton: React.FC<Pick<Props, 'formRef'>> = ({ formRef }) => {
  const [form] = Form.useForm();
  formRef(form);

  return (
    <Form form={form} scrollToFirstError>
      <Form.Item name="early" label="Early" rules={[{ required: true }]}>
        <Input />
      </Form.Item>
      <Form.Item>
        <button type="button" id="submit">
          OK
        </button>
      </Form.Item>
    </Form>
  );
};

async function submit(form: FormInstance) {
  await act(async () => {
    form.submit();
  });
}

describe('scroll to the first invalid field', () => {
  it('scrolls and focuses on a failed submit, without the control’s id', async () => {
    let form!: FormInstance;
    render(<TestForm formRef={(f) => (form = f)} scrollToFirstError />);
    // The control did not keep the id `Form.Item` gave it.
    expect(document.getElementById('early')).toBeNull();

    await submit(form);

    expect(scrolledField()).toBe('early');
    expect(document.activeElement).toBe(controlOf('early'));
  });

  it('does not scroll for a bare `validateFields()` — validating is not submitting', async () => {
    let form!: FormInstance;
    render(<TestForm formRef={(f) => (form = f)} scrollToFirstError />);

    await act(async () => {
      await form.validateFields().catch(() => undefined);
    });

    expect(scrollIntoView).not.toHaveBeenCalled();
  });

  it('stays off when the form does not ask — antd’s default', async () => {
    let form!: FormInstance;
    render(<TestForm formRef={(f) => (form = f)} />);

    await submit(form);

    expect(scrollIntoView).not.toHaveBeenCalled();
  });

  it('picks the field first in DOM order, not in registration order', async () => {
    let form!: FormInstance;
    render(
      <TestForm formRef={(f) => (form = f)} scrollToFirstError reverseDom />,
    );

    await submit(form);

    // `early` registers first but renders second.
    expect(scrolledField()).toBe('late');
  });

  it('asks for `nearest`, so an already-visible field is left alone', async () => {
    let form!: FormInstance;
    render(<TestForm formRef={(f) => (form = f)} scrollToFirstError />);

    await submit(form);

    expect(scrollIntoView).toHaveBeenCalledWith(
      expect.objectContaining({ block: 'nearest' }),
    );
  });

  it('lets reduced motion outrank a caller-stated behavior', async () => {
    const matchMedia = vi
      .spyOn(globalThis, 'matchMedia')
      .mockReturnValue({ matches: true } as MediaQueryList);
    let form!: FormInstance;
    render(
      <TestForm
        formRef={(f) => (form = f)}
        scrollToFirstError={{ behavior: 'smooth' } as any}
      />,
    );

    await submit(form);

    expect(scrollIntoView).toHaveBeenCalledWith(
      expect.objectContaining({ behavior: 'auto' }),
    );
    matchMedia.mockRestore();
  });

  it('never takes focus out of a control the user is already in', async () => {
    let form!: FormInstance;
    render(<TestForm formRef={(f) => (form = f)} scrollToFirstError />);
    // A radio group revalidates on every arrow key; an edit in progress may
    // hold an IME composition. Neither may lose focus to another field.
    const inUse = controlOf('late');
    inUse.focus();

    await submit(form);

    expect(scrolledField()).toBe('early');
    expect(document.activeElement).toBe(inUse);
  });

  it('still focuses when a layout-only item wraps the submit button', async () => {
    let form!: FormInstance;
    render(<FormWithButton formRef={(f) => (form = f)} />);
    document.getElementById('submit')!.focus();

    await submit(form);

    expect(document.activeElement).toBe(controlOf('early'));
  });

  it('does not scroll when the submit succeeds', async () => {
    let form!: FormInstance;
    render(<TestForm formRef={(f) => (form = f)} scrollToFirstError />);
    act(() => form.setFieldsValue({ early: 'a', late: 'b' }));

    await submit(form);

    expect(scrollIntoView).not.toHaveBeenCalled();
  });
});
