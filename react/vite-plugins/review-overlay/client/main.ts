/**
 * Dev review overlay — write side (FR-3811).
 *
 * Pick an element with react-grab (⌘⌃C or the dock button), type a note, press
 * ⌘⏎: a self-describing `#bai=v3` markdown block lands on the clipboard, ready
 * to paste into a GitHub PR comment, the PR's Teams thread, or a Claude
 * prompt. Reading those blocks back and drawing pins is FR-3813.
 */
import { captureAnchorSignals } from './anchor.js';
import { buildBlock, landmarkLabel, resolveRouteLabel } from './block.js';
import { createPicker } from './picker.js';
import type { ReviewServerState } from './types.js';
import { createOverlayUI } from './ui.js';

declare global {
  interface Window {
    __baiReviewOverlay?: boolean;
  }
}

if (!window.__baiReviewOverlay) {
  window.__baiReviewOverlay = true;
  boot();
}

function boot() {
  let serverState: ReviewServerState | null = null;

  const ui = createOverlayUI({
    onStartPick: () => picker.start(),
    onCopy: async (text) => {
      const target = ui.getComposeTarget();
      if (!target) return;
      const { block } = await buildBlock({
        target,
        text,
        pr: serverState?.pr ?? 0,
        routeLabel: currentRouteLabel(),
        stack: await picker.getStack(target),
        component: await picker.getComponent(target),
      });
      const copied = await ui.copyText(block);
      ui.showToast(
        copied
          ? 'Copied — paste it into the PR comment, the Teams thread, or Claude 📋'
          : 'Could not reach the clipboard — copy the block from the console',
      );
      if (!copied) {
        // eslint-disable-next-line no-console
        console.log(block);
      }
    },
    onComposeClosed: () => picker.stop(),
    onEscape: () => picker.stop(),
  });

  const picker = createPicker({
    onPick: (element, x, y) => {
      ui.openCompose(element, x, y);
      ui.setComposeLabel(
        landmarkLabel(currentRouteLabel(), captureAnchorSignals(element)),
      );
      void picker.getStack(element).then((stack) => {
        if (ui.getComposeTarget() !== element || !stack.length) return;
        ui.appendComposeLabel(
          `\n⚛️ ${stack.map((line) => line.trim()).join('\n')}`,
        );
      });
    },
    onModeChange: (active) => ui.setPickActive(active),
    onHover: (rect) => ui.setHoverRect(rect),
    isOwnEvent: (evt) => ui.isOwnEvent(evt),
    showHint: (message) => ui.showToast(message),
  });

  /** The app publishes this in dev; without it the pathname is the label. */
  const currentRouteLabel = () =>
    resolveRouteLabel(location.pathname, window.__BAI_REVIEW__?.routeLabel);

  fetch('/__review/state')
    .then((response) => response.json())
    .then((state: ReviewServerState) => {
      serverState = state;
    })
    .catch(() => {
      /* the PR number stays 0; the block is still usable */
    });

  picker.watchForReactGrab();
}
