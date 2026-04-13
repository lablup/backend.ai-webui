/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { ServiceHistory, useBAISettingUserState } from './useBAISetting';
import { generateRandomString } from 'backend.ai-ui';
import * as _ from 'lodash-es';
import { useCallback } from 'react';

export const useRecentServiceHistory = () => {
  const [recentServices, setRecentServiceHistory] = useBAISettingUserState(
    'recentServiceHistory',
  );

  const push = useCallback(
    ({
      id,
      params,
      createdAt,
      name,
      vFolderName,
    }: SelectivePartial<ServiceHistory, 'id' | 'createdAt'>) => {
      const newHistory: ServiceHistory = {
        id: id ?? generateRandomString(8),
        params,
        createdAt: createdAt ?? new Date().toISOString(),
        name: name,
        vFolderName,
      };
      setRecentServiceHistory((prev) => {
        return _.orderBy(
          [newHistory, ...(prev || [])],
          ['createdAt'],
          ['desc'],
        ).slice(0, 5);
      });
    },
    [setRecentServiceHistory],
  );
  const clear = useCallback(
    () => setRecentServiceHistory([]),
    [setRecentServiceHistory],
  );
  const remove = useCallback(
    (id: string) => {
      setRecentServiceHistory((prev) =>
        (prev || []).filter((item) => item.id !== id),
      );
    },
    [setRecentServiceHistory],
  );

  const update = useCallback(
    (id: string, name: string) => {
      setRecentServiceHistory((prev) =>
        (prev || []).map((item) => {
          if (item.id === id) {
            return {
              ...item,
              name,
            };
          }
          return item;
        }),
      );
    },
    [setRecentServiceHistory],
  );

  return [
    recentServices,
    {
      push,
      clear,
      remove,
      update,
    },
  ] as const;
};

export const usePinnedServiceHistory = () => {
  const [pinnedServiceHistory, setPinnedServiceHistory] =
    useBAISettingUserState('pinnedServiceHistory');
  const [recentServiceHistory] = useBAISettingUserState('recentServiceHistory');

  const pin = useCallback(
    (id: string) => {
      const pinnedItem = (recentServiceHistory || []).find(
        (item) => item.id === id,
      );
      if (pinnedItem) {
        setPinnedServiceHistory((prev) => [...(prev || []), pinnedItem]);
      }
    },
    [recentServiceHistory, setPinnedServiceHistory],
  );

  const unpin = useCallback(
    (id: string) => {
      setPinnedServiceHistory((prev) =>
        (prev || []).filter((item) => item.id !== id),
      );
    },
    [setPinnedServiceHistory],
  );

  const update = useCallback(
    (id: string, name: string) => {
      setPinnedServiceHistory((prev) =>
        (prev || []).map((item) => {
          if (item.id === id) {
            return {
              ...item,
              name,
            };
          }
          return item;
        }),
      );
    },
    [setPinnedServiceHistory],
  );

  return [
    pinnedServiceHistory,
    {
      pin,
      unpin,
      update,
    },
  ] as const;
};
