/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useAfterOpenChange } from './useAfterOpenChange';
import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

describe('useAfterOpenChange', () => {
  it('fires nothing on mount, either way', () => {
    const afterOpenChange = vi.fn();
    const afterClose = vi.fn();
    renderHook(() => useAfterOpenChange(true, { afterOpenChange, afterClose }));
    renderHook(() =>
      useAfterOpenChange(false, { afterOpenChange, afterClose }),
    );
    expect(afterOpenChange).not.toHaveBeenCalled();
    expect(afterClose).not.toHaveBeenCalled();
  });

  it('fires afterOpenChange(false) and afterClose on the close edge', () => {
    const afterOpenChange = vi.fn();
    const afterClose = vi.fn();
    const { rerender } = renderHook(
      ({ isOpen }) =>
        useAfterOpenChange(isOpen, { afterOpenChange, afterClose }),
      { initialProps: { isOpen: true } },
    );
    rerender({ isOpen: false });
    expect(afterOpenChange).toHaveBeenCalledExactlyOnceWith(false);
    expect(afterClose).toHaveBeenCalledTimes(1);
  });

  it('fires only afterOpenChange(true) on the open edge', () => {
    const afterOpenChange = vi.fn();
    const afterClose = vi.fn();
    const { rerender } = renderHook(
      ({ isOpen }) =>
        useAfterOpenChange(isOpen, { afterOpenChange, afterClose }),
      { initialProps: { isOpen: false } },
    );
    rerender({ isOpen: true });
    expect(afterOpenChange).toHaveBeenCalledExactlyOnceWith(true);
    expect(afterClose).not.toHaveBeenCalled();
  });

  it('does not fire again on a re-render without a transition', () => {
    const afterClose = vi.fn();
    const { rerender } = renderHook(
      ({ isOpen }) => useAfterOpenChange(isOpen, { afterClose }),
      { initialProps: { isOpen: true } },
    );
    rerender({ isOpen: false });
    rerender({ isOpen: false });
    expect(afterClose).toHaveBeenCalledTimes(1);
  });
});
