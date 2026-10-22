/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { Form, FormItem, type FormInstance } from '../../../form-engine';
import {
  LauncherModelError,
  transition,
  type LauncherEvent,
  type LauncherInputs,
} from '../model';
import {
  CPU,
  loading,
  ready,
  syntheticModel,
} from '../model/testing/syntheticModel';
import { useFormBoundSlice } from './useFormBoundSlice';
import { act, render } from '@testing-library/react';
import { useEffect } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../model', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../model')>();
  return { ...actual, transition: vi.fn(actual.transition) };
});

const INITIAL = {
  size: { cpu: 2, mem: '4g', shmem: '64m' },
  mode: { kind: 'small' },
  untouched: 'kept',
};

type Bound = {
  form: FormInstance;
  dispatch: (event: LauncherEvent) => void;
};
const harness: { current?: Bound } = {};
const bound = () => harness.current as Bound;

const Harness = ({ inputs }: { inputs: LauncherInputs }) => {
  const [form] = Form.useForm();
  const { dispatch } = useFormBoundSlice(form, syntheticModel, inputs);
  useEffect(() => {
    harness.current = { form, dispatch };
  });
  return (
    <Form form={form} initialValues={INITIAL}>
      <FormItem name={CPU}>
        <input aria-label="cpu" />
      </FormItem>
    </Form>
  );
};

const dataArrivedCalls = () =>
  vi
    .mocked(transition)
    .mock.calls.filter(([, , event]) => event.type === 'dataArrived')
    .map(([, , event]) => event);

beforeEach(() => {
  vi.mocked(transition).mockClear();
});

describe('useFormBoundSlice', () => {
  it('replays each applied patch with its recorded method, then validates', () => {
    render(<Harness inputs={{ limits: ready({ maxCpu: 8 }) }} />);
    const setFieldValue = vi.spyOn(bound().form, 'setFieldValue');
    const setFieldsValue = vi.spyOn(bound().form, 'setFieldsValue');
    const validateFields = vi.spyOn(bound().form, 'validateFields');

    act(() => bound().dispatch({ type: 'cpuEdited', payload: 12 }));

    // The intent writes 12 with setFieldsValue, then S-01 caps it with setFieldValue.
    expect(setFieldsValue).toHaveBeenCalledWith({ size: { cpu: 12 } });
    expect(setFieldValue).toHaveBeenCalledWith(CPU, 8);
    expect(validateFields).toHaveBeenCalledWith([CPU]);
    expect(validateFields).toHaveBeenCalledTimes(1);
    expect(bound().form.getFieldsValue(true)).toEqual({
      ...INITIAL,
      size: { ...INITIAL.size, cpu: 8 },
    });
  });

  it('does not write when every patch is a no-op', () => {
    render(<Harness inputs={{ limits: ready({ maxCpu: 8 }) }} />);
    const setFieldsValue = vi.spyOn(bound().form, 'setFieldsValue');
    const setFieldValue = vi.spyOn(bound().form, 'setFieldValue');

    act(() => bound().dispatch({ type: 'cpuEdited', payload: 2 }));

    expect(setFieldsValue).not.toHaveBeenCalled();
    expect(setFieldValue).not.toHaveBeenCalled();
  });

  it('dispatches dataArrived on loading → ready and on a new ready value', () => {
    const limits = { maxCpu: 8 };
    const view = render(<Harness inputs={{ limits: loading }} />);
    expect(dataArrivedCalls()).toEqual([]);

    view.rerender(<Harness inputs={{ limits: ready(limits) }} />);
    expect(dataArrivedCalls()).toEqual([
      { type: 'dataArrived', keys: ['limits'] },
    ]);

    // A fresh Loadable around the same value is identity churn.
    view.rerender(<Harness inputs={{ limits: ready(limits) }} />);
    expect(dataArrivedCalls()).toHaveLength(1);

    // A refetch hands a new value reference.
    view.rerender(<Harness inputs={{ limits: ready({ maxCpu: 8 }) }} />);
    expect(dataArrivedCalls()).toHaveLength(2);

    view.rerender(<Harness inputs={{ limits: loading }} />);
    expect(dataArrivedCalls()).toHaveLength(2);
    view.rerender(<Harness inputs={{ limits: ready({ maxCpu: 4 }) }} />);
    expect(dataArrivedCalls()).toHaveLength(3);
  });

  it('throws LauncherModelError at mount when a required input is missing', () => {
    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});
    expect(() => render(<Harness inputs={{}} />)).toThrow(LauncherModelError);
    consoleError.mockRestore();
  });
});
