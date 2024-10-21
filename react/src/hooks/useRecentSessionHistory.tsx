import { generateRandomString } from '../helper';
import { SessionHistory, useBAISettingUserState } from './useBAISetting';
import { useEventNotStable } from './useEventNotStable';

export const useRecentSessionHistory = () => {
  const [recentSessionHistory, setRecentSessionHistory] =
    useBAISettingUserState('recentSessionHistory');

  const push = useEventNotStable(
    ({
      id,
      params,
      createdAt,
    }: SelectivePartial<SessionHistory, 'id' | 'createdAt'>) => {
      const newHistory: SessionHistory = {
        id: id ?? generateRandomString(8),
        params,
        createdAt: createdAt ?? new Date().toISOString(),
      };
      // push new history to the top of recentSessionHistory and keep it up to 5
      const newRecentSessionHistory = [
        newHistory,
        ...(recentSessionHistory || []),
      ].slice(0, 5);
      setRecentSessionHistory(newRecentSessionHistory);
    },
  );
  const clear = useEventNotStable(() => setRecentSessionHistory([]));
  const remove = useEventNotStable((id: string) => {
    const newRecentSessionHistory = (recentSessionHistory || []).filter(
      (item) => item.id !== id,
    );
    setRecentSessionHistory(newRecentSessionHistory);
  });
  return [
    recentSessionHistory,
    {
      push,
      clear,
      remove,
    },
  ] as const;
};
