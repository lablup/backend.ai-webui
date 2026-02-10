/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useSuspendedBackendaiClient } from '.';
import { useRecentProjectGroup } from './backendai';
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

interface CurrentProject {
  name: string | undefined | null;
  id: string | undefined | null;
}

interface ScalingGroupsResponse {
  scaling_groups: ScalingGroupItem[];
}

const emptyCurrentProject: CurrentProject = {
  name: undefined,
  id: undefined,
};

// Handle async cases differently for suspense vs non-suspense scenarios
const currentProjectAtom = atomWithDefault((): CurrentProject => {
  const client = globalThis?.backendaiclient;

  if (!client) {
    // Server value not confirmed yet - return undefined for "not yet confirmed"
    return emptyCurrentProject;
  }

  // For suspense handling:
  // - If we confirmed value doesn't exist, return null
  // - If value exists, return that value (which might be undefined)
  const name = client.current_group;
  const id =
    typeof client.current_group_id === 'function'
      ? client.current_group_id()
      : client.current_group_id;

  return {
    name: name ?? null,
    id: id ?? null,
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

const emptyResourceGroupsResult = {
  nonSftpResourceGroups: undefined,
  vhostInfo: undefined,
  sftpResourceGroups: undefined,
};

const resourceGroupsForCurrentProjectAtom = atom(async (get) => {
  // NOTE: cannot use hook inside atom
  const currentProject = get(currentProjectAtom);

  // Skip API calls if project info is not available yet
  if (!currentProject.name || !currentProject.id) {
    return emptyResourceGroupsResult;
  }

  const client = globalThis?.backendaiclient;
  if (!client) {
    return emptyResourceGroupsResult;
  }

  const [resourceGroupsResult, vhostInfoResult] = await Promise.allSettled([
    client.scalingGroup.list(
      currentProject.name,
    ) as Promise<ScalingGroupsResponse>,
    client.vfolder.list_hosts(currentProject.id) as Promise<VHostInfo>,
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
  const { writeRecentProjectGroup } = useRecentProjectGroup();

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

      // Write recent project group using the new hook
      writeRecentProjectGroup(projectName);
    },
    [set, baiClient, writeRecentProjectGroup],
  );
};
