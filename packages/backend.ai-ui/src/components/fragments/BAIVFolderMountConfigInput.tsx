import { useBAIi18n } from '../../hooks/useBAIi18n';
import BAIFlex from '../BAIFlex';
import BAIText from '../BAIText';
import BAIVFolderSelect from './BAIVFolderSelect';
import { useControllableValue } from 'ahooks';
import { Button, Form, Input, Skeleton, Tooltip, theme } from 'antd';
import * as _ from 'lodash-es';
import { CircleHelpIcon, XIcon } from 'lucide-react';
import React, { Suspense, useEffect, useEffectEvent, useState } from 'react';

/**
 * A single vfolder mount configuration emitted by BAIVFolderMountConfigInput.
 *
 * - `vfolderId` is the vfolder's **UUID** (`row_id`), so consumers can forward
 *   it to mount mutation inputs without further conversion.
 * - `subpath` is the mount **source**: which subfolder inside the vfolder to
 *   mount. Empty means the vfolder root.
 * - `mountDestination` is the mount **target** (alias): the resolved, absolute
 *   path inside the container where the folder is mounted. It is always the
 *   computed full path (see {@link inputToMountDestination}), so consumers can
 *   forward it directly to a mount mutation input.
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
}

// Mirrors the alias validation used by the legacy VFolderTable mount UI.
export const vFolderAliasNameRegExp = /^[a-zA-Z0-9_/.-]*$/;

const DEFAULT_ALIAS_BASE_PATH = '/home/work/';

const resolveName = (entry: VFolderMountConfigValue) =>
  entry.name || entry.vfolderId;

/**
 * Convert a user-entered alias input into the resolved mount destination,
 * following the same rule as VFolderTable's `inputToAliasPath`:
 * - empty input        -> `${basePath}${name}`
 * - input starting `/` -> used as-is (absolute path)
 * - otherwise          -> `${basePath}${input}` (relative to the base path)
 */
const inputToMountDestination = (
  name: string,
  input: string | undefined,
  basePath: string,
) => {
  const trimmed = input?.trim();
  if (!trimmed) return `${basePath}${name}`;
  if (trimmed.startsWith('/')) return trimmed;
  return `${basePath}${trimmed}`;
};

/**
 * Derive the editable alias input from a stored mount destination — the
 * inverse of {@link inputToMountDestination}. The default path and the base
 * path prefix are stripped so the user edits the relative segment.
 */
const mountDestinationToInput = (
  destination: string | undefined,
  name: string,
  basePath: string,
) => {
  const trimmed = destination?.trim();
  if (!trimmed || trimmed === `${basePath}${name}`) return '';
  if (trimmed.startsWith(basePath)) return trimmed.slice(basePath.length);
  return trimmed;
};

// Subpath must be a relative path that does not escape the vfolder.
const isSubpathInvalid = (subpath?: string) => {
  const trimmed = subpath?.trim();
  if (!trimmed) return false;
  if (trimmed.startsWith('/')) return true;
  return trimmed.split('/').some((segment) => segment === '..');
};

/**
 * Reusable, schema-agnostic input for configuring vfolder mounts.
 *
 * Users pick vfolders with {@link BAIVFolderSelect} (in `row_id` mode, so the
 * value is the vfolder UUID); each selected folder appears as a row below the
 * select where its mount destination (alias) and an optional subpath can be
 * edited. The alias input follows VFolderTable's rule (relative inputs are
 * prefixed with `aliasBasePath`, absolute inputs are used as-is) while the
 * emitted `mountDestination` is always the resolved full path. The component
 * is controlled and emits a single `VFolderMountConfigValue[]` value, so it can
 * be wrapped in one `Form.Item` and mapped to any mount mutation input by the
 * consumer.
 */
