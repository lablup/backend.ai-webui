/**
 * Dev review overlay (FR-3811 write side, FR-3813 deep link).
 *
 * Pick an element with react-grab (⌘⌃C or the dock button), type a note, press
 * ⌘⏎: a self-describing `#bai=v3` markdown block lands on the clipboard, ready
 * to paste into a GitHub PR comment, the PR's Teams thread, or a Claude
 * prompt. Opening that block's link on this server is the read side: the hash
 * carries the whole anchor, so the element is pinned with no lookup at all.
 */
import { isAnchorV3 } from './anchor-guard.js';
import { captureAnchorSignals } from './anchor.js';
import {
  buildBlockFromCapture,
  captureForBlock,
  landmarkLabel,
  resolveRouteLabel,
  type AnchorCapture,
} from './block.js';
import { decodeAnchor } from './codec.js';
import {
  parseFragment,
  pathNeedsChange,
  pinUrl,
  retryUntil,
} from './deeplink.js';
import { createPicker } from './picker.js';
import { createDeepLinkPin } from './pin.js';
import type { AnchorV3, ReviewServerState } from './types.js';
import { createOverlayUI } from './ui.js';

/** The SPA's own `<Navigate replace>` redirects drop the fragment on login. */
const BOOT_HASH = location.hash;
/** 10 s of SPA boot at 500 ms — the login form is lazy behind the splash. */
const ANCHOR_TRIES = 20;
const ANCHOR_EVERY_MS = 500;
/** Survives the reload `location.assign` causes, so a redirect cannot loop. */
const APPLIED_KEY = 'bai-review-applied';

const appliedHere = (id: string): boolean => {
  try {
    return sessionStorage.getItem(APPLIED_KEY) === id;
  } catch {
    return false;
  }
};

const rememberApplied = (id: string) => {
  try {
    sessionStorage.setItem(APPLIED_KEY, id);
  } catch {
    // A tab with storage disabled just follows the link again.
  }
};

if (!window.__baiReviewOverlay) {
  window.__baiReviewOverlay = true;
  boot();
}

function boot() {
  let serverState: ReviewServerState | null = null;
  /**
   * The pick's async work, done the moment the reviewer picks — NOT when they
   * press ⌘⏎. `execCommand('copy')` is the only clipboard on the plain-http
   * gateway origin and it needs the user activation still to be live, so
   * nothing may be awaited between the gesture and the write.
   */
  let capture: { target: Element; value: AnchorCapture } | null = null;

  const ui = createOverlayUI({
    onStartPick: () => picker.start(),
    onBuildBlock: (text) => {
      const target = ui.getComposeTarget();
      if (!target || capture?.target !== target) return null;
      return buildBlockFromCapture(capture.value, {
        text,
        pr: serverState?.pr ?? 0,
        routeLabel: currentRouteLabel(),
      }).block;
    },
    onComposeClosed: () => {
      capture = null;
      picker.stop();
    },
    onEscape: () => picker.stop(),
  });

  const picker = createPicker({
    onPick: (element, x, y) => {
      capture = null;
      ui.openCompose(element, x, y);
      // One capture per pick: the label, the anchor payload and the rect all
      // come from this single walk, measured while the page still looks the
      // way the reviewer saw it.
      const anchor = captureAnchorSignals(element);
      ui.setComposeLabel(landmarkLabel(currentRouteLabel(), anchor));
      void prepare(element, anchor);
    },
    onModeChange: (active) => ui.setPickActive(active),
    onHover: (rect) => ui.setHoverRect(rect),
    isOwnEvent: (evt) => ui.isOwnEvent(evt),
    showHint: (message) => ui.showToast(message),
    onReactGrabUnavailable: () => ui.pinDock(),
  });

  async function prepare(element: Element, anchor: AnchorV3) {
    const [stack, component] = await Promise.all([
      picker.getStack(element),
      picker.getComponent(element),
    ]);
    const prepared = await captureForBlock(anchor, stack, component);
    if (ui.getComposeTarget() !== element) return;
    capture = { target: element, value: prepared };
    ui.setComposeReady(true);
    if (stack.length) {
      ui.appendComposeLabel(
        `\n⚛️ ${stack.map((line) => line.trim()).join('\n')}`,
      );
    }
  }

  /** The app publishes this in dev; without it the pathname is the label. */
  const currentRouteLabel = () =>
    resolveRouteLabel(location.pathname, window.__BAI_REVIEW__?.routeLabel);

  fetch('/__review/state')
    .then((response) => response.json())
    .then((state: ReviewServerState) => {
      serverState = state;
    })
    .catch(() => {
      // The PR number stays 0; the block is still usable.
      return undefined;
    });

  picker.watchForReactGrab();

  // ------------------------------------------------- deep link (FR-3813)

  const pin = createDeepLinkPin({ root: ui.root, host: ui.host });
  let cancelRetry = () => undefined as void;
  let navigated = false;

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
      if (!navigated && !appliedHere(fragment.id)) {
        // Path and query first (R3.3): a full reload, because React Router
        // owns the history and re-running our boot is cheap.
        navigated = true;
        location.assign(pinUrl(anchor, fragment.id, fragment.anchorB64));
        return;
      }
      // The app moved us off that page — pin what is here rather than fight it.
    }
    rememberApplied(fragment.id);
    cancelRetry();
    pin.show({
      id: fragment.id,
      anchor,
      label: landmarkLabel(currentRouteLabel(), anchor),
    });
    cancelRetry = retryUntil(() => pin.locate(), {
      tries: ANCHOR_TRIES,
      everyMs: ANCHOR_EVERY_MS,
      onGiveUp: () => ui.showToast('Could not find that element on this page'),
    });
  }

  window.addEventListener('hashchange', () => {
    navigated = false;
    void applyFragment(location.hash);
  });

  void applyFragment(BOOT_HASH);
}
