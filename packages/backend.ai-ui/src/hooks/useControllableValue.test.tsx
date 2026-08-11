import useControllableValue from './useControllableValue';
import { renderHook, act } from '@testing-library/react';

describe('useControllableValue', () => {
  describe('uncontrolled mode', () => {
    it('falls back to options.defaultValue when neither prop is present', () => {
      const { result } = renderHook(() =>
        useControllableValue<number>({}, { defaultValue: 7 }),
      );
      expect(result.current[0]).toBe(7);
    });

    it('prefers props.defaultValue over options.defaultValue', () => {
      const { result } = renderHook(() =>
        useControllableValue<number>({ defaultValue: 1 }, { defaultValue: 7 }),
      );
      expect(result.current[0]).toBe(1);
    });

    it('honours a custom defaultValuePropName', () => {
      const { result } = renderHook(() =>
        useControllableValue<boolean>(
          { defaultOpen: true },
          { valuePropName: 'open', defaultValuePropName: 'defaultOpen' },
        ),
      );
      expect(result.current[0]).toBe(true);
    });

    it('updates internal state and still fires the trigger', () => {
      const onChange = vi.fn();
      const { result } = renderHook(() =>
        useControllableValue<number>({ onChange }, { defaultValue: 0 }),
      );

      act(() => result.current[1](3));

      expect(result.current[0]).toBe(3);
      expect(onChange).toHaveBeenCalledWith(3);
    });

    it('accepts an updater function', () => {
      const { result } = renderHook(() =>
        useControllableValue<number>({}, { defaultValue: 10 }),
      );

      act(() => result.current[1]((prev) => prev + 5));

      expect(result.current[0]).toBe(15);
    });

    it('ignores later changes to options.defaultValue', () => {
      const { result, rerender } = renderHook(
        ({ d }) => useControllableValue<number>({}, { defaultValue: d }),
        { initialProps: { d: 1 } },
      );
      rerender({ d: 99 });
      expect(result.current[0]).toBe(1);
    });
  });

  describe('controlled mode', () => {
    it('is decided by key presence, not by the value being defined', () => {
      const onChange = vi.fn();
      const { result } = renderHook(() =>
        useControllableValue<number | undefined>(
          { value: undefined, onChange },
          { defaultValue: 42 },
        ),
      );

      // `value` is present ⇒ controlled ⇒ options.defaultValue is ignored.
      expect(result.current[0]).toBeUndefined();

      act(() => result.current[1](1));
      expect(onChange).toHaveBeenCalledWith(1);
      // Parent owns the value: no internal write happened.
      expect(result.current[0]).toBeUndefined();
    });

    it('tracks the prop across re-renders', () => {
      const { result, rerender } = renderHook(
        ({ value }) => useControllableValue<string>({ value }),
        { initialProps: { value: 'a' } },
      );
      expect(result.current[0]).toBe('a');
      rerender({ value: 'b' });
      expect(result.current[0]).toBe('b');
    });

    it('passes the previous value to an updater function', () => {
      const onChange = vi.fn();
      const { result } = renderHook(() =>
        useControllableValue<number>({ value: 4, onChange }),
      );
      act(() => result.current[1]((prev) => prev * 2));
      expect(onChange).toHaveBeenCalledWith(8);
    });
  });

  describe('trigger', () => {
    it('uses the configured trigger prop name', () => {
      const onOpenChange = vi.fn();
      const { result } = renderHook(() =>
        useControllableValue<boolean>(
          { onOpenChange },
          {
            valuePropName: 'open',
            trigger: 'onOpenChange',
            defaultValue: false,
          },
        ),
      );
      act(() => result.current[1](true));
      expect(onOpenChange).toHaveBeenCalledWith(true);
    });

    it('is a no-op when the trigger prop does not exist (the "no-trigger" idiom)', () => {
      const { result } = renderHook(() =>
        useControllableValue<number>(
          {},
          { valuePropName: 'current', defaultValue: 1, trigger: 'no-trigger' },
        ),
      );
      expect(() => act(() => result.current[1](2))).not.toThrow();
      expect(result.current[0]).toBe(2);
    });

    it('forwards extra arguments verbatim', () => {
      const onChange = vi.fn();
      const { result } = renderHook(() =>
        useControllableValue<string>({ onChange }, { defaultValue: '' }),
      );
      act(() => result.current[1]('x', { option: 1 }, 'third'));
      expect(onChange).toHaveBeenCalledWith('x', { option: 1 }, 'third');
    });

    it('always calls the latest trigger, not the one from the first render', () => {
      const first = vi.fn();
      const second = vi.fn();
      const { result, rerender } = renderHook(
        ({ onChange }) =>
          useControllableValue<number>({ onChange }, { defaultValue: 0 }),
        { initialProps: { onChange: first } },
      );
      rerender({ onChange: second });
      act(() => result.current[1](1));
      expect(first).not.toHaveBeenCalled();
      expect(second).toHaveBeenCalledWith(1);
    });
  });

  it('keeps a stable setter identity across renders', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useControllableValue<number>({ value }),
      { initialProps: { value: 1 } },
    );
    const setter = result.current[1];
    rerender({ value: 2 });
    expect(result.current[1]).toBe(setter);
  });
});
