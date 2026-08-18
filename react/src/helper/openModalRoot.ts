/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { BAI_MODAL_OPEN_ATTRIBUTE } from 'backend.ai-ui';

// A `BAIDialogPortal` root, or any open native `<dialog>` — after FR-3578 that
// is drawers, plus anything opened with `.show()`. Only the drawer arm is app
// knowledge; the attribute comes from the component that writes it.
const OPEN_MODAL_ROOTS = [
  `[${BAI_MODAL_OPEN_ATTRIBUTE}]`,
  'dialog[open]',
] as const;

export const OPEN_MODAL_ROOT_SELECTOR = OPEN_MODAL_ROOTS.join(', ');

/**
 * First element matching `selector` inside an open modal root, scanning roots
 * in document order. Takes the selector rather than handing out a built string
 * so grouped selectors stay scoped and call sites do not reach for `document`.
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
