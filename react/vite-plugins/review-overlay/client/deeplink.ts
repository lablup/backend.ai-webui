/**
 * `#bai=v3` deep links (R3.3, R3.6): read the fragment, apply path and query
 * first, then anchor with a retry ladder while the SPA renders.
 *
 * Only the self-contained `#bai=v3.<id>.<anchor>` form is a link. The id-only
 * form used to resolve against a pin list the dev server no longer serves, so
 * a link without an anchor is plain text now — never an error.
 */
import { isSafePath, PIN_BODY_SRC } from './codec.js';
import type { AnchorV3 } from './types.js';

/** `[#&]` because the pin can ride inside a fragment the app already uses. */
const HASH_RE = new RegExp(`[#&]bai=v3\\.${PIN_BODY_SRC}`);
/** v1/v2 links are not carried forward — recognised only to say so. */
const LEGACY_RE = /[#&]bai-review=/;

export type Fragment =
  { kind: 'v3'; id: string; anchorB64: string } | { kind: 'legacy' } | null;

export function parseFragment(hash: string): Fragment {
  const match = HASH_RE.exec(hash || '');
  if (match) return { kind: 'v3', id: match[1], anchorB64: match[2] };
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
  anchorB64: string,
): string {
  const query = anchor.q ? `?${anchor.q}` : '';
  return `${anchor.p}${query}#bai=v3.${id}.${anchorB64}`;
}

/** A path is shown to a human here, so `%ED%95%9C` is not the answer. */
export const readablePath = (path: string): string => {
  try {
    return decodeURIComponent(path);
  } catch {
    return path;
  }
};

/** Survives the reload `location.assign` causes, so a redirect cannot loop. */
const APPLIED_KEY = 'bai-review-applied';

const safeStorage = (): Storage | null => {
  try {
    return sessionStorage;
  } catch {
    // A tab with storage disabled just follows the link again.
    return null;
  }
};

export interface NavigationGuard {
  /** True while `location.assign(target)` is still worth trying. */
  shouldNavigate(id: string, target: string): boolean;
  /** We are on the link's own page: a later open may navigate again. */
  landed(): void;
  /** A new hash is a new link, so this document may navigate once more. */
  reset(): void;
}

/**
 * Records the navigation that was attempted, not the link that attempted it:
 * keyed on the id alone the guard would disable path/query application for
 * that link for the rest of the tab session, and a second open from another
 * page would silently pin whatever happens to be under it.
 */
export function createNavigationGuard(
  storage: Storage | null = safeStorage(),
): NavigationGuard {
  let navigatedHere = false;
  const read = () => {
    try {
      return storage?.getItem(APPLIED_KEY) ?? null;
    } catch {
      return null;
    }
  };
  const write = (value: string | null) => {
    try {
      if (value === null) storage?.removeItem(APPLIED_KEY);
      else storage?.setItem(APPLIED_KEY, value);
    } catch {
      // Storage went away mid-session; the in-document flag still holds.
    }
  };
  return {
    shouldNavigate(id, target) {
      if (navigatedHere) return false;
      const record = `${id} ${target}`;
      if (read() === record) return false;
      navigatedHere = true;
      write(record);
      return true;
    },
    landed() {
      write(null);
    },
    reset() {
      navigatedHere = false;
    },
  };
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
