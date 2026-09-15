/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useCurrentDomainValue, useSuspendedBackendaiClient } from '.';
import { MOUNT_IN_SESSION_PERMISSION } from '../helper/storageHostPermission';
import { useMergedAllowedStorageHostPermission } from './useMergedAllowedStorageHostPermission';
import * as _ from 'lodash-es';

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

  return _.keys(
    _.pickBy(unitedAllowedPermissionByVolume, (permissions) =>
      _.includes(permissions, MOUNT_IN_SESSION_PERMISSION),
    ),
  );
};
