/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useSuspendedBackendaiClient } from '.';
import { useSuspenseTanQuery } from './reactQueryAlias';

interface VHostVolumeInfo {
  backend: string;
  capabilities: string[];
  usage?: {
    percentage: number;
  };
  sftp_scaling_groups?: string[];
}

export interface VHostInfo {
  allowed: string[];
  default: string;
  volume_info: {
    [key: string]: VHostVolumeInfo;
  };
}

/**
 * Per-project volume host info (`vfolder.list_hosts(projectId)`), keyed to an
 * explicitly passed project (ADR-0001, FR-3412) instead of the ambient
 * current-project derived atom. Suspends while loading.
 */
export const useVHostInfo = (projectId: string) => {
  'use memo';
  const baiClient = useSuspendedBackendaiClient();

  const { data: vhostInfo } = useSuspenseTanQuery<VHostInfo>({
    queryKey: ['vhostInfo', projectId],
    queryFn: () => baiClient.vfolder.list_hosts(projectId),
    staleTime: 1000 * 60 * 5,
  });

  return { vhostInfo };
};
