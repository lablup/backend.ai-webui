import { useSuspendedBackendaiClient } from '.';
import { atom, useAtomValue, useSetAtom } from 'jotai';
import { atomEffect } from 'jotai-effect';
import { atomWithDefault } from 'jotai/utils';
import _ from 'lodash';
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

const syncPreviousCurrentResourceGroupNameEffect = atomEffect((get, set) => {
  (async () => {
    const currentResourceGroup = await get(currentResourceGroupAtom);
    set(previousCurrentResourceGroupNameAtom, currentResourceGroup);
  })();
});

const previousCurrentResourceGroupNameAtom = atom<string | null>(null);

const currentResourceGroupAtom = atom(async (get) => {
  const { resourceGroups } = await get(resourceGroupsForCurrentProjectAtom);

  get(syncPreviousCurrentResourceGroupNameEffect);
  if (resourceGroups.length === 0) {
    return null;
  } else if (
    _.some(
      resourceGroups,
      (item) => item.name === get(previousCurrentResourceGroupNameAtom),
    )
  ) {
    return get(previousCurrentResourceGroupNameAtom);
  } else {
    const autoSelectedResourceGroup =
      _.find(resourceGroups, (item) => item.name === 'default') ||
      resourceGroups[0];
    return autoSelectedResourceGroup.name;
  }
});

export const useCurrentResourceGroupValue = () => {
  return useAtomValue(currentResourceGroupAtom);
};

export const useSetCurrentResourceGroup = () => {
  return useSetAtom(previousCurrentResourceGroupNameAtom);
};

export const useCurrentResourceGroupState = () => {
  return [
    useCurrentResourceGroupValue(),
    useSetCurrentResourceGroup(),
  ] as const;
};

const resourceGroupsForCurrentProjectAtom = atom(async (get) => {
  const currentProject = get(currentProjectAtom);
  const [resourceGroups, vhostInfo] = await Promise.all([
    // @ts-ignore
    globalThis.backendaiclient.scalingGroup.list(currentProject.name) as {
      scaling_groups: {
        name: string;
      }[];
    },
    // @ts-ignore
    globalThis.backendaiclient.vfolder.list_hosts(currentProject.id) as {
      allowed: string[];
      default: string;
      volume_info: {
        [key: string]: {
          backend: string;
          capabilities: string[];
          usage: {
            percentage: number;
          };
          sftp_scaling_groups?: string[];
        };
      };
    },
  ]);

  console.log('####', resourceGroups.scaling_groups);
  return {
    resourceGroups: resourceGroups.scaling_groups,
    vhostInfo,
  };
});

export const useResourceGroupsForCurrentProject = () => {
  return useAtomValue(resourceGroupsForCurrentProjectAtom);
};

export const useAllowedStorageHostsForCurrentProject = () => {};

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
