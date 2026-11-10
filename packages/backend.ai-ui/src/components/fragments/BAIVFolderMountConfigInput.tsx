import { App } from '../../app-shim';
import { Form, type RuleObject } from '../../form-engine';
import { useControllableValue } from '../../hooks';
import { useBAIi18n } from '../../hooks/useBAIi18n';
import {
  mountableVFolderFilter,
  useSuspendedAutoMountedVFolders,
  type AutoMountedFolder,
  type VFolderFilter,
  type VFolderScope,
} from '../../hooks/useMountableVFolders';
import BAIButton from '../BAIButton';
import BAICard from '../BAICard';
import type { BAILabeledValue } from '../BAIComplexSelect';
import BAIFlex from '../BAIFlex';
import BAILink from '../BAILink';
import BAIQuestionIconWithTooltip from '../BAIQuestionIconWithTooltip';
import BAIText from '../BAIText';
import BAITextInput from '../BAITextInput';
import BAIVFolderIdenticon from '../BAIVFolderIdenticon';
import BAIVFolderPathPicker from '../baiClient/FileExplorer/BAIVFolderPathPicker';
import BAIScopedVFolderSelect, {
  type BAIScopedVFolderSelectRef,
  type ScopedVFolderResolution,
} from './BAIScopedVFolderSelect';
import './BAIVFolderMountConfigInput.css';
import { ButtonGroup } from '@lablup/ui-common/ButtonGroup';
import { Token } from '@lablup/ui-common/Token';
import { Tooltip } from '@lablup/ui-common/Tooltip';
import { useTheme } from '@lablup/ui-common/theme';
import * as _ from 'lodash-es';
import { ArrowRight, PlusIcon, RotateCw, XIcon } from 'lucide-react';
import React, { useImperativeHandle, useRef, useTransition } from 'react';
import type { LinkProps } from 'react-router-dom';

export type { AutoMountedFolder };

/**
 * A single vfolder mount configuration emitted by BAIVFolderMountConfigInput.
 * `mountDestination` holds the **raw alias** the user typed, verbatim, so the
 * input box never transforms text mid-edit; resolve it to the full container
 * path with {@link inputToMountDestination}.
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

export interface BAIVFolderMountConfigInputRef {
  /** Re-reads the folder options and the auto-mounted folders. */
  refetch: () => void;
}

export interface BAIVFolderMountConfigInputProps {
  value?: VFolderMountConfigValue[];
  defaultValue?: VFolderMountConfigValue[];
  onChange?: (value: VFolderMountConfigValue[]) => void;
  /**
   * The scopes a session mounts from, usually `mountableVFolderScope(userId,
   * projectId)`. The folder options and the auto-mounted folders are read over it.
   */
  scope: VFolderScope;
  /**
   * Hosts granting `mount-in-session`. Which policies merge into that list
   * is the host app's business, so it is supplied rather than queried here.
   */
  mountableHosts: string[];
  /**
   * Server-side filter ANDed onto the options query. It narrows the options
   * only; a selected folder it excludes stays selected.
   */
  filter?: VFolderFilter;
  disabled?: boolean;
  /** Base path prepended to a relative alias input. */
  aliasBasePath?: string;
  /**
   * Route that opens a folder in the host's folder explorer. Given, every
   * folder name the component renders becomes a link to it.
   */
  folderExplorerPath?: (vfolderId: string) => LinkProps['to'];
  /**
   * Opens the host's folder-creation modal. The create button is rendered only
   * when this is given, because the modal lives in the host app.
   */
  onClickCreateFolder?: () => void;
  ref?: React.Ref<BAIVFolderMountConfigInputRef>;
}

// Allowed characters of a mount alias.
export const vFolderAliasNameRegExp = /^[a-zA-Z0-9_/.-]*$/;

/** Container path a folder mounts under when its alias is left empty. */
export const DEFAULT_ALIAS_BASE_PATH = '/home/work/';

