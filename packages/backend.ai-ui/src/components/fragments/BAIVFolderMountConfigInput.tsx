import { App } from '../../app-shim';
import { Form, type RuleObject } from '../../form-engine';
import { convertToUUID } from '../../helper';
import { useSuspenseTanQuery } from '../../helper/reactQueryAlias';
import {
  useBAISignedRequestWithPromise,
  useControllableValue,
} from '../../hooks';
import { useBAIi18n } from '../../hooks/useBAIi18n';
import { theme } from '../../theme-shim';
import BAIButton from '../BAIButton';
import BAIComplexSelect, {
  type BAIComplexSelectValue,
  type BAILabeledValue,
} from '../BAIComplexSelect';
import BAIFlex from '../BAIFlex';
import BAIQuestionIconWithTooltip from '../BAIQuestionIconWithTooltip';
import BAIText from '../BAIText';
import BAIVFolderPathPicker from '../baiClient/FileExplorer/BAIVFolderPathPicker';
import { Badge } from '@astryxdesign/core/Badge';
import { TextInput } from '@astryxdesign/core/TextInput';
import { Tooltip } from '@astryxdesign/core/Tooltip';
import * as _ from 'lodash-es';
import { XIcon } from 'lucide-react';
import React, { useEffect, useEffectEvent, useState } from 'react';

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

/**
 * A single vfolder mount configuration emitted by BAIVFolderMountConfigInput.
 *
 * - `subpath` is the mount **source**: which subfolder inside the vfolder to
 *   mount. Empty means the vfolder root.
 * - `mountDestination` is the **raw alias** the user typed, stored verbatim so
 *   the input box never transforms text mid-edit: `''` mounts at the default
 *   `${aliasBasePath}${name}`, a relative segment like `data` resolves to
 *   `${aliasBasePath}data`, and an absolute path like `/data` is used as-is.
 *   Resolve it to the full container path with {@link inputToMountDestination}.
 */
export interface VFolderMountConfigValue {
  vfolderId: string;
  /**
   * The folder name. Optional for legacy values, but a producer should set it:
   * an empty alias resolves to `${aliasBasePath}${name}`, so without it the
   * mount path falls back to the raw id.
   */
  name?: string;
  mountDestination?: string;
  subpath?: string;
}

export interface BAIVFolderMountConfigInputProps {
  value?: VFolderMountConfigValue[];
  defaultValue?: VFolderMountConfigValue[];
  onChange?: (value: VFolderMountConfigValue[]) => void;
  currentProjectId?: string;
  /** Lists the folders of this user instead of the caller's own. */
  ownerEmail?: string;
  /**
   * Hosts granting `mount-in-session`. Which policies merge into that list
   * is the host app's business, so it is supplied rather than queried here.
   */
  mountableHosts: string[];
  /**
   * Display-only folder filter, applied after the mount gates. An already
   * selected folder stays visible even when it filters out.
   */
  filter?: (folder: LegacyVFolder) => boolean;
  disabled?: boolean;
  /** Base path prepended to a relative alias input (mirrors VFolderTable). */
  aliasBasePath?: string;
  /**
   * Names of folders that are auto-mounted. Their default mount paths
   * (`${aliasBasePath}${name}`) join the overlap set so a colliding user alias
   * is flagged, they are shown as a read-only tag list at the bottom, and
   * they are dropped from the folder options.
   */
  autoMountedFolderNames?: string[];
}

// Mirrors the alias validation used by the legacy VFolderTable mount UI.
export const vFolderAliasNameRegExp = /^[a-zA-Z0-9_/.-]*$/;

/** Container path a folder mounts under when its alias is left empty. */
export const DEFAULT_ALIAS_BASE_PATH = '/home/work/';

/**
 * Convert a user-entered alias input into the resolved mount destination,
 * following the same rule as VFolderTable's `inputToAliasPath`:
 * - empty input        -> `${basePath}${name}`
 * - input starting `/` -> used as-is (absolute path)
 * - otherwise          -> `${basePath}${input}` (relative to the base path)
 */
