/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 FR-3683 — a failed SUBMIT must land the user on the first invalid field.

 What is pinned here:
   - `form.submit()` scrolls and focuses; a bare `validateFields()` never does
     (validating is not submitting);
   - the field is found through `data-bai-field-id`, not the control's `id` —
     the test control drops its `id`, as Astryx inputs do;
   - a `noStyle` field, which has no wrapper of its own, lands on the parent
     item that shows its error;
   - "first" is DOM order, not field REGISTRATION order;
   - the switch is off until `<Form scrollToFirstError>` says otherwise;
   - the store's own `scrollToField` works again on such controls;
   - the lookup is scoped by the form's token, not by its element, and the
     handle is the JSON path, so neither a sibling form nor a look-alike
     name is mistaken for the field.
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

/** The element that was scrolled. */
function scrolled(): HTMLElement | undefined {
  return scrollIntoView.mock.instances[0] as HTMLElement | undefined;
}

/** The handle `FormItem` stamps: the JSON name path. */
function handleOf(...name: (string | number)[]): string {
  return JSON.stringify(name);
}

/** The item the resolver scrolled, named by the first field it wraps. */
function scrolledField(): string | undefined {
  const handle = scrolled()
    ?.querySelector('[data-bai-field-id]')
    ?.getAttribute('data-bai-field-id');
  return handle ? JSON.parse(handle).join('.') : undefined;
}

function controlsOf(...name: (string | number)[]): HTMLInputElement[] {
  return Array.from(
    document.querySelectorAll<HTMLInputElement>(
      `[data-bai-field-id='${handleOf(...name)}']`,
    ),
  );
}

