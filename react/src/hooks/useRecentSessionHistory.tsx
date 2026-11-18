/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { App } from '../app-shim';
import { useMyAppConfig, useMyAppConfigStatus } from './useAppConfig';
import { SessionHistory, useBAISettingUserState } from './useBAISetting';
import {
  useEventNotStable,
  generateRandomString,
  useErrorMessageResolver,
} from 'backend.ai-ui';
import * as _ from 'lodash-es';
import { useEffect, useEffectEvent, useState } from 'react';

type SessionHistoryKey = 'recentSessionHistory' | 'pinnedSessionHistory';

// Several stores of one key mount at once; only the first moves its local history.
const migratingKeys = new Set<SessionHistoryKey>();

/**
 * Session history lives in the user's server-side `userConfig` so it follows
 * the user across browsers. A history this browser kept in localStorage moves
 * there once, and leaves localStorage only when that write succeeded.
 */
const useSessionHistoryStore = (key: SessionHistoryKey) => {
  'use memo';
  const { message } = App.useApp();
  const { getErrorMessage } = useErrorMessageResolver();
  const [serverValue, setServerValue] =
    useMyAppConfig<Array<SessionHistory>>(key);
  // Without a loaded userConfig, `undefined` does not mean the server has no history.
  const isUserConfigLoaded = useMyAppConfigStatus() === 'loaded';
  const [localValue, setLocalValue] = useBAISettingUserState(key);
  // Shows the written value while the write is in flight.
  const [pending, setPending] = useState<{ value: Array<SessionHistory> }>();

  /** Writes `next` after the writes already queued on `userConfig`; false when it failed (the error is shown). */
  const write = async (next: Array<SessionHistory>): Promise<boolean> => {
    try {
      await setServerValue(next);
      return true;
    } catch (error) {
      message.error(getErrorMessage(error));
      return false;
    }
  };

  const setValue = async (next: Array<SessionHistory>): Promise<boolean> => {
    setPending({ value: next });
    try {
      return await write(next);
    } finally {
      setPending(undefined);
    }
  };

  const migrateLocalHistory = useEffectEvent(() => {
    if (
      !isUserConfigLoaded ||
      migratingKeys.has(key) ||
      serverValue !== undefined ||
      _.isEmpty(localValue)
    )
      return;
    migratingKeys.add(key);
    // No pending value: the local history stays on screen until the server has it.
    write(localValue!).then((written) => {
      if (written) setLocalValue(undefined);
      // A failed move may run again on a later mount.
      else migratingKeys.delete(key);
    });
  });
  useEffect(() => {
    migrateLocalHistory();
  }, [serverValue, localValue]);

  return [pending?.value ?? serverValue ?? localValue, setValue] as const;
};

export const useRecentSessionHistory = () => {
  'use memo';
  const [recentSessions, setRecentSessionHistory] = useSessionHistoryStore(
    'recentSessionHistory',
  );

  const push = useEventNotStable(
    ({
      id,
      params,
      createdAt,
      name,
    }: SelectivePartial<SessionHistory, 'id' | 'createdAt'>) => {
      const newHistory: SessionHistory = {
        id: id ?? generateRandomString(8),
        params,
        createdAt: createdAt ?? new Date().toISOString(),
        name: name,
      };
      // push new history to the top of recentSessionHistory and keep it up to 5
      const newRecentSessionHistory = _.sortBy(
        [newHistory, ...(recentSessions || [])],
        '-createdAt',
      ).slice(0, 5);
      return setRecentSessionHistory(newRecentSessionHistory);
    },
  );
  const clear = useEventNotStable(() => setRecentSessionHistory([]));
  const remove = useEventNotStable((id: string) => {
    const newRecentSessionHistory = (recentSessions || []).filter(
      (item) => item.id !== id,
    );
    return setRecentSessionHistory(newRecentSessionHistory);
  });

  const update = useEventNotStable((id: string, name: string) => {
    const newRecentSessionHistory = (recentSessions || []).map((item) => {
      if (item.id === id) {
        return {
          ...item,
          name,
        };
      }
      return item;
    });
    return setRecentSessionHistory(newRecentSessionHistory);
  });

  return [
    recentSessions,
    {
      push,
      clear,
      remove,
      update,
    },
  ] as const;
};

export const usePinnedSessionHistory = () => {
  'use memo';
  const [pinnedSessionHistory, setPinnedSessionHistory] =
    useSessionHistoryStore('pinnedSessionHistory');
  const [recentSessionHistory] = useSessionHistoryStore('recentSessionHistory');

  const pin = useEventNotStable((id: string) => {
    const pinnedItem = (recentSessionHistory || []).find(
      (item) => item.id === id,
    );
    return pinnedItem
      ? setPinnedSessionHistory([...(pinnedSessionHistory || []), pinnedItem])
      : Promise.resolve();
  });

  const unpin = useEventNotStable((id: string) => {
    const newPinnedSessionHistory = (pinnedSessionHistory || []).filter(
      (item) => item.id !== id,
    );
    return setPinnedSessionHistory(newPinnedSessionHistory);
  });

  const update = useEventNotStable((id: string, name: string) => {
    const newPinnedSessionHistory = (pinnedSessionHistory || []).map((item) => {
      if (item.id === id) {
        return {
          ...item,
          name,
        };
      }
      return item;
    });
    return setPinnedSessionHistory(newPinnedSessionHistory);
  });

  return [
    pinnedSessionHistory,
    {
      pin,
      unpin,
      update,
    },
  ] as const;
};