export const inputToMountDestination = (
  name: string,
  input: string | undefined,
  basePath: string = DEFAULT_ALIAS_BASE_PATH,
) => {
  const trimmed = input?.trim();
  if (!trimmed) return `${basePath}${name}`;
  if (trimmed.startsWith('/')) return trimmed;
  return `${basePath}${trimmed}`;
};

/**
 * Inverse of {@link inputToMountDestination}: recover the raw alias a resolved
 * mount destination came from, so a stored absolute path edits as the relative
 * segment the user would have typed.
 */
export const mountDestinationToInput = (
  name: string,
  mountDestination: string | undefined,
  basePath: string = DEFAULT_ALIAS_BASE_PATH,
) => {
  if (!mountDestination) return '';
  if (mountDestination === `${basePath}${name}`) return '';
  if (mountDestination.startsWith(basePath))
    return mountDestination.slice(basePath.length);
  return mountDestination;
};

// Subpath must be a relative path that does not escape the vfolder.
const isSubpathInvalid = (subpath?: string) => {
  const trimmed = subpath?.trim();
  if (!trimmed) return false;
  if (trimmed.startsWith('/')) return true;
  return trimmed.split('/').some((segment) => segment === '..');
};

export interface VFolderMountConfigStatusOptions {
  /** Base path prepended to a relative alias input (mirrors VFolderTable). */
  aliasBasePath?: string;
  /** Names of auto-mounted folders, included in the overlap check. */
  autoMountedFolderNames?: string[];
}

export interface VFolderMountConfigEntryStatus {
  /** The resolved absolute mount path for the entry (for display). */
  mountDestination: string;
  /** Alias error, if any: a bad path format or a colliding mount path. */
  aliasError?: 'invalidFormat' | 'overlapping' | 'overlappingWithAutoMount';
  /** Set when the subpath is absolute or escapes the vfolder via `..`. */
  subpathError?: boolean;
}

/**
 * Compute, per entry, its resolved mount destination and any alias/subpath
 * error — the single source of truth behind the component's inline feedback.
 * Exported so a consumer can gate a form on validity (see
 * {@link isVFolderMountConfigValid}) or translate the error kinds itself.
 */
export const getVFolderMountConfigStatuses = (
  value: VFolderMountConfigValue[] | undefined,
  options?: VFolderMountConfigStatusOptions,
): Record<string, VFolderMountConfigEntryStatus> => {
  const basePath = options?.aliasBasePath ?? DEFAULT_ALIAS_BASE_PATH;
  const entries = value ?? [];

  const mountDestinationByVFolderId: Record<string, string> = {};
  entries.forEach((entry) => {
    mountDestinationByVFolderId[entry.vfolderId] = inputToMountDestination(
      entry.name || entry.vfolderId,
      entry.mountDestination,
      basePath,
    );
  });
  // Auto-mounted folders occupy their default mount path; include them so a
  // user alias colliding with an auto-mounted folder counts as an overlap.
  const autoMountDestinations = new Set(
    (options?.autoMountedFolderNames ?? []).map((n) =>
      inputToMountDestination(n, '', basePath),
    ),
  );
  const destinationCounts = _.countBy([
    ...Object.values(mountDestinationByVFolderId),
    ...autoMountDestinations,
  ]);

  const resolveAliasError = (
    entry: VFolderMountConfigValue,
    mountDestination: string,
  ): VFolderMountConfigEntryStatus['aliasError'] => {
    if (!vFolderAliasNameRegExp.test(entry.mountDestination ?? ''))
      return 'invalidFormat';
    if (destinationCounts[mountDestination] <= 1) return undefined;
    return autoMountDestinations.has(mountDestination)
      ? 'overlappingWithAutoMount'
      : 'overlapping';
  };

  const statuses: Record<string, VFolderMountConfigEntryStatus> = {};
  entries.forEach((entry) => {
    const mountDestination = mountDestinationByVFolderId[entry.vfolderId];
    statuses[entry.vfolderId] = {
      mountDestination,
      aliasError: resolveAliasError(entry, mountDestination),
      subpathError: isSubpathInvalid(entry.subpath),
    };
  });
  return statuses;
};

