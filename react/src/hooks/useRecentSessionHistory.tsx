import { generateRandomString } from '../helper';
import { SessionHistory, useBAISettingUserState } from './useBAISetting';
import { useEventNotStable } from 'backend.ai-ui';
import _ from 'lodash';

export const useRecentSessionHistory = () => {
  const [recentSessions, setRecentSessionHistory] = useBAISettingUserState(
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
      setRecentSessionHistory(newRecentSessionHistory);
    },
  );
  const clear = useEventNotStable(() => setRecentSessionHistory([]));
  const remove = useEventNotStable((id: string) => {
    const newRecentSessionHistory = (recentSessions || []).filter(
      (item) => item.id !== id,
    );
    setRecentSessionHistory(newRecentSessionHistory);
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
    setRecentSessionHistory(newRecentSessionHistory);
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
  const [pinnedSessionHistory, setPinnedSessionHistory] =
    useBAISettingUserState('pinnedSessionHistory');
  const [recentSessionHistory] = useBAISettingUserState('recentSessionHistory');

  const pin = useEventNotStable((id: string) => {
    const pinnedItem = (recentSessionHistory || []).find(
      (item) => item.id === id,
    );
    pinnedItem &&
      setPinnedSessionHistory([...(pinnedSessionHistory || []), pinnedItem]);
  });

  const unpin = useEventNotStable((id: string) => {
    const newPinnedSessionHistory = (pinnedSessionHistory || []).filter(
      (item) => item.id !== id,
    );
    setPinnedSessionHistory(newPinnedSessionHistory);
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
    setPinnedSessionHistory(newPinnedSessionHistory);
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
