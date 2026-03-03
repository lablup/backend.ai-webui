/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useSuspendedBackendaiClient } from '.';
import { backendaiUtils } from '../global-stores';
import { atom, useAtom, useAtomValue, useSetAtom } from 'jotai';
import { atomWithDefault } from 'jotai/utils';
import _ from 'lodash';
import { useCallback, useEffect } from 'react';

interface ScalingGroupItem {
  name: string;
}

interface VHostVolumeInfo {
  backend: string;
  capabilities: string[];
  usage: {
    percentage: number;
  };
  sftp_scaling_groups?: string[];
}

interface VHostInfo {
  allowed: string[];
  default: string;
  volume_info: {
    [key: string]: VHostVolumeInfo;
  };
}

interface ScalingGroupsResponse {
  scaling_groups: ScalingGroupItem[];
}

// TODO: check undefined and add error handling
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
  const { nonSftpResourceGroups } = useResourceGroupsForCurrentProject();
  const [prevSelectedRGName, setPrevSelectedRGName] = useAtom(
    previousSelectedResourceGroupNameAtom,
  );

  let nextResourceGroupName: string | null = null;
  if (
    nonSftpResourceGroups === undefined ||
    nonSftpResourceGroups.length === 0
  ) {
    nextResourceGroupName = null;
  } else if (
    _.some(nonSftpResourceGroups, (item) => item.name === prevSelectedRGName)
  ) {
    nextResourceGroupName = prevSelectedRGName;
  } else {
    const autoSelectedResourceGroup =
      // _.find(resourceGroups, (item) => item.name === 'default') ||
      nonSftpResourceGroups[0];
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
  const [resourceGroupsResult, vhostInfoResult] = await Promise.allSettled([
    // @ts-ignore
    globalThis.backendaiclient.scalingGroup.list(
      currentProject.name,
    ) as Promise<ScalingGroupsResponse>,
    // @ts-ignore
    globalThis.backendaiclient.vfolder.list_hosts(
      currentProject.id,
    ) as Promise<VHostInfo>,
  ]);

  const resourceGroups =
    resourceGroupsResult.status === 'fulfilled'
      ? resourceGroupsResult.value
      : undefined;
  const vhostInfo =
    vhostInfoResult.status === 'fulfilled' ? vhostInfoResult.value : undefined;

  const sftpResourceGroups = vhostInfo
    ? _.uniq(
        _.flatten(
          _.map(vhostInfo.volume_info, (volume) => volume?.sftp_scaling_groups),
        ),
      )
    : undefined;

  return {
    nonSftpResourceGroups:
      resourceGroups && vhostInfo && sftpResourceGroups
        ? _.filter(
            resourceGroups.scaling_groups,
            (rg) => !sftpResourceGroups.includes(rg.name),
          )
        : resourceGroups?.scaling_groups || undefined,
    vhostInfo,
    sftpResourceGroups,
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
      // eslint-disable-next-line react-hooks/immutability
      baiClient.current_group = projectName;
      backendaiUtils._writeRecentProjectGroup(projectName);
    },
    [set, baiClient],
  );
};
