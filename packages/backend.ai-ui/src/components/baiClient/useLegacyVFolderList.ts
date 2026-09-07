/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useSuspenseTanQuery } from '../../helper/reactQueryAlias';
import { useBAISignedRequestWithPromise } from '../../hooks';
import type { LegacyVFolder } from './BAILegacyVFolderSelect';

export interface MountGateOptions {
  /** Hosts granting `mount-in-session`, supplied by the host app. */
  mountableHosts: Array<string> | Set<string>;
  /** Project scope; a folder owned by a different project is not mountable. */
  currentProjectId?: string;
}

/**
 * The session launcher's mount gate, minus the display filter: the host must
 * grant `mount-in-session` and the folder must be reachable from the project.
 */
export const isMountableLegacyVFolder = (
  folder: LegacyVFolder,
  { mountableHosts, currentProjectId }: MountGateOptions,
): boolean => {
  const hosts =
    mountableHosts instanceof Set ? mountableHosts : new Set(mountableHosts);
  return (
    hosts.has(folder.host) &&
    (folder.ownership_type === 'user' ||
      !folder.group ||
      folder.group === currentProjectId)
  );
};

/**
 * The raw REST `GET /folders` list, ungated. One query key per owner, so the
 * select and the mount config input around it share a single request.
 */
export const useLegacyVFolderList = (
  ownerEmail?: string,
): Array<LegacyVFolder> => {
  'use memo';
  const baiRequestWithPromise = useBAISignedRequestWithPromise();

  const { data } = useSuspenseTanQuery<Array<LegacyVFolder>>({
    // The request carries no project scope — that gate is applied client-side.
    queryKey: ['BAILegacyVFolderSelectFolders', ownerEmail ?? ''],
    queryFn: () => {
      const search = new URLSearchParams();
      if (ownerEmail) search.set('owner_user_email', ownerEmail);
      const query = search.toString();
      return baiRequestWithPromise({
        method: 'GET',
        url: `/folders${query ? `?${query}` : ''}`,
      }) as Promise<Array<LegacyVFolder>>;
    },
    staleTime: 30 * 1000,
  });

  return data ?? [];
};

export default useLegacyVFolderList;
