/**
 * The pins a `#bai=v3` link drops on their elements. One LAYER owns the
 * `<style>`, the mutation observer, the scroll/resize listeners, the placement
 * batch, the retry driver and the docked column; one VIEW per pin owns its
 * marker, its card leading with the note the reviewer typed, and the
 * translucent box over the element.
 *
 * The card text comes off a link anyone can write, so it goes in through
 * `textContent` — never `innerHTML`. The box is state, not a one-shot effect:
 * a React re-render that replaces the anchored node re-draws it over the new
 * one rather than leaving it on a detached element.
 */
import { retryUntil } from './deeplink.js';
import { findAnchorTarget, quickFindTarget, textMatches } from './resolve.js';
import { projectFraction } from './selection.js';
import type { AnchorV3, CopyPayload } from './types.js';

const REPOSITION_DEBOUNCE_MS = 300;
/** Long enough for a `behavior: 'smooth'` scroll and its momentum to stop. */
const SETTLE_MS = 1200;
/** Card gap below/above the element, and its margin to the viewport edge. */
const CARD_GAP = 10;
const VIEWPORT_PAD = 8;
/** Between two cards of the docked column. */
const DOCK_GAP = 6;
/** `.card`'s `max-width` under the shadow root's `box-sizing: border-box`. */
const CARD_MAX_WIDTH = 320;
/** Four 1 s beats of the prototype's arrival pulse, then just the box. */
const PULSE_MS = 4200;
/** Escalated text scans a lost element gets before the pin stops looking. */
const MAX_MISSED_SCANS = 3;
/** 10 s of SPA boot at 500 ms — the login form is lazy behind the splash. */
const ANCHOR_TRIES = 20;
const ANCHOR_EVERY_MS = 500;

