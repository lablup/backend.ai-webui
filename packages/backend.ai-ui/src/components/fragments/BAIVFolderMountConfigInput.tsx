import { toLocalId } from '../../helper';
import { useBAIi18n } from '../../hooks/useBAIi18n';
import BAIFlex from '../BAIFlex';
import BAIText from '../BAIText';
import BAIVFolderSelect, { BAIVFolderSelectProps } from './BAIVFolderSelect';
import { useControllableValue } from 'ahooks';
import { Input, Skeleton, Tooltip, Typography, theme } from 'antd';
import * as _ from 'lodash-es';
import { CircleHelpIcon, XIcon } from 'lucide-react';
import React, { Suspense } from 'react';

/**
 * A single vfolder mount configuration emitted by BAIVFolderMountConfigInput.
 *
 * - `subpath` is the mount **source**: which subfolder inside the vfolder to
 *   mount. Empty means the vfolder root.
 * - `mountDestination` is the mount **target** (alias): the path inside the
 *   container where the folder is mounted. Empty falls back to
 *   `${defaultMountBasePath}${name}`.
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
  /** Which field BAIVFolderSelect uses as the option value. */
  valuePropName?: BAIVFolderSelectProps['valuePropName'];
  /** Base path prepended to the folder name when no mount destination is set. */
  defaultMountBasePath?: string;
}

// Mirrors the alias validation used by the legacy VFolderTable mount UI.
export const vFolderAliasNameRegExp = /^[a-zA-Z0-9_/.-]*$/;

const DEFAULT_MOUNT_BASE_PATH = '/home/work/';

const resolveName = (entry: VFolderMountConfigValue) =>
  entry.name || toLocalId(entry.vfolderId);

const getEffectiveDestination = (
  entry: VFolderMountConfigValue,
  defaultMountBasePath: string,
) =>
  entry.mountDestination?.trim() || defaultMountBasePath + resolveName(entry);

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
 * Users pick vfolders with {@link BAIVFolderSelect}; each selected folder
 * appears as a row below the select where its mount destination (alias) and
 * an optional subpath can be edited. The component is controlled and emits a
 * single `VFolderMountConfigValue[]` value, so it can be wrapped in one
 * `Form.Item` and mapped to any mount mutation input by the consumer.
 */
