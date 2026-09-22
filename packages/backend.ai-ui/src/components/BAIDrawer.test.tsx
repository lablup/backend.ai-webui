/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 `BAIDrawer`'s close lifecycle: `afterOpenChange` / `afterClose` fire on the
 close edge of `open`, which is what lets `BAIUnmountAfterClose` drop a
 drawer — and the state it holds — once it closes.
*/
import BAIDrawer from './BAIDrawer';
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

describe('BAIDrawer close lifecycle', () => {
  it.each([true, false])(
    'fires afterOpenChange and afterClose on the close edge (hasScrim=%s)',
    (hasScrim) => {
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
      const { rerender } = render(ui(true));
      expect(afterOpenChange).not.toHaveBeenCalled();
      rerender(ui(false));
      expect(afterOpenChange).toHaveBeenCalledExactlyOnceWith(false);
      expect(afterClose).toHaveBeenCalledTimes(1);
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

  it('is dropped by BAIUnmountAfterClose once it closes', () => {
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
    expect(afterClose).toHaveBeenCalledTimes(1);
    expect(screen.queryByText('Inside')).toBeNull();
  });
});
