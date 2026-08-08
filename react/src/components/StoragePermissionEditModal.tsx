/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { App } from '../app-shim';
import {
  PERMISSION_DISPLAY_MAP,
  hasMountWithoutFileOps,
} from '../helper/storageHostPermission';
import { CheckboxInput } from '@astryxdesign/core/CheckboxInput';
import {
  CheckboxList,
  CheckboxListItem,
} from '@astryxdesign/core/CheckboxList';
import { Divider } from '@astryxdesign/core/Divider';
import { Text } from '@astryxdesign/core/Text';
import { Tooltip } from '@astryxdesign/core/Tooltip';
import { BAIFlex, BAIModal, type BAIModalProps } from 'backend.ai-ui';
import * as _ from 'lodash-es';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

// to-astryx phase 3 / ticket B: the co-located `.ant-modal-title` override is
// gone with the antd modal. Astryx's `DialogHeader` already gives the title
// slot `flex: 1; min-width: 0` beside a laid-out (not absolutely positioned)
// close button, so the inner flex has a definite width and the name ellipsizes
// without any scoped CSS.
/**
 * One entity whose permissions are being edited. `id` is the opaque key the
 * caller uses to fan out the save (domain name / project gid / KRP name);
 * `name` is the display label; `enabled` is its currently-saved kebab keys for
 * the storage host in scope.
 */
export interface PermissionEditTarget {
  id: string;
  name: string;
  enabled: ReadonlySet<string>;
}

interface Props extends Omit<BAIModalProps, 'onOk' | 'okText' | 'cancelText'> {
  /** Canonical permission key list (driven by `vfolder_host_permissions`). */
  permissionKeys: string[];
  /**
   * Entities to edit.
   * - Length 1 → single-edit: prefills the entity's current permissions.
   * - Length > 1 → bulk-edit: defaults to all permissions selected; saving
   *   overwrites every selected target with the chosen set.
   */
  targets: PermissionEditTarget[];
  onRequestClose: () => void;
  /**
   * Persist the edit. `enabledKeys` is the full set the user left ON; callers
   * apply it directly to every target (overwrite).
   */
  onSave: (
    enabledKeys: string[],
  ) => Promise<{ ok: boolean; msg?: string | null }>;
}

const StoragePermissionEditModal: React.FC<Props> = ({
  permissionKeys,
  targets,
  onRequestClose,
  onSave,
  open,
  title,
  ...baiModalProps
}) => {
  'use memo';
  const { t } = useTranslation();
  const { message, modal } = App.useApp();

  // Single target → prefill its current permissions. Bulk (multiple targets)
  // → default to all permissions selected.
  const initialKeys = () =>
    targets.length > 1 ? [...permissionKeys] : [...(targets[0]?.enabled ?? [])];

  const [editedKeys, setEditedKeys] = useState<string[]>(initialKeys);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Tracks `open` (not the arrays) so a new `targets`/`permissionKeys`
  // identity from the parent does not re-fire the reset while open.
  const [prevOpen, setPrevOpen] = useState(open);
  if (prevOpen !== open) {
    setPrevOpen(open);
    if (open) {
      setEditedKeys(initialKeys());
    }
  }

  const handleOk = async (): Promise<void> => {
    if (hasMountWithoutFileOps(new Set(editedKeys))) {
      const confirmed = await new Promise<boolean>((resolve) => {
        modal.confirm({
          title: t('storageHost.permission.MountSessionWarningTitle'),
          content: t('storageHost.permission.MountSessionWarningContent'),
          okText: t('storageHost.permission.Update'),
          onOk: () => resolve(true),
          onCancel: () => resolve(false),
        });
      });
      if (!confirmed) return;
    }
    setIsSaving(true);
    try {
      const result = await onSave(editedKeys);
      if (result.ok) {
        // `result.msg` carries a partial-success summary (e.g. bulk-edit where
        // some targets failed); fall back to the generic success text.
        message.success(result.msg || t('storageHost.permission.SaveSuccess'));
        onRequestClose();
      } else {
        message.error(result.msg || t('storageHost.permission.SaveFailed'));
      }
    } finally {
      setIsSaving(false);
    }
  };

  const totalCount = permissionKeys.length;
  // Clamp to keys that are actually columns: a stale `enabled` key from the
  // backend (not in `permissionKeys`) must not push `selectedCount` past
  // `totalCount`, which would blank the master checkbox despite selections.
  const selectedCount = _.intersection(editedKeys, permissionKeys).length;
  const allSelected = totalCount > 0 && selectedCount === totalCount;
  const indeterminate = selectedCount > 0 && selectedCount < totalCount;

  // Single target → "Edit Permissions (name)" where only the name ellipsizes
  // (long names would otherwise overflow the narrow modal header); hovering
  // the name reveals the full text. Bulk edit keeps the caller's count label.
  const resolvedTitle =
    targets.length > 1 ? (
      title
    ) : (
      <BAIFlex align="center" style={{ width: '100%', minWidth: 0 }}>
        <Text style={{ flexShrink: 0 }}>
          {`${t('storageHost.permission.EditPermissionsAction')} (`}
        </Text>
        <Tooltip content={targets[0]?.name}>
          <span
            style={{
              flex: '0 1 auto',
              minWidth: 0,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {targets[0]?.name}
          </span>
        </Tooltip>
        <Text style={{ flexShrink: 0 }}>{')'}</Text>
      </BAIFlex>
    );

  return (
    <BAIModal
      {...baiModalProps}
      className="storage-permission-edit-modal-header"
      title={resolvedTitle}
      open={open}
      destroyOnHidden
      okText={t('storageHost.permission.Update')}
      confirmLoading={isSaving}
      onOk={handleOk}
      onCancel={onRequestClose}
      width={300}
    >
      <BAIFlex direction="column" align="stretch" gap="xs">
        <BAIFlex justify="between" align="center">
          {/* MAPPING §4: `checked` -> `value`, `indeterminate` ->
              `value="indeterminate"`, `onChange(e)` -> `onChange(checked, e)`,
              and the children become the required `label` string. */}
          <CheckboxInput
            label={t('storageHost.permission.All')}
            value={indeterminate ? 'indeterminate' : allSelected}
            onChange={(checked) => {
              setEditedKeys(checked ? [...permissionKeys] : []);
            }}
          />
          <Text color="secondary">
            {selectedCount} / {totalCount}
          </Text>
        </BAIFlex>
        <Divider />
        {/* `Checkbox.Group` -> `CheckboxList`, whose required `label` is the
            heading this section used to render as a separate `Text` — so the
            heading IS the group's accessible name now instead of a
            visually-adjacent string with no programmatic association. */}
        <CheckboxList
          label={t('storageHost.permission.Permissions')}
          density="compact"
          width="100%"
          value={editedKeys}
          onChange={(values) => setEditedKeys(values)}
        >
          {permissionKeys.map((permKey) => {
            const display = PERMISSION_DISPLAY_MAP[permKey];
            return (
              <CheckboxListItem
                key={permKey}
                value={permKey}
                label={display ? t(display.labelKey) : permKey}
              />
            );
          })}
        </CheckboxList>
      </BAIFlex>
    </BAIModal>
  );
};

export default StoragePermissionEditModal;
