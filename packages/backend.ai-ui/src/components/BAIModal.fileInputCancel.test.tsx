/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 FR-3579 — a file chooser's dismissal must not close the modal around it.

 `<input type="file">` fires a BUBBLING `cancel` when the user dismisses the
 chooser, and Astryx `Dialog` reads any `cancel` reaching its `<dialog>` as its
 own close request — there is no `target === currentTarget` guard upstream, so
 the modal went down with the chooser.
*/
import BAIModal from './BAIModal';
import { render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { describe, expect, it, vi } from 'vitest';

describe('BAIModal and a file input inside it', () => {
  it('stays open when a descendant file input reports a cancelled chooser', () => {
    const handleCancel = vi.fn();

    render(
      <BAIModal open title="Upload" onCancel={handleCancel}>
        <input type="file" data-testid="picker" />
      </BAIModal>,
    );

    const picker = screen.getByTestId('picker');
    picker.dispatchEvent(new Event('cancel', { bubbles: true }));

    expect(handleCancel).not.toHaveBeenCalled();
  });

  it('still lets the modal be dismissed the normal way', async () => {
    const handleCancel = vi.fn();

    render(
      <BAIModal open title="Upload" onCancel={handleCancel}>
        <input type="file" data-testid="picker" />
      </BAIModal>,
    );

    // The header close button is the modal's own dismissal path; it must be
    // unaffected by the guard on the body.
    const close = screen.getByRole('button', { name: /close/i });
    close.click();

    expect(handleCancel).toHaveBeenCalled();
  });
});

/**
 * The guard is installed from the body's callback ref, so this component now
 * owns `bodyRef`'s teardown. Getting that wrong silently breaks any consumer
 * that installs an observer there — the FolderExplorer's drop container is one.
 */
describe('BAIModal bodyRef forwarding', () => {
  it('still populates and clears an object ref', () => {
    const ref = createRef<HTMLDivElement>();
    const { unmount } = render(
      <BAIModal open title="Upload" bodyRef={ref}>
        <span>body</span>
      </BAIModal>,
    );

    expect(ref.current).toBeInstanceOf(HTMLDivElement);
    unmount();
    expect(ref.current).toBeNull();
  });

  it("runs a callback ref's own React 19 cleanup instead of calling it with null", () => {
    const cleanup = vi.fn();
    const attached = vi.fn();
    const { unmount } = render(
      <BAIModal
        open
        title="Upload"
        bodyRef={(node) => {
          attached(node);
          return cleanup;
        }}
      >
        <span>body</span>
      </BAIModal>,
    );

    expect(attached).toHaveBeenCalledWith(expect.any(HTMLDivElement));
    unmount();
    expect(cleanup).toHaveBeenCalledTimes(1);
    // The cleanup is the teardown contract; a stray `ref(null)` on top of it is
    // exactly what React 19 stopped doing.
    expect(attached).not.toHaveBeenCalledWith(null);
  });

  it('falls back to clearing a cleanup-less callback ref', () => {
    const seen: Array<HTMLDivElement | null> = [];
    const { unmount } = render(
      <BAIModal
        open
        title="Upload"
        bodyRef={(node) => {
          seen.push(node);
        }}
      >
        <span>body</span>
      </BAIModal>,
    );

    expect(seen).toHaveLength(1);
    unmount();
    expect(seen).toEqual([expect.any(HTMLDivElement), null]);
  });
});
