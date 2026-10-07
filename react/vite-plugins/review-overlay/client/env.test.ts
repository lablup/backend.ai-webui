/**
 * The footer's account switch: the reviewer's choice, kept across tabs, and
 * the one place the host's answer is trimmed before it reaches a copy.
 */
import {
  envForCopy,
  onShareAccountChange,
  readShareAccount,
  SHARE_ACCOUNT_KEY,
  writeShareAccount,
} from './env.js';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

const env = {
  webui: '26.9.0',
  manager: '25.14.2',
  endpoint: 'https://api.example.com',
  account: 'reviewer@example.com (admin)',
};

beforeEach(() => {
  localStorage.clear();
});

describe('the account switch', () => {
  it('is on until the reviewer turns it off', () => {
    expect(readShareAccount()).toBe(true);
  });

  it('remembers off across page loads, and on again by forgetting', () => {
    writeShareAccount(false);
    expect(localStorage.getItem(SHARE_ACCOUNT_KEY)).toBe('0');
    expect(readShareAccount()).toBe(false);

    writeShareAccount(true);
    expect(localStorage.getItem(SHARE_ACCOUNT_KEY)).toBeNull();
    expect(readShareAccount()).toBe(true);
  });

  it('holds for the page load when storage is refused', () => {
    const refusing = {
      getItem: () => {
        throw new Error('denied');
      },
      setItem: () => {
        throw new Error('denied');
      },
      removeItem: () => {
        throw new Error('denied');
      },
    } as unknown as Storage;

    expect(readShareAccount(refusing)).toBe(true);
    expect(() => writeShareAccount(false, refusing)).not.toThrow();
    expect(readShareAccount(null)).toBe(true);
  });
});

describe('what a copy may say', () => {
  it('is the host’s whole answer while the account is shared', () => {
    expect(envForCopy(env, true)).toBe(env);
  });

  it('is the host’s answer minus the account once it is withheld', () => {
    expect(envForCopy(env, false)).toEqual({
      webui: '26.9.0',
      manager: '25.14.2',
      endpoint: 'https://api.example.com',
    });
    expect(envForCopy(env, false)).not.toHaveProperty('account');
  });

  it('is nothing on a host with no app behind it', () => {
    expect(envForCopy(undefined, true)).toBeUndefined();
    expect(envForCopy(undefined, false)).toBeUndefined();
  });
});

describe('a switch flipped in another tab', () => {
  let heard: boolean[];
  let stop: () => void;
  const fromOtherTab = (key: string | null, newValue: string | null) =>
    window.dispatchEvent(new StorageEvent('storage', { key, newValue }));

  beforeEach(() => {
    heard = [];
    stop = onShareAccountChange((share) => heard.push(share));
  });
  afterEach(() => stop());

  it('is heard as off, then on again', () => {
    fromOtherTab(SHARE_ACCOUNT_KEY, '0');
    fromOtherTab(SHARE_ACCOUNT_KEY, null);

    expect(heard).toEqual([false, true]);
  });

  it('reads cleared storage as the default, on', () => {
    fromOtherTab(null, null);

    expect(heard).toEqual([true]);
  });

  it('ignores every other key', () => {
    fromOtherTab('bai-review:dock-pos', '{}');

    expect(heard).toEqual([]);
  });
});