/** The edges of a rectangle the element may have left: viewport or scroller. */
interface Bounds {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

/** Which viewport edge a card docked to, so the layer can stack the column. */
type DockEdge = 'top' | 'bottom';

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
  /* Mid-pick the cards fold away; the markers are click-through already. */
  .card.collapsed { display: none; }
  .card .count {
    color: var(--bai-review-text-dim); font-size: 11px; font-weight: 600;
    margin-bottom: 4px; padding-right: 62px;
  }
  .card .count:empty { display: none; }
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

export interface PinLayerOptions {
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
  onLocated?: (
    element: Element | null,
    target: DeepLinkPinTarget | null,
  ) => void;
  /** The reviewer pressed ✕; whoever owns the set decides what that means. */
  onDismiss?: (target: DeepLinkPinTarget) => void;
}

/** The one-view layer `main.ts` opened a link with before pin sets. */
export type DeepLinkPinOptions = PinLayerOptions;

export interface DeepLinkPinTarget {
  id: string;
  anchor: AnchorV3;
  /** The link's own anchor payload, so a copy can rebuild the link itself. */
  anchorB64: string;
  /** `<route> › <landmark> › <tag "quoted text">` from the block. */
  label: string;
  /**
   * Zero-based place in the SET, when only part of one is drawn — a set that
   * spans pages leaves its off-page members to the dock, and pin 3 of 5 still
   * has to say 3.
   */
  index?: number;
}

interface ViewDeps {
  host: Element;
  copyText: PinLayerOptions['copyText'];
  showToast: PinLayerOptions['showToast'];
  buildComment: PinLayerOptions['buildComment'];
  onLocated?: PinLayerOptions['onLocated'];
  onDismiss?: PinLayerOptions['onDismiss'];
  /** One layout read per frame, however many views ask for one. */
  placeSoon: () => void;
  /** A smooth scroll ends after `locate()` returns; follow it to its stop. */
  followScroll: () => void;
}

interface PinView {
  /** Marker, box and card, for the layer to mount and unmount. */
  readonly nodes: Element[];
  /** The card itself, so the layer can stack the docked column. */
  readonly card: HTMLElement;
  id(): string;
  show(next: DeepLinkPinTarget): void;
  /**
   * Set order, for the marker glyph and the `3 / 5` header; `null` for a pin
   * the set does not hold.
   */
  setOrdinal(index: number | null, total: number): void;
  setCollapsed(collapsed: boolean): void;
  /** The edge the card docked to, or null while it is anchored or hidden. */
  place(): DockEdge | null;
  locate(focus: boolean): boolean;
  reposition(): void;
  dismiss(): void;
  isShowing(): boolean;
  /** False for a drawn pin the set does not count, e.g. a link's. */
  isMember(): boolean;
  /** Already this pin, payload and all — nothing to re-adopt. */
  holds(next: DeepLinkPinTarget): boolean;
  isLocated(): boolean;
  locatedElement(): Element | null;
  dispose(): void;
}

function createPinView(deps: ViewDeps): PinView {
  const { host } = deps;
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
  const count = document.createElement('div');
  count.className = 'count';
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
  card.append(
    close,
    locateButton,
    commentCopy,
    count,
    away,
    note,
    trunc,
    label,
    sub,
  );
  const markBox = document.createElement('div');
  markBox.className = 'markbox';

  let target: DeepLinkPinTarget | null = null;
  let located: Element | null = null;
  /** Ancestors that can hide the element without moving its own rect. */
  let clippers: Element[] = [];
  /** Escalated scans in a row that found nothing — the page moved on. */
  let missedScans = 0;
  /** False for a pin the set does not hold: it stays a lone 📍. */
  let member = true;
  /** One arrival pulse per link — the box is what stays. */
  let pulsed = false;
  let pulseTimer = 0;
  /** Folded away for a pick: a hidden card measures 0 high, so it is not moved. */
  let collapsed = false;

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
    if (moved) deps.onLocated?.(node, target);
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

  /**
   * The card as it will be shown. Read only after `found` is on and the text
   * is written, or it measures a hidden box. jsdom reports 0 for every layout
   * value, so the cap stands in and keeps the clamps meaningful there.
   */
  const cardWidth = () => card.offsetWidth || CARD_MAX_WIDTH;
  /** The rightmost `left` that still leaves the card's shadow room to draw. */
  const rightEdge = () =>
    Math.max(VIEWPORT_PAD, window.innerWidth - cardWidth() - VIEWPORT_PAD);

  function hide(): null {
    marker.classList.remove('found');
    card.classList.remove('found');
    card.classList.remove('away');
    markBox.classList.remove('found');
    away.textContent = '';
    return null;
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
  function placeAway(box: DOMRect, area: Bounds, vh: number): DockEdge {
    marker.classList.remove('found');
    markBox.classList.remove('found');
    card.classList.add('found');
    card.classList.add('away');
    const up = box.bottom <= area.top;
    const down = box.top >= area.bottom;
    // `placeAway` runs only when the element is outside `area` on one of the
    // four sides, so failing the other three leaves exactly "past the right".
    const left = box.right <= area.left;
    // Written BEFORE the measurement: the hint is a line of the card, so a
    // height read without it docks a bottom-docked card past the fold.
    away.textContent = up
      ? '↑ Scrolled above — 📍 goes back'
      : down
        ? '↓ Scrolled below — 📍 goes back'
        : left
          ? '← Scrolled to the left — 📍 goes back'
          : '→ Scrolled to the right — 📍 goes back';
    if (collapsed) return up ? 'top' : 'bottom';
    // A horizontal departure docks to a horizontal edge. Clamping `box.left`
    // would leave the card mid-screen whenever a scroller — not the window —
    // is what took the element sideways, with an arrow pointing nowhere.
    // Measured, not assumed: `.card` is `width: auto`, so a short comment is
    // far narrower than the cap and an assumed width would not reach the edge.
    card.style.left =
      up || down
        ? `${Math.max(VIEWPORT_PAD, Math.min(box.left, rightEdge()))}px`
        : `${left ? VIEWPORT_PAD : rightEdge()}px`;
    card.style.top = up
      ? `${VIEWPORT_PAD}px`
      : `${Math.max(VIEWPORT_PAD, vh - card.offsetHeight - VIEWPORT_PAD)}px`;
    return up ? 'top' : 'bottom';
  }

  function place(): DockEdge | null {
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
    if (measured && gone) return placeAway(box, gone, vh);
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
    // A folded card measures 0 high, which would place it past the fold;
    // `setCollapsed(false)` re-places it with a height to read.
    if (collapsed) return null;
    card.style.left = `${Math.max(VIEWPORT_PAD, Math.min(box.left, rightEdge()))}px`;
    // `locate()` centres the element, so anything taller than half the
    // viewport puts `box.bottom` below the fold — and a fixed layer cannot be
    // scrolled to. Flip above, then clamp.
    const height = card.offsetHeight;
    const below = box.bottom + CARD_GAP;
    const top =
      below + height <= vh - VIEWPORT_PAD ? below : box.top - CARD_GAP - height;
    card.style.top = `${Math.max(VIEWPORT_PAD, Math.min(top, vh - height - VIEWPORT_PAD))}px`;
    return null;
  }

  /** The cheap ladder settled for the container of the element it wants. */
  const isLandmarkFallback = (element: Element) =>
    !!target?.anchor.tid &&
    !!target.anchor.rect &&
    element.getAttribute('data-testid') === target.anchor.tid;

  /**
   * Cheap first — it runs on every mutation batch — but a target the text scan
   * resolved cannot be re-found by the selector/landmark step, and a re-render
   * would either lose the pin or slide it onto the landmark. Debounced by the
   * layer, so the expensive scan runs at most once per settle, and budgeted,
   * so a page the reviewer has navigated away from stops paying for it.
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
  }

  locateButton.addEventListener('click', () =>
    located?.scrollIntoView?.({ block: 'center', behavior: 'smooth' }),
  );
  close.addEventListener('click', () => {
    const dismissed = target;
    dismiss();
    if (dismissed) deps.onDismiss?.(dismissed);
  });

  function write(text: string, html: string | undefined, ok: string) {
    const done = (written: boolean) =>
      deps.showToast(
        written ? ok : 'Could not reach the clipboard — try again',
      );
    const copied = deps.copyText(text, html);
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
    const payload = deps.buildComment(target);
    if (!payload) {
      deps.showToast('Still reading this element — try again');
      return;
    }
    write(
      payload.text,
      payload.html,
      // The link caps the note it carries, and a copy that quietly loses the
      // rest is worse than one that says so — unless the payload says better.
      payload.toast ??
        (target.anchor.nt === 1
          ? 'Copied — the note is the shortened one the link carries 📋'
          : 'Copied the whole comment 📋'),
    );
  });

  function dismiss() {
    target = null;
    setLocated(null);
    missedScans = 0;
    place();
    // The docked column is one pin shorter now.
    deps.placeSoon();
  }

  return {
    nodes: [markBox, marker, card],
    card,
    id: () => target?.id ?? '',

    /** Adopt a link's anchor. Nothing is drawn until `locate()` finds it. */
    show(next: DeepLinkPinTarget) {
      dismiss();
      pulsed = false;
      clearTimeout(pulseTimer);
      marker.classList.remove('pulse');
      target = next;
      marker.dataset.pinId = next.id;
      card.dataset.pinId = next.id;
      markBox.dataset.pinId = next.id;
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

    // A set of one is what a single pin has always been — the 📍 glyph and no
    // header. Only a real set numbers itself; `null` is not a member of one.
    setOrdinal(index: number | null, total: number) {
      member = index !== null;
      const numbered = index !== null && total > 1;
      head.textContent = numbered ? String(index + 1) : '📍';
      count.textContent = numbered ? `${index + 1} / ${total}` : '';
    },

    setCollapsed(next: boolean) {
      collapsed = next;
      card.classList.toggle('collapsed', next);
    },

    place,
    reposition,

    /**
     * One attempt at the full resolution ladder. True once the element is on
     * the page — which is when the pin and its box appear. Only the focus pin
     * scrolls the page to itself and pulses; the rest are drawn quietly.
     */
    locate(focus: boolean): boolean {
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
      if (!focus) return true;
      found.scrollIntoView?.({ block: 'center', behavior: 'smooth' });
      deps.followScroll();
      pulse();
      return true;
    },

    dismiss,
    isShowing: () => !!target,
    isMember: () => member,
    /** Same pin, same payload — nothing to re-adopt. */
    holds: (next: DeepLinkPinTarget) =>
      target?.id === next.id && target.anchorB64 === next.anchorB64,
    isLocated: () => !!located,
    locatedElement: () => located,

    dispose() {
      clearTimeout(pulseTimer);
      dismiss();
      for (const node of [markBox, marker, card]) node.remove();
    },
  };
}

export function createPinLayer(options: PinLayerOptions) {
  const { root, host, showToast } = options;
  const style = document.createElement('style');
  style.textContent = STYLE;
  const layer = document.createElement('div');
  layer.className = 'pinlayer';
  root.append(style, layer);

  const views: PinView[] = [];
  let collapsed = false;
  let focusId: string | null = null;
  /** False while the set is only being re-drawn: nothing scrolls, nothing pulses. */
  let autoFocus = true;
  let frame = 0;
  let settleUntil = 0;
  let timer = 0;
  let cancelRetry: () => void = () => undefined;

  /** Called, never aliased: a detached `requestAnimationFrame` throws. */
  const raf = (callback: FrameRequestCallback): number =>
    typeof requestAnimationFrame === 'function'
      ? requestAnimationFrame(callback)
      : window.setTimeout(() => callback(0), 16);

  /**
   * Away cards form a column at the edge they left by, in set order. The head
   * of the column keeps the geometry it placed itself at, so a set of one —
   * and the first card of any set — docks exactly where it always has.
   */
  function layoutDocked(docked: Array<{ card: HTMLElement; edge: DockEdge }>) {
    if (docked.length < 2) return;
    const vh = window.innerHeight;
    const run: Record<DockEdge, number> = { top: 0, bottom: 0 };
    for (const { card, edge } of docked) {
      const height = card.offsetHeight;
      if (run[edge])
        card.style.top =
          edge === 'top'
            ? `${VIEWPORT_PAD + run[edge]}px`
            : `${Math.max(VIEWPORT_PAD, vh - height - VIEWPORT_PAD - run[edge])}px`;
      run[edge] += height + DOCK_GAP;
    }
  }

  function placeAll() {
    const docked: Array<{ card: HTMLElement; edge: DockEdge }> = [];
    for (const view of views) {
      const edge = view.place();
      if (edge) docked.push({ card: view.card, edge });
    }
    // A folded column measures 0 high; it is stacked again on the way out.
    if (!collapsed) layoutDocked(docked);
  }

  /** One layout read per frame, however many scrollers report a scroll. */
  function placeSoon() {
    if (frame) return;
    frame = raf(() => {
      frame = 0;
      placeAll();
    });
  }

  /** A smooth scroll ends after `locate()` returns; follow it to its stop. */
  function followScroll() {
    const first = settleUntil === 0;
    settleUntil = Date.now() + SETTLE_MS;
    if (!first) return;
    const step = () => {
      placeAll();
      if (Date.now() >= settleUntil) {
        settleUntil = 0;
        return;
      }
      raf(step);
    };
    raf(step);
  }

  const deps: ViewDeps = {
    host,
    copyText: options.copyText,
    showToast,
    buildComment: options.buildComment,
    onLocated: options.onLocated,
    onDismiss: (target) => {
      renumber();
      options.onDismiss?.(target);
    },
    placeSoon,
    followScroll,
  };

  /** Views are reused BY POSITION, so a card the set keeps keeps its node. */
  function resize(count: number) {
    while (views.length > count) views.pop()?.dispose();
    while (views.length < count) {
      const view = createPinView(deps);
      view.setCollapsed(collapsed);
      layer.append(...view.nodes);
      views.push(view);
    }
  }

  const showingViews = () => views.filter((view) => view.isShowing());

  /** A set one pin shorter says so: the glyphs and the `n / N` heads move up. */
  function renumber() {
    const members = showingViews().filter((view) => view.isMember());
    for (const [index, view] of members.entries())
      view.setOrdinal(index, members.length);
  }

  function locateAll(skipLocated: boolean): boolean {
    const shown = showingViews();
    // A stored focus id can name a pin this set does not have; the set still
    // has to scroll somewhere.
    const focus = autoFocus
      ? (shown.find((view) => view.id() === focusId)?.id() ??
        shown[0]?.id() ??
        null)
      : null;
    let missing = 0;
    let landed = false;
    for (const view of shown) {
      if (skipLocated && view.isLocated()) continue;
      if (view.locate(view.id() === focus)) landed = true;
      else missing++;
    }
    // Each view placed itself; the column between them is the layer's to lay.
    if (landed) placeSoon();
    return missing === 0;
  }

  function stopRetry() {
    cancelRetry();
    cancelRetry = () => undefined;
  }

  /** N=1 says what the overlay has always said; a set counts itself instead. */
  function giveUp() {
    const shown = showingViews();
    const missing = shown.filter((view) => !view.isLocated()).length;
    if (!missing) return;
    showToast(
      shown.length === 1
        ? 'Could not find that element on this page'
        : `${missing} of ${shown.length} pins are not on this page`,
    );
  }

  /** One driver for the whole layer: every unlocated view, once per tick. */
  function startRetry() {
    stopRetry();
    if (!showingViews().length) return;
    cancelRetry = retryUntil(() => locateAll(true), {
      tries: ANCHOR_TRIES,
      everyMs: ANCHOR_EVERY_MS,
      onGiveUp: giveUp,
    });
  }

  function schedule() {
    clearTimeout(timer);
    timer = window.setTimeout(() => {
      for (const view of views) view.reposition();
      placeAll();
    }, REPOSITION_DEBOUNCE_MS);
  }

  const observer = new MutationObserver((records) => {
    if (!showingViews().length) return;
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

  return {
    /** Build this many cards up front, before any pin is adopted. */
    reserve: (count: number) => resize(Math.max(views.length, count)),

    /**
     * Draw exactly these pins, in set order, and start the one retry driver
     * that resolves whatever is not on the page yet. `focusId` names the pin
     * that scrolls and pulses; the first pin is the default, and an explicit
     * `null` is a re-draw — an authoring set must not move the page under the
     * reviewer every time they add a pin to it. `setSize` is how many of the
     * leading targets the SET holds; the rest are drawn as lone pins.
     */
    show(
      targets: DeepLinkPinTarget[],
      opts: { focusId?: string | null; setSize?: number } = {},
    ) {
      resize(targets.length);
      autoFocus = opts.focusId !== null;
      focusId = opts.focusId ?? targets[0]?.id ?? null;
      const size = opts.setSize ?? targets.length;
      // Only the pin this call focuses is re-adopted: the rest keep the
      // element `reposition()` may be holding through a re-render.
      const arriving =
        opts.focusId === undefined ? (targets[0]?.id ?? null) : opts.focusId;
      targets.forEach((target, index) => {
        const view = views[index];
        if (target.id === arriving || !view.holds(target)) view.show(target);
        const place = target.index ?? index;
        view.setOrdinal(place < size ? place : null, size);
      });
      startRetry();
    },

    /** One pass of the full ladder over every drawn pin. */
    locate: () => locateAll(false),

    /** No id dismisses every pin; the cards stay for the next set. */
    dismiss(id?: string) {
      for (const view of views)
        if (id === undefined || view.id() === id) view.dismiss();
      if (id === undefined || id === focusId) focusId = null;
      renumber();
      if (!showingViews().length) stopRetry();
    },

    /**
     * Mid-pick the cards are in the way of the next pick — the markers are
     * click-through already, so they stay and the cards fold away.
     */
    setCollapsed(next: boolean) {
      if (collapsed === next) return;
      collapsed = next;
      for (const view of views) view.setCollapsed(next);
      placeSoon();
    },

    ids: () => showingViews().map((view) => view.id()),
    isShowing: (id?: string) =>
      id === undefined
        ? showingViews().length > 0
        : showingViews().some((view) => view.id() === id),
    locatedElement: (id?: string) =>
      (id === undefined
        ? showingViews()[0]
        : views.find((view) => view.id() === id)
      )?.locatedElement() ?? null,

    /** One layer lives as long as the page; tests make one per case. */
    dispose() {
      observer.disconnect();
      window.removeEventListener('resize', placeSoon);
      window.removeEventListener('scroll', placeSoon, { capture: true });
      stopRetry();
      settleUntil = 0;
      clearTimeout(timer);
      resize(0);
      layer.remove();
      style.remove();
    },
  };
}

export type PinLayer = ReturnType<typeof createPinLayer>;

/**
 * A pin set of one, with the surface `pin.test.ts` has always called: the card
 * exists from construction and `show` re-targets it in place.
 */
export function createDeepLinkPin(options: DeepLinkPinOptions) {
  const layer = createPinLayer(options);
  layer.reserve(1);
  return {
    show: (next: DeepLinkPinTarget) => layer.show([next]),
    locate: () => layer.locate(),
    dismiss: () => layer.dismiss(),
    isShowing: () => layer.isShowing(),
    locatedElement: () => layer.locatedElement(),
    dispose: () => layer.dispose(),
  };
}

export type DeepLinkPin = ReturnType<typeof createDeepLinkPin>;
