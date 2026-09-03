/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 FR-3683 — a failed SUBMIT must land the user on the first invalid field.

 What is pinned here:
   - `form.submit()` scrolls and focuses; a bare `validateFields()` never does
     (validating is not submitting);
   - "first" is DOM order, not field REGISTRATION order, and skips a field
     hidden inside an inactive wizard step;
   - the switch is off until `<Form scrollToFirstError>` says otherwise;
   - the scroll never yanks the viewport or the focus around a user who is
     mid-edit.
 */
import { Form } from './engine';
import type { FormInstance } from './interface';
import { act, render } from '@testing-library/react';
import * as React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const Input: React.FC<any> = ({ value = '', onChange, ...rest }) => (
  <input value={value} onChange={onChange} {...rest} />
);

const scrollIntoView = vi.fn();

/** The scrolled item's field, read off the control it wraps. */
function scrolledField(): string | undefined {
  const node = scrollIntoView.mock.instances[0] as HTMLElement | undefined;
  return node?.querySelector('input')?.id;
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
  /** Mounts `early` inside a `display: none` box, as a wizard step would. */
  hideFirst?: boolean;
}

const TestForm: React.FC<Props> = ({
  formRef,
  scrollToFirstError,
  reverseDom,
  hideFirst,
}) => {
  const [form] = Form.useForm();
  formRef(form);

  const earlyItem = (
    <Form.Item name="early" label="Early" rules={[{ required: true }]}>
      <Input />
    </Form.Item>
  );
  const early = hideFirst ? (
    <div key="early" style={{ display: 'none' }}>
      {earlyItem}
    </div>
  ) : (
    <React.Fragment key="early">{earlyItem}</React.Fragment>
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

/** Submit, let validation reject, then flush the frame the scroll waits for. */
async function submit(form: FormInstance) {
  await act(async () => {
    form.submit();
  });
  await act(async () => {
    await new Promise((resolve) => requestAnimationFrame(() => resolve(null)));
  });
}

describe('scroll to the first invalid field', () => {
  it('scrolls and focuses on a failed submit', async () => {
    let form!: FormInstance;
    render(<TestForm formRef={(f) => (form = f)} scrollToFirstError />);

    await submit(form);

    expect(scrollIntoView).toHaveBeenCalled();
    expect(scrolledField()).toBe('early');
    expect((document.activeElement as HTMLElement)?.id).toBe('early');
  });

  it('does not scroll for a bare `validateFields()` — validating is not submitting', async () => {
    let form!: FormInstance;
    render(<TestForm formRef={(f) => (form = f)} scrollToFirstError />);

    await act(async () => {
      await form.validateFields().catch(() => undefined);
    });
    await act(async () => {
      await new Promise((resolve) =>
        requestAnimationFrame(() => resolve(null)),
      );
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

  it('skips a hidden field — a wizard keeps inactive steps mounted', async () => {
    let form!: FormInstance;
    render(
      <TestForm formRef={(f) => (form = f)} scrollToFirstError hideFirst />,
    );

    await submit(form);

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
    const inUse = document.getElementById('late')!;
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

    expect((document.activeElement as HTMLElement)?.id).toBe('early');
  });

  it('does not scroll when the submit succeeds', async () => {
    let form!: FormInstance;
    render(<TestForm formRef={(f) => (form = f)} scrollToFirstError />);
    act(() => form.setFieldsValue({ early: 'a', late: 'b' }));

    await submit(form);

    expect(scrollIntoView).not.toHaveBeenCalled();
  });
});
