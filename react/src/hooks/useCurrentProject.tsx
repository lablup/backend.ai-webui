import { useSuspendedBackendaiClient } from '.';
import { atom, useAtom, useAtomValue, useSetAtom } from 'jotai';
import { atomWithDefault } from 'jotai/utils';
import _ from 'lodash';
import { useCallback, useEffect } from 'react';

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

const previousSelectedResourceGroupNameAtom = atom<string | null>(null);

export const useCurrentResourceGroupValue = () => {
  useSuspendedBackendaiClient();
  const { resourceGroups } = useAtomValue(resourceGroupsForCurrentProjectAtom);
  const [prevSelectedRGName, setPrevSelectedRGName] = useAtom(
    previousSelectedResourceGroupNameAtom,
  );

  let nextResourceGroupName: string | null = null;
  if (resourceGroups.length === 0) {
    nextResourceGroupName = null;
  } else if (
    _.some(resourceGroups, (item) => item.name === prevSelectedRGName)
  ) {
    nextResourceGroupName = prevSelectedRGName;
  } else {
    const autoSelectedResourceGroup =
      // _.find(resourceGroups, (item) => item.name === 'default') ||
      resourceGroups[0];
    nextResourceGroupName = autoSelectedResourceGroup.name;
  }

  useEffect(() => {
    if (nextResourceGroupName && prevSelectedRGName !== nextResourceGroupName) {
      setPrevSelectedRGName(nextResourceGroupName);
    }
    // do not need to consider the change of prevCurRGName
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nextResourceGroupName, setPrevSelectedRGName]);

  return nextResourceGroupName;
};

export const useSetCurrentResourceGroup = () => {
  return useSetAtom(previousSelectedResourceGroupNameAtom);
};

export const useCurrentResourceGroupState = () => {
  return [
    useCurrentResourceGroupValue(),
    useSetCurrentResourceGroup(),
  ] as const;
};

const resourceGroupsForCurrentProjectAtom = atom(async (get) => {
  // NOTE: cannot use hook inside atom
  const currentProject = get(currentProjectAtom);

  // First, fetch scaling groups (required)
  const resourceGroups = await // @ts-ignore
  (globalThis.backendaiclient.scalingGroup.list(
    currentProject.name,
  ) as Promise<{
    scaling_groups: {
      name: string;
    }[];
  }>);

  // Vhost info is handled with default values even if errors occur
  let vhostInfo: {
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
  };

  try {
    vhostInfo = await // @ts-ignore
    (globalThis.backendaiclient.vfolder.list_hosts(
      currentProject.id,
    ) as Promise<{
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
    }>);
  } catch (error) {
    console.warn('Failed to fetch vhost info, using fallback:', error);
    // Use default values when vhost info acquisition fails
    vhostInfo = {
      allowed: [],
      default: '',
      volume_info: {},
    };
  }

  const allSftpScalingGroups = _.uniq(
    _.flatten(
      _.map(vhostInfo.volume_info, (volume) => volume.sftp_scaling_groups),
    ),
  );

  return {
    resourceGroups: _.filter(
      resourceGroups.scaling_groups,
      (rg) => !allSftpScalingGroups.includes(rg.name),
    ),
    vhostInfo,
    allSftpScalingGroups,
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
