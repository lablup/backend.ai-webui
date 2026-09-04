/**
 * Dev review overlay (FR-3811 write side, FR-3813 deep link).
 *
 * Pick an element with react-grab (⌘⌃C, or the same chord bound by the overlay
 * itself when react-grab is missing), type a note, press ⌘⏎: a self-describing
 * `#bai=v3` block lands on the clipboard as both markdown and HTML, so it
 * pastes right into a GitHub PR comment, the PR's Teams thread, or a Claude
 * prompt. Opening that block's link on this server is the read side: the hash
 * carries the whole anchor, so the element is pinned with no lookup at all.
 */
import { isAnchorV3 } from './anchor-guard.js';
import { captureAnchorSignals, withNote } from './anchor.js';
import {
  blockStamp,
  buildBlockFromCapture,
  buildBlockHtml,
  buildBlockText,
  captureForBlock,
  landmarkLabel,
  resolveRouteLabel,
  type AnchorCapture,
} from './block.js';
import { decodeAnchor } from './codec.js';
import {
  createNavigationGuard,
  parseFragment,
  pathNeedsChange,
  pinUrl,
} from './deeplink.js';
import { createPicker } from './picker.js';
import { createPinLayer, type DeepLinkPinTarget } from './pin.js';
import type {
  AnchorComponent,
  AnchorV3,
  CopyPayload,
  ReviewServerState,
} from './types.js';
import { createOverlayUI } from './ui.js';

/** The SPA's own `<Navigate replace>` redirects drop the fragment on login. */
const BOOT_HASH = location.hash;

if (!window.__baiReviewOverlay) {
  window.__baiReviewOverlay = true;
  boot();
}

