/**
 * Where the overlay reads its server state (FR-3880).
 *
 * A dev server answers `/__review/state`. A STATIC build — the nightly
 * Amplify deployment — has no such endpoint, and Amplify rewrites every
 * unknown path to `index.html` with a 200, so the fetch would not even fail:
 * it would resolve to an HTML parse error on every boot. The build plugin
 * embeds the state in the document as a JSON data block, read synchronously
 * here, and that is also what tells the client react-grab is never coming.
 */
import type { ReviewServerState } from './types.js';

/** The `<script type="application/json">` the build plugin writes. */
export const STATE_ELEMENT_ID = 'bai-review-state';

/** `null` on a dev server, whose document carries no such block. */
export function readEmbeddedState(): ReviewServerState | null {
  const text = document.getElementById(STATE_ELEMENT_ID)?.textContent;
  if (!text) return null;
  try {
    const parsed: unknown = JSON.parse(text);
    return parsed && typeof parsed === 'object'
      ? (parsed as ReviewServerState)
      : null;
  } catch {
    return null;
  }
}

/** A failed fetch leaves the state unknown; the block is still usable. */
export function fetchServerState(): Promise<ReviewServerState | null> {
  return fetch('/__review/state')
    .then((response) => response.json() as Promise<ReviewServerState>)
    .catch(() => null);
}
