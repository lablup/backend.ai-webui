/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 `BAIModal` hands its close edge to the `BAIDialog` it keeps mounted, mounts
 its content on first open and keeps it while closed. `BAIUnmountAfterClose`
 drops the whole modal, and its state, instead.
*/
import BAIModal from './BAIModal';
import BAIUnmountAfterClose from './BAIUnmountAfterClose';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('react-i18next', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-i18next')>();
  return {
    ...actual,
    useTranslation: () => ({ t: (key: string) => key }),
  };
});

describe('BAIModal close lifecycle', () => {
  it('fires afterOpenChange and afterClose on the close edge, never on mount', () => {
    const afterOpenChange = vi.fn();
    const afterClose = vi.fn();
    const ui = (open: boolean) => (
      <BAIModal
        open={open}
        title="Settings"
        afterOpenChange={afterOpenChange}
        afterClose={afterClose}
      >
        <span>Inside</span>
      </BAIModal>
    );
    const { rerender } = render(ui(true));
    expect(afterOpenChange).not.toHaveBeenCalled();
    rerender(ui(false));
    expect(afterOpenChange).toHaveBeenCalledExactlyOnceWith(false);
    expect(afterClose).toHaveBeenCalledTimes(1);
    rerender(ui(true));
    expect(afterOpenChange).toHaveBeenLastCalledWith(true);
    expect(afterClose).toHaveBeenCalledTimes(1);
  });

  it('does not render its content before the first open', () => {
    render(
      <BAIModal open={false} title="Settings">
        <span>Inside</span>
      </BAIModal>,
    );
    expect(screen.queryByText('Inside')).toBeNull();
  });

  it('keeps its content mounted while closed', () => {
    const ui = (open: boolean) => (
      <BAIModal open={open} title="Settings">
        <span>Inside</span>
      </BAIModal>
    );
    const { rerender } = render(ui(true));
    rerender(ui(false));
    expect(screen.getByText('Inside')).toBeInTheDocument();
  });

  it('is dropped entirely by BAIUnmountAfterClose once it closes', () => {
    const ui = (open: boolean) => (
      <BAIUnmountAfterClose>
        <BAIModal open={open} title="Settings">
          <span>Inside</span>
        </BAIModal>
      </BAIUnmountAfterClose>
    );
    const { rerender } = render(ui(true));
    expect(screen.getByText('Inside')).toBeInTheDocument();
    rerender(ui(false));
    expect(screen.queryByText('Inside')).toBeNull();
    // The kept-mounted BAIDialog portal root goes too.
    expect(document.querySelector('.bai-dialog')).toBeNull();
  });
});
