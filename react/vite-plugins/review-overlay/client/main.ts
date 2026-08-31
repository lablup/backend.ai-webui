/**
 * Dev review overlay — write side (FR-3811).
 *
 * Pick an element with react-grab (⌘⌃C or the dock button), type a note, press
 * ⌘⏎: a self-describing `#bai=v3` markdown block lands on the clipboard, ready
 * to paste into a GitHub PR comment, the PR's Teams thread, or a Claude
 * prompt. Reading those blocks back and drawing pins is FR-3813.
 */
import { captureAnchorSignals } from './anchor.js';
import {
  buildBlockFromCapture,
  captureForBlock,
  landmarkLabel,
  resolveRouteLabel,
  type AnchorCapture,
} from './block.js';
import { createPicker } from './picker.js';
import type { AnchorV3, ReviewServerState } from './types.js';
import { createOverlayUI } from './ui.js';

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
}
