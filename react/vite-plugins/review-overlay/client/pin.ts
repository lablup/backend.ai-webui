/**
 * The pin a `#bai=v3` link drops on its element: one marker, one card with the
 * quoted label the block carried, and a highlight on the element itself.
 *
 * The card text comes off a link anyone can write, so it goes in through
 * `textContent` — never `innerHTML`. The highlight is state, not a one-shot
 * effect: a React re-render that replaces the anchored node re-applies it to
 * the new one rather than leaving the outline on a detached element.
 */
import { findAnchorTarget, quickFindTarget, textMatches } from './resolve.js';
import type { AnchorV3 } from './types.js';

const REPOSITION_DEBOUNCE_MS = 300;
/** Long enough for a `behavior: 'smooth'` scroll and its momentum to stop. */
const SETTLE_MS = 1200;
/** Card gap below/above the element, and its margin to the viewport edge. */
const CARD_GAP = 10;
const VIEWPORT_PAD = 8;
/** Four 1 s beats of the prototype's arrival pulse, then back to the outline. */
const PULSE_MS = 4200;

const STYLE = `
  .pinlayer {
    position: fixed; inset: 0; z-index: 2147482999; pointer-events: none;
  }
  .pin {
    position: absolute; width: 24px; height: 24px; margin: -12px 0 0 -12px;
    border-radius: 50% 50% 50% 0; transform: rotate(-45deg);
    background: var(--bai-review-accent); color: var(--bai-review-on-accent);
    display: none; align-items: center; justify-content: center;
    font-size: 12px; font-weight: 700; cursor: pointer; pointer-events: auto;
    box-shadow: 0 1px 4px var(--bai-review-shadow);
  }
  .pin.found { display: flex; }
  .pin > span { transform: rotate(45deg); }
  .pin.pulse { animation: baipulse 1s ease-in-out 4; }
  @keyframes baipulse {
    0%,100% { box-shadow: 0 1px 4px var(--bai-review-shadow); }
    50% { box-shadow: 0 0 0 8px var(--bai-review-accent); }
  }
  @media (prefers-reduced-motion: reduce) {
    .pin.pulse { animation: none; }
  }
  .card {
    position: absolute; max-width: 320px; display: none;
    background: var(--bai-review-surface); color: var(--bai-review-text);
    border: 1px solid var(--bai-review-border); border-radius: 8px;
    padding: 8px 10px; font-size: 14px; pointer-events: none;
    box-shadow: 0 4px 18px var(--bai-review-shadow);
  }
  .card.found { display: block; }
  .card .label { font-weight: 600; word-break: break-word; }
  .card .sub {
    color: var(--bai-review-text-dim); font-size: 13px; margin-top: 3px;
    word-break: break-all;
  }
  .card .close {
    position: absolute; top: 2px; right: 4px; cursor: pointer; border: 0;
    background: none; color: var(--bai-review-text-dim); font-size: 14px;
    pointer-events: auto;
  }
`;

export interface DeepLinkPinOptions {
  root: ShadowRoot;
  /** The overlay's own shadow host — never a valid answer for the anchor. */
  host: Element;
}

export interface DeepLinkPinTarget {
  id: string;
  anchor: AnchorV3;
  /** `<route> › <landmark> › <tag "quoted text">` from the block. */
  label: string;
}

