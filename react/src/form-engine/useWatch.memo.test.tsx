/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { Form } from './index';
import { act, render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it } from 'vitest';

// `Form.useWatch` compares the incoming value against its state inside a
// `useEffectEvent`. React 19.2 never republishes that event inside a memo()
// fiber, so a change back to a value the watcher has seen is dropped (#10705).
// The `fails` case documents the trap; once React 19.3 lands (#10706) it starts
// passing, Vitest reports it, and the memo constraint in
// `.claude/rules/use-effect-event.md` can go.

const Watcher: React.FC<{ form: ReturnType<typeof Form.useForm>[0] }> = ({
  form,
}) => {
  const value = Form.useWatch(['rg'], { form, preserve: true });
  return <output data-testid="watched">{String(value)}</output>;
};
const MemoWatcher = React.memo(Watcher);

let formRef: ReturnType<typeof Form.useForm>[0];
const Harness: React.FC<{ W: typeof Watcher }> = ({ W }) => {
  const [form] = Form.useForm();
  React.useEffect(() => {
    formRef = form;
  }, [form]);
  return (
    <Form form={form} initialValues={{ rg: 'a' }}>
      <Form.Item name="rg">
        <input data-testid="rg" />
      </Form.Item>
      <W form={form} />
    </Form>
  );
};

// The watcher center notifies through a MessageChannel task.
const flush = () =>
  act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 20));
  });

const roundTrip = async () => {
  await flush();
  expect(screen.getByTestId('watched').textContent).toBe('a');
  await act(async () => formRef.setFieldValue('rg', 'b'));
  await flush();
  expect(screen.getByTestId('watched').textContent).toBe('b');
  await act(async () => formRef.setFieldValue('rg', 'a'));
  await flush();
  expect(screen.getByTestId('watched').textContent).toBe('a');
};

describe('Form.useWatch returning to a value it has seen', () => {
  it('follows a → b → a in a plain function component', async () => {
    render(<Harness W={Watcher} />);
    await roundTrip();
  });

  it.fails(
    'is dropped inside React.memo on React 19.2 (retire with #10706)',
    async () => {
      render(<Harness W={MemoWatcher} />);
      await roundTrip();
    },
  );
});
