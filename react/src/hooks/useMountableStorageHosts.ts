/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useCurrentDomainValue, useSuspendedBackendaiClient } from '.';
import { MOUNT_IN_SESSION_PERMISSION } from '../helper/storageHostPermission';
import { useMergedAllowedStorageHostPermission } from './useMergedAllowedStorageHostPermission';

/**
 * Hosts a session in this project may mount folders from: those granting
 * `mount-in-session` once the domain, project and keypair policies are merged.
 * Suspends.
 */
export const useMountableStorageHosts = (
  projectId: string | null,
): Array<string> => {
  'use memo';
  const baiClient = useSuspendedBackendaiClient();
  const currentDomain = useCurrentDomainValue();

  const { unitedAllowedPermissionByVolume } =
    useMergedAllowedStorageHostPermission(
      currentDomain,
      projectId,
      baiClient?._config?.accessKey,
    );

  return Object.entries(unitedAllowedPermissionByVolume)
    .filter(([, permissions]) =>
      permissions.includes(MOUNT_IN_SESSION_PERMISSION),
    )
    .map(([host]) => host);
};
