/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { Form } from './index';
import {
  act,
  render,
  renderHook,
  screen,
  waitFor,
} from '@testing-library/react';
import React from 'react';
import { describe, expect, it } from 'vitest';

// `Form.useWatch` compares the incoming value against its state inside a
// `useEffectEvent`. React 19.2 never republished that event inside a memo()
// or forwardRef() fiber, so a change back to a value the watcher had seen was
// dropped (#10705, facebook/react#34818); React 19.3 fixed it. The memo and
// forwardRef cases run the hook in those fibers to keep the path covered.

type FormInstance = ReturnType<typeof Form.useForm>[0];

const Watcher: React.FC<{ form: FormInstance }> = ({ form }) => {
  const value = Form.useWatch(['rg'], { form, preserve: true });
  return <output data-testid="watched">{String(value)}</output>;
};
const MemoWatcher = React.memo(Watcher);
// The hook must run in the forwardRef fiber itself, not in a child.
const ForwardRefWatcher = React.forwardRef<
  HTMLOutputElement,
  { form: FormInstance }
>(function ForwardRefWatcher({ form }, ref) {
  const value = Form.useWatch(['rg'], { form, preserve: true });
  return (
    <output ref={ref} data-testid="watched">
      {String(value)}
    </output>
  );
});

const Harness: React.FC<{
  W: React.ComponentType<{ form: FormInstance }>;
  form: FormInstance;
}> = ({ W, form }) => (
  <Form form={form} initialValues={{ rg: 'a' }}>
    <Form.Item name="rg">
      <input data-testid="rg" />
    </Form.Item>
    <W form={form} />
  </Form>
);

const mount = (W: React.ComponentType<{ form: FormInstance }>) => {
  const { result } = renderHook(() => Form.useForm()[0]);
  render(<Harness W={W} form={result.current} />);
  return result.current;
};

const expectWatched = (value: string) =>
  waitFor(() => expect(screen.getByTestId('watched').textContent).toBe(value));

const roundTrip = async (W: React.ComponentType<{ form: FormInstance }>) => {
  const form = mount(W);
  await expectWatched('a');
  act(() => form.setFieldValue('rg', 'b'));
  await expectWatched('b');
  act(() => form.setFieldValue('rg', 'a'));
  await expectWatched('a');
};

describe('Form.useWatch returning to a value it has seen', () => {
  it('follows a → b → a in a plain function component', () =>
    roundTrip(Watcher));

  it('follows a → b → a inside React.memo', () => roundTrip(MemoWatcher));

  it('follows a → b → a inside forwardRef', () => roundTrip(ForwardRefWatcher));
});
