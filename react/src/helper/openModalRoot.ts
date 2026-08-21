/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { BAI_MODAL_OPEN_ATTRIBUTE } from 'backend.ai-ui';

// A `BAIDialog` root, or any open native `<dialog>` — after FR-3578 that
// is drawers, plus anything opened with `.show()`.
const OPEN_MODAL_ROOTS = [
  `[${BAI_MODAL_OPEN_ATTRIBUTE}]`,
  'dialog[open]',
] as const;

export const OPEN_MODAL_ROOT_SELECTOR = OPEN_MODAL_ROOTS.join(', ');

/**
 * First match inside an open modal root, topmost root first — portals append
 * to `body`, so document order puts the covered (`inert`) root first.
 * Takes the selector, not a built string, so it stays scoped to each root.
 */
export const queryWithinOpenModal = <T extends HTMLElement>(
  selector: string,
): T | null => {
  const roots = Array.from(
    document.querySelectorAll(OPEN_MODAL_ROOT_SELECTOR),
  ).reverse();
  for (const root of roots) {
    const match = root.querySelector<T>(selector);
    if (match) return match;
  }
  return null;
};