/** One entry's mount as it goes to the server, alias already resolved. */
export interface ResolvedVFolderMount {
  vfolderId: string;
  name: string;
  mountDestination: string;
  /** True when the alias input was left empty, so the default path applies. */
  isDefaultAlias: boolean;
  subpath: string;
}

/** Resolve every entry's name, mount destination and subpath in one pass. */
export const resolveVFolderMounts = (
  value: VFolderMountConfigValue[] | undefined,
  options?: VFolderMountConfigStatusOptions,
): Array<ResolvedVFolderMount> =>
  _.map(value ?? [], (entry) => {
    const name = entry.name || entry.vfolderId;
    return {
      vfolderId: entry.vfolderId,
      name,
      mountDestination: inputToMountDestination(
        name,
        entry.mountDestination,
        options?.aliasBasePath ?? DEFAULT_ALIAS_BASE_PATH,
      ),
      isDefaultAlias: _.isEmpty(entry.mountDestination?.trim()),
      subpath: entry.subpath?.trim() ?? '',
    };
  });

export interface VFolderMountCreationConfig {
  mount_ids: Array<string>;
  mount_id_map: Record<string, string>;
  mount_options?: Record<string, { subpath: string }>;
}

/**
 * Manager `creation_config` contract (>= 26.4.4): `mount_ids` names the
 * folders, `mount_id_map[id]` their container paths, `mount_options[id].subpath`
 * the in-vfolder source subfolder.
 */
export const toMountCreationConfig = (
  value: VFolderMountConfigValue[] | undefined,
  options?: VFolderMountConfigStatusOptions,
): VFolderMountCreationConfig => {
  const mounts = _.map(resolveVFolderMounts(value, options), (mount) => ({
    ...mount,
    id: convertToUUID(mount.vfolderId),
  }));
  const mountOptions = _.fromPairs(
    _.map(
      _.filter(mounts, (mount) => !!mount.subpath),
      (mount) => [mount.id, { subpath: mount.subpath }],
    ),
  );

  return {
    mount_ids: _.map(mounts, (mount) => mount.id),
    mount_id_map: _.fromPairs(
      _.map(mounts, (mount) => [mount.id, mount.mountDestination]),
    ),
    ...(_.isEmpty(mountOptions) ? {} : { mount_options: mountOptions }),
  };
};

/** True when every entry's alias and subpath are valid. */
export const isVFolderMountConfigValid = (
  value: VFolderMountConfigValue[] | undefined,
  options?: VFolderMountConfigStatusOptions,
): boolean =>
  Object.values(getVFolderMountConfigStatuses(value, options)).every(
    (status) => !status.aliasError && !status.subpathError,
  );

/**
 * A `Form.Item` `rules` entry gating the launch on the mount configuration,
 * rejecting with the most specific of the alias / subpath messages.
 */
export const useVFolderMountConfigFormRule = (
  options?: VFolderMountConfigStatusOptions,
): RuleObject => {
  'use memo';
  const { t } = useBAIi18n();

  return {
    validator: (_rule, value: VFolderMountConfigValue[] | undefined) => {
      const statuses = _.values(getVFolderMountConfigStatuses(value, options));
      const rejectWith = (key: string) => Promise.reject(new Error(t(key)));
      const hasAliasError = (
        kind: VFolderMountConfigEntryStatus['aliasError'],
      ) => _.some(statuses, (status) => status.aliasError === kind);

      if (hasAliasError('invalidFormat'))
        return rejectWith('comp:BAIVFolderMountConfigInput.AliasInvalid');
      if (hasAliasError('overlappingWithAutoMount'))
        return rejectWith(
          'comp:BAIVFolderMountConfigInput.AliasOverlappingWithAutoMount',
        );
      if (hasAliasError('overlapping'))
        return rejectWith('comp:BAIVFolderMountConfigInput.AliasOverlapping');
      if (_.some(statuses, (status) => status.subpathError))
        return rejectWith('comp:BAIVFolderMountConfigInput.SubpathInvalid');
      return Promise.resolve();
    },
  };
};

