import { useSuspendedBackendaiClient } from '.';
import { useAtomValue, useSetAtom } from 'jotai';
import { atomWithDefault } from 'jotai/utils';
import { useCallback } from 'react';

const currentProjectAtom = atomWithDefault(() => {
  return {
    // @ts-ignore
    name: globalThis?.backendaiclient?.current_group,
    // @ts-ignore
    id: globalThis?.backendaiclient?.current_group_id(),
  };
});

export const useCurrentProjectValue = () => {
  useSuspendedBackendaiClient();
  return useAtomValue(currentProjectAtom);
};

export const useSetCurrentProject = () => {
  const set = useSetAtom(currentProjectAtom);
  const baiClient = useSuspendedBackendaiClient();
  return useCallback(
    ({
      projectName,
      projectId,
    }: {
      projectName: string;
      projectId: string;
    }) => {
      set({
        name: projectName,
        id: projectId,
      });

      // To sync with baiClient
      baiClient.current_group = projectName;
      // @ts-ignore
      globalThis.backendaiutils._writeRecentProjectGroup(projectName);
      const event: CustomEvent = new CustomEvent('backend-ai-group-changed', {
        detail: projectName,
      });
      document.dispatchEvent(event);
    },
    [set, baiClient],
  );
};
