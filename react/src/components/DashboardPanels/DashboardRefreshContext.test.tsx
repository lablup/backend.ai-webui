/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import {
  DashboardRefreshProvider,
  panelRefreshId,
  useBoardItemVisibility,
  useDashboardRefreshScheduler,
} from './DashboardRefreshContext';
import type { RefreshScheduler } from './refreshScheduler';
import { act, render } from '@testing-library/react';
import React, { useRef } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const observed: Array<Element> = [];
let report: (
  entries: Array<Partial<IntersectionObserverEntry>>,
) => void = () => {};

class FakeIntersectionObserver {
  constructor(callback: IntersectionObserverCallback) {
    report = (entries) =>
      callback(
        entries as Array<IntersectionObserverEntry>,
        this as unknown as IntersectionObserver,
      );
  }
  observe(element: Element) {
    observed.push(element);
  }
  disconnect() {}
}

beforeEach(() => {
  observed.length = 0;
  vi.stubGlobal('IntersectionObserver', FakeIntersectionObserver);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

const Board: React.FC<{
  itemIds: ReadonlyArray<string>;
  onScheduler: (scheduler: RefreshScheduler | null) => void;
}> = ({ itemIds, onScheduler }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  onScheduler(useDashboardRefreshScheduler());
  useBoardItemVisibility(containerRef);
  return (
    <div ref={containerRef}>
      {itemIds.map((id) => (
        <div key={id} data-board-item-id={id} />
      ))}
    </div>
  );
};

describe('useBoardItemVisibility', () => {
  it('observes a board item that mounts after the board', async () => {
    let scheduler: RefreshScheduler | null = null;
    const onScheduler = (value: RefreshScheduler | null) => {
      scheduler = value;
    };
    const { rerender } = render(
      <DashboardRefreshProvider>
        <Board itemIds={[]} onScheduler={onScheduler} />
      </DashboardRefreshProvider>,
    );
    expect(observed).toHaveLength(0);

    rerender(
      <DashboardRefreshProvider>
        <Board itemIds={['late']} onScheduler={onScheduler} />
      </DashboardRefreshProvider>,
    );
    // MutationObserver callbacks run as a microtask.
    await act(async () => {});

    expect(observed).toHaveLength(1);
    const refresh = vi.fn();
    scheduler!.register(panelRefreshId('late'), { refresh });
    act(() => {
      report([{ target: observed[0], isIntersecting: false }]);
    });
    scheduler!.tick();
    expect(refresh).not.toHaveBeenCalled();
  });
});
