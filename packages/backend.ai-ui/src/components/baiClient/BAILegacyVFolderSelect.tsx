/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { convertToUUID } from '../../helper';
import { useControllableValue } from '../../hooks';
import { useBAIi18n } from '../../hooks/useBAIi18n';
import BAIComplexSelect, {
  type BAIComplexSelectProps,
  type BAIComplexSelectValue,
  type BAILabeledValue,
} from '../BAIComplexSelect';
import {
  isMountableLegacyVFolder,
  useLegacyVFolderList,
} from './useLegacyVFolderList';
import * as _ from 'lodash-es';
import { useState } from 'react';

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
  /**
   * `labelInValue`-shaped, array iff `multiple`: `value` is the dashed vfolder
   * UUID (a 32-hex REST id is accepted and normalized) and `label` its name. A
   * missing or stale label is re-resolved from the loaded list.
   */
  value?: BAIComplexSelectValue;
  defaultValue?: BAIComplexSelectValue;
  onChange?: (value: BAIComplexSelectValue) => void;
  /** Project scope: folders owned by another project are dropped. */
  currentProjectId?: string;
  /** Lists the folders of this user instead of the caller's own. */
  ownerEmail?: string;
  /**
   * Hosts granting `mount-in-session`. Which policies merge into that list is
   * the host app's business, so it is supplied rather than queried here.
   */
  mountableHosts: Array<string>;
  /**
   * Folders the session mounts on its own. They are dropped from the options —
   * offering a folder that is mounted regardless is noise — while a caller
   * still uses the names for its own overlap checks.
   */
  autoMountedFolderNames?: Array<string>;
  /**
   * Display-only filter, applied after the mount gates. A folder that is
   * already selected stays visible even when it filters out — the same rule
   * VFolderTable applies to its `rowFilter`.
   */
  filter?: (folder: LegacyVFolder) => boolean;
}

const toLabeledArray = (
  value: BAIComplexSelectValue,
): Array<BAILabeledValue> =>
  value === null || value === undefined ? [] : _.castArray(value);

/**
 * Folder picker over the REST `GET /folders` list, gated to the mountable
 * hosts and the reachable folders of `currentProjectId`. See the `.doc.ts`.
 */
const BAILegacyVFolderSelect: React.FC<BAILegacyVFolderSelectProps> = ({
  currentProjectId,
  ownerEmail,
  mountableHosts,
  autoMountedFolderNames,
  filter,
  multiple = false,
  ...selectProps
}) => {
  'use memo';
  const { t } = useBAIi18n();
  const allFolderList = useLegacyVFolderList(ownerEmail);
  const [value, setValue] = useControllableValue<BAIComplexSelectValue>(
    selectProps as Record<string, unknown>,
    { valuePropName: 'value', trigger: 'onChange' },
  );
  const [searchStr, setSearchStr] = useState('');

  const mountableHostSet = new Set(mountableHosts);
  const autoMountedNameSet = new Set(autoMountedFolderNames ?? []);

  const mountableFolders = _.filter(
    allFolderList,
    (folder) =>
      isMountableLegacyVFolder(folder, {
        mountableHosts: mountableHostSet,
        currentProjectId,
      }) && !autoMountedNameSet.has(folder.name),
  );

  const nameByKey = _.fromPairs(
    _.map(mountableFolders, (folder) => [
      convertToUUID(folder.id),
      folder.name,
    ]),
  );

  // Normalize a stored 32-hex id and re-resolve a stale label, so a selection
  // restored from a URL or a template labels itself from the loaded list. A
  // selection the gates no longer offer keeps rendering — the gates shape the
  // OPTIONS only, never the value.
  const selected: Array<BAILabeledValue> = _.map(
    toLabeledArray(value),
    (item) => {
      const key = convertToUUID(item.value);
      return { value: key, label: nameByKey[key] ?? item.label ?? key };
    },
  );
  const selectedKeySet = new Set(_.map(selected, (item) => item.value));

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

  return (
    <BAIComplexSelect
      placeholder={t('comp:BAILegacyVFolderSelect.SelectFolder')}
      {...selectProps}
      multiple={multiple}
      total={displayingFolders.length}
      options={options}
      value={multiple ? selected : (selected[0] ?? null)}
      onChange={(next) => setValue(next, undefined)}
      searchValue={searchStr}
      onSearch={setSearchStr}
    />
  );
};

export default BAILegacyVFolderSelect;
