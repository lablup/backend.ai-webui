/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { App } from '../app-shim';
import {
  useMyAppConfig,
  useRefetchMyAppConfig,
  useUpdateMyUserAppConfig,
} from './useAppConfig';
import { SessionHistory, useBAISettingUserState } from './useBAISetting';
import {
  useEventNotStable,
  generateRandomString,
  useErrorMessageResolver,
} from 'backend.ai-ui';
import * as _ from 'lodash-es';
import { useState } from 'react';

type SessionHistoryKey = 'recentSessionHistory' | 'pinnedSessionHistory';

// Each write replaces the whole `userConfig` document, so concurrent writes
// (a rename updates both lists) must run one after another.
let writeQueue: Promise<unknown> = Promise.resolve();

/**
 * Session history lives in the user's server-side `userConfig` so it follows
 * the user across browsers. A history this browser kept in localStorage is
 * shown until the first write carries it over to the server.
 */
const useSessionHistoryStore = (key: SessionHistoryKey) => {
  'use memo';
  const { message } = App.useApp();
  const { getErrorMessage } = useErrorMessageResolver();
  const serverValue = useMyAppConfig<Array<SessionHistory>>(key);
  const [localValue] = useBAISettingUserState(key);
  const updateMyUserAppConfig = useUpdateMyUserAppConfig();
  const refetchMyAppConfig = useRefetchMyAppConfig();
  // Shows the written value while the write and the refetch are in flight.
  const [pending, setPending] = useState<{ value: Array<SessionHistory> }>();

  const setValue = async (next: Array<SessionHistory>) => {
    setPending({ value: next });
    const write = writeQueue.then(async () => {
      await updateMyUserAppConfig(key, next);
      await refetchMyAppConfig();
    });
    writeQueue = write.catch(() => {});
    try {
      await write;
    } catch (error) {
      message.error(getErrorMessage(error));
    } finally {
      setPending(undefined);
    }
  };

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
