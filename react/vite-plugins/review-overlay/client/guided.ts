/**
 * GUIDED MODE (FR-3950): walking a walkthrough's stops.
 *
 * A `#bai=v3` link whose parts are all STOPS is not a reviewer's pin set — it
 * is the implementing session's tour of what it changed. It opens here instead
 * of merging into the draft set: marks on the elements, a navigator pill, one
 * popover for the stop the reader stands on, and the reviewer's own comments
 * gathered back into ordinary `bai-review` blocks.
 *
 * Composes `marks.ts`, `navigator.ts` and `popover.ts` over the set and the
 * progress `walkthrough.ts` holds. `main.ts` starts and stops it.
 */
import { blockStamp } from './block.js';
import { pathNeedsChange, pinSetUrlAt, retryUntil } from './deeplink.js';
import { createMarkLayer, type MarkSpec } from './marks.js';
import {
  createNavigator,
  type NavigatorGroup,
  type NavigatorModel,
} from './navigator.js';
import { isEditable } from './picker.js';
import {
  createPopover,
  type PopoverModel,
  type PopoverPlace,
} from './popover.js';
import { findAnchorTarget } from './resolve.js';
import type { ReviewServerState } from './types.js';
import {
  buildCommentCopy,
  codeHref,
  codeText,
  commentPin,
  createWalkthroughProgress,
  pageCount,
  pageSummaryText,
  repoUrl,
  stopPage,
  stopPageKey,
  viaSentence,
  walkthroughSha,
  type WalkthroughStop,
} from './walkthrough.js';

/** ~10 s of ladder after entry or a route change, as the pin layer runs. */
const LADDER_TRIES = 34;
const LADDER_EVERY_MS = 300;
const SETTLE_MS = 150;

const BANNER_STYLE = `
  .bai-banner {
    position: fixed; z-index: 2147483003; left: 50%; top: 8px;
    transform: translateX(-50%); max-width: 92vw; display: none;
    padding: 8px 12px; border-radius: 6px; font-size: 13px;
    border: 1px solid var(--bai-mod); background: var(--bai-pop-bg);
    color: var(--bai-pop-fg); box-shadow: 0 6px 20px var(--bai-review-shadow);
    pointer-events: none;
  }
  .bai-banner.shown { display: block; }
  .bai-banner.warn { border-color: var(--bai-del); }
  .bai-banner code { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; }
`;

type Place =
  | { kind: 'located'; element: Element }
  | { kind: 'waiting' }
  | { kind: 'away' };

export interface GuidedModeOptions {
  root: ShadowRoot;
  /** The overlay's shadow host — never a valid answer for a stop. */
  host: Element;
  stops: WalkthroughStop[];
  /** Read late: the state fetch may still have been in flight at entry. */
  serverState: () => ReviewServerState | null;
  copyWithToast: (payload: {
    text: string;
    html?: string;
    toast?: string;
  }) => void;
  showToast: (message: string) => void;
  /** True while the set dock occupies the bottom-right corner. */
  dockShown: () => boolean;
  /** The reader left the walkthrough; `main.ts` forgets the set. */
  onExit: () => void;
}

