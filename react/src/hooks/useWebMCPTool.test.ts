/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
/**
 * FR-3764: `useWebMCPTool` registers through `document.modelContext` and
 * unregisters by aborting the registration signal.
 */
import { getModelContext, isWebMCPEnabled } from '../helper/webmcp';
import { useWebMCPTool, type WebMCPTool } from './useWebMCPTool';
import type { ModelContext } from '@mcp-b/webmcp-types';
import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../helper/webmcp', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../helper/webmcp')>();
  return {
    ...actual,
    isWebMCPEnabled: vi.fn(() => true),
    getModelContext: vi.fn(),
  };
});

const mockIsWebMCPEnabled = vi.mocked(isWebMCPEnabled);
const mockGetModelContext = vi.mocked(getModelContext);

const registerTool =
  vi.fn<
    (tool: WebMCPTool, options: { signal: AbortSignal }) => Promise<void>
  >();
const modelContext = { registerTool } as unknown as ModelContext;

const tool = (name = 'bai_test'): WebMCPTool => ({
  name,
  description: 'test tool',
  inputSchema: { type: 'object', properties: {} },
  execute: () => ({ content: [{ type: 'text', text: 'ok' }] }),
});

/** The `AbortSignal` the nth `registerTool` call was given. */
const signalOfCall = (index: number): AbortSignal =>
  registerTool.mock.calls[index][1].signal;

beforeEach(() => {
  vi.clearAllMocks();
  mockIsWebMCPEnabled.mockReturnValue(true);
  mockGetModelContext.mockReturnValue(modelContext);
});

describe('useWebMCPTool', () => {
  it('registers the tool with an abort signal while mounted', () => {
    renderHook(() => useWebMCPTool(tool(), []));

    expect(registerTool).toHaveBeenCalledTimes(1);
    expect(registerTool.mock.calls[0][0]).toMatchObject({ name: 'bai_test' });
    expect(signalOfCall(0).aborted).toBe(false);
  });

  it('re-registers when deps change, aborting the previous registration', () => {
    const { rerender } = renderHook(
      ({ dep }: { dep: number }) => useWebMCPTool(tool(), [dep]),
      { initialProps: { dep: 1 } },
    );

    rerender({ dep: 1 });
    expect(registerTool).toHaveBeenCalledTimes(1);

    rerender({ dep: 2 });
    expect(registerTool).toHaveBeenCalledTimes(2);
    expect(signalOfCall(0).aborted).toBe(true);
    expect(signalOfCall(1).aborted).toBe(false);
  });

  it('aborts the registration on unmount', () => {
    const { unmount } = renderHook(() => useWebMCPTool(tool(), []));

    unmount();

    expect(signalOfCall(0).aborted).toBe(true);
  });

  it('registers nothing when the tool is null, and picks it up when it appears', () => {
    const { rerender } = renderHook(
      ({ ready }: { ready: boolean }) =>
        useWebMCPTool(ready ? tool() : null, []),
      { initialProps: { ready: false } },
    );

    expect(registerTool).not.toHaveBeenCalled();

    rerender({ ready: true });
    expect(registerTool).toHaveBeenCalledTimes(1);
  });

  it('does not touch document.modelContext when the flag is off', () => {
    mockIsWebMCPEnabled.mockReturnValue(false);

    renderHook(() => useWebMCPTool(tool(), []));

    expect(mockGetModelContext).not.toHaveBeenCalled();
    expect(registerTool).not.toHaveBeenCalled();
  });

  it('is a no-op when the polyfill did not install document.modelContext', () => {
    mockGetModelContext.mockReturnValue(undefined);

    const { unmount } = renderHook(() => useWebMCPTool(tool(), []));

    expect(registerTool).not.toHaveBeenCalled();
    expect(() => unmount()).not.toThrow();
  });
});
