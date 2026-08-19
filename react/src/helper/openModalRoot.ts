/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
*/
import { BAI_MODAL_OPEN_ATTRIBUTE } from 'backend.ai-ui';

// A portal root (`BAIDialog`, and `BAIDrawerPortal` since FR-3585), or any
// open native `<dialog>` — tours, the launcher, non-scrim drawers.
// `:not([inert])` drops the roots the level stack covered, whose contents no
// one can reach.
const OPEN_MODAL_ROOTS = [
  `[${BAI_MODAL_OPEN_ATTRIBUTE}]:not([inert])`,
  'dialog[open]:not([inert])',
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
