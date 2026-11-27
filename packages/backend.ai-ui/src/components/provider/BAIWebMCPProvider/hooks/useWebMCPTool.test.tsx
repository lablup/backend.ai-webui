import BAIWebMCPProvider from '../BAIWebMCPProvider';
import type { WebMCPTool, WebMCPToolDescriptor } from '../types';
import useWebMCPTool from './useWebMCPTool';
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

  it('reads the message off a plain-object rejection', async () => {
    renderHook(
      () =>
        useWebMCPTool(
          makeTool({
            execute: () =>
              Promise.reject({ isError: true, message: 'quota exceeded' }),
          }),
        ),
      { wrapper: gate(true) },
    );

    await expect(descriptorOf(0).execute({})).resolves.toEqual({
      error: { code: 'execution_failed', message: 'quota exceeded' },
    });
  });

  it.each([
    ['msg', { msg: 'bad request' }, 'bad request'],
    ['title', { title: 'Forbidden' }, 'Forbidden'],
    ['message before msg', { message: 'first', msg: 'second' }, 'first'],
    ['a string', 'plain text', 'plain text'],
  ])('reads the failure text from %s', async (_label, rejection, message) => {
    renderHook(
      () =>
        useWebMCPTool(makeTool({ execute: () => Promise.reject(rejection) })),
      { wrapper: gate(true) },
    );

    await expect(descriptorOf(0).execute({})).resolves.toEqual({
      error: { code: 'execution_failed', message },
    });
  });

  it.each([
    ['an object without text', { message: undefined, code: 500 }],
    ['undefined', undefined],
    ['a prototype-less object', Object.create(null)],
    [
      'a throwing getter',
      {
        get message() {
          throw new Error('nope');
        },
      },
    ],
  ])('stays structured when rejected with %s', async (_label, rejection) => {
    renderHook(
      () =>
        useWebMCPTool(makeTool({ execute: () => Promise.reject(rejection) })),
      { wrapper: gate(true) },
    );

    const result = (await descriptorOf(0).execute({})) as {
      error: { code: string; message: string };
    };
    expect(result.error.code).toBe('execution_failed');
    expect(result.error.message).toBe('The tool failed without a message.');
  });

  it('reports a result that serializes to undefined as a failure', async () => {
    renderHook(() => useWebMCPTool(makeTool({ execute: () => undefined })), {
      wrapper: gate(true),
    });

    await expect(descriptorOf(0).execute({})).resolves.toMatchObject({
      error: { code: 'execution_failed' },
    });
  });

  it('reports a result that cannot be serialized as a structured error', async () => {
    const cycle: Record<string, unknown> = {};
    cycle.self = cycle;
    renderHook(() => useWebMCPTool(makeTool({ execute: () => cycle })), {
      wrapper: gate(true),
    });

    await expect(descriptorOf(0).execute({})).resolves.toMatchObject({
      error: { code: 'execution_failed' },
    });
  });

  it('reports a validator failure as a structured error', async () => {
    const malformed = {
      type: 'object',
      additionalProperties: false,
    } as unknown as WebMCPTool['inputSchema'];
    renderHook(() => useWebMCPTool(makeTool({ inputSchema: malformed })), {
      wrapper: gate(true),
    });

    await expect(descriptorOf(0).execute({ count: 1 })).resolves.toMatchObject({
      error: { code: 'execution_failed' },
    });
  });

  it('answers tool_unavailable once the component passes null', async () => {
    const { rerender } = renderHook(
      ({ ready }: { ready: boolean }) =>
        useWebMCPTool(ready ? makeTool() : null),
      { wrapper: gate(true), initialProps: { ready: true } },
    );

    rerender({ ready: false });

    await expect(descriptorOf(0).execute({})).resolves.toMatchObject({
      error: { code: 'tool_unavailable' },
    });
  });

  it('answers tool_unavailable after unmount without running the tool', async () => {
    const execute = vi.fn(() => 'ran');
    const { unmount } = renderHook(() => useWebMCPTool(makeTool({ execute })), {
      wrapper: gate(true),
    });

    unmount();

    await expect(descriptorOf(0).execute({})).resolves.toMatchObject({
      error: { code: 'tool_unavailable' },
    });
    expect(execute).not.toHaveBeenCalled();
  });

  it('answers tool_unavailable after the gate turns off', async () => {
    const execute = vi.fn(() => 'ran');
    let enabled = true;
    const Wrapper = ({ children }: { children: ReactNode }) => (
      <BAIWebMCPProvider enabled={enabled}>{children}</BAIWebMCPProvider>
    );
    const { rerender } = renderHook(
      () => useWebMCPTool(makeTool({ execute })),
      { wrapper: Wrapper },
    );

    enabled = false;
    rerender();

    await expect(descriptorOf(0).execute({})).resolves.toMatchObject({
      error: { code: 'tool_unavailable' },
    });
    expect(execute).not.toHaveBeenCalled();
  });

  it('still runs after a re-registration', async () => {
    const { rerender } = renderHook(
      ({ description }: { description: string }) =>
        useWebMCPTool(makeTool({ description, execute: () => 'ran' })),
      { wrapper: gate(true), initialProps: { description: 'one' } },
    );

    rerender({ description: 'two' });

    await expect(descriptorOf(1).execute({})).resolves.toBe('ran');
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