export function createDeepLinkPin({ root, host }: DeepLinkPinOptions) {
  const style = document.createElement('style');
  style.textContent = STYLE;
  const layer = document.createElement('div');
  layer.className = 'pinlayer';
  const marker = document.createElement('div');
  marker.className = 'pin';
  marker.title = 'Scroll back to this element';
  const head = document.createElement('span');
  head.textContent = '📍';
  marker.append(head);
  const card = document.createElement('div');
  card.className = 'card';
  const label = document.createElement('div');
  label.className = 'label';
  const sub = document.createElement('div');
  sub.className = 'sub';
  const close = document.createElement('button');
  close.className = 'close';
  close.textContent = '✕';
  close.title = 'Dismiss this pin';
  card.append(close, label, sub);
  layer.append(marker, card);
  root.append(style, layer);

  let target: DeepLinkPinTarget | null = null;
  let located: Element | null = null;
  let outlined: HTMLElement | null = null;
  let saved: { outline: string; offset: string } | null = null;
  /** Whether the cheap ladder can repeat what `locate()` found. */
  let neededFullLadder = false;
  /** One arrival pulse per link — the outline is what stays. */
  let pulsed = false;
  let pulseTimer = 0;

  function pulse() {
    if (pulsed) return;
    pulsed = true;
    marker.classList.add('pulse');
    pulseTimer = window.setTimeout(
      () => marker.classList.remove('pulse'),
      PULSE_MS,
    );
  }

  function clearHighlight() {
    if (outlined && saved) {
      outlined.style.outline = saved.outline;
      outlined.style.outlineOffset = saved.offset;
    }
    outlined = null;
    saved = null;
  }

  function highlight(node: Element) {
    if (outlined === node) return;
    clearHighlight();
    const element = node as HTMLElement;
    saved = {
      outline: element.style.outline,
      offset: element.style.outlineOffset,
    };
    element.style.outline = '3px solid var(--color-icon-orange, #e9690b)';
    element.style.outlineOffset = '2px';
    outlined = element;
  }

  function hide() {
    marker.classList.remove('found');
    card.classList.remove('found');
  }

  function place() {
    if (!located) return hide();
    const box = located.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    // A scrolled-away element must not leave a floating card behind. A rect
    // with no size at all is jsdom (or `display: contents`), not off-screen.
    const measured = box.width > 0 || box.height > 0;
    const offscreen =
      box.bottom <= 0 || box.top >= vh || box.right <= 0 || box.left >= vw;
    if (measured && offscreen) return hide();
    marker.classList.add('found');
    card.classList.add('found');
    marker.style.left = `${box.left + 6}px`;
    marker.style.top = `${box.top + 6}px`;
    card.style.left = `${Math.max(8, Math.min(box.left, vw - 340))}px`;
    // `locate()` centres the element, so anything taller than half the
    // viewport puts `box.bottom` below the fold — and a fixed layer cannot be
    // scrolled to. Flip above, then clamp.
    const height = card.offsetHeight;
    const below = box.bottom + CARD_GAP;
    const top =
      below + height <= vh - VIEWPORT_PAD ? below : box.top - CARD_GAP - height;
    card.style.top = `${Math.max(VIEWPORT_PAD, Math.min(top, vh - height - VIEWPORT_PAD))}px`;
  }

  let frame = 0;
  /** Called, never aliased: a detached `requestAnimationFrame` throws. */
  const raf = (callback: FrameRequestCallback): number =>
    typeof requestAnimationFrame === 'function'
      ? requestAnimationFrame(callback)
      : window.setTimeout(() => callback(0), 16);

  /** One layout read per frame, however many scrollers report a scroll. */
  function placeSoon() {
    if (frame) return;
    frame = raf(() => {
      frame = 0;
      place();
    });
  }

  let settleUntil = 0;
  /** A smooth scroll ends after `locate()` returns; follow it to its stop. */
  function placeUntilSettled() {
    const first = settleUntil === 0;
    settleUntil = Date.now() + SETTLE_MS;
    if (!first) return;
    const step = () => {
      place();
      if (Date.now() >= settleUntil) {
        settleUntil = 0;
        return;
      }
      raf(step);
    };
    raf(step);
  }

  /** The cheap ladder settled for the container of the element it wants. */
  const isLandmarkFallback = (element: Element) =>
    !!target?.anchor.tid &&
    !!target.anchor.rect &&
    element.getAttribute('data-testid') === target.anchor.tid;

  /**
   * Cheap first — it runs on every mutation batch — but a target the text scan
   * resolved cannot be re-found by the selector/landmark step, and a re-render
   * would either lose the pin or slide it onto the landmark. Debounced, so the
   * expensive scan runs at most once per settle.
   */
  function reposition() {
    if (!target) return;
    const held =
      located?.isConnected && textMatches(located, target.anchor.txt)
        ? located
        : null;
    let next = held ?? quickFindTarget(target.anchor, { ignore: host });
    if (!held && neededFullLadder && (!next || isLandmarkFallback(next)))
      next = findAnchorTarget(target.anchor, { ignore: host }) ?? next;
    located = next;
    if (located) highlight(located);
    else clearHighlight();
    place();
  }

  let timer = 0;
  const schedule = () => {
    clearTimeout(timer);
    timer = window.setTimeout(reposition, REPOSITION_DEBOUNCE_MS);
  };

  const observer = new MutationObserver((records) => {
    if (!target) return;
    if (records.every((record) => host.contains(record.target as Node))) return;
    schedule();
  });
  observer.observe(document.body, { childList: true, subtree: true });
  window.addEventListener('resize', schedule);
  // Viewport coordinates, so a scroll moves the pin — including a scroll in an
  // overflow ancestor, which a document-coordinate layer would miss.
  window.addEventListener('scroll', placeSoon, {
    capture: true,
    passive: true,
  });

  marker.addEventListener('click', () =>
    located?.scrollIntoView?.({ block: 'center', behavior: 'smooth' }),
  );
  close.addEventListener('click', () => dismiss());

  function dismiss() {
    target = null;
    located = null;
    neededFullLadder = false;
    clearHighlight();
    place();
  }

  return {
    /** Adopt a link's anchor. Nothing is drawn until `locate()` finds it. */
    show(next: DeepLinkPinTarget) {
      dismiss();
      pulsed = false;
      clearTimeout(pulseTimer);
      marker.classList.remove('pulse');
      target = next;
      marker.dataset.pinId = next.id;
      card.dataset.pinId = next.id;
      label.textContent = next.label;
      sub.textContent = next.anchor.c
        ? `${next.id} · ${next.anchor.c.name} (${next.anchor.c.src})`
        : next.id;
    },

    /**
     * One attempt at the full resolution ladder. True once the element is on
     * the page — which is when the pin appears and the highlight fires.
     */
    locate(): boolean {
      if (!target) return false;
      // The debounced observer runs the cheap ladder and can land first; a pin
      // already drawn must not also report "could not find that element".
      const found =
        findAnchorTarget(target.anchor, { ignore: host }) ??
        (located?.isConnected ? located : null);
      if (!found) return false;
      located = found;
      neededFullLadder =
        found !== quickFindTarget(target.anchor, { ignore: host });
      highlight(found);
      place();
      found.scrollIntoView?.({ block: 'center', behavior: 'smooth' });
      placeUntilSettled();
      pulse();
      return true;
    },

    dismiss,
    isShowing: () => !!target,
    locatedElement: () => located,

    /** One pin lives as long as the page; tests make one per case. */
    dispose() {
      observer.disconnect();
      window.removeEventListener('resize', schedule);
      window.removeEventListener('scroll', placeSoon, { capture: true });
      settleUntil = 0;
      clearTimeout(timer);
      clearTimeout(pulseTimer);
      dismiss();
      layer.remove();
      style.remove();
    },
  };
}

export type DeepLinkPin = ReturnType<typeof createDeepLinkPin>;
