import BAIWebMCPProvider from '../BAIWebMCPProvider';
import type { WebMCPTool, WebMCPToolDescriptor } from '../types';
import useWebMCPTool, { type WebMCPToolDep } from './useWebMCPTool';
import { renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const registerTool =
  vi.fn<
    (tool: WebMCPToolDescriptor, options: { signal: AbortSignal }) => void
  >();
const modelContextGetter = vi.fn(() => ({ registerTool }));

const installModelContext = (present: boolean) => {
  Object.defineProperty(document, 'modelContext', {
    configurable: true,
    get: present ? modelContextGetter : () => undefined,
  });
};

const makeTool = (overrides: Partial<WebMCPTool> = {}): WebMCPTool => ({
  name: 'bai_test',
  description: 'test tool',
  inputSchema: {
    type: 'object',
    properties: { count: { type: 'integer', minimum: 0 } },
    additionalProperties: false,
  },
  annotations: { readOnlyHint: true },
  execute: (input) => ({ echoed: input }),
  ...overrides,
});

const gate = (enabled: boolean) => {
  const Gate = ({ children }: { children: ReactNode }) => (
    <BAIWebMCPProvider enabled={enabled}>{children}</BAIWebMCPProvider>
  );
  return Gate;
};

const signalOf = (call: number) => registerTool.mock.calls[call][1].signal;
const descriptorOf = (call: number) => registerTool.mock.calls[call][0];

beforeEach(() => {
  vi.clearAllMocks();
  installModelContext(true);
});

afterEach(() => {
  delete (document as { modelContext?: unknown }).modelContext;
});

describe('useWebMCPTool', () => {
  it('never touches document.modelContext when the gate is off', () => {
    renderHook(() => useWebMCPTool(makeTool()), { wrapper: gate(false) });

    expect(modelContextGetter).not.toHaveBeenCalled();
    expect(registerTool).not.toHaveBeenCalled();
  });

  it('is off without a provider', () => {
    renderHook(() => useWebMCPTool(makeTool()));

    expect(modelContextGetter).not.toHaveBeenCalled();
  });

  it('is a no-op when the browser has no document.modelContext', () => {
    installModelContext(false);

    const { unmount } = renderHook(() => useWebMCPTool(makeTool()), {
      wrapper: gate(true),
    });

    expect(registerTool).not.toHaveBeenCalled();
    expect(() => unmount()).not.toThrow();
  });

  it('registers the tool with its definition and a live signal', () => {
    renderHook(() => useWebMCPTool(makeTool()), { wrapper: gate(true) });

    expect(registerTool).toHaveBeenCalledTimes(1);
    expect(descriptorOf(0)).toMatchObject({
      name: 'bai_test',
      description: 'test tool',
      annotations: { readOnlyHint: true },
    });
    expect(signalOf(0).aborted).toBe(false);
  });

  it('aborts the registration on unmount', () => {
    const { unmount } = renderHook(() => useWebMCPTool(makeTool()), {
      wrapper: gate(true),
    });

    unmount();

    expect(signalOf(0).aborted).toBe(true);
  });

  it('re-registers when deps change and aborts the previous registration', () => {
    const { rerender } = renderHook(
      ({ dep }: { dep: WebMCPToolDep }) => useWebMCPTool(makeTool(), [dep]),
      { wrapper: gate(true), initialProps: { dep: 'a' as WebMCPToolDep } },
    );

    rerender({ dep: 'a' });
    expect(registerTool).toHaveBeenCalledTimes(1);

    rerender({ dep: 'b' });
    expect(registerTool).toHaveBeenCalledTimes(2);
    expect(signalOf(0).aborted).toBe(true);
    expect(signalOf(1).aborted).toBe(false);
  });

  it('re-registers when the definition changes, not when only execute does', () => {
    const { rerender } = renderHook(
      ({ description, value }: { description: string; value: number }) =>
        useWebMCPTool(makeTool({ description, execute: () => value })),
      { wrapper: gate(true), initialProps: { description: 'one', value: 1 } },
    );

    rerender({ description: 'one', value: 2 });
    expect(registerTool).toHaveBeenCalledTimes(1);

    rerender({ description: 'two', value: 2 });
    expect(registerTool).toHaveBeenCalledTimes(2);
    expect(signalOf(0).aborted).toBe(true);
  });

  it('registers nothing for null and registers once the tool appears', () => {
    const { rerender } = renderHook(
      ({ ready }: { ready: boolean }) =>
        useWebMCPTool(ready ? makeTool() : null),
      { wrapper: gate(true), initialProps: { ready: false } },
    );
    expect(registerTool).not.toHaveBeenCalled();

    rerender({ ready: true });
    expect(registerTool).toHaveBeenCalledTimes(1);
  });

  it('unregisters when the gate turns off', () => {
    let enabled = true;
    const Wrapper = ({ children }: { children: ReactNode }) => (
      <BAIWebMCPProvider enabled={enabled}>{children}</BAIWebMCPProvider>
    );
    const { rerender } = renderHook(() => useWebMCPTool(makeTool()), {
      wrapper: Wrapper,
    });

    enabled = false;
    rerender();

    expect(signalOf(0).aborted).toBe(true);
  });

  it('validates input before execute and returns a structured error', async () => {
    const execute = vi.fn(() => 'ran');
    renderHook(() => useWebMCPTool(makeTool({ execute })), {
      wrapper: gate(true),
    });

    await expect(descriptorOf(0).execute({ count: 'x' })).resolves.toEqual({
      error: {
        code: 'invalid_input',
        message: '"count" must be an integer',
        issues: [{ path: 'count', message: 'must be an integer' }],
      },
    });
    expect(execute).not.toHaveBeenCalled();

    await expect(descriptorOf(0).execute({ count: 3 })).resolves.toBe('ran');
    expect(execute).toHaveBeenCalledWith({ count: 3 });
  });

  it('turns a thrown error into a structured error', async () => {
    renderHook(
      () =>
        useWebMCPTool(
          makeTool({
            execute: () => {
              throw new Error('boom');
            },
          }),
        ),
      { wrapper: gate(true) },
    );

    await expect(descriptorOf(0).execute({})).resolves.toEqual({
      error: { code: 'execution_failed', message: 'boom' },
    });
  });

  it('runs execute against the latest render', async () => {
    const { rerender } = renderHook(
      ({ value }: { value: number }) =>
        useWebMCPTool(makeTool({ execute: () => value })),
      { wrapper: gate(true), initialProps: { value: 1 } },
    );

    rerender({ value: 2 });

    await expect(descriptorOf(0).execute({})).resolves.toBe(2);
  });
});
