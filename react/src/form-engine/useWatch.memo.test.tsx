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
// `useEffectEvent`. React 19.2 never republishes that event inside a memo()
// fiber, so a change back to a value the watcher has seen is dropped (#10705).
// On 19.2 the memo case asserts the drop; on a newer React it asserts the
// round trip, which is the signal to retire the memo constraint in
// `.claude/rules/use-effect-event.md` (#10706).
const REACT_HAS_THE_MEMO_TRAP = React.version.startsWith('19.2.');

type FormInstance = ReturnType<typeof Form.useForm>[0];

const Watcher: React.FC<{ form: FormInstance }> = ({ form }) => {
  const value = Form.useWatch(['rg'], { form, preserve: true });
  return <output data-testid="watched">{String(value)}</output>;
};
const MemoWatcher = React.memo(Watcher);

const Harness: React.FC<{ W: typeof Watcher; form: FormInstance }> = ({
  W,
  form,
}) => (
  <Form form={form} initialValues={{ rg: 'a' }}>
    <Form.Item name="rg">
      <input data-testid="rg" />
    </Form.Item>
    <W form={form} />
  </Form>
);

const mount = (W: typeof Watcher) => {
  const { result } = renderHook(() => Form.useForm()[0]);
  render(<Harness W={W} form={result.current} />);
  return result.current;
};

const watched = () => screen.getByTestId('watched').textContent;
const expectWatched = (value: string) =>
  waitFor(() => expect(watched()).toBe(value));

// The watcher center notifies through a MessageChannel task; a drop has no
// event to wait for, so give that task time to run before asserting.
const settle = () =>
  act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 50));
  });

describe('Form.useWatch returning to a value it has seen', () => {
  it('follows a → b → a in a plain function component', async () => {
    const form = mount(Watcher);
    await expectWatched('a');
    act(() => form.setFieldValue('rg', 'b'));
    await expectWatched('b');
    act(() => form.setFieldValue('rg', 'a'));
    await expectWatched('a');
  });

  it(
    REACT_HAS_THE_MEMO_TRAP
      ? 'drops the return to a inside React.memo on React 19.2 (#10705)'
      : 'follows a → b → a inside React.memo (React ≥ 19.3; retire the memo constraint, #10706)',
    async () => {
      const form = mount(MemoWatcher);
      await expectWatched('a');
      act(() => form.setFieldValue('rg', 'b'));
      await expectWatched('b');
      act(() => form.setFieldValue('rg', 'a'));
      if (REACT_HAS_THE_MEMO_TRAP) {
        await settle();
        expect(
          watched(),
          'React 19.2 drops this change; if it now follows, React moved past 19.2 — retire the memo constraint in .claude/rules/use-effect-event.md (#10706)',
        ).toBe('b');
      } else {
        await expectWatched('a');
      }
    },
  );
});
