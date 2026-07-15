/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useBaiSignedRequestWithPromise } from '../helper';
import { useTanQuery } from './reactQueryAlias';
import { queryOptions, useQueryClient } from '@tanstack/react-query';
import * as _ from 'lodash-es';

type BaiSignedRequest = ReturnType<typeof useBaiSignedRequestWithPromise>;

const SFTP_PROXY_RESOURCE_GROUPS_QUERY_KEY = ['sftpProxyResourceGroups'];

const PROXIES_ETCD_PREFIX = 'volumes/proxies';

const etcdKey = (proxy: string) =>
  `${PROXIES_ETCD_PREFIX}/${proxy}/sftp_scaling_groups`;

const parseGroups = (value: string | null | undefined): string[] =>
  typeof value === 'string'
    ? value
        .split(',')
        .map((group) => group.trim())
        .filter(Boolean)
    : [];

/**
 * Read the `proxy -> resource group names` map straight from etcd
 * (`/config/get` prefix on `volumes/proxies`). We read etcd — not
 * `vfolder.list_hosts()` — because the manager caches `sftp_scaling_groups`
 * at proxy-load time, so a fresh `/config/set` is not reflected by
 * `list_hosts()` until the manager reloads. etcd is the store we write to,
 * so this is immediately consistent after a write. Superadmin-only.
 *
 * The prefix read returns a nested tree keyed by proxy name, e.g.
 * `{ local: { sftp_scaling_groups: "a,b", client_api: "...", ... }, ... }`.
 */
const getProxyResourceGroups = async (
  baiSignedRequest: BaiSignedRequest,
): Promise<Record<string, string[]>> => {
  const res = await baiSignedRequest<{
    result?: Record<
      string,
      { sftp_scaling_groups?: string | null } | null
    > | null;
  }>({
    method: 'POST',
    url: '/config/get',
    body: { key: PROXIES_ETCD_PREFIX, prefix: true },
  });
  return _.mapValues(res?.result ?? {}, (proxyConfig) =>
    parseGroups(proxyConfig?.sftp_scaling_groups),
  );
};

/**
 * Single source of truth for the proxy-resource-groups query (key + fetcher),
 * shared by the suspending and non-suspending reader hooks below and by the
 * write hook's cache invalidation. Superadmin-only (raw `/config/get`).
 */
const sftpProxyResourceGroupsQueryOptions = (
  baiSignedRequest: BaiSignedRequest,
) =>
  queryOptions({
    queryKey: SFTP_PROXY_RESOURCE_GROUPS_QUERY_KEY,
    queryFn: () => getProxyResourceGroups(baiSignedRequest),
  });

/**
 * The storage proxies currently serving SFTP for any of `groupNames`, derived
 * from the `proxy -> resource group names` map. Prefills the proxy multi-select
 * and doubles as the baseline for the submit delta. A union across groups is
 * correct even when the selected groups' assignments differ: deselecting a
 * proxy is a per-proxy no-op for groups that weren't on it.
 */
export const proxiesServingGroups = (
  proxyResourceGroups: Record<string, string[]> | undefined,
  groupNames: string[],
): string[] =>
  _.keys(
    _.pickBy(
      proxyResourceGroups ?? {},
      (groups) => _.intersection(groups, groupNames).length > 0,
    ),
  );

/**
 * The proxy-membership change from `initialProxies` to `targetProxies`:
 * proxies newly selected (to add to) and deselected (to remove from). Callers
 * need `removed` separately (e.g. to confirm before a destructive removal),
 * so this stays a pure helper rather than being hidden inside the write.
 */
export const computeProxyDelta = (
  initialProxies: string[],
  targetProxies: string[],
) => ({
  added: _.difference(targetProxies, initialProxies),
  removed: _.difference(initialProxies, targetProxies),
});

/**
 * Write helpers for the per-storage-proxy SFTP resource-group assignment that
 * lives in etcd at `volumes/proxies/{proxy}/sftp_scaling_groups` (comma-joined).
 * There is no GraphQL mutation for this key, so writes go through raw superadmin
 * signed requests against `/config/{get,set}`.
 *
 * Every write reads the proxy's current list first and merges, because `set`
 * overwrites the whole key — this preserves resource groups already assigned to
 * the proxy that this operation isn't touching.
 */
export const useSFTPResourceGroups = () => {
  'use memo';
  const baiSignedRequest = useBaiSignedRequestWithPromise();
  const queryClient = useQueryClient();

  const getGroupsForProxy = (proxy: string): Promise<string[]> =>
    baiSignedRequest<{ result?: string | null }>({
      method: 'POST',
      url: '/config/get',
      body: { key: etcdKey(proxy), prefix: false },
    }).then((res) => parseGroups(res?.result));

  const setGroupsForProxy = (
    proxy: string,
    groups: string[],
  ): Promise<unknown> =>
    // An empty list means the proxy is no longer designated for any group.
    // Delete the etcd key rather than writing '', because the manager parses
    // the value with a comma-splitter: '' becomes [''] (a bogus empty-named
    // group), not the unset state. A deleted key reads back as None, the
    // documented "all groups" default.
    groups.length === 0
      ? baiSignedRequest<unknown>({
          method: 'POST',
          url: '/config/delete',
          body: { key: etcdKey(proxy), prefix: false },
        })
      : baiSignedRequest<unknown>({
          method: 'POST',
          url: '/config/set',
          body: { key: etcdKey(proxy), value: groups.join(',') },
        });

  /**
   * Apply a proxy-membership delta to a set of groups at once: add every group
   * in `groupNames` to `addedProxies` and remove them from `removedProxies`,
   * preserving other groups on each affected proxy. `addedProxies` and
   * `removedProxies` are disjoint by construction. Runs every proxy write
   * concurrently and invalidates the cached map once. Shared write path for
   * both the per-group and bulk SFTP settings flows.
   */
  const applyGroupProxyDelta = async (
    groupNames: string[],
    addedProxies: string[],
    removedProxies: string[],
  ) => {
    const results = await Promise.allSettled([
      ...addedProxies.map(async (proxy) => {
        const existing = await getGroupsForProxy(proxy);
        await setGroupsForProxy(proxy, _.union(existing, groupNames));
      }),
      ...removedProxies.map(async (proxy) => {
        const existing = await getGroupsForProxy(proxy);
        await setGroupsForProxy(proxy, _.difference(existing, groupNames));
      }),
    ]);
    queryClient.invalidateQueries({
      queryKey: SFTP_PROXY_RESOURCE_GROUPS_QUERY_KEY,
    });
    return results;
  };

  return {
    applyGroupProxyDelta,
  };
};

/**
 * Non-suspending read of the `proxy -> resource group names` map. Used both by
 * the resource-group list column and by the setting modals, which gate it on a
 * deferred `open` and surface the fetch through their own loading skeletons
 * rather than a Suspense boundary. Pass `enabled: false` for non-superadmins,
 * who cannot read the raw etcd config.
 */
export const useSFTPProxyResourceGroupsQuery = (options?: {
  enabled?: boolean;
}) => {
  'use memo';
  const baiSignedRequest = useBaiSignedRequestWithPromise();
  return useTanQuery({
    ...sftpProxyResourceGroupsQueryOptions(baiSignedRequest),
    enabled: options?.enabled,
  });
};
