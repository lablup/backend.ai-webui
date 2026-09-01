/**
 * The six pin states (R3.6) and the "is this pin about the page I am on?"
 * question the panel and the pin layer both ask.
 */
import type { AnchorV3, PinState, ReviewPin } from './types.js';

export interface PinPlacement {
  /** An element on this page currently matches the anchor. */
  located: boolean;
  /** The anchor names this page at all. */
  onPage: boolean;
}

/**
 * Conversation state first, placement last: `orphan` says "the UI moved under
 * this pin", which matters less than "somebody answered you and is waiting".
 */
export function deriveState(pin: ReviewPin, placement: PinPlacement): PinState {
  if (pin.resolved) return 'resolved';
  if (pin.outdated) return 'outdated';
  if (pin.replyCount > 0) return 'replied';
  if (pin.hint) return 'hint';
  if (placement.onPage && !placement.located) return 'orphan';
  return 'open';
}

/** The query is reproduced on a jump, but it does not decide the page. */
export function onCurrentPage(
  anchor: AnchorV3 | null,
  location: { pathname: string; search: string },
): boolean {
  return !!anchor && anchor.p === location.pathname;
}
