import { useBAIi18n } from '../../hooks/useBAIi18n';
import BAIFlex from '../BAIFlex';
import BAIQuestionIconWithTooltip from '../BAIQuestionIconWithTooltip';
import BAIText from '../BAIText';
import BAIVFolderSelect from './BAIVFolderSelect';
import { useControllableValue } from 'ahooks';
import { Button, Form, Input, Skeleton, Tag, Tooltip, theme } from 'antd';
import * as _ from 'lodash-es';
import { XIcon } from 'lucide-react';
import React, { Suspense } from 'react';

/**
 * A single vfolder mount configuration emitted by BAIVFolderMountConfigInput.
 *
 * - `vfolderId` is the vfolder's **UUID** (`row_id`), so consumers can forward
 *   it to mount mutation inputs without further conversion.
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
  name?: string;
  mountDestination?: string;
  subpath?: string;
}

export interface BAIVFolderMountConfigInputProps {
  value?: VFolderMountConfigValue[];
  defaultValue?: VFolderMountConfigValue[];
  onChange?: (value: VFolderMountConfigValue[]) => void;
  currentProjectId?: string;
  filter?: string;
  disabled?: boolean;
  /** Base path prepended to a relative alias input (mirrors VFolderTable). */
  aliasBasePath?: string;
  /**
   * Names of folders that are auto-mounted (dotfile folders). Their default
   * mount paths (`${aliasBasePath}${name}`) are added to the overlap set so a
   * user alias colliding with an auto-mounted folder is flagged — mirrors
   * VFolderTable's `FolderAliasOverlappingToAutoMount` check. Also shown as a
   * read-only tag list at the bottom of the component.
   */
  autoMountedFolderNames?: string[];
}

// Mirrors the alias validation used by the legacy VFolderTable mount UI.
export const vFolderAliasNameRegExp = /^[a-zA-Z0-9_/.-]*$/;

const DEFAULT_ALIAS_BASE_PATH = '/home/work/';

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
  basePath: string,
) => {
  const trimmed = input?.trim();
  if (!trimmed) return `${basePath}${name}`;
  if (trimmed.startsWith('/')) return trimmed;
  return `${basePath}${trimmed}`;
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
  aliasError?: 'invalidFormat' | 'overlapping';
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
  const autoMountDestinations = (options?.autoMountedFolderNames ?? []).map(
    (n) => inputToMountDestination(n, '', basePath),
  );
  const destinationCounts = _.countBy([
    ...Object.values(mountDestinationByVFolderId),
    ...autoMountDestinations,
  ]);

  const statuses: Record<string, VFolderMountConfigEntryStatus> = {};
  entries.forEach((entry) => {
    const mountDestination = mountDestinationByVFolderId[entry.vfolderId];
    statuses[entry.vfolderId] = {
      mountDestination,
      aliasError: !vFolderAliasNameRegExp.test(entry.mountDestination ?? '')
        ? 'invalidFormat'
        : destinationCounts[mountDestination] > 1
          ? 'overlapping'
          : undefined,
      subpathError: isSubpathInvalid(entry.subpath),
    };
  });
  return statuses;
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
 * Reusable, schema-agnostic input for configuring vfolder mounts.
 *
 * Users pick vfolders with {@link BAIVFolderSelect} (in `row_id` mode, so the
 * value is the vfolder UUID); each selected folder appears as a row below the
 * select where its mount destination (alias) and an optional subpath can be
 * edited. The alias input follows VFolderTable's rule (relative inputs are
 * prefixed with `aliasBasePath`, absolute inputs are used as-is); the emitted
 * `mountDestination` stores that raw alias verbatim, which the consumer
 * resolves to the full path with {@link inputToMountDestination}. The component
 * is controlled and emits a single `VFolderMountConfigValue[]` value.
 *
 * The inline per-row errors are advisory UX only. To gate a form on validity,
 * wrap the component in one named `Form.Item` and call
 * {@link isVFolderMountConfigValid} from a `rules` validator so
 * `form.validateFields()` rejects on invalid input:
 *
 * ```tsx
 * <Form.Item
 *   name="mounts"
 *   rules={[
 *     {
 *       validator: (_rule, value) =>
 *         isVFolderMountConfigValid(value, { aliasBasePath, autoMountedFolderNames })
 *           ? Promise.resolve()
 *           : Promise.reject(new Error(t('...'))),
 *     },
 *   ]}
 * >
 *   <BAIVFolderMountConfigInput autoMountedFolderNames={...} />
 * </Form.Item>
 * ```
 */