function boot() {
  let serverState: ReviewServerState | null = null;
  /**
   * The pick's fiber walk, done once. The note is not part of it: it changes
   * while the reviewer types, and only the anchor has to be re-encoded.
   */
  let pick: {
    target: Element;
    anchor: AnchorV3;
    stack: string[];
    component?: AnchorComponent;
  } | null = null;
  /**
   * The encoded anchor for `note`, done the moment the reviewer picks and
   * again whenever they pause typing — NOT when they press ⌘⏎.
   * `execCommand('copy')` is the only clipboard on the plain-http gateway
   * origin and it needs the user activation still to be live, so nothing may
   * be awaited between the gesture and the write.
   */
  let capture: { target: Element; note: string; value: AnchorCapture } | null =
    null;
  /** Typing faster than `encodeAnchor` resolves; only the last one counts. */
  let encodeSeq = 0;
  let pickActive = false;
  /**
   * Drawn cards sit over the app, so the next pick would land on one. The
   * markers are click-through already; only the cards have to fold away.
   */
  const syncCollapse = () =>
    pins.setCollapsed(pickActive || ui.getComposeTarget() !== null);

  const ui = createOverlayUI({
    onBuildBlock: (text) => {
      const target = ui.getComposeTarget();
      if (!target || capture?.target !== target || capture.note !== text)
        return null;
      const built = buildBlockFromCapture(capture.value, {
        text,
        pr: serverState?.pr ?? 0,
        routeLabel: currentRouteLabel(),
      });
      return { text: built.block, html: built.html };
    },
    onNoteChanged: (text) => void encodeFor(text),
    onComposeClosed: () => {
      capture = null;
      pick = null;
      picker.stop();
      syncCollapse();
    },
    onEscape: () => picker.stop(),
  });

  const picker = createPicker({
    onPick: (element, x, y, region) => {
      capture = null;
      pick = null;
      ui.openCompose(element, x, y, region);
      syncCollapse();
      // One capture per pick: the label, the anchor payload and the rect all
      // come from this single walk, measured while the page still looks the
      // way the reviewer saw it.
      const anchor = captureAnchorSignals(element, undefined, region);
      ui.setComposeLabel(landmarkLabel(currentRouteLabel(), anchor));
      void prepare(element, anchor);
    },
    onModeChange: (active) => {
      pickActive = active;
      ui.setPickActive(active);
      syncCollapse();
    },
    onHover: (rect, borderRadius) => ui.setHoverRect(rect, borderRadius),
    isOwnEvent: (evt) => ui.isOwnEvent(evt),
    showHint: (message) => ui.showToast(message),
    sourceRoot: () => serverState?.root,
  });

  /**
   * `/__review/state` carries the repository root every source path is
   * relativized against, so the fetch is a gate, not a race: a pick that
   * outruns it would otherwise copy the driver's absolute worktree path.
   * A failed fetch leaves the root unknown, and `source-path.ts` then drops
   * the location rather than leaking it.
   */
  const stateReady = fetch('/__review/state')
    .then((response) => response.json())
    .then((state: ReviewServerState) => {
      serverState = state;
    })
    .catch(() => {
      // The PR number stays 0; the block is still usable.
      return undefined;
    });

  async function prepare(element: Element, anchor: AnchorV3) {
    await stateReady;
    if (ui.getComposeTarget() !== element) return;
    const [stack, component] = await Promise.all([
      picker.getStack(element),
      picker.getComponent(element),
    ]);
    if (ui.getComposeTarget() !== element) return;
    pick = { target: element, anchor, stack, component };
    // Whatever they have typed while the fiber walk ran, not the empty note
    // this pick started with.
    await encodeFor(ui.currentNote());
    if (stack.length) {
      ui.appendComposeLabel(
        `\n⚛️ ${stack.map((line) => line.trim()).join('\n')}`,
      );
    }
  }

  /**
   * Re-encode the anchor around the note. Async by nature (`CompressionStream`),
   * so the copy gesture only ever reads what this has already finished — the
   * copy button stays disabled for any text this has not caught up with.
   */
  async function encodeFor(note: string) {
    const state = pick;
    if (!state) return;
    const seq = ++encodeSeq;
    const prepared = await captureForBlock(
      withNote(state.anchor, note),
      state.stack,
      state.component,
    );
    if (seq !== encodeSeq || pick !== state) return;
    if (ui.getComposeTarget() !== state.target) return;
    capture = { target: state.target, note, value: prepared };
    ui.setComposeReady(true, note);
  }

  /** The app publishes this in dev; without it the pathname is the label. */
  const currentRouteLabel = () =>
    resolveRouteLabel(location.pathname, window.__BAI_REVIEW__?.routeLabel);

  // ------------------------------------------------- deep link (FR-3813)

  /** A pin that locates before react-grab registers, retried into a stack. */
  const STACK_TRIES = 8;
  const STACK_RETRY_MS = 500;
  /**
   * The ⚛️ stack the copied comment quotes. The anchor does not carry it — it
   * is re-read here, from the element this pin landed on, the same way the
   * composer read it when the comment was written.
   */
  let pinStack: string[] = [];
  let stackOf: Element | null = null;
  /** False until `pr` and the stack are both this element's — see `buildComment`. */
  let pinReady = false;

  async function readPinStack(element: Element | null) {
    stackOf = element;
    pinStack = [];
    pinReady = false;
    if (!element) return;
    // `pr` is part of the block, so the copy waits for the same gate the
    // composer waits for rather than writing `pr=0`.
    await stateReady;
    for (let left = STACK_TRIES; ; left--) {
      const stack = await picker.getStack(element);
      if (stackOf !== element) return;
      pinStack = stack;
      pinReady = true;
      // An empty stack is the answer once react-grab is there; before that it
      // only means the app has not finished booting.
      if (stack.length || left <= 0 || picker.hasReactGrab()) return;
      await new Promise((resolve) => setTimeout(resolve, STACK_RETRY_MS));
      if (stackOf !== element) return;
    }
  }

  /**
   * The comment this pin was written as, re-rendered here. The note, the label
   * and the link all come off the fragment, so they are the reviewer's own;
   * `pr` and `at` describe this copy, and the id is what carries the identity.
   * `null` while the element's own reads are still in flight — a block missing
   * its stack, or claiming `pr=0`, is not the comment that was written.
   */
  function buildComment(target: DeepLinkPinTarget): CopyPayload | null {
    if (!pinReady) return null;
    const input = {
      label: target.label,
      id: target.id,
      stack: pinStack,
      text: target.anchor.n ?? '',
      // The app's own fragment rides alongside the pin (`#tab=logs&bai=v3.…`),
      // and dropping it would reopen the page on a different tab.
      url: `${location.origin}${pinUrl(target.anchor, target.id, target.anchorB64, location.hash)}`,
      pr: serverState?.pr ?? 0,
      at: blockStamp(),
    };
    return { text: buildBlockText(input), html: buildBlockHtml(input) };
  }

  const pins = createPinLayer({
    root: ui.root,
    host: ui.host,
    copyText: ui.copyText,
    showToast: ui.showToast,
    buildComment,
    onLocated: (element) => void readPinStack(element),
  });
  // After the layer: registering the plugin can activate react-grab straight
  // away, and `syncCollapse` reaches `pins`.
  picker.watchForReactGrab();
  const guard = createNavigationGuard();

  /** The route the pin was made on, not the one the reader happens to be on. */
  const anchorRouteLabel = (anchor: AnchorV3) =>
    anchor.p === location.pathname
      ? currentRouteLabel()
      : resolveRouteLabel(anchor.p);

  async function applyFragment(hash: string) {
    const fragment = parseFragment(hash);
    if (!fragment) return;
    if (fragment.kind === 'legacy') {
      ui.showToast('That is an old #bai-review link — pick the element again');
      return;
    }
    const anchor = await decodeAnchor(fragment.anchorB64);
    // The link is a stranger's: `decodeAnchor` checks `v`, `s` and `p`, the
    // rest of the payload reaches `querySelector` and the DOM unchecked.
    if (!anchor || !isAnchorV3(anchor)) {
      ui.showToast('Could not read the anchor in that link');
      return;
    }
    if (pathNeedsChange(anchor, location)) {
      // The fragment this call was handed, not the live one: the SPA can
      // rewrite the hash while `decodeAnchor` is still in flight.
      const target = pinUrl(anchor, fragment.id, fragment.anchorB64, hash);
      if (guard.shouldNavigate(fragment.id, target)) {
        // Path and query first (R3.3): a full reload, because React Router
        // owns the history and re-running our boot is cheap.
        location.assign(target);
        return;
      }
      // The app moved us off that page — pin what is here rather than fight it.
    } else {
      guard.landed();
    }
    // The layer owns the retry ladder: one driver for however many pins the
    // link carried, and one give-up sentence for all of them.
    pins.show([
      {
        id: fragment.id,
        anchor,
        anchorB64: fragment.anchorB64,
        label: landmarkLabel(anchorRouteLabel(anchor), anchor),
      },
    ]);
  }

  window.addEventListener('hashchange', () => {
    guard.reset();
    void applyFragment(location.hash);
  });

  void applyFragment(BOOT_HASH);
}
