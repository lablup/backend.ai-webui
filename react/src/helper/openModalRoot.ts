/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { BAI_MODAL_OPEN_ATTRIBUTE } from 'backend.ai-ui';

// A `BAIDialogPortal` root, or any open native `<dialog>` — after FR-3578 that
// is drawers, plus anything opened with `.show()`.
const OPEN_MODAL_ROOTS = [
  `[${BAI_MODAL_OPEN_ATTRIBUTE}]`,
  'dialog[open]',
] as const;

export const OPEN_MODAL_ROOT_SELECTOR = OPEN_MODAL_ROOTS.join(', ');

/**
 * First match inside an open modal root, roots scanned in document order.
 * Takes the selector, not a built string, so it stays scoped to each root.
 */
export const queryWithinOpenModal = <T extends HTMLElement>(
  selector: string,
): T | null => {
  for (const root of document.querySelectorAll(OPEN_MODAL_ROOT_SELECTOR)) {
    const match = root.querySelector<T>(selector);
    if (match) return match;
  }
  return null;
};