const BAIVFolderMountConfigInput: React.FC<BAIVFolderMountConfigInputProps> = ({
  currentProjectId,
  filter,
  disabled,
  aliasBasePath = DEFAULT_ALIAS_BASE_PATH,
  autoMountedFolderNames,
  ...props
}) => {
  'use memo';
  const { t } = useBAIi18n();
  const { token } = theme.useToken();
  const [value, setValue] = useControllableValue<VFolderMountConfigValue[]>(
    props,
    { defaultValue: [] },
  );
  const mountConfigs = value ?? [];
  // `vfolderId` is the vfolder UUID; BAIVFolderSelect runs in `row_id` mode so
  // its value, options, and resolved name map are all keyed by the same UUID.
  const selectedIds = mountConfigs.map((entry) => entry.vfolderId);

  // Resolve each entry's mount destination + validity once via the same
  // exported helper a consumer uses to gate the form, then read per row below.
  const statusByVFolderId = getVFolderMountConfigStatuses(mountConfigs, {
    aliasBasePath,
    autoMountedFolderNames,
  });

  return (
    <BAIFlex direction="column" align="stretch" gap="xs">
      <Suspense fallback={<Skeleton.Input active block />}>
        <BAIVFolderSelect
          mode="multiple"
          allowClear
          disabled={disabled}
          currentProjectId={currentProjectId}
          filter={filter}
          valuePropName="row_id"
          value={selectedIds}
          onResolvedNamesChange={(nameMap) => {
            // nameMap is keyed by row_id (== vfolderId). Backfill names that
            // resolve asynchronously after selection. `mountDestination` is the
            // raw alias and never depends on the name, so only `name` changes
            // here. The guard skips a redundant emit when every name is already
            // set — this callback fires on every node-load of BAIVFolderSelect.
            let changed = false;
            const next = mountConfigs.map((entry) => {
              const resolved = nameMap[entry.vfolderId];
              if (!entry.name && resolved) {
                changed = true;
                return { ...entry, name: resolved };
              }
              return entry;
            });
            if (changed) setValue(next);
          }}
          onChange={(ids, option) => {
            // In `row_id` mode BAIVFolderSelect emits vfolder UUIDs directly.
            const nextIds = _.castArray(ids ?? []);
            const nameById: Record<string, string> = {};
            _.castArray(option ?? []).forEach(
              (opt: { label?: unknown; value?: string }) => {
                if (opt?.value && _.isString(opt.label)) {
                  nameById[opt.value] = opt.label;
                }
              },
            );
            setValue(
              nextIds.map((id) => {
                const resolvedName = nameById[id];
                const existing = mountConfigs.find(
                  (entry) => entry.vfolderId === id,
                );
                if (existing) {
                  return resolvedName && !existing.name
                    ? { ...existing, name: resolvedName }
                    : existing;
                }
                return {
                  vfolderId: id,
                  name: resolvedName,
                  // Raw alias starts empty -> resolves to the default mount
                  // path (`${aliasBasePath}${name}`) at display time.
                  mountDestination: '',
                  subpath: '',
                };
              }),
            );
          }}
        />
      </Suspense>
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
            const aliasInvalidFormat = status.aliasError === 'invalidFormat';
            const aliasOverlapping = status.aliasError === 'overlapping';
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
                  validateStatus={
                    aliasInvalidFormat || aliasOverlapping ? 'error' : undefined
                  }
                  help={
                    aliasInvalidFormat
                      ? t('comp:BAIVFolderMountConfigInput.AliasInvalid')
                      : aliasOverlapping
                        ? t('comp:BAIVFolderMountConfigInput.AliasOverlapping')
                        : undefined
                  }
                  extra={
                    aliasInvalidFormat || aliasOverlapping ? undefined : (
                      <BAIText type="secondary" ellipsis>
                        {effectiveDestination}
                      </BAIText>
                    )
                  }
                  style={{ flex: 1, marginBottom: 0 }}
                >
                  <Input
                    size="small"
                    disabled={disabled}
                    placeholder={t(
                      'comp:BAIVFolderMountConfigInput.AliasPlaceholder',
                    )}
                    value={aliasInput}
                    onChange={(e) =>
                      setValue(
                        mountConfigs.map((m) =>
                          m.vfolderId === entry.vfolderId
                            ? { ...m, mountDestination: e.target.value }
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
                  <Input
                    size="small"
                    disabled={disabled}
                    placeholder={t(
                      'comp:BAIVFolderMountConfigInput.SubpathPlaceholder',
                    )}
                    value={entry.subpath}
                    onChange={(e) =>
                      setValue(
                        mountConfigs.map((m) =>
                          m.vfolderId === entry.vfolderId
                            ? { ...m, subpath: e.target.value }
                            : m,
                        ),
                      )
                    }
                  />
                </Form.Item>
                <Tooltip
                  title={t('comp:BAIVFolderMountConfigInput.RemoveFolder')}
                >
                  <Button
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
                      setValue(
                        mountConfigs.filter(
                          (m) => m.vfolderId !== entry.vfolderId,
                        ),
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
            <Tag key={folderName}>{folderName}</Tag>
          ))}
        </BAIFlex>
      )}
    </BAIFlex>
  );
};

export default BAIVFolderMountConfigInput;