export function startGuidedMode(options: GuidedModeOptions) {
  const { root, host, stops } = options;
  const progress = createWalkthroughProgress(walkthroughSha(stops));
  const ids = stops.map((stop) => stop.id);
  const style = document.createElement('style');
  style.textContent = BANNER_STYLE;
  const banner = document.createElement('div');
  banner.className = 'bai-banner';
  root.append(style, banner);

  let current = 0;
  let popOpen = true;
  let panelOpen = false;
  let settleTimer = 0;
  let frame = 0;
  let cancelLadder: () => void = () => undefined;

  /** Called, never aliased: a detached `requestAnimationFrame` throws. */
  const raf = (callback: FrameRequestCallback): number =>
    typeof requestAnimationFrame === 'function'
      ? requestAnimationFrame(callback)
      : window.setTimeout(() => callback(0), 16);
  /** What the last resolution found, so a scroll re-places without re-resolving. */
  let found: Place[] = [];

  const servedPr = () => options.serverState()?.pr ?? 0;
  const flushProgress = () => progress.flush();
  const stopType = (stop: WalkthroughStop): 'added' | 'modified' =>
    stop.anchor.type === 'added' ? 'added' : 'modified';

  function place(stop: WalkthroughStop): Place {
    if (pathNeedsChange(stop.anchor, location)) return { kind: 'away' };
    const element = findAnchorTarget(stop.anchor, { ignore: host });
    return element ? { kind: 'located', element } : { kind: 'waiting' };
  }

  const marks = createMarkLayer({
    root,
    onSelect: (id) => go(ids.indexOf(id), false),
  });
  const nav = createNavigator(root, {
    onNext: () => go(current + 1),
    onPrev: () => go(current - 1),
    onTogglePanel: () => {
      panelOpen = !panelOpen;
      refresh();
    },
    onCopyComments: copyComments,
    onCopySummary: copySummary,
    onGo: (index) => go(index),
    onExit: exit,
  });
  const pop = createPopover(root, {
    onToggleViewed: (viewed) => {
      progress.setViewed(stops[current].id, viewed);
      refresh();
    },
    onComment: (text) => {
      const stop = stops[current];
      if (!stop) return;
      const before = progress.commented(ids).length;
      progress.setComment(stop.id, text);
      // Every keystroke, and nothing on screen says the text — only whether
      // there IS text. Re-render on the flip, not on the typing. Never the
      // popover: the reader has the caret in it.
      if (before === progress.commented(ids).length) return;
      renderMarks(found);
      nav.render(navModel(found));
    },
    onCopyRef: copyRef,
    onClose: () => {
      popOpen = false;
      refresh();
    },
  });

  // --------------------------------------------------------------- render

  const places = (): Place[] => stops.map(place);

  function renderMarks(where: Place[]) {
    const specs: MarkSpec[] = [];
    stops.forEach((stop, index) => {
      const at = where[index];
      if (at.kind !== 'located') return;
      specs.push({
        id: stop.id,
        index,
        total: stops.length,
        label: stop.label,
        type: stopType(stop),
        element: at.element,
        viewed: progress.isViewed(stop.id),
        commented: !!progress.comment(stop.id).trim(),
        current: index === current,
      });
    });
    marks.render(specs);
  }

  const stateText = (id: string): string =>
    [
      progress.isViewed(id) ? '✓ viewed' : '',
      progress.comment(id).trim() ? '✎ comment' : '',
    ]
      .filter(Boolean)
      .join(' · ');

  function groups(): NavigatorGroup[] {
    const byPage = new Map<string, NavigatorGroup>();
    stops.forEach((stop, index) => {
      const key = stopPageKey(stop);
      const group = byPage.get(key) ?? { page: stopPage(stop), items: [] };
      group.items.push({
        index,
        type: stopType(stop),
        text: stop.label.split(' › ').slice(1).join(' › ') || stop.label,
        state: stateText(stop.id),
        commented: !!progress.comment(stop.id).trim(),
        current: index === current,
      });
      byPage.set(key, group);
    });
    return [...byPage.values()];
  }

  function navModel(where: Place[]): NavigatorModel {
    return {
      dodge: options.dockShown(),
      pages: pageCount(stops),
      total: stops.length,
      index: current,
      viewed: progress.viewedCount(ids),
      comments: progress.commented(ids).length,
      waiting: where[current]?.kind === 'waiting',
      panelOpen,
      pr: stops[current]?.anchor.pr ?? options.serverState()?.pr ?? null,
      groups: groups(),
    };
  }

  function popPlace(at: Place, stop: WalkthroughStop): PopoverPlace {
    if (at.kind === 'located') {
      const rect = at.element.getBoundingClientRect();
      return {
        kind: 'located',
        rect: { left: rect.left, top: rect.top, bottom: rect.bottom },
      };
    }
    if (at.kind === 'waiting')
      return { kind: 'waiting', via: viaSentence(stop.anchor.via) };
    return { kind: 'away', page: stopPage(stop) };
  }

  function popModel(where: Place[]): PopoverModel | null {
    const stop = stops[current];
    if (!popOpen || !stop) return null;
    const base = repoUrl(options.serverState());
    const pr = stop.anchor.pr ?? servedPr();
    return {
      id: stop.id,
      index: current,
      total: stops.length,
      page: stopPage(stop),
      label: stop.label,
      type: stopType(stop),
      kind: stop.anchor.kind ?? '',
      changed: stop.anchor.ch ?? '',
      check: stop.anchor.ck ?? '',
      old: stop.anchor.old ?? '',
      next: stop.anchor.new ?? '',
      code: pr
        ? (stop.anchor.code ?? []).map((ref) => ({
            text: codeText(ref),
            href: codeHref(base, pr, ref),
          }))
        : [],
      comment: progress.comment(stop.id),
      viewed: progress.isViewed(stop.id),
      place: popPlace(where[current], stop),
    };
  }

  /** N on THIS page, and the head the walkthrough was minted for. */
  function renderBanner(where: Place[]) {
    const here = stops.filter((_, index) => where[index].kind !== 'away');
    if (!here.length) return banner.classList.remove('shown');
    const viewed = progress.viewedCount(here.map((stop) => stop.id));
    const sha = walkthroughSha(stops);
    const head = options.serverState()?.head ?? null;
    const stale =
      !!head &&
      sha !== 'nosha' &&
      stops.every((stop) => stop.anchor.sha !== head);
    const made =
      sha === 'nosha' ? '' : ` · made for <code>${sha.slice(0, 7)}</code>`;
    banner.innerHTML = stale
      ? `Walkthrough made for <code>${sha.slice(0, 7)}</code>, but this server serves <code>${head.slice(0, 7)}</code> — marks and code lines may have moved.`
      : `<b>${here.length} change${here.length === 1 ? '' : 's'}</b> on this page · ${viewed} viewed${made}`;
    banner.classList.toggle('warn', stale);
    banner.classList.add('shown');
  }

  /** One resolution pass, and everything that reads it. */
  function refresh(): boolean {
    found = places();
    renderMarks(found);
    nav.render(navModel(found));
    pop.render(popModel(found));
    renderBanner(found);
    // Every stop is drawn or on another page; nothing is still waiting.
    return found.every((where) => where.kind !== 'waiting');
  }

  // ------------------------------------------------------------ navigation

  /**
   * A stop behind a dialog or a step opens no URL, so the route watcher never
   * fires for it: the ladder keeps looking, and the DOM-settle observer picks
   * it up after that.
   */
  function ladder() {
    cancelLadder();
    cancelLadder = retryUntil(refresh, {
      tries: LADDER_TRIES,
      everyMs: LADDER_EVERY_MS,
    });
  }

  /**
   * A stop on another page: the app's own router first, so the walkthrough
   * keeps its state and the route watcher re-runs resolution. Only a document
   * that publishes no navigate falls back to a full reload of the set link.
   */
  function navigateTo(stop: WalkthroughStop): void {
    const query = stop.anchor.q ? `?${stop.anchor.q}` : '';
    const target = `${stop.anchor.p}${query}${stop.appHash ? `#${stop.appHash}` : ''}`;
    const navigate = window.__BAI_REVIEW__?.navigate;
    if (navigate) {
      try {
        navigate(target);
        return;
      } catch {
        // The app's router refused; the reload below still gets there.
      }
    }
    location.assign(pinSetUrlAt(stops, stop.id));
  }

  function go(index: number, follow = true): void {
    const stop = stops[index];
    if (!stop) return;
    current = index;
    popOpen = true;
    const where = place(stop);
    // The route watcher re-runs resolution after the navigation; this render is
    // the pill catching up to the new index while the page changes under it.
    if (follow && where.kind === 'away') navigateTo(stop);
    else if (where.kind === 'located')
      where.element.scrollIntoView?.({ block: 'center', behavior: 'smooth' });
    refresh();
  }

  // ---------------------------------------------------------------- copy

  function copyRef() {
    const stop = stops[current];
    if (!stop) return;
    const pin = commentPin(
      stop,
      current,
      progress.comment(stop.id),
      servedPr(),
      blockStamp(),
    );
    options.copyWithToast({
      ...buildCommentCopy([pin]),
      toast: `Copied the ref for stop ${current + 1}`,
    });
  }

  function copyComments() {
    const stamp = blockStamp();
    const pins = stops.flatMap((stop, index) => {
      const comment = progress.comment(stop.id).trim();
      return comment
        ? [commentPin(stop, index, comment, servedPr(), stamp)]
        : [];
    });
    if (!pins.length) return options.showToast('No comments to copy yet');
    options.copyWithToast(buildCommentCopy(pins));
  }

  function copySummary() {
    options.copyWithToast({
      text: pageSummaryText(stops, progress),
      toast: 'Copied the page summary',
    });
  }

  // -------------------------------------------------------------- events

  const typing = () => pop.isTyping() || isEditable(document.activeElement);

  /** The focused node, shadow or light — `document.activeElement` is our host. */
  const blurActive = () => {
    const node = root.activeElement ?? document.activeElement;
    if (node instanceof HTMLElement) node.blur();
  };

  function onKeydown(evt: KeyboardEvent) {
    if (evt.code === 'Escape') {
      if (typing()) return blurActive();
      if (!popOpen && !panelOpen) return;
      popOpen = false;
      panelOpen = false;
      refresh();
      return;
    }
    if (typing()) {
      if (evt.code === 'Enter' && (evt.metaKey || evt.ctrlKey)) blurActive();
      return;
    }
    if (evt.metaKey || evt.ctrlKey || evt.altKey) return;
    const stop = stops[current];
    if (!stop) return;
    if (evt.code === 'KeyN' || evt.code === 'BracketRight') go(current + 1);
    else if (evt.code === 'KeyP' || evt.code === 'BracketLeft') go(current - 1);
    else if (evt.code === 'KeyV') {
      const viewed = !progress.isViewed(stop.id);
      progress.setViewed(stop.id, viewed);
      refresh();
      options.showToast(viewed ? 'Marked viewed' : 'Viewed cleared');
    } else if (evt.code === 'KeyM') {
      popOpen = true;
      refresh();
      pop.focusComment();
    } else if (evt.code === 'KeyC') copyRef();
    else return;
    evt.preventDefault();
  }

  /**
   * A click outside the walkthrough's own chrome tidies it away — except while
   * the current stop is waiting: its `via` sentence asks for a click outside
   * the popover, and closing on that takes the instruction away at the moment
   * it is followed.
   */
  function onPointerDown(evt: Event) {
    if (!popOpen && !panelOpen) return;
    const path = evt.composedPath();
    if (path.some((node) => node instanceof Node && nav.contains(node))) return;
    if (path.some((node) => node instanceof Node && pop.contains(node))) return;
    panelOpen = false;
    if (found[current]?.kind !== 'waiting') popOpen = false;
    refresh();
  }

  function onSettle() {
    clearTimeout(settleTimer);
    settleTimer = window.setTimeout(refresh, SETTLE_MS);
  }

  /**
   * One layout pass per frame, however many scrollers report a scroll — the
   * shape `pin.ts` uses. The popover is re-placed, not re-rendered: rebuilding
   * its model hashes every code path's file name, and that is not scroll work.
   */
  function placeSoon() {
    if (frame) return;
    frame = raf(() => {
      frame = 0;
      marks.reposition();
      const stop = stops[current];
      if (stop) pop.reposition(popPlace(found[current], stop));
    });
  }

  const observer = new MutationObserver((records) => {
    // Our own chrome mutates on every render; reacting to it would not stop.
    if (records.every((record) => host.contains(record.target as Node))) return;
    onSettle();
  });
  observer.observe(document.body, { childList: true, subtree: true });
  // A reload beats the debounce by ~400 ms otherwise, and the comment the
  // reader had just typed is the one thing they cannot retype from the page.
  window.addEventListener('pagehide', flushProgress);
  document.addEventListener('keydown', onKeydown);
  document.addEventListener('mousedown', onPointerDown, true);
  window.addEventListener('resize', placeSoon);
  window.addEventListener('scroll', placeSoon, {
    capture: true,
    passive: true,
  });

  function exit() {
    destroy();
    options.onExit();
  }

  function destroy() {
    progress.flush();
    cancelLadder();
    clearTimeout(settleTimer);
    observer.disconnect();
    window.removeEventListener('pagehide', flushProgress);
    document.removeEventListener('keydown', onKeydown);
    document.removeEventListener('mousedown', onPointerDown, true);
    window.removeEventListener('resize', placeSoon);
    window.removeEventListener('scroll', placeSoon, true);
    marks.destroy();
    nav.destroy();
    pop.destroy();
    banner.remove();
    style.remove();
  }

  // The stop the reader lands on: the first one that belongs to THIS page, so
  // a link opened on page 2 does not start by pointing at page 1. `away` is
  // the only verdict that is final at t=0 — React has not mounted yet, so
  // every stop here still reads as `waiting`.
  const landed = places().findIndex((where) => where.kind !== 'away');
  current = landed < 0 ? 0 : landed;
  refresh();
  ladder();

  return {
    /** The route changed under us: re-resolve every stop from scratch. */
    onRoute() {
      refresh();
      ladder();
    },
    /**
     * The reviewer's own set grew or emptied. Nothing about the stops moved —
     * only which corner the dock is occupying — so only the pill is redrawn.
     */
    onDraftChange() {
      nav.render(navModel(found));
    },
    destroy,
  };
}

export type GuidedMode = ReturnType<typeof startGuidedMode>;
