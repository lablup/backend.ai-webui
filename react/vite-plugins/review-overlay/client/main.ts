/**
 * Dev review overlay (FR-3811 write side, FR-3813 read side).
 *
 * Pick an element with react-grab (⌘⌃C or the dock button), type a note, press
 * ⌘⏎: a self-describing `#bai=v3` markdown block lands on the clipboard. Every
 * such block already pasted on the served PRs comes back from
 * `/__review/pins` as a numbered pin on the element it was picked from, and
 * opening the block's link lands on that element.
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
import { createPinPanel } from './panel.js';
import { createPicker } from './picker.js';
import { createPoller } from './poll.js';
import type {
  AnchorV3,
  ReviewPinsPayload,
  ReviewServerState,
} from './types.js';
import { createOverlayUI } from './ui.js';

/** The SPA's own `<Navigate replace>` redirects drop the fragment on login. */
const BOOT_HASH = location.hash;
/** 10 s of SPA boot at 500 ms — the login form is lazy behind the splash. */
const ANCHOR_TRIES = 20;
const ANCHOR_EVERY_MS = 500;
/** The fragment survives in-app navigation, so a link is followed once a tab. */
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
    onTogglePanel: () => panel.toggle(),
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

  // ------------------------------------------------------ pins (FR-3813)

  const poller = createPoller<ReviewPinsPayload>({
    load: async () => {
      const response = await fetch('/__review/pins');
      if (!response.ok) throw new Error(String(response.status));
      return response.json();
    },
    onPayload: (payload) => onPins(payload),
    onError: () => panel.setError('dev server unreachable'),
    // `fetchedAt` is new on every build, so it can never mean "changed".
    signatureOf: (payload) =>
      JSON.stringify({
        pins: payload.pins,
        served: payload.served,
        sources: payload.sources,
        error: payload.error,
      }),
  });

  const panel = createPinPanel({
    root: ui.root,
    host: ui.host,
    showToast: ui.showToast,
    copyText: ui.copyText,
    onCountChange: ui.setPinCount,
    onOpenChange: ui.setPanelOpen,
    onStartPick: () => picker.start(),
    onRefresh: () => poller.refreshNow(),
  });

  /** The deep link's id, until the payload that describes it arrives. */
  let pendingId: string | null = null;
  let navigatedForHash = false;
  let anchoredId: string | null = null;
  let cancelAnchorRetry = () => undefined as void;

  const anchorWithRetry = (id: string) => {
    if (anchoredId === id) return;
    anchoredId = id;
    cancelAnchorRetry();
    cancelAnchorRetry = retryUntil(
      () => !!panel.locatePin(id, { full: true, quiet: true, highlight: true }),
      {
        tries: ANCHOR_TRIES,
        everyMs: ANCHOR_EVERY_MS,
        onGiveUp: () =>
          ui.showToast('Could not find that element — the pin is in the panel'),
      },
    );
  };

  function onPins(payload: ReviewPinsPayload) {
    panel.applyPayload(payload);
    if (!pendingId || !panel.has(pendingId)) return;
    const id = pendingId;
    pendingId = null;
    const entry = panel.get(id);
    const anchor = entry?.anchor ?? null;
    // The short form learns its page only now, so the jump happens here — and
    // it is the same jump the full form makes: path AND query (R3.3).
    if (anchor && pathNeedsChange(anchor, location)) {
      if (!navigatedForHash && !appliedHere(id)) {
        navigatedForHash = true;
        location.assign(pinUrl(anchor, id, entry?.pin.anchorB64 ?? null));
        return;
      }
      panel.revealItem(id);
      return;
    }
    panel.revealItem(id);
    if (anchor) {
      rememberApplied(id);
      anchorWithRetry(id);
    }
  }

  async function applyFragment(hash: string) {
    const fragment = parseFragment(hash);
    if (!fragment) return;
    if (fragment.kind === 'legacy') {
      ui.showToast('That is an old #bai-review link — pick the element again');
      return;
    }
    pendingId = fragment.id;
    panel.open();
    if (fragment.anchorB64) {
      const anchor = await decodeAnchor(fragment.anchorB64);
      // The link is a stranger's: `decodeAnchor` checks `v`, `s` and `p`, the
      // rest of the payload reaches `querySelector` and the DOM unchecked.
      if (!anchor || !isAnchorV3(anchor)) {
        ui.showToast('Could not read the anchor in that link');
      } else if (pathNeedsChange(anchor, location)) {
        if (!navigatedForHash && !appliedHere(fragment.id)) {
          // Path and query first (R3.3): a full reload, because React Router
          // owns the history and re-running our boot is cheap.
          navigatedForHash = true;
          location.assign(pinUrl(anchor, fragment.id, fragment.anchorB64));
          return;
        }
        // Followed once in this tab already: show the pin in the panel rather
        // than pulling the reviewer back here on every later reload.
        panel.ensureProvisional(fragment.id, anchor, fragment.anchorB64);
        panel.revealItem(fragment.id);
      } else {
        rememberApplied(fragment.id);
        panel.ensureProvisional(fragment.id, anchor, fragment.anchorB64);
        anchorWithRetry(fragment.id);
      }
    } else {
      ui.showToast('Looking for this pin on the served PRs…');
    }
    poller.refreshNow();
  }

  window.addEventListener('hashchange', () => {
    navigatedForHash = false;
    anchoredId = null;
    void applyFragment(location.hash);
  });

  poller.start();
  void applyFragment(BOOT_HASH);
}
