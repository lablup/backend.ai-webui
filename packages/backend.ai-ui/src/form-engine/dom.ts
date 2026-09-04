/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */

/** `checkVisibility` where the browser has it; jsdom falls back to markup. */
export function isVisible(el: HTMLElement): boolean {
  if (typeof el.checkVisibility === 'function') return el.checkVisibility();
  for (let node: HTMLElement | null = el; node; node = node.parentElement) {
    if (node.hidden || node.style.display === 'none') return false;
  }
  return true;
}
