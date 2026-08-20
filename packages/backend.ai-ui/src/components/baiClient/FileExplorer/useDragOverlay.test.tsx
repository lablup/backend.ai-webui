import { useDragOverlay } from './hooks';
import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

/**
 * The overlay's Astryx `FileInput` calls `stopPropagation()` on its own
 * `dragenter`/`dragover`/`dragleave`/`drop`, and it covers the whole overlay.
 * These tests stand in for it, because the listener phase the hook picks is
 * only observable through a descendant that does that (FR-3575) — nothing in
 * `tsc` or lint can see it.
 */
const mountDropzoneStandIn = () => {
  const zone = document.createElement('div');
  const child = document.createElement('span');
  zone.appendChild(child);
  document.body.appendChild(zone);
  for (const type of ['dragenter', 'dragover', 'dragleave', 'drop']) {
    zone.addEventListener(type, (e) => e.stopPropagation());
  }
  return { zone, child };
};

const fire = (el: Element | Document, type: string) =>
  act(() => {
    el.dispatchEvent(new Event(type, { bubbles: true, cancelable: true }));
  });

/**
 * Chromium populates `relatedTarget` on every `dragleave` between two elements
 * of the page, and leaves it null only when the drag exits the window — which
 * is the one case that must dismiss the overlay.
 */
const fireDragLeave = (el: Element, relatedTarget: Element | null) =>
  act(() => {
    el.dispatchEvent(
      new MouseEvent('dragleave', {
        bubbles: true,
        cancelable: true,
        relatedTarget,
      }),
    );
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

    // Moving between the zone and its children keeps the cursor in the page,
    // so every leave names the element being entered.
    for (let i = 0; i < 3; i++) {
      fire(child, 'dragenter');
      fireDragLeave(zone, child);
      fireDragLeave(child, zone);
      fire(zone, 'dragover');
    }

    expect(result.current.isDragMode).toBe(true);
  });

  it('closes when the drag leaves the window over the dropzone', () => {
    // The regression this pins: the dropzone fills the overlay, so the leave
    // that ends the drag fires ON it and its `stopPropagation()` hides it from
    // any bubble listener — the overlay then never comes down (FR-3575).
    const { result } = renderHook(() => useDragOverlay());
    const { zone } = mountDropzoneStandIn();
    fire(document, 'dragenter');
    expect(result.current.isDragMode).toBe(true);

    fireDragLeave(zone, null);
    expect(result.current.isDragMode).toBe(false);
  });

  it.each(['mousedown', 'keydown', 'wheel'])(
    'closes after a cancelled drag, on the next %s',
    (type) => {
      // Escape (or a drop the OS refuses) ends the drag without firing any
      // drag event at all, so the overlay comes down on the user's next
      // interaction instead.
      const { result } = renderHook(() => useDragOverlay());
      mountDropzoneStandIn();
      fire(document, 'dragenter');
      expect(result.current.isDragMode).toBe(true);

      fire(document, type);
      expect(result.current.isDragMode).toBe(false);
    },
  );

  it('survives pointer movement while the drag is still in flight', () => {
    // The regression this pins: `mousemove` is not suppressed during a drag on
    // every platform, and closing on it unmounted the dropzone mid-drag — the
    // drop then landed on nothing and the browser opened the file (FR-3575).
    const { result } = renderHook(() => useDragOverlay());
    const { zone } = mountDropzoneStandIn();
    fire(document, 'dragenter');

    fire(document, 'mousemove');
    fire(zone, 'dragover');
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