const BAIVFolderMountConfigInput: React.FC<BAIVFolderMountConfigInputProps> = ({
  currentProjectId,
  filter,
  disabled,
  valuePropName = 'id',
  defaultMountBasePath = DEFAULT_MOUNT_BASE_PATH,
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
  const selectedIds = mountConfigs.map((entry) => entry.vfolderId);

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

  const columnLabel = (label: string, tooltip: string) => (
    <BAIFlex gap={token.sizeXXS} align="center">
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
          valuePropName={valuePropName}
          value={selectedIds}
          onResolvedNamesChange={(nameMap) => {
            let changed = false;
            const next = mountConfigs.map((entry) => {
              if (!entry.name && nameMap[entry.vfolderId]) {
                changed = true;
                return { ...entry, name: nameMap[entry.vfolderId] };
              }
              return entry;
            });
            if (changed) setValue(next);
          }}
          onChange={(ids, option) => {
            const nextIds = _.castArray(ids ?? []);
            const nameByValue: Record<string, string> = {};
            _.castArray(option ?? []).forEach(
              (opt: { label?: unknown; value?: string }) => {
                if (opt?.value && _.isString(opt.label)) {
                  nameByValue[opt.value] = opt.label;
                }
              },
            );
            setValue(
              nextIds.map((id) => {
                const existing = mountConfigs.find(
                  (entry) => entry.vfolderId === id,
                );
                if (existing) {
                  return nameByValue[id] && !existing.name
                    ? { ...existing, name: nameByValue[id] }
                    : existing;
                }
                return {
                  vfolderId: id,
                  name: nameByValue[id],
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
          <BAIFlex gap={token.sizeXXS} align="center">
            <BAIText type="secondary" style={{ width: 150, flexShrink: 0 }}>
              {t('comp:BAIVFolderMountConfigInput.Name')}
            </BAIText>
            <div style={{ flex: 1 }}>
              {columnLabel(
                t('comp:BAIVFolderMountConfigInput.PathAndAlias'),
                t('comp:BAIVFolderMountConfigInput.PathAndAliasTooltip'),
              )}
            </div>
            <div style={{ flex: 1 }}>
              {columnLabel(
                t('comp:BAIVFolderMountConfigInput.Subpath'),
                t('comp:BAIVFolderMountConfigInput.SubpathTooltip'),
              )}
            </div>
            <span style={{ width: 16, flexShrink: 0 }} />
          </BAIFlex>
          {mountConfigs.map((entry) => {
            const effectiveDestination = getEffectiveDestination(
              entry,
              defaultMountBasePath,
            );
            const aliasInvalidFormat =
              !vFolderAliasNameRegExp.test(effectiveDestination);
            const aliasOverlapping = mountConfigs.some(
              (other) =>
                other.vfolderId !== entry.vfolderId &&
                getEffectiveDestination(other, defaultMountBasePath) ===
                  effectiveDestination,
            );
            const subpathInvalid = isSubpathInvalid(entry.subpath);
            return (
              <BAIFlex
                key={entry.vfolderId}
                direction="row"
                align="start"
                gap={token.sizeXXS}
              >
                <Typography.Text
                  ellipsis={{ tooltip: true }}
                  style={{ width: 150, flexShrink: 0, lineHeight: '24px' }}
                >
                  {resolveName(entry)}
                </Typography.Text>
                <BAIFlex direction="column" align="stretch" style={{ flex: 1 }}>
                  <Input
                    size="small"
                    disabled={disabled}
                    status={
                      aliasInvalidFormat || aliasOverlapping
                        ? 'error'
                        : undefined
                    }
                    placeholder={t(
                      'comp:BAIVFolderMountConfigInput.AliasPlaceholder',
                    )}
                    value={entry.mountDestination}
                    onChange={(e) =>
                      updateEntry(entry.vfolderId, {
                        mountDestination: e.target.value,
                      })
                    }
                  />
                  {aliasInvalidFormat ? (
                    <BAIText
                      type="danger"
                      style={{ fontSize: token.fontSizeSM }}
                    >
                      {t('comp:BAIVFolderMountConfigInput.AliasInvalid')}
                    </BAIText>
                  ) : aliasOverlapping ? (
                    <BAIText
                      type="danger"
                      style={{ fontSize: token.fontSizeSM }}
                    >
                      {t('comp:BAIVFolderMountConfigInput.AliasOverlapping')}
                    </BAIText>
                  ) : (
                    <BAIText
                      type="secondary"
                      ellipsis
                      style={{ fontSize: token.fontSizeSM }}
                    >
                      {effectiveDestination}
                    </BAIText>
                  )}
                </BAIFlex>
                <BAIFlex direction="column" align="stretch" style={{ flex: 1 }}>
                  <Input
                    size="small"
                    disabled={disabled}
                    status={subpathInvalid ? 'error' : undefined}
                    placeholder={t(
                      'comp:BAIVFolderMountConfigInput.SubpathPlaceholder',
                    )}
                    value={entry.subpath}
                    onChange={(e) =>
                      updateEntry(entry.vfolderId, { subpath: e.target.value })
                    }
                  />
                  {subpathInvalid && (
                    <BAIText
                      type="danger"
                      style={{ fontSize: token.fontSizeSM }}
                    >
                      {t('comp:BAIVFolderMountConfigInput.SubpathInvalid')}
                    </BAIText>
                  )}
                </BAIFlex>
                <Tooltip
                  title={t('comp:BAIVFolderMountConfigInput.RemoveFolder')}
                >
                  <XIcon
                    size={16}
                    style={{
                      cursor: disabled ? 'not-allowed' : 'pointer',
                      color: token.colorTextQuaternary,
                      marginTop: token.marginXXS,
                      flexShrink: 0,
                    }}
                    onClick={() => !disabled && removeEntry(entry.vfolderId)}
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
