/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useResetPageOn } from './useResetPageOn';
import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

describe('useResetPageOn', () => {
  it('goes back to page 1 only when the key changes', () => {
    const resetPage = vi.fn();
    const { rerender } = renderHook(
      ({ key }) => useResetPageOn(key, resetPage),
      { initialProps: { key: ['now-24h', 'rg-a'] as unknown } },
    );
    rerender({ key: ['now-24h', 'rg-a'] });
    expect(resetPage).not.toHaveBeenCalled();
    rerender({ key: ['now-7d', 'rg-a'] });
    expect(resetPage).toHaveBeenCalledWith({ current: 1 });
    expect(resetPage).toHaveBeenCalledTimes(1);
  });
});
