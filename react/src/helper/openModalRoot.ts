/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
*/
import { BAI_MODAL_OPEN_ATTRIBUTE } from 'backend.ai-ui';

// A portal root (`BAIDialog`, the `BAIModal` app launcher among them, and
// `BAIDrawerPortal` since FR-3585), or an open native `<dialog>` that is
// actually MODAL. `[aria-modal="true"]` stands in for `:modal` (jsdom cannot
// match it) and keeps the non-scrim `show()` drawers out — an open
// notification drawer must not suppress its own `]` toggle (FR-3619).
// `:not([inert])` drops the roots the level stack covered.
const OPEN_MODAL_ROOTS = [
  `[${BAI_MODAL_OPEN_ATTRIBUTE}]:not([inert])`,
  'dialog[open][aria-modal="true"]:not([inert])',
] as const;

export const OPEN_MODAL_ROOT_SELECTOR = OPEN_MODAL_ROOTS.join(', ');

/**
 * First match inside a reachable open modal root, the last such root first —
 * portals append to `body`, so a modal opened later sits later in the document.
 * Takes the selector, not a built string, so it stays scoped to each root.
 */
export const queryWithinOpenModal = <T extends HTMLElement>(
  selector: string,
): T | null => {
  const roots = document.querySelectorAll(OPEN_MODAL_ROOT_SELECTOR);
  for (let i = roots.length - 1; i >= 0; i--) {
    const match = roots[i].querySelector<T>(selector);
    if (match) return match;
  }
  return null;
};
