/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import React, { useEffect, useRef } from 'react';

const MIN_THUMB_HEIGHT = 24;
const HIDE_DELAY_MS = 800;

/**
 * Overlay scrollbar for the main content column (FR-3612). The native
 * scrollbar is hidden on that column (`.main-layout-content-scroll`) and this
 * thumb is painted OVER the content instead, so scrollability never changes
 * the content width — `overflow: overlay` is gone from Chromium and
 * `scrollbar-gutter: stable` reserves an always-visible strip. Appears while
 * scrolling (fades after idle), supports thumb dragging, and renders nothing
 * interactable while hidden. All updates write straight to the DOM — no
 * React state, so scrolling stays out of the render loop.
 */
const MainLayoutOverlayScrollbar: React.FC<{
  targetRef: React.RefObject<HTMLElement | null>;
}> = ({ targetRef }) => {
  'use memo';
  const trackRef = useRef<HTMLDivElement>(null);
  const thumbRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = targetRef.current;
    const track = trackRef.current;
    const thumb = thumbRef.current;
    if (!el || !track || !thumb) {
      return;
    }

    let hideTimer: ReturnType<typeof setTimeout> | undefined;
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

    const reveal = () => {
      track.dataset.visible = 'true';
      if (hideTimer) {
        clearTimeout(hideTimer);
      }
      hideTimer = setTimeout(() => {
        track.dataset.visible = 'false';
      }, HIDE_DELAY_MS);
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

    const onScroll = () => {
      scheduleLayout();
      reveal();
    };

    el.addEventListener('scroll', onScroll, { passive: true });
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
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
    };
    const onPointerDown = (event: PointerEvent) => {
      event.preventDefault();
      dragStartY = event.clientY;
      dragStartScrollTop = el.scrollTop;
      window.addEventListener('pointermove', onPointerMove);
      window.addEventListener('pointerup', onPointerUp);
      reveal();
    };
    thumb.addEventListener('pointerdown', onPointerDown);

    layout();

    return () => {
      el.removeEventListener('scroll', onScroll);
      resizeObserver.disconnect();
      mutationObserver.disconnect();
      thumb.removeEventListener('pointerdown', onPointerDown);
      onPointerUp();
      if (hideTimer) {
        clearTimeout(hideTimer);
      }
      if (rafId !== undefined) {
        cancelAnimationFrame(rafId);
      }
    };
  }, [targetRef]);

  return (
    <div
      ref={trackRef}
      className="main-layout-overlay-scrollbar"
      aria-hidden="true"
    >
      <div ref={thumbRef} className="main-layout-overlay-scrollbar-thumb" />
    </div>
  );
};

export default MainLayoutOverlayScrollbar;
