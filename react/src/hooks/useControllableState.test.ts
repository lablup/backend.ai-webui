import useControllableState_deprecated, {
  Options,
  Props,
} from './useControllableState';
import { renderHook } from '@testing-library/react';
import { act } from 'react';

describe('useControllableState', () => {
  const setUp = (props?: Props, options?: Options<any>): any =>
    renderHook(() => useControllableState_deprecated(props, options));

  it('defaultValue should work', () => {
    const hook = setUp({ defaultValue: 1 });
    expect(hook.result.current[0]).toBe(1);
  });

  it('value should work', () => {
    const hook = setUp({ defaultValue: 1, value: 2 });
    expect(hook.result.current[0]).toBe(2);
  });

  it('state should be undefined', () => {
    const hook = setUp();
    expect(hook.result.current[0]).toBeUndefined();
  });

  it('onChange should work', () => {
    let extraParam: string = '';
    const props = {
      value: 2,
      onChange(v: any, extra: any) {
        this.value = v;
        extraParam = extra;
      },
    };
    const hook = setUp(props);
    expect(hook.result.current[0]).toBe(2);
    act(() => {
      hook.result.current[1](3, 'extraParam');
    });
    expect(props.value).toBe(3);
    expect(extraParam).toBe('extraParam');
  });

  it('test on state update', () => {
    const props: any = {
      value: 1,
    };
    const { result, rerender } = setUp(props);
    props.value = 2;
    rerender(props);
    expect(result.current[0]).toBe(2);
    props.value = 3;
    rerender(props);
    expect(result.current[0]).toBe(3);
  });

  it('test set state', async () => {
    const { result } = setUp({
      newValue: 1,
    });
    const [, setValue] = result.current;
    act(() => setValue(undefined));
    expect(result.current[0]).toBeUndefined();

    act(() => setValue(null));
    expect(result.current[0]).toBeNull();

    act(() => setValue(55));
    expect(result.current[0]).toBe(55);

    act(() => setValue((prevState: number) => prevState + 1));
    expect(result.current[0]).toBe(56);
  });

  it('type inference should work', async () => {
    type Value = {
      foo: number;
    };
    const props: {
      value: Value;
      defaultValue: Value;
      onChange: (val: Value) => void;
    } = {
      value: {
        foo: 123,
      },
      defaultValue: {
        foo: 123,
      },
      onChange: () => {},
    };
    const hook = renderHook(() => useControllableState_deprecated(props));
    const [v] = hook.result.current;
    expect(v.foo).toBe(123);
  });

  it('test valuePropName of options', () => {
    const props: any = {
      value: 1,
    };
    const options = {
      valuePropName: 'testValue',
    };
    const { result, rerender } = setUp(props, options);
    expect(result.current[0]).toBe(undefined);

    props.testValue = 2;
    rerender(props);
    expect(result.current[0]).toBe(2);
  });

  it('test defaultValuePropName of options', () => {
    const props: any = {
      defaultValue: 1,
    };
    const options = {
      defaultValuePropName: 'defaultValueProp',
    };
    const { result: undefinedResult } = setUp(props, options);
    expect(undefinedResult.current[0]).toBe(undefined);

    props.defaultValueProp = 2;
    const { result: defaultValueResult } = setUp(props, options);
    expect(defaultValueResult.current[0]).toBe(2);
  });

  it('test trigger of options', () => {
    const trigger = jest.fn();
    const props: any = {
      value: 3,
      onChange: trigger,
    };
    const options: any = {
      trigger: 'trigger',
    };
    const { result, rerender } = setUp(props, options);
    const [value, setValue] = result.current;
    expect(value).toBe(3);
    act(() => setValue());
    expect(trigger).not.toHaveBeenCalled();

    props.trigger = trigger;
    rerender(props);
    act(() => setValue('c'));
    expect(trigger).toHaveBeenCalled();
  });

  it('defaultValue should be applied when value is undefined', () => {
    const { result } = setUp({ value: undefined, defaultValue: 1 });
    expect(result.current[0]).toBe(1);
  });
});
