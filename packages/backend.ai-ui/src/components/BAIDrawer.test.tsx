/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 `BAIDrawer`'s close lifecycle: `afterOpenChange(false)` / `afterClose` fire
 once lab's delayed `dialog.close()` ends the slide-out, which is when
 `BAIUnmountAfterClose` may drop the drawer and the state it holds.
*/
import BAIDrawer from './BAIDrawer';
import BAIUnmountAfterClose from './BAIUnmountAfterClose';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('react-i18next', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-i18next')>();
  return {
    ...actual,
    useTranslation: () => ({ t: (key: string) => key }),
  };
});

describe('BAIDrawer close lifecycle', () => {
  it.each([true, false])(
    'fires afterOpenChange(true) on open and the close pair after the slide-out (hasScrim=%s)',
    async (hasScrim) => {
      const afterOpenChange = vi.fn();
      const afterClose = vi.fn();
      const ui = (open: boolean) => (
        <BAIDrawer
          open={open}
          onClose={() => {}}
          title="Details"
          hasScrim={hasScrim}
          afterOpenChange={afterOpenChange}
          afterClose={afterClose}
        >
          <button type="button">Inside</button>
        </BAIDrawer>
      );
      const { rerender } = render(ui(false));
      rerender(ui(true));
      expect(afterOpenChange).toHaveBeenCalledExactlyOnceWith(true);
      rerender(ui(false));
      // lab keeps the <dialog> open while the panel slides out.
      expect(afterClose).not.toHaveBeenCalled();
      await waitFor(() => expect(afterClose).toHaveBeenCalledTimes(1));
      expect(afterOpenChange).toHaveBeenLastCalledWith(false);
      expect(afterOpenChange).toHaveBeenCalledTimes(2);
    },
  );

  it('keeps its children mounted while closed', () => {
    const ui = (open: boolean) => (
      <BAIDrawer open={open} onClose={() => {}} title="Details">
        <span>Inside</span>
      </BAIDrawer>
    );
    const { rerender } = render(ui(true));
    rerender(ui(false));
    expect(screen.getByText('Inside')).toBeInTheDocument();
  });

  it('is dropped by BAIUnmountAfterClose once the slide-out ends', async () => {
    const afterClose = vi.fn();
    const ui = (open: boolean) => (
      <BAIUnmountAfterClose>
        <BAIDrawer
          open={open}
          onClose={() => {}}
          title="Details"
          afterClose={afterClose}
        >
          <span>Inside</span>
        </BAIDrawer>
      </BAIUnmountAfterClose>
    );
    const { rerender } = render(ui(true));
    expect(screen.getByText('Inside')).toBeInTheDocument();
    rerender(ui(false));
    expect(screen.getByText('Inside')).toBeInTheDocument();
    await waitFor(() => expect(screen.queryByText('Inside')).toBeNull());
    expect(afterClose).toHaveBeenCalledTimes(1);
  });
});
