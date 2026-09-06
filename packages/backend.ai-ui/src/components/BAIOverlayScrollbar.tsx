/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import './BAIOverlayScrollbar.css';
import React, { useLayoutEffect, useRef, useSyncExternalStore } from 'react';

const MIN_THUMB_HEIGHT = 24;

/**
 * Touch-primary platforms keep their NATIVE scroll indicator: it already
 * floats over the content (so there is no width to reclaim), a persistent bar
 * is not the platform convention on a phone, and iOS momentum scrolling is
 * documented to starve JS of the touch/scroll events a hand-drawn thumb needs
 * to track the flick.
 *
 * The gate is the pointer type, not the measured scrollbar width: on a desktop
 * whose scrollbars are already overlays (macOS with a trackpad) the width is
 * zero yet the persistent thumb is still wanted, because a transient one is
 * exactly the "can't tell it scrolls" problem this component exists to fix.
 *
 * Module-level singleton + stable boolean snapshot, per the store contract
 * `useSyncExternalStore` requires (see `theme-shim/breakpoints.ts`).
 */
const COARSE_POINTER_QUERY = '(pointer: coarse)';
let coarsePointerQueryList: MediaQueryList | null = null;

const getCoarsePointerQueryList = (): MediaQueryList => {
  if (!coarsePointerQueryList) {
    coarsePointerQueryList = window.matchMedia(COARSE_POINTER_QUERY);
  }
  return coarsePointerQueryList;
};

const subscribeToPointerType = (onStoreChange: () => void): (() => void) => {
  const list = getCoarsePointerQueryList();
  list.addEventListener('change', onStoreChange);
  return () => list.removeEventListener('change', onStoreChange);
};

const getIsTouchPrimary = (): boolean => getCoarsePointerQueryList().matches;
// Assume touch on the server so nothing is hidden before hydration measures.
const getIsTouchPrimaryOnServer = (): boolean => true;

export interface BAIOverlayScrollbarProps {
  /** The scroll container this thumb tracks. */
  targetRef: React.RefObject<HTMLElement | null>;
}

/**
 * Overlay scrollbar for a scroll column. On pointer-driven platforms the
 * native bar is hidden on the target and this thumb is painted OVER the
 * content instead, so scrollability never changes the content width —
 * `overflow: overlay` is gone from Chromium, and `scrollbar-gutter: stable`
 * leaves a permanently empty strip. The thumb stays visible the whole time the
 * content is scrollable, so its presence is the scrollability cue, and it can
 * be dragged. All updates write straight to the DOM — no React state, so
 * scrolling stays out of the render loop.
 *
 * Contract: render it inside the target's POSITIONED ancestor (the track is
 * `position: absolute`). On touch-primary platforms it renders `null` and
 * leaves the native indicator alone.
 */
const BAIOverlayScrollbar: React.FC<BAIOverlayScrollbarProps> = ({
  targetRef,
}) => {
  'use memo';
  const trackRef = useRef<HTMLDivElement>(null);
  const thumbRef = useRef<HTMLDivElement>(null);
  const isTouchPrimary = useSyncExternalStore(
    subscribeToPointerType,
    getIsTouchPrimary,
    getIsTouchPrimaryOnServer,
  );

  useLayoutEffect(() => {
    const el = targetRef.current;
    const track = trackRef.current;
    const thumb = thumbRef.current;
    if (isTouchPrimary || !el || !track || !thumb) {
      return;
    }

    // Opts the target into hiding its native bar (BAIOverlayScrollbar.css).
    // Set here, not in markup, so the native bar stays untouched on platforms
    // that never reserved space for it.
    el.dataset.baiCustomScrollbar = 'true';

    let rafId: number | undefined;

    const layout = () => {
      const { scrollTop, scrollHeight, clientHeight } = el;
      const scrollable = scrollHeight > clientHeight + 1;
      track.dataset.scrollable = scrollable ? 'true' : 'false';
      if (!scrollable) {
        return;
      }
      const thumbHeight = Math.max(
        (clientHeight / scrollHeight) * clientHeight,
        MIN_THUMB_HEIGHT,
      );
      const maxTop = clientHeight - thumbHeight;
      const top = (scrollTop / (scrollHeight - clientHeight)) * maxTop || 0;
      thumb.style.height = `${thumbHeight}px`;
      thumb.style.transform = `translateY(${top}px)`;
    };

    const scheduleLayout = () => {
      if (rafId !== undefined) {
        return;
      }
      rafId = requestAnimationFrame(() => {
        rafId = undefined;
        layout();
      });
    };

    el.addEventListener('scroll', scheduleLayout, { passive: true });
    const resizeObserver = new ResizeObserver(scheduleLayout);
    resizeObserver.observe(el);
    // `scrollHeight` changes with content, which no ResizeObserver on the
    // scroller itself reports — watch subtree mutations, rAF-throttled.
    const mutationObserver = new MutationObserver(scheduleLayout);
    mutationObserver.observe(el, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['style', 'class'],
    });

    // Thumb dragging (the native bar is hidden, so the thumb owns it).
    let dragStartY = 0;
    let dragStartScrollTop = 0;
    const onPointerMove = (event: PointerEvent) => {
      const { scrollHeight, clientHeight } = el;
      const thumbHeight = thumb.getBoundingClientRect().height;
      const maxTop = clientHeight - thumbHeight;
      if (maxTop <= 0) {
        return;
      }
      const deltaRatio = (event.clientY - dragStartY) / maxTop;
      el.scrollTop =
        dragStartScrollTop + deltaRatio * (scrollHeight - clientHeight);
    };
    const onPointerUp = () => {
      track.dataset.dragging = 'false';
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
    };
    const onPointerDown = (event: PointerEvent) => {
      event.preventDefault();
      dragStartY = event.clientY;
      dragStartScrollTop = el.scrollTop;
      track.dataset.dragging = 'true';
      window.addEventListener('pointermove', onPointerMove);
      window.addEventListener('pointerup', onPointerUp);
    };
    thumb.addEventListener('pointerdown', onPointerDown);

    layout();

    return () => {
      delete el.dataset.baiCustomScrollbar;
      el.removeEventListener('scroll', scheduleLayout);
      resizeObserver.disconnect();
      mutationObserver.disconnect();
      thumb.removeEventListener('pointerdown', onPointerDown);
      onPointerUp();
      if (rafId !== undefined) {
        cancelAnimationFrame(rafId);
      }
    };
  }, [targetRef, isTouchPrimary]);

  if (isTouchPrimary) {
    return null;
  }

  return (
    <div
      ref={trackRef}
      className="bai-overlay-scrollbar"
      data-scrollable="false"
      aria-hidden="true"
    >
      <div ref={thumbRef} className="bai-overlay-scrollbar-thumb" />
    </div>
  );
};

export default BAIOverlayScrollbar;