function controlOf(...name: (string | number)[]): HTMLInputElement {
  return controlsOf(...name)[0];
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

/** A `noStyle` field inside a layout item — the shape that has no wrapper. */
const FormWithNoStyle: React.FC<Pick<Props, 'formRef'>> = ({ formRef }) => {
  const [form] = Form.useForm();
  formRef(form);

  return (
    <Form form={form} scrollToFirstError>
      <Form.Item label="Group">
        <Form.Item noStyle name="inner" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
      </Form.Item>
    </Form>
  );
};

/** Like Astryx Switch / SegmentedControl: `rest` lands on a wrapper div. */
const WrapperInput: React.FC<any> = ({
  value = '',
  onChange,
  id: _ignored,
  ...rest
}) => (
  <div {...rest}>
    <input value={value} onChange={onChange} />
  </div>
);

const FormWithWrapperControl: React.FC<Pick<Props, 'formRef'>> = ({
  formRef,
}) => {
  const [form] = Form.useForm();
  formRef(form);

  return (
    <Form form={form} scrollToFirstError>
      <Form.Item name="early" label="Early" rules={[{ required: true }]}>
        <WrapperInput />
      </Form.Item>
    </Form>
  );
};

/** A named form: the DOM id gets the `name` prefix, the handle must not. */
const NamedForm: React.FC<Pick<Props, 'formRef'>> = ({ formRef }) => {
  const [form] = Form.useForm();
  formRef(form);

  return (
    <Form form={form} name="signup" scrollToFirstError>
      <Form.Item name="early" label="Early" rules={[{ required: true }]}>
        <Input />
      </Form.Item>
    </Form>
  );
};

/** A child that forwards nothing to the DOM — Astryx RadioList's shape. */
const OpaqueInput: React.FC<any> = ({ value = '', onChange }) => (
  <input value={value} onChange={onChange} />
);

const FormWithOpaqueControl: React.FC<Pick<Props, 'formRef'>> = ({
  formRef,
}) => {
  const [form] = Form.useForm();
  formRef(form);

  return (
    <Form form={form} scrollToFirstError>
      <Form.Item name="early" label="Early" rules={[{ required: true }]}>
        <OpaqueInput />
      </Form.Item>
    </Form>
  );
};

/** A first field hidden the way a wizard hides an inactive step. */
const FormWithHiddenFirst: React.FC<Pick<Props, 'formRef'>> = ({ formRef }) => {
  const [form] = Form.useForm();
  formRef(form);

  return (
    <Form form={form} scrollToFirstError>
      <Form.Item hidden name="early" label="Early" rules={[{ required: true }]}>
        <Input />
      </Form.Item>
      <Form.Item name="late" label="Late" rules={[{ required: true }]}>
        <Input />
      </Form.Item>
    </Form>
  );
};

/** A segmented-control shape: handle on the group, first segment tabindex=-1. */
const SegmentedLike: React.FC<any> = ({
  value = '',
  onChange,
  id: _ignored,
  ...rest
}) => (
  <div role="radiogroup" {...rest}>
    <button type="button" role="radio" tabIndex={-1} id="seg-a">
      A
    </button>
    <button type="button" role="radio" tabIndex={0} id="seg-b">
      B
    </button>
    <input type="hidden" value={value} onChange={onChange} />
  </div>
);

const FormWithSegmented: React.FC<Pick<Props, 'formRef'>> = ({ formRef }) => {
  const [form] = Form.useForm();
  formRef(form);

  return (
    <Form form={form} scrollToFirstError>
      <Form.Item name="early" label="Early" rules={[{ required: true }]}>
        <SegmentedLike />
      </Form.Item>
    </Form>
  );
};

/** A form with no element of its own — nothing to scope a lookup by. */
const BareForm: React.FC<Pick<Props, 'formRef'>> = ({ formRef }) => {
  const [form] = Form.useForm();
  formRef(form);

  return (
    <Form form={form} component={false} scrollToFirstError>
      <Form.Item name="early" label="Early" rules={[{ required: true }]}>
        <Input />
      </Form.Item>
    </Form>
  );
};

/** Names whose `_`-joined spelling is the same: `a_b` and `['a', 'b']`. */
const FormWithLookalikeNames: React.FC<Pick<Props, 'formRef'>> = ({
  formRef,
}) => {
  const [form] = Form.useForm();
  formRef(form);

  return (
    <Form form={form} scrollToFirstError initialValues={{ a_b: 'set' }}>
      <Form.Item name="a_b" label="Flat">
        <Input />
      </Form.Item>
      <Form.Item name={['a', 'b']} label="Nested" rules={[{ required: true }]}>
        <Input />
      </Form.Item>
    </Form>
  );
};

/** One name mounted twice, the first hidden — a field repeated across tabs. */
const FormWithTwinFields: React.FC<Pick<Props, 'formRef'>> = ({ formRef }) => {
  const [form] = Form.useForm();
  formRef(form);

  return (
    <Form form={form} scrollToFirstError>
      <Form.Item hidden name="early" label="Early (tab 1)">
        <Input />
      </Form.Item>
      <Form.Item
        name="early"
        label="Early (tab 2)"
        rules={[{ required: true }]}
      >
        <Input />
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

    expect(scrolled()?.matches('[data-bai-form-item]')).toBe(true);
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

  it('reaches a `noStyle` field through the parent item that shows its error', async () => {
    let form!: FormInstance;
    render(<FormWithNoStyle formRef={(f) => (form = f)} />);

    await submit(form);

    expect(scrolled()?.matches('[data-bai-form-item]')).toBe(true);
    expect(scrolled()?.textContent).toContain('Group');
    expect(document.activeElement).toBe(controlOf('inner'));
  });

  it('asks for `nearest`, so an already-visible field is left alone', async () => {
    let form!: FormInstance;
    render(<TestForm formRef={(f) => (form = f)} scrollToFirstError />);

    await submit(form);

    expect(scrollIntoView).toHaveBeenCalledWith(
      expect.objectContaining({ block: 'nearest' }),
    );
  });

  it('leaves focus alone when the form says `focus: false`', async () => {
    let form!: FormInstance;
    render(
      <TestForm
        formRef={(f) => (form = f)}
        scrollToFirstError={{ focus: false } as any}
      />,
    );
    const before = document.activeElement;

    await submit(form);

    expect(scrolledField()).toBe('early');
    expect(document.activeElement).toBe(before);
  });

  it('focuses the control inside a wrapper that carries the handle', async () => {
    let form!: FormInstance;
    render(<FormWithWrapperControl formRef={(f) => (form = f)} />);

    await submit(form);

    expect(scrolledField()).toBe('early');
    expect(document.activeElement).toBe(
      controlOf('early').querySelector('input'),
    );
  });

  it('finds the field in a named form, whose DOM id is prefixed', async () => {
    let form!: FormInstance;
    render(<NamedForm formRef={(f) => (form = f)} />);

    await submit(form);

    expect(scrolledField()).toBe('early');
    expect(document.activeElement).toBe(controlOf('early'));
  });

  it('falls back to the item wrapper for a child that forwards nothing', async () => {
    let form!: FormInstance;
    render(<FormWithOpaqueControl formRef={(f) => (form = f)} />);
    expect(document.querySelector('[data-bai-field-id]')).toBeNull();

    await submit(form);

    expect(scrolled()?.matches('[data-bai-form-item]')).toBe(true);
    expect(scrolled()?.getAttribute('data-bai-field-item')).toBe(
      handleOf('early'),
    );
    expect(document.activeElement).toBe(scrolled()?.querySelector('input'));
  });

  it('stays inside its own form when another mounted form shares the name', async () => {
    let other!: FormInstance;
    let form!: FormInstance;
    render(
      <>
        <TestForm formRef={(f) => (other = f)} />
        <TestForm formRef={(f) => (form = f)} scrollToFirstError />
      </>,
    );
    void other;
    const mine = controlsOf('early')[1];

    await submit(form);

    expect(scrolled()?.contains(mine)).toBe(true);
    expect(document.activeElement).toBe(mine);
  });

  it('does not let a hidden field win over a visible one', async () => {
    let form!: FormInstance;
    render(<FormWithHiddenFirst formRef={(f) => (form = f)} />);

    await submit(form);

    expect(scrolledField()).toBe('late');
  });

  it('does not focus a tabindex=-1 segment when the handle is on the group', async () => {
    let form!: FormInstance;
    render(<FormWithSegmented formRef={(f) => (form = f)} />);

    await submit(form);

    expect(scrolledField()).toBe('early');
    expect((document.activeElement as HTMLElement)?.id).toBe('seg-b');
  });

  it('stays inside its own form even when it has no element (`component={false}`)', async () => {
    let other!: FormInstance;
    let form!: FormInstance;
    render(
      <>
        <TestForm formRef={(f) => (other = f)} />
        <BareForm formRef={(f) => (form = f)} />
      </>,
    );
    void other;
    const mine = controlsOf('early')[1];

    await submit(form);

    expect(scrolled()?.contains(mine)).toBe(true);
    expect(document.activeElement).toBe(mine);
  });

  it('does not confuse `a_b` with `["a", "b"]`', async () => {
    let form!: FormInstance;
    render(<FormWithLookalikeNames formRef={(f) => (form = f)} />);

    await submit(form);

    expect(scrolledField()).toBe('a.b');
    expect(document.activeElement).toBe(controlOf('a', 'b'));
    expect(document.activeElement).not.toBe(controlOf('a_b'));
  });

  it('resolves a name mounted twice to the visible one', async () => {
    let form!: FormInstance;
    render(<FormWithTwinFields formRef={(f) => (form = f)} />);
    const visible = controlsOf('early')[1];

    act(() => form.scrollToField('early', { focus: true }));

    expect(scrolled()?.contains(visible)).toBe(true);
    expect(document.activeElement).toBe(visible);
  });

  it('does not scroll when the submit succeeds', async () => {
    let form!: FormInstance;
    render(<TestForm formRef={(f) => (form = f)} scrollToFirstError />);
    act(() => form.setFieldsValue({ early: 'a', late: 'b' }));

    await submit(form);

    expect(scrollIntoView).not.toHaveBeenCalled();
  });

  it('lets the store’s `scrollToField` find an id-dropping control too', async () => {
    let form!: FormInstance;
    render(<TestForm formRef={(f) => (form = f)} />);

    act(() => form.scrollToField('late', { focus: true }));

    expect(scrolledField()).toBe('late');
    expect(document.activeElement).toBe(controlOf('late'));
  });
});
