/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { convertToUUID } from '../../helper';
import { useSuspenseTanQuery } from '../../helper/reactQueryAlias';
import {
  useBAISignedRequestWithPromise,
  useControllableValue,
} from '../../hooks';
import { useBAIi18n } from '../../hooks/useBAIi18n';
import { useMergedAllowedVFolderHosts } from '../../hooks/useMergedAllowedVFolderHosts';
import BAIComplexSelect, {
  type BAIComplexSelectProps,
  type BAIComplexSelectValue,
  type BAILabeledValue,
} from '../BAIComplexSelect';
import useConnectedBAIClient from '../provider/BAIClientProvider/hooks/useConnectedBAIClient';
import * as _ from 'lodash-es';
import { useEffect, useEffectEvent, useState } from 'react';

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

export interface BAILegacyVFolderSelectProps extends Omit<
  BAIComplexSelectProps,
  'options' | 'value' | 'onChange' | 'searchValue' | 'onSearch' | 'total'
> {
  /** Dashed vfolder UUID(s). A 32-hex REST id is accepted and normalized. */
  value?: string | Array<string> | null;
  defaultValue?: string | Array<string> | null;
  onChange?: (value: string | Array<string> | undefined) => void;
  /**
   * Project scope. Folders owned by another project are dropped, and the
   * project's `allowed_vfolder_hosts` join the mountable-host gate.
   */
  currentProjectId?: string;
  /** Lists the folders of this user instead of the caller's own. */
  ownerEmail?: string;
  /**
   * Display-only filter, applied after the mount gates. A folder that is
   * already selected stays visible even when it filters out — the same rule
   * VFolderTable applies to its `rowFilter`.
   */
  filter?: (folder: LegacyVFolder) => boolean;
  /** Names of the mountable, ready dotfile folders the session auto-mounts. */
  onAutoMountedFoldersChange?: (names: Array<string>) => void;
  /** key -> name for every mountable folder, so callers can label a selection. */
  onResolvedNamesChange?: (nameMap: Record<string, string>) => void;
}

/**
 * Folder picker over the REST `GET /folders` list, gated as the session
 * launcher gates its mounts: `mount-in-session` hosts only, project-reachable
 * folders only. Value is the dashed vfolder UUID. See the `.doc.ts` beside it.
 */
const BAILegacyVFolderSelect: React.FC<BAILegacyVFolderSelectProps> = ({
  currentProjectId,
  ownerEmail,
  filter,
  onAutoMountedFoldersChange,
  onResolvedNamesChange,
  multiple = false,
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

  const selectedKeys = _.map(
    _.compact(_.castArray(value ?? [])),
    convertToUUID,
  );
  const selectedKeySet = new Set(selectedKeys);

  const { data: allFolderList } = useSuspenseTanQuery<Array<LegacyVFolder>>({
    // The request itself carries no project scope — that filter is applied
    // client-side below (same as VFolderTable).
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

  const { mountableHosts } = useMergedAllowedVFolderHosts({
    domainName: baiClient._config?.domainName ?? '',
    projectId: currentProjectId,
  });
  const mountableHostSet = new Set(mountableHosts);

  const mountableFolders = _.filter(
    allFolderList ?? [],
    (folder) =>
      (folder.ownership_type === 'user' ||
        !folder.group ||
        folder.group === currentProjectId) &&
      mountableHostSet.has(folder.host),
  );

  const autoMountedFolderNames = _.map(
    _.filter(
      mountableFolders,
      (folder) => folder.status === 'ready' && folder.name?.startsWith('.'),
    ),
    (folder) => folder.name,
  );
  const nameMap = _.fromPairs(
    _.map(mountableFolders, (folder) => [
      convertToUUID(folder.id),
      folder.name,
    ]),
  );

  // `mountableFolders` is a stable reference under `'use memo'`, so it changes
  // only when the underlying list or a gate does.
  const report = useEffectEvent(() => {
    onResolvedNamesChange?.(nameMap);
    onAutoMountedFoldersChange?.(autoMountedFolderNames);
  });
  useEffect(() => {
    report();
  }, [mountableFolders]);

  const displayingFolders = _.filter(mountableFolders, (folder) => {
    if (selectedKeySet.has(convertToUUID(folder.id))) return true;
    if (filter && !filter(folder)) return false;
    return !searchStr || _.includes(folder.name, searchStr);
  });

  const options = _.map(displayingFolders, (folder) => ({
    value: convertToUUID(folder.id),
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