/**
 * Reusable, schema-agnostic input for configuring vfolder mounts.
 *
 * Users pick vfolders from the REST `GET /folders` list, gated by the
 * `mountableHosts` / `autoMountedFolderNames` the host supplies — gates the
 * `vfolder_nodes` connection cannot express, which is why the legacy endpoint
 * is still the source. It suspends on that list; the consumer owns the
 * Suspense boundary.
 * Each selected folder appears as a row below the select where its mount
 * destination (alias) is typed and its subpath is browsed with
 * {@link BAIVFolderPathPicker}. The alias input follows VFolderTable's rule
 * (relative inputs are prefixed with `aliasBasePath`, absolute inputs are used
 * as-is); the emitted `mountDestination` stores that raw alias verbatim, which
 * the consumer resolves to the full path with {@link inputToMountDestination}.
 * The component is controlled and emits a single `VFolderMountConfigValue[]`.
 *
 * The inline per-row errors are advisory UX only. To gate a form on validity,
 * wrap the component in one named `Form.Item` whose `rules` carry
 * {@link useVFolderMountConfigFormRule}, so `form.validateFields()` rejects on
 * invalid input with the already-translated message:
 *
 * ```tsx
 * <Form.Item
 *   name="vfolderMounts"
 *   rules={[useVFolderMountConfigFormRule({ autoMountedFolderNames })]}
 * >
 *   <BAIVFolderMountConfigInput autoMountedFolderNames={autoMountedFolderNames} />
 * </Form.Item>
 * ```
 */