const BAIVFolderMountConfigInput: React.FC<BAIVFolderMountConfigInputProps> = ({
  currentProjectId,
  filter,
  disabled,
  aliasBasePath = DEFAULT_ALIAS_BASE_PATH,
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
  const selectedIdsKey = selectedIds.join(',');

  // Raw alias inputs (the editable relative/absolute segment), tracked
  // separately from the emitted full path so typing is not transformed
  // mid-edit. Mirrors VFolderTable's internal form + aliasMap split.
  const [aliasInputs, setAliasInputs] = useState<Record<string, string>>({});

  // Seed alias inputs for newly added folders and drop removed ones, deriving
  // the editable segment from each entry's stored mount destination.
  const syncAliasInputs = useEffectEvent(() => {
    setAliasInputs((prev) => {
      const next: Record<string, string> = {};
      let changed = Object.keys(prev).length !== selectedIds.length;
      selectedIds.forEach((id) => {
        if (id in prev) {
          next[id] = prev[id];
        } else {
          const entry = mountConfigs.find((e) => e.vfolderId === id);
          next[id] = mountDestinationToInput(
            entry?.mountDestination,
            entry ? resolveName(entry) : id,
            aliasBasePath,
          );
          changed = true;
        }
      });
      return changed ? next : prev;
    });
  });

  useEffect(() => {
    syncAliasInputs();
  }, [selectedIdsKey]);

  const setAliasInput = (vfolderId: string, name: string, raw: string) => {
    setAliasInputs((prev) => ({ ...prev, [vfolderId]: raw }));
    setValue(
      mountConfigs.map((entry) =>
        entry.vfolderId === vfolderId
          ? {
              ...entry,
              mountDestination: inputToMountDestination(
                name,
                raw,
                aliasBasePath,
              ),
            }
          : entry,
      ),
    );
  };

  const updateEntry = (
    vfolderId: string,
    patch: Partial<VFolderMountConfigValue>,
  ) => {
    setValue(
      mountConfigs.map((entry) =>
        entry.vfolderId === vfolderId ? { ...entry, ...patch } : entry,
      ),
    );
  };

  const removeEntry = (vfolderId: string) => {
    setValue(mountConfigs.filter((entry) => entry.vfolderId !== vfolderId));
  };

  // Resolve each row's effective mount destination once, then flag overlaps by
  // counting duplicates — avoids recomputing destinations inside the row loop.
  const destinationByVFolderId: Record<string, string> = {};
  mountConfigs.forEach((entry) => {
    destinationByVFolderId[entry.vfolderId] = inputToMountDestination(
      resolveName(entry),
      aliasInputs[entry.vfolderId] ?? '',
      aliasBasePath,
    );
  });
  const destinationCounts = _.countBy(Object.values(destinationByVFolderId));

  const columnLabel = (label: string, tooltip: string) => (
    <BAIFlex gap={token.sizeXXS} align="center" style={{ flex: 1 }}>
      <BAIText type="secondary">{label}</BAIText>
      <Tooltip title={tooltip}>
        <CircleHelpIcon size={14} color={token.colorTextQuaternary} />
      </Tooltip>
    </BAIFlex>
  );

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
            // nameMap is keyed by row_id (== vfolderId).
            let changed = false;
            const next = mountConfigs.map((entry) => {
              const resolved = nameMap[entry.vfolderId];
              if (!entry.name && resolved) {
                changed = true;
                // Recompute the default/relative destination with the resolved
                // name so the emitted value stays consistent.
                return {
                  ...entry,
                  name: resolved,
                  mountDestination: inputToMountDestination(
                    resolved,
                    aliasInputs[entry.vfolderId] ?? '',
                    aliasBasePath,
                  ),
                };
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
                  mountDestination: inputToMountDestination(
                    resolvedName ?? id,
                    '',
                    aliasBasePath,
                  ),
                  subpath: '',
                };
              }),
            );
          }}
        />
      </Suspense>
      {mountConfigs.length > 0 && (
        <BAIFlex direction="column" align="stretch" gap="xxs">
          <BAIFlex gap={token.sizeXXS} align="center">
            <BAIText type="secondary" style={{ width: 150, flexShrink: 0 }}>
              {t('comp:BAIVFolderMountConfigInput.Name')}
            </BAIText>
            {columnLabel(
              t('comp:BAIVFolderMountConfigInput.PathAndAlias'),
              t('comp:BAIVFolderMountConfigInput.PathAndAliasTooltip'),
            )}
            {columnLabel(
              t('comp:BAIVFolderMountConfigInput.Subpath'),
              t('comp:BAIVFolderMountConfigInput.SubpathTooltip'),
            )}
            {/* Spacer aligning the header with the row's 16px remove-button column */}
            <span style={{ width: 16, flexShrink: 0 }} />
          </BAIFlex>
          {mountConfigs.map((entry) => {
            const name = resolveName(entry);
            const aliasInput = aliasInputs[entry.vfolderId] ?? '';
            const effectiveDestination =
              destinationByVFolderId[entry.vfolderId];
            // Validate the raw input (relative or absolute), matching the
            // legacy VFolderTable pattern check.
            const aliasInvalidFormat = !vFolderAliasNameRegExp.test(aliasInput);
            const aliasOverlapping =
              destinationCounts[effectiveDestination] > 1;
            const subpathInvalid = isSubpathInvalid(entry.subpath);
            return (
              <BAIFlex
                key={entry.vfolderId}
                direction="row"
                align="start"
                gap={token.sizeXXS}
              >
                <BAIText
                  ellipsis={{ tooltip: true }}
                  style={{ width: 150, flexShrink: 0, lineHeight: '24px' }}
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
                      setAliasInput(entry.vfolderId, name, e.target.value)
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
                      updateEntry(entry.vfolderId, { subpath: e.target.value })
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
                    icon={<XIcon size={16} color={token.colorTextQuaternary} />}
                    style={{ flexShrink: 0 }}
                    onClick={() => removeEntry(entry.vfolderId)}
                  />
                </Tooltip>
              </BAIFlex>
            );
          })}
        </BAIFlex>
      )}
    </BAIFlex>
  );
};

export default BAIVFolderMountConfigInput;
