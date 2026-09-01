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

const STYLE = `
  .pinlayer {
    position: fixed; inset: 0; z-index: 2147482999; pointer-events: none;
  }
  .pin {
    position: absolute; width: 24px; height: 24px; margin: -12px 0 0 -12px;
    border-radius: 50% 50% 50% 0; transform: rotate(-45deg);
    background: var(--bai-review-accent); color: var(--bai-review-on-accent);
    display: none; align-items: center; justify-content: center;
    font-size: 12px; cursor: pointer; pointer-events: auto;
    box-shadow: 0 1px 4px var(--bai-review-shadow);
  }
  .pin.found { display: flex; }
  .pin > span { transform: rotate(45deg); }
  .card {
    position: absolute; max-width: 320px; display: none;
    background: var(--bai-review-surface); color: var(--bai-review-text);
    border: 1px solid var(--bai-review-border); border-radius: 8px;
    padding: 8px 10px; font-size: 13px; pointer-events: auto;
    box-shadow: 0 4px 18px var(--bai-review-shadow);
  }
  .card.found { display: block; }
  .card .label { font-weight: 600; word-break: break-word; }
  .card .sub {
    color: var(--bai-review-text-dim); font-size: 11px; margin-top: 3px;
    word-break: break-all;
  }
  .card .close {
    position: absolute; top: 2px; right: 4px; cursor: pointer; border: 0;
    background: none; color: var(--bai-review-text-dim); font-size: 13px;
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

  function place() {
    if (!located) {
      marker.classList.remove('found');
      card.classList.remove('found');
      return;
    }
    const box = located.getBoundingClientRect();
    marker.classList.add('found');
    card.classList.add('found');
    marker.style.left = `${box.left + 6}px`;
    marker.style.top = `${box.top + 6}px`;
    card.style.left = `${Math.max(8, Math.min(box.left, window.innerWidth - 340))}px`;
    card.style.top = `${box.bottom + 10}px`;
  }

  /**
   * Cheap by design — it runs on every mutation batch and every scroll, so it
   * re-runs the selector/landmark step only, never the document-wide text scan.
   */
  function reposition() {
    if (!target) return;
    const held =
      located?.isConnected && textMatches(located, target.anchor.txt)
        ? located
        : null;
    located = held ?? quickFindTarget(target.anchor, { ignore: host });
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
  // Pins are positioned in viewport coordinates, so a scroll moves them.
  window.addEventListener('scroll', place, { capture: true, passive: true });

  marker.addEventListener('click', () =>
    located?.scrollIntoView?.({ block: 'center', behavior: 'smooth' }),
  );
  close.addEventListener('click', () => dismiss());

  function dismiss() {
    target = null;
    located = null;
    clearHighlight();
    place();
  }

  return {
    /** Adopt a link's anchor. Nothing is drawn until `locate()` finds it. */
    show(next: DeepLinkPinTarget) {
      dismiss();
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
      highlight(found);
      place();
      found.scrollIntoView?.({ block: 'center', behavior: 'smooth' });
      return true;
    },

    dismiss,
    isShowing: () => !!target,
    locatedElement: () => located,

    /** One pin lives as long as the page; tests make one per case. */
    dispose() {
      observer.disconnect();
      window.removeEventListener('resize', schedule);
      window.removeEventListener('scroll', place, { capture: true });
      clearTimeout(timer);
      dismiss();
      layer.remove();
      style.remove();
    },
  };
}

export type DeepLinkPin = ReturnType<typeof createDeepLinkPin>;