const BAIVFolderMountConfigInput: React.FC<BAIVFolderMountConfigInputProps> = ({
  currentProjectId,
  ownerEmail,
  mountableHosts,
  filter,
  disabled,
  aliasBasePath = DEFAULT_ALIAS_BASE_PATH,
  autoMountedFolderNames,
  ...props
}) => {
  'use memo';
  const { t } = useBAIi18n();
  const { message } = App.useApp();
  const { token } = theme.useToken();
  const baiRequestWithPromise = useBAISignedRequestWithPromise();
  const [value, setValue] = useControllableValue<VFolderMountConfigValue[]>(
    props,
    { defaultValue: [] },
  );
  const [searchStr, setSearchStr] = useState('');
  const mountConfigs = value ?? [];
  // The select is `labelInValue`-shaped, so the folder name travels with the
  // selection and no separate name lookup is needed.
  const selectedFolders: BAILabeledValue[] = mountConfigs.map((entry) => ({
    value: entry.vfolderId,
    label: entry.name ?? entry.vfolderId,
  }));
  const selectedIdSet = new Set(_.map(mountConfigs, (e) => e.vfolderId));

  const { data: allFolderList } = useSuspenseTanQuery<Array<LegacyVFolder>>({
    // The request carries no project scope — that gate is applied client-side.
    queryKey: ['BAIVFolderMountConfigInputFolders', ownerEmail ?? ''],
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

  const mountableHostSet = new Set(mountableHosts);
  const autoMountedNameSet = new Set(autoMountedFolderNames ?? []);
  // Offering an auto-mounted folder is noise: the session mounts it anyway, so
  // picking it could only produce a duplicate mount path.
  const mountableFolders = _.filter(
    allFolderList ?? [],
    (folder) =>
      mountableHostSet.has(folder.host) &&
      (folder.ownership_type === 'user' ||
        !folder.group ||
        folder.group === currentProjectId) &&
      !autoMountedNameSet.has(folder.name),
  );
  const mountableIdSet = new Set(
    _.map(mountableFolders, (folder) => convertToUUID(folder.id)),
  );

  // A value restored from a template or a URL can name a folder this owner and
  // project cannot mount. Drop it rather than letting the launch fail server
  // side, and say so — a selection shrinking on its own is otherwise silent.
  // The early return is also what keeps the emitted value from looping back in.
  const pruneUnmountableEntries = useEffectEvent(() => {
    const kept = _.filter(mountConfigs, (entry) =>
      mountableIdSet.has(entry.vfolderId),
    );
    if (kept.length === mountConfigs.length) return;
    setValue(kept);
    message.warning(
      t('comp:BAIVFolderMountConfigInput.UnmountableFoldersRemoved'),
    );
  });
  useEffect(() => {
    pruneUnmountableEntries();
  }, [mountableFolders]);

  const displayingFolders = _.filter(mountableFolders, (folder) => {
    if (selectedIdSet.has(convertToUUID(folder.id))) return true;
    if (filter && !filter(folder)) return false;
    return !searchStr || _.includes(folder.name, searchStr);
  });

  // Resolve each entry's mount destination + validity once via the same
  // exported helper a consumer uses to gate the form, then read per row below.
  const statusByVFolderId = getVFolderMountConfigStatuses(mountConfigs, {
    aliasBasePath,
    autoMountedFolderNames,
  });

  // The select's value carries the folder name, so a new entry is named on the
  // spot and no backfill pass is needed.
  const handleSelectionChange = (next: BAIComplexSelectValue) => {
    const selected =
      next === null || next === undefined ? [] : _.castArray(next);
    setValue(
      _.map(selected, (item) => {
        const existing = _.find(
          mountConfigs,
          (entry) => entry.vfolderId === item.value,
        );
        if (existing) return { ...existing, name: item.label };
        return {
          vfolderId: item.value,
          name: item.label,
          // Raw alias starts empty -> resolves to the default mount path
          // (`${aliasBasePath}${name}`) at display time.
          mountDestination: '',
          subpath: '',
        };
      }),
    );
  };

  return (
    <BAIFlex direction="column" align="stretch" gap="xs">
      <BAIComplexSelect
        multiple
        label={t('comp:BAIVFolderMountConfigInput.SelectFolder')}
        isLabelHidden
        isDisabled={disabled}
        placeholder={t('comp:BAIVFolderMountConfigInput.SelectFolder')}
        total={displayingFolders.length}
        options={_.map(displayingFolders, (folder) => ({
          value: convertToUUID(folder.id),
          label: folder.name,
          description: folder.host,
        }))}
        value={selectedFolders}
        onChange={handleSelectionChange}
        searchValue={searchStr}
        onSearch={setSearchStr}
      />
      {mountConfigs.length > 0 && (
        <BAIFlex direction="column" align="stretch" gap="xxs">
          <BAIFlex gap="xxs" align="center">
            <BAIText type="secondary" style={{ width: 150, flexShrink: 0 }}>
              {t('comp:BAIVFolderMountConfigInput.Name')}
            </BAIText>
            <BAIFlex gap="xxs" align="center" style={{ flex: 1 }}>
              <BAIText type="secondary">
                {t('comp:BAIVFolderMountConfigInput.PathAndAlias')}
              </BAIText>
              <BAIQuestionIconWithTooltip
                title={t('comp:BAIVFolderMountConfigInput.PathAndAliasTooltip')}
              />
            </BAIFlex>
            <BAIFlex gap="xxs" align="center" style={{ flex: 1 }}>
              <BAIText type="secondary">
                {t('comp:BAIVFolderMountConfigInput.Subpath')}
              </BAIText>
              <BAIQuestionIconWithTooltip
                title={t('comp:BAIVFolderMountConfigInput.SubpathTooltip')}
              />
            </BAIFlex>
            {/* Spacer aligning the header with the row's remove-button column
                (kept in sync with the ✕ icon size via token.size). */}
            <span style={{ width: token.size, flexShrink: 0 }} />
          </BAIFlex>
          {mountConfigs.map((entry) => {
            const name = entry.name || entry.vfolderId;
            const aliasInput = entry.mountDestination ?? '';
            const status = statusByVFolderId[entry.vfolderId];
            const effectiveDestination = status.mountDestination;
            const aliasErrorMessage = status.aliasError
              ? t(
                  {
                    invalidFormat:
                      'comp:BAIVFolderMountConfigInput.AliasInvalid',
                    overlapping:
                      'comp:BAIVFolderMountConfigInput.AliasOverlapping',
                    overlappingWithAutoMount:
                      'comp:BAIVFolderMountConfigInput.AliasOverlappingWithAutoMount',
                  }[status.aliasError],
                )
              : undefined;
            const subpathInvalid = !!status.subpathError;
            return (
              <BAIFlex
                key={entry.vfolderId}
                direction="row"
                align="start"
                gap="xxs"
              >
                <BAIText
                  ellipsis={{ tooltip: true }}
                  style={{
                    width: 150,
                    flexShrink: 0,
                    // Match the input control height so the name lines up with
                    // the input row, not the helper-text-inflated row height.
                    lineHeight: `${token.controlHeight}px`,
                  }}
                >
                  {name}
                </BAIText>
                {/* Nameless Form.Item: a controlled feedback wrapper (no Form
                    ancestor / no `rules`). `help` shows errors, `extra` the
                    always-on mount-destination hint. */}
                <Form.Item
                  validateStatus={aliasErrorMessage ? 'error' : undefined}
                  help={aliasErrorMessage}
                  extra={
                    aliasErrorMessage ? undefined : (
                      <BAIText type="secondary" ellipsis>
                        {effectiveDestination}
                      </BAIText>
                    )
                  }
                  style={{ flex: 1, marginBottom: 0 }}
                >
                  <TextInput
                    label={t(
                      'comp:BAIVFolderMountConfigInput.AliasPlaceholder',
                    )}
                    isLabelHidden
                    size="sm"
                    isDisabled={disabled}
                    placeholder={t(
                      'comp:BAIVFolderMountConfigInput.AliasPlaceholder',
                    )}
                    value={aliasInput ?? ''}
                    onChange={(next) =>
                      setValue((prev) =>
                        prev.map((m) =>
                          m.vfolderId === entry.vfolderId
                            ? { ...m, mountDestination: next }
                            : m,
                        ),
                      )
                    }
                  />
                </Form.Item>
                <Form.Item
                  validateStatus={subpathInvalid ? 'error' : undefined}
                  help={
                    subpathInvalid
                      ? t('comp:BAIVFolderMountConfigInput.SubpathInvalid')
                      : undefined
                  }
                  style={{ flex: 1, marginBottom: 0 }}
                >
                  <BAIVFolderPathPicker
                    label={t('comp:BAIVFolderMountConfigInput.Subpath')}
                    size="sm"
                    disabled={disabled}
                    vfolderUuid={entry.vfolderId}
                    value={entry.subpath}
                    onChange={(next) =>
                      setValue((prev) =>
                        prev.map((m) =>
                          m.vfolderId === entry.vfolderId
                            ? { ...m, subpath: next ?? '' }
                            : m,
                        ),
                      )
                    }
                  />
                </Form.Item>
                <Tooltip
                  content={t('comp:BAIVFolderMountConfigInput.RemoveFolder')}
                >
                  <BAIButton
                    type="text"
                    size="small"
                    disabled={disabled}
                    aria-label={t(
                      'comp:BAIVFolderMountConfigInput.RemoveFolder',
                    )}
                    icon={
                      <XIcon
                        size={token.size}
                        color={token.colorTextQuaternary}
                      />
                    }
                    // Match the input control height so the remove button
                    // centers on the input row, not the full (helper-inclusive)
                    // row height.
                    style={{ flexShrink: 0, height: token.controlHeight }}
                    onClick={() =>
                      setValue((prev) =>
                        prev.filter((m) => m.vfolderId !== entry.vfolderId),
                      )
                    }
                  />
                </Tooltip>
              </BAIFlex>
            );
          })}
        </BAIFlex>
      )}
      {autoMountedFolderNames && autoMountedFolderNames.length > 0 && (
        <BAIFlex gap="xxs" align="center" wrap="wrap">
          <BAIText type="secondary">
            {t('comp:BAIVFolderMountConfigInput.AutoMountedFolders')}
          </BAIText>
          {autoMountedFolderNames.map((folderName) => (
            <Badge key={folderName} variant="neutral" label={folderName} />
          ))}
        </BAIFlex>
      )}
    </BAIFlex>
  );
};

export default BAIVFolderMountConfigInput;
