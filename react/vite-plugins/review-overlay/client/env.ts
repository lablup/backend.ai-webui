/**
 * The environment footer's one setting: whether the account goes into copies.
 * The reviewer's own choice, so it lives in `localStorage` — it outlives the
 * tab and the set, unlike the draft (`sessionStorage`) it is not part of.
 */
import type { ReviewEnv } from './types.js';

/** `0` while the reviewer has switched the account off; absent means on. */
export const SHARE_ACCOUNT_KEY = 'bai-review:share-account';

const safeStorage = (): Storage | null => {
  try {
    return localStorage;
  } catch {
    return null;
  }
};

export function readShareAccount(
  storage: Storage | null = safeStorage(),
): boolean {
  try {
    return storage?.getItem(SHARE_ACCOUNT_KEY) !== '0';
  } catch {
    return true;
  }
}

export function writeShareAccount(
  share: boolean,
  storage: Storage | null = safeStorage(),
): void {
  try {
    if (share) storage?.removeItem(SHARE_ACCOUNT_KEY);
    else storage?.setItem(SHARE_ACCOUNT_KEY, '0');
  } catch {
    // Storage disabled: the switch holds for this page load only.
  }
}

/**
 * Another tab flipped the switch, or cleared storage (`key === null`). Same-
 * tab writes fire no `storage` event, so this only ever hears other tabs.
 */
export function onShareAccountChange(
  listener: (share: boolean) => void,
): () => void {
  const handle = (evt: StorageEvent) => {
    if (evt.key !== null && evt.key !== SHARE_ACCOUNT_KEY) return;
    listener(evt.newValue !== '0' || evt.key === null);
  };
  window.addEventListener('storage', handle);
  return () => window.removeEventListener('storage', handle);
}

/** What a copy may say about where it was made: the host's answer, minus the account when the switch is off. */
export function envForCopy(
  env: ReviewEnv | undefined,
  shareAccount: boolean,
): ReviewEnv | undefined {
  if (!env) return undefined;
  if (shareAccount) return env;
  const { account: _withheld, ...rest } = env;
  return rest;
}
