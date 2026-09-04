/**
 * The pin a `#bai=v3` link drops on its element: one marker, one card leading
 * with the note the reviewer typed, and a translucent box over the element.
 *
 * The card text comes off a link anyone can write, so it goes in through
 * `textContent` — never `innerHTML`. The box is state, not a one-shot effect:
 * a React re-render that replaces the anchored node re-draws it over the new
 * one rather than leaving it on a detached element.
 */
import { findAnchorTarget, quickFindTarget, textMatches } from './resolve.js';
import { projectFraction } from './selection.js';
import type { AnchorV3, CopyPayload } from './types.js';

const REPOSITION_DEBOUNCE_MS = 300;
/** Long enough for a `behavior: 'smooth'` scroll and its momentum to stop. */
const SETTLE_MS = 1200;
/** Card gap below/above the element, and its margin to the viewport edge. */
const CARD_GAP = 10;
const VIEWPORT_PAD = 8;
/** Four 1 s beats of the prototype's arrival pulse, then just the box. */
const PULSE_MS = 4200;
/** Escalated text scans a lost element gets before the pin stops looking. */
const MAX_MISSED_SCANS = 3;

/** The edges of a rectangle the element may have left: viewport or scroller. */
interface Bounds {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

const STYLE = `
  .pinlayer {
    position: fixed; inset: 0; z-index: 2147482999; pointer-events: none;
  }
  .pin {
    position: absolute; width: 24px; height: 24px; margin: -12px 0 0 -12px;
    border-radius: 50% 50% 50% 0; transform: rotate(-45deg);
    background: var(--bai-review-accent); color: var(--bai-review-on-accent);
    display: none; align-items: center; justify-content: center;
    font-size: 12px; font-weight: 700; pointer-events: none;
    box-shadow: 0 1px 4px var(--bai-review-shadow);
  }
  .pin.found { display: flex; }
  .pin > span { transform: rotate(45deg); }
  .pin.pulse { animation: baipulse 1s ease-in-out 4; }
  @keyframes baipulse {
    0%,100% { box-shadow: 0 1px 4px var(--bai-review-shadow); }
    50% { box-shadow: 0 0 0 8px var(--bai-review-accent-soft); }
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
  /* The element is gone from the viewport; the card is docked, not anchored. */
  .card.away { border-style: dashed; opacity: 0.94; }
  .card .awaynote {
    color: var(--bai-review-text-dim); font-size: 11px; margin-bottom: 6px;
    padding-right: 62px;
  }
  .card .awaynote:empty { display: none; }
  /* The reviewer's own words lead. An anchor from before the note travelled
     carries none, and :empty leaves no gap where it would have been. */
  .card .note {
    white-space: pre-wrap; word-break: break-word; padding-right: 62px;
    margin-bottom: 6px;
  }
  .card .note:empty { display: none; }
  .card .trunc {
    color: var(--bai-review-text-dim); font-size: 11px; margin-bottom: 6px;
    display: none;
  }
  .card .trunc.shown { display: block; }
  .card .label {
    font-weight: 600; word-break: break-word; padding-right: 62px;
  }
  .card .sub {
    color: var(--bai-review-text-dim); font-size: 13px; margin-top: 3px;
    word-break: break-all;
  }
  /* The card stays click-through (G4), so its padding and the space beside a
     short line still reach the app. Each text run takes pointer events back:
     an inline box hugs its own lines, so only the words are covered. */
  .card .txt {
    pointer-events: auto; -webkit-user-select: text; user-select: text;
  }
  .card .idcopy {
    pointer-events: auto; cursor: pointer; border: 0; background: none;
    padding: 0 2px; font: inherit; font-size: 11px; line-height: 1;
    color: var(--bai-review-text-dim);
  }
  .card .idcopy:hover { color: var(--bai-review-text); }
  .card .close, .card .locate, .card .copyall {
    position: absolute; top: 2px; cursor: pointer; border: 0;
    background: none; color: var(--bai-review-text-dim); font-size: 14px;
    pointer-events: auto;
  }
  .card .close { right: 4px; }
  .card .locate { right: 24px; }
  .card .copyall { right: 44px; }
  .card .copyall:hover { color: var(--bai-review-text); }
  /* The pick box's own style, so arriving on a link looks like the pick that
     made it: a thin stroke over a light fill, on our layer — never the app's. */
  .markbox {
    position: absolute; display: none; pointer-events: none;
    border: 1px solid var(--bai-review-pick-line);
    background: var(--bai-review-pick-fill);
  }
  .markbox.found { display: block; }
`;

export interface DeepLinkPinOptions {
  root: ShadowRoot;
  /** The overlay's own shadow host — never a valid answer for the anchor. */
  host: Element;
  /**
   * The overlay's own clipboard, not `navigator.clipboard`: the gateway origin
   * is plain http, where `execCommand` is the only path that writes. The HTML
   * flavour is what makes a paste into Teams a quote instead of raw markdown.
   */
  copyText: (text: string, html?: string) => boolean | Promise<boolean>;
  showToast: (message: string) => void;
  /**
   * Re-render this pin's whole comment, SYNCHRONOUSLY — the copy runs through
   * `execCommand` on the gateway origin, so nothing may be awaited inside the
   * gesture. `main.ts` owns it: the server state and the stack live there, and
   * `null` means those reads have not landed for this element yet.
   */
  buildComment: (target: DeepLinkPinTarget) => CopyPayload | null;
  /** The pin settled on a different element — or on none. */
  onLocated?: (element: Element | null) => void;
}

export interface DeepLinkPinTarget {
  id: string;
  anchor: AnchorV3;
  /** The link's own anchor payload, so a copy can rebuild the link itself. */
  anchorB64: string;
  /** `<route> › <landmark> › <tag "quoted text">` from the block. */
  label: string;
}

export function createDeepLinkPin({
  root,
  host,
  copyText,
  showToast,
  buildComment,
  onLocated,
}: DeepLinkPinOptions) {
  const style = document.createElement('style');
  style.textContent = STYLE;
  const layer = document.createElement('div');
  layer.className = 'pinlayer';
  const marker = document.createElement('div');
  marker.className = 'pin';
  const head = document.createElement('span');
  head.textContent = '📍';
  marker.append(head);
  const card = document.createElement('div');
  card.className = 'card';
  /** A text run: the line stays click-through, the words do not. */
  const run = (): HTMLSpanElement => {
    const span = document.createElement('span');
    span.className = 'txt';
    return span;
  };
  const note = document.createElement('div');
  note.className = 'note';
  // Appended only when there IS a note, so `.note:empty` still collapses it.
  const noteText = run();
  const trunc = document.createElement('div');
  trunc.className = 'trunc';
  const truncText = run();
  truncText.textContent = 'Note truncated — the comment has the whole of it.';
  trunc.append(truncText);
  const away = document.createElement('div');
  away.className = 'awaynote';
  const label = document.createElement('div');
  label.className = 'label';
  const labelText = run();
  label.append(labelText);
  const sub = document.createElement('div');
  sub.className = 'sub';
  const idText = run();
  const idCopy = document.createElement('button');
  idCopy.className = 'idcopy';
  idCopy.textContent = '📋';
  // The glyph is the accessible name unless one is given, and "clipboard" is
  // not the action; `title` stays the visual tooltip.
  idCopy.title = 'Copy this comment id';
  idCopy.setAttribute('aria-label', 'Copy this comment id');
  const componentText = run();
  sub.append(idText, idCopy, componentText);
  const close = document.createElement('button');
  close.className = 'close';
  close.textContent = '✕';
  close.title = 'Dismiss this pin';
  close.setAttribute('aria-label', 'Dismiss this pin');
  const locateButton = document.createElement('button');
  locateButton.className = 'locate';
  locateButton.textContent = '📍';
  locateButton.title = 'Scroll back to this element';
  locateButton.setAttribute('aria-label', 'Scroll back to this element');
  const commentCopy = document.createElement('button');
  commentCopy.className = 'copyall';
  commentCopy.textContent = '⧉';
  commentCopy.title = 'Copy the whole comment';
  commentCopy.setAttribute('aria-label', 'Copy the whole comment');
  card.append(close, locateButton, commentCopy, away, note, trunc, label, sub);
  const markBox = document.createElement('div');
  markBox.className = 'markbox';
  layer.append(markBox, marker, card);
  root.append(style, layer);

  let target: DeepLinkPinTarget | null = null;
  let located: Element | null = null;
  /** Ancestors that can hide the element without moving its own rect. */
  let clippers: Element[] = [];
  /** Escalated scans in a row that found nothing — the page moved on. */
  let missedScans = 0;
  /** One arrival pulse per link — the box is what stays. */
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

  /** Scrollers and `overflow: hidden` boxes between the element and the root. */
  function collectClippers(node: Element | null): Element[] {
    const view = node?.ownerDocument?.defaultView;
    const list: Element[] = [];
    let parent = view ? node?.parentElement : null;
    while (parent) {
      const style = view?.getComputedStyle(parent);
      if (
        style &&
        (style.overflowX !== 'visible' || style.overflowY !== 'visible')
      )
        list.push(parent);
      parent = parent.parentElement;
    }
    return list;
  }

  function setLocated(node: Element | null) {
    const moved = node !== located;
    located = node;
    clippers = node ? collectClippers(node) : [];
    // The ⚛️ stack a copy quotes belongs to the element the pin is on now, and
    // a re-render moves it — so this fires on every change, not just the first.
    if (moved) onLocated?.(node);
  }

  /**
   * The rectangle this pin marks: the located element's own box, or — for a
   * box select — `sel` projected back onto it, which is the region react-grab
   * showed while the reviewer dragged.
   */
  function markedBox(node: Element): DOMRect {
    const box = node.getBoundingClientRect();
    const sel = target?.anchor.sel;
    if (!sel || !box.width || !box.height) return box;
    const r = projectFraction(box, sel);
    return new DOMRect(r.left, r.top, r.width, r.height);
  }

  /** react-grab rounds its box to the element's own corners; so do we. */
  function cornerRadius(node: Element): string {
    if (target?.anchor.sel) return '0px';
    const view = node.ownerDocument?.defaultView;
    return view?.getComputedStyle(node).borderRadius || '0px';
  }

  function hide() {
    marker.classList.remove('found');
    card.classList.remove('found');
    card.classList.remove('away');
    markBox.classList.remove('found');
    away.textContent = '';
  }

  /**
   * The element scrolled out of sight. The marker and the box belong ON it and
   * go with it, but the card is the comment — and the control that scrolls
   * back lives in it, so hiding the card is what made that button unreachable
   * exactly when it was wanted. It docks to the edge the element left by.
   *
   * `area` is the rectangle the element left — a clipping scroller's, not the
   * viewport's, when a scroller is what hid it. The card still docks to the
   * VIEWPORT edge, because it lives on a fixed layer; only the direction comes
   * from `area`.
   */
  function placeAway(box: DOMRect, area: Bounds, vh: number, vw: number) {
    marker.classList.remove('found');
    markBox.classList.remove('found');
    card.classList.add('found');
    card.classList.add('away');
    const up = box.bottom <= area.top;
    const down = box.top >= area.bottom;
    // Written BEFORE the measurement: the hint is a line of the card, so a
    // height read without it docks a bottom-docked card past the fold.
    away.textContent = up
      ? '↑ Scrolled above — 📍 goes back'
      : down
        ? '↓ Scrolled below — 📍 goes back'
        : '↔ Off to the side — 📍 goes back';
    card.style.left = `${Math.max(8, Math.min(box.left, vw - 340))}px`;
    card.style.top = up
      ? `${VIEWPORT_PAD}px`
      : `${Math.max(VIEWPORT_PAD, vh - card.offsetHeight - VIEWPORT_PAD)}px`;
  }

  function place() {
    if (!located) return hide();
    const box = markedBox(located);
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    // A rect with no size at all is jsdom (or `display: contents`), not a
    // scrolled-away element.
    const measured = box.width > 0 || box.height > 0;
    const outside = (area: Bounds) =>
      box.bottom <= area.top ||
      box.top >= area.bottom ||
      box.right <= area.left ||
      box.left >= area.right;
    const viewport: Bounds = { top: 0, bottom: vh, left: 0, right: vw };
    // `getBoundingClientRect` reports the geometric box of an element a
    // scroller has clipped out of sight, so the window test is not enough —
    // and the scroller's rect, not the viewport's, is what says which way it
    // went.
    const clipper = clippers.find((clip) => {
      const area = clip.getBoundingClientRect();
      return (area.width > 0 || area.height > 0) && outside(area);
    });
    const gone = outside(viewport)
      ? viewport
      : clipper?.getBoundingClientRect();
    if (measured && gone) return placeAway(box, gone, vh, vw);
    marker.classList.add('found');
    card.classList.add('found');
    card.classList.remove('away');
    away.textContent = '';
    markBox.classList.add('found');
    Object.assign(markBox.style, {
      left: `${box.left}px`,
      top: `${box.top}px`,
      width: `${box.width}px`,
      height: `${box.height}px`,
      borderRadius: cornerRadius(located),
    });
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
   * expensive scan runs at most once per settle, and budgeted, so a page the
   * reviewer has navigated away from stops paying for it entirely.
   */
  function reposition() {
    if (!target) return;
    const held =
      located?.isConnected && textMatches(located, target.anchor.txt)
        ? located
        : null;
    if (held) missedScans = 0;
    let next = held ?? quickFindTarget(target.anchor, { ignore: host });
    if (
      !held &&
      missedScans < MAX_MISSED_SCANS &&
      (!next || isLandmarkFallback(next))
    ) {
      const full = findAnchorTarget(target.anchor, { ignore: host });
      missedScans = full ? 0 : missedScans + 1;
      next = full ?? next;
    }
    setLocated(next);
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
  window.addEventListener('resize', placeSoon);
  // Viewport coordinates, so a scroll moves the pin — including a scroll in an
  // overflow ancestor, which a document-coordinate layer would miss.
  window.addEventListener('scroll', placeSoon, {
    capture: true,
    passive: true,
  });

  locateButton.addEventListener('click', () =>
    located?.scrollIntoView?.({ block: 'center', behavior: 'smooth' }),
  );
  close.addEventListener('click', () => dismiss());

  function write(text: string, html: string | undefined, ok: string) {
    const done = (written: boolean) =>
      showToast(written ? ok : 'Could not reach the clipboard — try again');
    const copied = copyText(text, html);
    if (typeof copied === 'boolean') done(copied);
    else void copied.then(done);
  }

  /**
   * The bare id, not the `#bai=v3.` link: what the reader pastes into the PR
   * thread or a Claude prompt to name this comment. The whole link is already
   * one ⌘L away in the address bar.
   */
  idCopy.addEventListener('click', () => {
    const id = target?.id;
    if (!id) return;
    write(id, undefined, `Copied ${id} 📋`);
  });

  /**
   * The comment itself, in the shape the composer wrote it — so opening a pin
   * and forwarding it costs one click instead of retyping the note.
   */
  commentCopy.addEventListener('click', () => {
    if (!target) return;
    const payload = buildComment(target);
    if (!payload) {
      showToast('Still reading this element — try again');
      return;
    }
    write(
      payload.text,
      payload.html,
      // The link caps the note it carries, and a copy that quietly loses the
      // rest is worse than one that says so.
      target.anchor.nt === 1
        ? 'Copied — the note is the shortened one the link carries 📋'
        : 'Copied the whole comment 📋',
    );
  });

  function dismiss() {
    target = null;
    setLocated(null);
    missedScans = 0;
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
      noteText.textContent = next.anchor.n ?? '';
      note.replaceChildren(...(next.anchor.n ? [noteText] : []));
      trunc.classList.toggle('shown', next.anchor.nt === 1 && !!next.anchor.n);
      labelText.textContent = next.label;
      idText.textContent = next.id;
      const component = next.anchor.c;
      componentText.textContent = component
        ? ` · ${component.name}${component.src ? ` (${component.src})` : ''}`
        : '';
    },

    /**
     * One attempt at the full resolution ladder. True once the element is on
     * the page — which is when the pin and its box appear.
     */
    locate(): boolean {
      if (!target) return false;
      // The debounced observer runs the cheap ladder and can land first; a pin
      // already drawn must not also report "could not find that element".
      const found =
        findAnchorTarget(target.anchor, { ignore: host }) ??
        (located?.isConnected ? located : null);
      if (!found) return false;
      setLocated(found);
      missedScans = 0;
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
      window.removeEventListener('resize', placeSoon);
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
