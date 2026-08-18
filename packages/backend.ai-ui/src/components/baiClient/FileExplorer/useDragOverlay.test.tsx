import { useDragOverlay } from './hooks';
import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

/**
 * The overlay's Astryx `FileInput` calls `stopPropagation()` on its own
 * `dragleave` and `drop`. These tests stand in for it, because the listener
 * phase the hook picks is only observable through a descendant that does that
 * (FR-3575) — nothing in `tsc` or lint can see it.
 */
const mountDropzoneStandIn = () => {
  const zone = document.createElement('div');
  const child = document.createElement('span');
  zone.appendChild(child);
  document.body.appendChild(zone);
  zone.addEventListener('dragleave', (e) => e.stopPropagation());
  zone.addEventListener('drop', (e) => e.stopPropagation());
  return { zone, child };
};

const fire = (el: Element | Document, type: string) =>
  act(() => {
    el.dispatchEvent(new Event(type, { bubbles: true, cancelable: true }));
  });

afterEach(() => {
  document.body.innerHTML = '';
});

describe('useDragOverlay', () => {
  it('opens on dragenter', () => {
    const { result } = renderHook(() => useDragOverlay());
    expect(result.current.isDragMode).toBe(false);
    fire(document, 'dragenter');
    expect(result.current.isDragMode).toBe(true);
  });

  it('stays open while the cursor moves inside the dropzone', () => {
    const { result } = renderHook(() => useDragOverlay());
    const { zone, child } = mountDropzoneStandIn();
    fire(document, 'dragenter');

    // The browser fires dragenter on the child and dragleave on the parent as
    // the cursor moves within the zone, with no relatedTarget. The dropzone
    // stops those, so they must not reach the hook.
    for (let i = 0; i < 3; i++) {
      fire(child, 'dragenter');
      fire(zone, 'dragleave');
      fire(zone, 'dragover');
    }

    expect(result.current.isDragMode).toBe(true);
  });

  it('leaves a drop on the dropzone to the overlay itself', () => {
    // Closing here would unmount the dropzone before React dispatches
    // `FileInput`'s own drop handler, and the file would never be uploaded.
    // `DragAndDrop`'s deferred `onDropCapture` owns this case.
    const { result } = renderHook(() => useDragOverlay());
    const { zone } = mountDropzoneStandIn();
    fire(document, 'dragenter');

    fire(zone, 'drop');
    expect(result.current.isDragMode).toBe(true);
  });

  it('closes on a drop that misses the dropzone', () => {
    const { result } = renderHook(() => useDragOverlay());
    const elsewhere = document.createElement('div');
    document.body.appendChild(elsewhere);
    fire(document, 'dragenter');
    expect(result.current.isDragMode).toBe(true);

    fire(elsewhere, 'drop');
    expect(result.current.isDragMode).toBe(false);
  });

  it('exposes close() for the overlay to dismiss itself', () => {
    const { result } = renderHook(() => useDragOverlay());
    fire(document, 'dragenter');
    expect(result.current.isDragMode).toBe(true);

    act(() => result.current.close());
    expect(result.current.isDragMode).toBe(false);
  });

  it('closes when the drag leaves the window', () => {
    const { result } = renderHook(() => useDragOverlay());
    fire(document, 'dragenter');
    // relatedTarget is null and nothing stops this one — it reaches the hook.
    fire(document, 'dragleave');
    expect(result.current.isDragMode).toBe(false);
  });

  it('captures the portal container when the drag starts', () => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    const ref = { current: container };
    const { result } = renderHook(() => useDragOverlay(ref));

    expect(result.current.portalContainer).toBeNull();
    fire(document, 'dragenter');
    expect(result.current.portalContainer).toBe(container);
  });

  it('removes its listeners on unmount', () => {
    const { result, unmount } = renderHook(() => useDragOverlay());
    const before = result.current.isDragMode;
    unmount();
    fire(document, 'dragenter');
    expect(result.current.isDragMode).toBe(before);
  });
});
