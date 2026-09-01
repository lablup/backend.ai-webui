/**
 * `#bai=v3` deep links (R3.3, R3.6): read the fragment, apply path and query
 * first, then anchor with a retry ladder while the SPA renders.
 */
import { isSafePath, PIN_BODY_SRC } from './codec.js';
import type { AnchorV3 } from './types.js';

/** `[#&]` because the pin can ride inside a fragment the app already uses. */
const HASH_RE = new RegExp(`[#&]bai=v3\\.${PIN_BODY_SRC}`);
/** v1/v2 links are not carried forward — recognised only to say so. */
const LEGACY_RE = /[#&]bai-review=/;

export type Fragment =
  | { kind: 'v3'; id: string; anchorB64: string | null }
  | { kind: 'legacy' }
  | null;

export function parseFragment(hash: string): Fragment {
  const match = HASH_RE.exec(hash || '');
  if (match) return { kind: 'v3', id: match[1], anchorB64: match[2] ?? null };
  return LEGACY_RE.test(hash || '') ? { kind: 'legacy' } : null;
}

/** Path AND query, so a filtered list or a tab reproduces (R3.3). */
export function pathNeedsChange(
  anchor: AnchorV3,
  location: { pathname: string; search: string },
): boolean {
  if (!isSafePath(anchor.p)) return false;
  const want = anchor.q ? `?${anchor.q}` : '';
  return anchor.p !== location.pathname || want !== location.search;
}

export function pinUrl(
  anchor: AnchorV3,
  id: string,
  anchorB64: string | null,
): string {
  const query = anchor.q ? `?${anchor.q}` : '';
  return `${anchor.p}${query}#bai=v3.${id}${anchorB64 ? `.${anchorB64}` : ''}`;
}

export interface RetryOptions {
  tries: number;
  everyMs: number;
  onGiveUp?: () => void;
}

/**
 * The overlay script runs before React mounts, and the login form is lazy
 * behind a Suspense splash, so the first attempt at a cold-boot deep link
 * always fails. Returns a cancel function.
 */
export function retryUntil(
  attempt: () => boolean,
  { tries, everyMs, onGiveUp }: RetryOptions,
): () => void {
  let left = tries;
  let timer = 0;
  let cancelled = false;
  const run = () => {
    if (cancelled) return;
    if (attempt()) return;
    if (--left <= 0) {
      onGiveUp?.();
      return;
    }
    timer = window.setTimeout(run, everyMs);
  };
  run();
  return () => {
    cancelled = true;
    clearTimeout(timer);
  };
}
