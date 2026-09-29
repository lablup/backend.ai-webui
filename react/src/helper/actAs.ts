/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */

/**
 * Super-admin "use as this user" (X-BackendAI-Act-As, BA-6781).
 *
 * The state is tab-scoped: it lives in `sessionStorage`, so it survives reloads
 * in the act-as tab and disappears when the tab closes, while every other tab
 * keeps the super-admin view. The opener hands the target over through a
 * one-time nonce in `localStorage`, so a crafted link alone cannot turn it on.
 */

export interface ActAsTarget {
  userId: string;
  email: string;
  name: string;
}

export const ACT_AS_HANDOFF_PARAM = 'actAsHandoff';
const SESSION_KEY = 'backendaiwebui.actAs';
const HANDOFF_KEY_PREFIX = 'backendaiwebui.actAs.handoff.';
const HANDOFF_TTL_MS = 60_000;

interface Handoff {
  target: ActAsTarget;
  createdAt: number;
}

const isActAsTarget = (value: unknown): value is ActAsTarget => {
  const v = value as Partial<ActAsTarget> | null;
  return (
    typeof v?.userId === 'string' &&
    v.userId.length > 0 &&
    typeof v.email === 'string' &&
    typeof v.name === 'string'
  );
};

const parseJSON = (raw: string | null): unknown => {
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

const sweepExpiredHandoffs = (now: number) => {
  try {
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i);
      if (!key?.startsWith(HANDOFF_KEY_PREFIX)) continue;
      const handoff = parseJSON(localStorage.getItem(key)) as Handoff | null;
      if (!handoff || now - handoff.createdAt > HANDOFF_TTL_MS) {
        localStorage.removeItem(key);
      }
    }
  } catch {
    // Storage unavailable: nothing to sweep.
  }
};

export const getActAsTarget = (): ActAsTarget | null => {
  try {
    const value = parseJSON(sessionStorage.getItem(SESSION_KEY));
    return isActAsTarget(value) ? value : null;
  } catch {
    return null;
  }
};

/** Opens a new tab that acts as `target`. Returns false if storage is unavailable. */
export const openActAsTab = (target: ActAsTarget): boolean => {
  const now = Date.now();
  sweepExpiredHandoffs(now);
  const nonce = crypto.randomUUID();
  try {
    localStorage.setItem(
      HANDOFF_KEY_PREFIX + nonce,
      JSON.stringify({ target, createdAt: now } satisfies Handoff),
    );
  } catch {
    return false;
  }
  const url = new URL('/', window.location.href);
  url.searchParams.set(ACT_AS_HANDOFF_PARAM, nonce);
  window.open(url.href, '_blank', 'noopener');
  return true;
};

/**
 * Run once before the app renders: moves a pending hand-off into this tab's
 * `sessionStorage` and strips the nonce from the URL.
 */
export const adoptActAsHandoff = () => {
  const url = new URL(window.location.href);
  const nonce = url.searchParams.get(ACT_AS_HANDOFF_PARAM);
  if (!nonce) return;
  url.searchParams.delete(ACT_AS_HANDOFF_PARAM);
  window.history.replaceState(window.history.state, '', url.href);

  const key = HANDOFF_KEY_PREFIX + nonce;
  try {
    const handoff = parseJSON(localStorage.getItem(key)) as Handoff | null;
    localStorage.removeItem(key);
    if (
      handoff &&
      Date.now() - handoff.createdAt <= HANDOFF_TTL_MS &&
      isActAsTarget(handoff.target)
    ) {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(handoff.target));
    }
  } catch {
    // Storage unavailable: the tab opens in the normal view.
  }
};

export const applyActAsTitle = (target: ActAsTarget) => {
  const prefix = `[${target.name || target.email}] `;
  if (!document.title.startsWith(prefix)) {
    document.title = `${prefix}${document.title}`;
  }
};

/** Leaves act-as: closes the tab, or falls back to the super-admin view. */
export const exitActAs = () => {
  try {
    sessionStorage.removeItem(SESSION_KEY);
  } catch {
    // Nothing stored; the reload below still drops the in-memory header.
  }
  window.close();
  // `window.close()` is ignored for tabs the script did not open.
  setTimeout(() => {
    window.location.replace(new URL('/', window.location.href).href);
  }, 200);
};
