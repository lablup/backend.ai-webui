/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import {
  createPageToolRegistry,
  waitForTool,
  waitForToolsToSettle,
} from './pageToolRegistry';
import type { WebMCPToolDescriptor } from 'backend.ai-ui';

const descriptor = (
  name: string,
  result: unknown = name,
): WebMCPToolDescriptor => ({
  name,
  description: name,
  inputSchema: { type: 'object', properties: {}, additionalProperties: false },
  execute: async () => result,
});

describe('createPageToolRegistry', () => {
  it('lists a tool until its signal aborts', () => {
    const registry = createPageToolRegistry();
    const controller = new AbortController();
    registry.registerTool(descriptor('bai_a'), { signal: controller.signal });
    expect(registry.list().map((tool) => tool.name)).toEqual(['bai_a']);
    controller.abort();
    expect(registry.list()).toEqual([]);
  });

  it('keeps a newer registration when the older one aborts', () => {
    const registry = createPageToolRegistry();
    const older = new AbortController();
    registry.registerTool(descriptor('bai_a', 1), { signal: older.signal });
    const newer = descriptor('bai_a', 2);
    registry.registerTool(newer, { signal: new AbortController().signal });
    older.abort();
    expect(registry.get('bai_a')).toBe(newer);
  });

  it('ignores a registration whose signal already aborted', () => {
    const registry = createPageToolRegistry();
    const controller = new AbortController();
    controller.abort();
    registry.registerTool(descriptor('bai_a'), { signal: controller.signal });
    expect(registry.list()).toEqual([]);
  });
});

describe('waitForToolsToSettle', () => {
  it('waits until registrations stop for the quiet period', async () => {
    vi.useFakeTimers();
    const registry = createPageToolRegistry();
    let settled = false;
    void waitForToolsToSettle(registry, { quietMs: 100, timeoutMs: 1000 }).then(
      () => (settled = true),
    );
    await vi.advanceTimersByTimeAsync(80);
    registry.registerTool(descriptor('bai_a'));
    await vi.advanceTimersByTimeAsync(80);
    expect(settled).toBe(false);
    await vi.advanceTimersByTimeAsync(40);
    expect(settled).toBe(true);
    vi.useRealTimers();
  });
});

describe('waitForTool', () => {
  it('resolves once the tool registers, or undefined after the timeout', async () => {
    const registry = createPageToolRegistry();
    const pending = waitForTool(registry, 'bai_b', { timeoutMs: 1000 });
    const tool = descriptor('bai_b');
    registry.registerTool(tool);
    await expect(pending).resolves.toBe(tool);
    await expect(
      waitForTool(registry, 'bai_missing', { timeoutMs: 10 }),
    ).resolves.toBeUndefined();
  });
});
