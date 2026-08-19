/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { BAI_MODAL_OPEN_ATTRIBUTE } from 'backend.ai-ui';

// A portal root (`BAIDialogPortal`, the `BAIModal` app launcher among them, and
// `BAIDrawerPortal` since FR-3585), or an open native `<dialog>` — which since
// FR-3585 is only the two non-scrim drawers. Tours are popovers, not dialogs.
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
