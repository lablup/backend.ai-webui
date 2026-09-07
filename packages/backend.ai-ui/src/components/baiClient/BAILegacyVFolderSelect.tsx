/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { BAILegacyVFolderSelectAllowedHostsQuery } from '../../__generated__/BAILegacyVFolderSelectAllowedHostsQuery.graphql';
import { BAILegacyVFolderSelectKeypairQuery } from '../../__generated__/BAILegacyVFolderSelectKeypairQuery.graphql';
import { useSuspenseTanQuery } from '../../helper/reactQueryAlias';
import {
  useBAISignedRequestWithPromise,
  useControllableValue,
  useFetchKey,
} from '../../hooks';
import { useBAIi18n } from '../../hooks/useBAIi18n';
import BAIComplexSelect, {
  type BAIComplexSelectProps,
  type BAIComplexSelectValue,
  type BAILabeledValue,
} from '../BAIComplexSelect';
import useConnectedBAIClient from '../provider/BAIClientProvider/hooks/useConnectedBAIClient';
import * as _ from 'lodash-es';
import {
  useEffect,
  useEffectEvent,
  useImperativeHandle,
  useState,
  useTransition,
} from 'react';
import { graphql, useLazyLoadQuery } from 'react-relay';

/**
 * A folder as the REST `GET /folders` endpoint returns it. Distinct from the
 * GraphQL `vfolder_nodes` shape: `id` is the 32-hex local id (no dashes) and
 * `group` is the owning project's UUID or `null` for a user folder.
 */
export interface LegacyVFolder {
  name: string;
  id: string;
  quota_scope_id: string;
  host: string;
  status: string;
  usage_mode: string;
  created_at: string;
  is_owner: boolean;
  permission: string;
  user: string | null;
  group: string | null;
  creator: string;
  user_email: string | null;
  group_name: string | null;
  ownership_type: string;
  type: string;
  cloneable: boolean;
  max_files: number;
  max_size: null | number;
  cur_size: number;
}

export interface BAILegacyVFolderSelectRef {
  refetch: () => void;
}

export interface BAILegacyVFolderSelectProps extends Omit<
  BAIComplexSelectProps,
  'options' | 'value' | 'onChange' | 'searchValue' | 'onSearch' | 'total'
> {
  /** Plain folder key(s) — the REST `id` (32-hex), as VFolderTable's rowKey. */
  value?: string | Array<string> | null;
  defaultValue?: string | Array<string> | null;
  onChange?: (value: string | Array<string> | undefined) => void;
  /**
   * Project scope. Folders owned by another project are dropped, and the
   * project's `allowed_vfolder_hosts` join the mountable-host gate. Without
   * it only the domain and keypair policies gate the hosts.
   */
  currentProjectId?: string;
  /** Lists the folders of this user instead of the caller's own. */
  ownerEmail?: string;
  /**
   * Keypair resource policy whose `allowed_vfolder_hosts` gate the list.
   * Resolved from the connected client's access key when omitted.
   */
  keypairResourcePolicyName?: string;
  /**
   * Display-only filter, applied after the mount gates. A folder that is
   * already selected stays visible even when it filters out — the same rule
   * VFolderTable applies to its `rowFilter`.
   */
  filter?: (folder: LegacyVFolder) => boolean;
  /** Selected keys that are not (or no longer) mountable, plus the valid rest. */
  onInvalidSelection?: (
    invalidKeys: Array<string>,
    validFolders: Array<LegacyVFolder>,
  ) => void;
  /** Names of the mountable, ready dotfile folders the session auto-mounts. */
  onAutoMountedFoldersChange?: (names: Array<string>) => void;
  /** key -> name for every loaded folder, so callers can label a selection. */
  onResolvedNamesChange?: (nameMap: Record<string, string>) => void;
  ref?: React.Ref<BAILegacyVFolderSelectRef>;
}

const MOUNT_PERMISSION = 'mount-in-session';
// `group(id:)` is `UUID!`; a placeholder keeps the query valid while the
// selection is @skip-ed because no project is scoped.
const UNSCOPED_GROUP_ID = '00000000-0000-0000-0000-000000000000';