/** Convert a user-entered alias input into the resolved mount destination. */
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
  /** Base path prepended to a relative alias input. */
  aliasBasePath?: string;
  /** Auto-mounted folders, included in the overlap check. */
  autoMountedFolders?: ReadonlyArray<Pick<AutoMountedFolder, 'name'>>;
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
 * Exported so a consumer can gate a form on validity or translate the error
 * kinds itself.
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
    (options?.autoMountedFolders ?? []).map((folder) =>
      inputToMountDestination(folder.name, '', basePath),
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
  /** True when the mount resolves to the default `${aliasBasePath}${name}`. */
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
    const basePath = options?.aliasBasePath ?? DEFAULT_ALIAS_BASE_PATH;
    const mountDestination = inputToMountDestination(
      name,
      entry.mountDestination,
      basePath,
    );
    return {
      vfolderId: entry.vfolderId,
      name,
      mountDestination,
      isDefaultAlias: mountDestination === `${basePath}${name}`,
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
  const mounts = resolveVFolderMounts(value, options);
  const mountOptions = Object.fromEntries(
    mounts
      .filter((mount) => !!mount.subpath)
      .map((mount) => [mount.vfolderId, { subpath: mount.subpath }]),
  );

  return {
    mount_ids: mounts.map((mount) => mount.vfolderId),
    mount_id_map: Object.fromEntries(
      mounts.map((mount) => [mount.vfolderId, mount.mountDestination]),
    ),
    ...(_.isEmpty(mountOptions) ? {} : { mount_options: mountOptions }),
  };
};

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
 * Reusable input for configuring vfolder mounts. Folders are picked with
 * `BAIScopedVFolderSelect` over the caller's `scope`,
 * and the auto-mounted folders are read here too; both suspend on first load,
 * so the consumer owns the Suspense boundary.
 *
 * Props, form gating and usage: `BAIVFolderMountConfigInput.doc.ts`.
 */
const BAIVFolderMountConfigInput: React.FC<BAIVFolderMountConfigInputProps> = ({
  scope,
  mountableHosts,
  filter,
  disabled,
  aliasBasePath = DEFAULT_ALIAS_BASE_PATH,
  folderExplorerPath,
  onClickCreateFolder,
  ref,
  ...props
}) => {
  'use memo';
  const { t } = useBAIi18n();
  const { message } = App.useApp();
  const { token } = useTheme();
  const [value, setValue] = useControllableValue<VFolderMountConfigValue[]>(
    props,
    { defaultValue: [] },
  );
  const selectRef = useRef<BAIScopedVFolderSelectRef>(null);
  const [isPendingRefetch, startRefetchTransition] = useTransition();
  const { autoMountedFolders, refetch: refetchAutoMountedFolders } =
    useSuspendedAutoMountedVFolders({ scope, mountableHosts });

  const refetch = () => {
    startRefetchTransition(() => {
      selectRef.current?.refetch();
      refetchAutoMountedFolders();
    });
  };
  useImperativeHandle(ref, () => ({ refetch }));

  const mountConfigs = value ?? [];
  const statusByVFolderId = getVFolderMountConfigStatuses(mountConfigs, {
    aliasBasePath,
    autoMountedFolders,
  });

  // A value restored from a template or a URL can name a folder this user and
  // project cannot mount, or carry no name. Drop the former with a warning
  // rather than letting the launch fail server side; name the latter.
  const handleResolve = ({ resolved, unresolved }: ScopedVFolderResolution) => {
    const nameById = _.fromPairs(
      resolved.map((folder) => [folder.entityId, folder.name]),
    );
    const isRenamed = (entry: VFolderMountConfigValue) =>
      !!nameById[entry.vfolderId] && entry.name !== nameById[entry.vfolderId];
    if (unresolved.length === 0 && !mountConfigs.some(isRenamed)) return;
    setValue((prev) =>
      prev
        .filter((entry) => !unresolved.includes(entry.vfolderId))
        .map((entry) =>
          isRenamed(entry)
            ? { ...entry, name: nameById[entry.vfolderId] }
            : entry,
        ),
    );
    if (unresolved.length > 0) {
      message.warning(
        t('comp:BAIVFolderMountConfigInput.UnmountableFoldersRemoved'),
      );
    }
  };

  const handleSelectionChange = (selected: Array<BAILabeledValue>) => {
    setValue(
      selected.map((item) => {
        const existing = mountConfigs.find(
          (entry) => entry.vfolderId === item.value,
        );
        if (existing) return { ...existing, name: item.label };
        return {
          vfolderId: item.value,
          name: item.label,
          // Empty resolves to the default path, which the input shows as its
          // placeholder.
          mountDestination: '',
          subpath: '',
        };
      }),
    );
  };

  return (
    <BAIFlex direction="column" align="stretch" gap="xs">
      <BAIFlex direction="row" gap="xs" justify="between">
        <BAIScopedVFolderSelect
          ref={selectRef}
          multiple
          allowClear
          selectionMark="checkbox"
          label={t('comp:BAIVFolderMountConfigInput.SelectFolder')}
          isLabelHidden
          isDisabled={disabled}
          placeholder={t('comp:BAIVFolderMountConfigInput.SelectFolder')}
          scope={scope}
          filter={mountableVFolderFilter(mountableHosts)}
          // Dotfile folders are mounted by the session itself, so never offered.
          optionFilter={{
            AND: _.compact([
              { status: { equals: 'READY' } },
              { name: { notStartsWith: '.' } },
              filter,
            ]),
          }}
          disableUnmountable
          value={mountConfigs.map((entry) => entry.vfolderId)}
          fallbackLabels={_.fromPairs(
            _.compact(
              mountConfigs.map((entry) =>
                entry.name ? [entry.vfolderId, entry.name] : null,
              ),
            ),
          )}
          onChange={(_ids, options) =>
            handleSelectionChange(_.castArray(options ?? []))
          }
          onResolve={handleResolve}
        />
        <ButtonGroup label={t('comp:BAIVFolderMountConfigInput.Folders')}>
          {onClickCreateFolder ? (
            <BAIButton
              icon={<PlusIcon size="1em" />}
              title={t('comp:BAIVFolderMountConfigInput.CreateFolder')}
              disabled={disabled}
              onClick={onClickCreateFolder}
            />
          ) : null}
          <BAIButton
            icon={<RotateCw size="1em" />}
            title={t('comp:BAIVFolderMountConfigInput.Refresh')}
            loading={isPendingRefetch}
            disabled={disabled}
            // The query already drives `loading`; `action` would add a transition
            // that can stay pending after the fetch settles.
            onClick={refetch}
          />
        </ButtonGroup>
      </BAIFlex>
      {mountConfigs.length > 0 && (
        <BAICard size="small">
          <div className="bai-vfolder-mount-config__grid" role="list">
            <div className="bai-vfolder-mount-config__header">
              <BAIFlex gap="xxs" align="center">
                <BAIText type="secondary">
                  {t('comp:BAIVFolderMountConfigInput.SourcePath')}
                </BAIText>
                <BAIQuestionIconWithTooltip
                  title={t('comp:BAIVFolderMountConfigInput.SubpathTooltip')}
                />
              </BAIFlex>
              <span />
              <BAIFlex gap="xxs" align="center">
                <BAIText type="secondary">
                  {t('comp:BAIVFolderMountConfigInput.DestinationPath')}
                </BAIText>
                <BAIQuestionIconWithTooltip
                  title={t(
                    'comp:BAIVFolderMountConfigInput.PathAndAliasTooltip',
                  )}
                />
              </BAIFlex>
              <span />
            </div>
            {mountConfigs.map((entry) => {
              const name = entry.name || entry.vfolderId;
              const aliasInput = entry.mountDestination ?? '';
              const status = statusByVFolderId[entry.vfolderId];
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
              const updateEntry = (patch: Partial<VFolderMountConfigValue>) =>
                setValue((prev) =>
                  prev.map((m) =>
                    m.vfolderId === entry.vfolderId ? { ...m, ...patch } : m,
                  ),
                );
              return (
                <div
                  key={entry.vfolderId}
                  className="bai-vfolder-mount-config__row"
                  role="listitem"
                >
                  {/* Source: the folder and the subpath read as one path. */}
                  <Form.Item
                    validateStatus={subpathInvalid ? 'error' : undefined}
                    help={
                      subpathInvalid
                        ? t('comp:BAIVFolderMountConfigInput.SubpathInvalid')
                        : undefined
                    }
                    style={{ marginBottom: 0, minWidth: 0 }}
                  >
                    <div className="bai-vfolder-mount-config__source">
                      <div className="bai-vfolder-mount-config__folder">
                        <BAIVFolderIdenticon vfolderId={entry.vfolderId} />
                        {/* Only the name shrinks, so the trailing '/' stays. */}
                        <span className="bai-vfolder-mount-config__folder-name">
                          {folderExplorerPath ? (
                            <BAILink
                              to={folderExplorerPath(entry.vfolderId)}
                              ellipsis
                            >
                              {name}
                            </BAILink>
                          ) : (
                            <BAIText ellipsis={{ tooltip: true }}>
                              {name}
                            </BAIText>
                          )}
                        </span>
                        <span className="bai-vfolder-mount-config__separator">
                          /
                        </span>
                      </div>
                      <BAIVFolderPathPicker
                        label={t('comp:BAIVFolderMountConfigInput.Subpath')}
                        placeholder={t('comp:VFolderPathPicker.SelectAPath')}
                        allowClear
                        disabled={disabled}
                        vfolderUuid={entry.vfolderId}
                        value={entry.subpath}
                        onChange={(next) =>
                          updateEntry({ subpath: next ?? '' })
                        }
                      />
                    </div>
                  </Form.Item>
                  <span className="bai-vfolder-mount-config__arrow" aria-hidden>
                    <ArrowRight size="1em" />
                  </span>
                  {/* `extra` shows the resolved path only when it differs from
                    what is typed (a relative alias). */}
                  <Form.Item
                    validateStatus={aliasErrorMessage ? 'error' : undefined}
                    help={aliasErrorMessage}
                    extra={
                      aliasInput.trim() &&
                      aliasInput.trim() !== status.mountDestination ? (
                        <BAIText type="secondary" ellipsis={{ tooltip: true }}>
                          {status.mountDestination}
                        </BAIText>
                      ) : undefined
                    }
                    style={{ marginBottom: 0, minWidth: 0 }}
                  >
                    <BAITextInput
                      aria-label={t(
                        'comp:BAIVFolderMountConfigInput.AliasPlaceholder',
                      )}
                      hasClear
                      disabled={disabled}
                      placeholder={status.mountDestination}
                      value={aliasInput}
                      onChange={(next) =>
                        updateEntry({ mountDestination: next })
                      }
                    />
                  </Form.Item>
                  <div className="bai-vfolder-mount-config__remove">
                    <Tooltip
                      content={t(
                        'comp:BAIVFolderMountConfigInput.RemoveFolder',
                      )}
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
                            size={token('--spacing-4')}
                            color={token('--color-text-quaternary')}
                          />
                        }
                        style={{
                          flexShrink: 0,
                          height: token('--size-element-md'),
                        }}
                        onClick={() =>
                          setValue((prev) =>
                            prev.filter((m) => m.vfolderId !== entry.vfolderId),
                          )
                        }
                      />
                    </Tooltip>
                  </div>
                </div>
              );
            })}
          </div>
        </BAICard>
      )}
      {autoMountedFolders.length > 0 && (
        <BAIFlex gap="xxs" align="center" wrap="wrap">
          <BAIText type="secondary">
            {t('comp:BAIVFolderMountConfigInput.AutoMountedFolders')}
          </BAIText>
          {autoMountedFolders.map((folder) =>
            folderExplorerPath ? (
              <BAILink
                key={folder.vfolderId}
                to={folderExplorerPath(folder.vfolderId)}
              >
                <Token label={folder.name} />
              </BAILink>
            ) : (
              <Token key={folder.vfolderId} label={folder.name} />
            ),
          )}
        </BAIFlex>
      )}
    </BAIFlex>
  );
};

export default BAIVFolderMountConfigInput;