/**
 * Folder picker over the REST `GET /folders` list, reproducing the mount
 * gates of the session launcher's legacy VFolderTable: only hosts whose
 * merged domain / project / keypair-policy permissions include
 * `mount-in-session`, and only folders the current project can reach. Prefer
 * {@link BAIVFolderSelect} — this exists for the launcher's mount field,
 * whose gates the GraphQL `vfolder_nodes` connection cannot express.
 *
 * The value is the REST `id` (32-hex, dash-less); convert it with
 * `convertToUUID` before handing it to anything that wants a UUID.
 */
const BAILegacyVFolderSelect: React.FC<BAILegacyVFolderSelectProps> = ({
  currentProjectId,
  ownerEmail,
  keypairResourcePolicyName,
  filter,
  onInvalidSelection,
  onAutoMountedFoldersChange,
  onResolvedNamesChange,
  multiple = false,
  isLoading,
  ref,
  ...selectProps
}) => {
  'use memo';
  const { t } = useBAIi18n();
  const baiClient = useConnectedBAIClient();
  const baiRequestWithPromise = useBAISignedRequestWithPromise();
  const [value, setValue] = useControllableValue<
    string | Array<string> | null | undefined
  >(selectProps as Record<string, unknown>, {
    valuePropName: 'value',
    trigger: 'onChange',
  });
  const [searchStr, setSearchStr] = useState('');
  const [fetchKey, updateFetchKey] = useFetchKey();
  const [isPendingRefetch, startRefetchTransition] = useTransition();

  const selectedKeys = _.compact(_.castArray(value ?? []));

  const { data: allFolderList } = useSuspenseTanQuery<Array<LegacyVFolder>>({
    queryKey: [
      'BAILegacyVFolderSelectFolders',
      fetchKey,
      currentProjectId ?? '',
      ownerEmail ?? '',
    ],
    queryFn: () => {
      const search = new URLSearchParams();
      // The endpoint has no working `group_id` filter, so the project scope is
      // applied client-side below (same as VFolderTable).
      if (ownerEmail) search.set('owner_user_email', ownerEmail);
      const query = search.toString();
      return baiRequestWithPromise({
        method: 'GET',
        url: `/folders${query ? `?${query}` : ''}`,
      }) as Promise<Array<LegacyVFolder>>;
    },
    staleTime: 1000,
  });

  const accessKey = baiClient._config?.accessKey ?? baiClient.accessKey ?? '';
  const { keypair } = useLazyLoadQuery<BAILegacyVFolderSelectKeypairQuery>(
    graphql`
      query BAILegacyVFolderSelectKeypairQuery(
        $accessKey: String!
        $skipKeypair: Boolean!
      ) {
        keypair(access_key: $accessKey) @skip(if: $skipKeypair) {
          resource_policy
        }
      }
    `,
    { accessKey, skipKeypair: !!keypairResourcePolicyName || !accessKey },
    { fetchPolicy: 'store-and-network', fetchKey },
  );

  const { domain, group, keypair_resource_policy } =
    useLazyLoadQuery<BAILegacyVFolderSelectAllowedHostsQuery>(
      graphql`
        query BAILegacyVFolderSelectAllowedHostsQuery(
          $domain_name: String!
          $group_id: UUID!
          $skipGroup: Boolean!
          $keypair_resource_policy_name: String!
        ) {
          domain(name: $domain_name) {
            allowed_vfolder_hosts
          }
          group(id: $group_id, domain_name: $domain_name)
            @skip(if: $skipGroup) {
            allowed_vfolder_hosts
          }
          keypair_resource_policy(name: $keypair_resource_policy_name) {
            allowed_vfolder_hosts
          }
        }
      `,
      {
        domain_name: baiClient._config?.domainName ?? '',
        group_id: currentProjectId || UNSCOPED_GROUP_ID,
        skipGroup: !currentProjectId,
        keypair_resource_policy_name:
          keypairResourcePolicyName || keypair?.resource_policy || '',
      },
      { fetchPolicy: 'store-and-network', fetchKey },
    );

  const parseAllowedHosts = (raw: string | null | undefined) => {
    try {
      return JSON.parse(raw || '{}') as Record<string, Array<string>>;
    } catch {
      return {};
    }
  };
  const mergedHostPermissions = _.merge(
    {},
    parseAllowedHosts(domain?.allowed_vfolder_hosts),
    parseAllowedHosts(group?.allowed_vfolder_hosts),
    parseAllowedHosts(keypair_resource_policy?.allowed_vfolder_hosts),
  );
  const mountableHosts = Object.keys(mergedHostPermissions).filter((host) =>
    _.includes(mergedHostPermissions[host], MOUNT_PERMISSION),
  );

  const mountableFolders = _.filter(
    allFolderList ?? [],
    (folder) =>
      (folder.ownership_type === 'user' ||
        !folder.group ||
        folder.group === currentProjectId) &&
      _.includes(mountableHosts, folder.host),
  );

  const autoMountedFolderNames = _.map(
    _.filter(
      mountableFolders,
      (folder) => folder.status === 'ready' && folder.name?.startsWith('.'),
    ),
    (folder) => folder.name,
  );
  const nameMap = _.fromPairs(
    _.map(mountableFolders, (folder) => [folder.id, folder.name]),
  );
  const invalidKeys = _.difference(
    selectedKeys,
    _.map(mountableFolders, (folder) => folder.id),
  );

  // The three report-outward callbacks. Each is keyed on its own payload by
  // CONTENT, so a parent re-render never retriggers it.
  const autoMountedKey = JSON.stringify(autoMountedFolderNames);
  const invalidSelectionKey = JSON.stringify([invalidKeys, selectedKeys]);
  const nameMapKey = JSON.stringify(nameMap);

  const reportAutoMounted = useEffectEvent(() => {
    onAutoMountedFoldersChange?.(autoMountedFolderNames);
  });
  useEffect(() => {
    reportAutoMounted();
  }, [autoMountedKey]);

  const reportInvalidSelection = useEffectEvent(() => {
    onInvalidSelection?.(
      invalidKeys,
      _.filter(mountableFolders, (folder) =>
        _.includes(selectedKeys, folder.id),
      ),
    );
  });
  useEffect(() => {
    reportInvalidSelection();
  }, [invalidSelectionKey]);

  const reportResolvedNames = useEffectEvent(() => {
    onResolvedNamesChange?.(nameMap);
  });
  useEffect(() => {
    reportResolvedNames();
  }, [nameMapKey]);

  useImperativeHandle(
    ref,
    () => ({
      refetch: () => {
        startRefetchTransition(() => {
          updateFetchKey();
        });
      },
    }),
    [updateFetchKey],
  );

  const displayingFolders = _.filter(mountableFolders, (folder) => {
    if (_.includes(selectedKeys, folder.id)) return true;
    if (filter && !filter(folder)) return false;
    return !searchStr || _.includes(folder.name, searchStr);
  });

  const options = _.map(displayingFolders, (folder) => ({
    value: folder.id,
    label: folder.name,
    description: folder.host,
  }));

  const labeled: Array<BAILabeledValue> = _.map(selectedKeys, (key) => ({
    label: nameMap[key] ?? key,
    value: key,
  }));
  const labeledValue: BAIComplexSelectValue = multiple
    ? labeled
    : (labeled[0] ?? null);

  return (
    <BAIComplexSelect
      placeholder={t('comp:BAILegacyVFolderSelect.SelectFolder')}
      {...selectProps}
      multiple={multiple}
      isLoading={isLoading || isPendingRefetch}
      total={displayingFolders.length}
      options={options}
      value={labeledValue}
      onChange={(next) => {
        const keys = _.map(_.compact(_.castArray(next ?? [])), (v) => v.value);
        setValue(multiple ? keys : keys[0], undefined);
      }}
      searchValue={searchStr}
      onSearch={setSearchStr}
    />
  );
};

export default BAILegacyVFolderSelect;
