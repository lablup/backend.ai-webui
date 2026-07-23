/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import {
  PERMISSION_DISPLAY_MAP,
  hasMountWithoutFileOps,
} from '../helper/storageHostPermission';
import { App, Checkbox, Divider, Tooltip, Typography, theme } from 'antd';
import { createStyles } from 'antd-style';
import type { CheckboxChangeEvent } from 'antd/es/checkbox';
import { BAIFlex, BAIModal, type BAIModalProps } from 'backend.ai-ui';
import * as _ from 'lodash-es';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

// `.ant-modal-title` shrinks to its content by default, so an inner flex's
// `width: 100%` resolves against a content-sized parent and the title grows
// past the modal instead of truncating. Forcing the title to fill the header
// gives the inner flex a definite width so the name ellipsizes (same fix as
// FolderExplorerModalV2). `padding-inline-end` then reserves room for the
// absolutely-positioned close (X) button so the trailing `)` never collides
// with it.
const useStyles = createStyles(({ css, token }) => ({
  modalHeader: css`
    .ant-modal-title {
      width: 100%;
      padding-inline-end: ${token.marginXL}px;
    }
  `,
}));

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
  const { token } = theme.useToken();
  const { styles } = useStyles();
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
        <Typography.Text style={{ flexShrink: 0 }}>
          {`${t('storageHost.permission.EditPermissionsAction')} (`}
        </Typography.Text>
        <Tooltip title={targets[0]?.name}>
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
        <Typography.Text style={{ flexShrink: 0 }}>{')'}</Typography.Text>
      </BAIFlex>
    );

  return (
    <BAIModal
      {...baiModalProps}
      className={styles.modalHeader}
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
          <Checkbox
            indeterminate={indeterminate}
            checked={allSelected}
            onChange={(e: CheckboxChangeEvent) => {
              setEditedKeys(e.target.checked ? [...permissionKeys] : []);
            }}
          >
            {t('storageHost.permission.All')}
          </Checkbox>
          <Typography.Text type="secondary">
            {selectedCount} / {totalCount}
          </Typography.Text>
        </BAIFlex>
        <Divider style={{ margin: 0 }} />
        <Typography.Text
          type="secondary"
          style={{ fontSize: token.fontSizeSM }}
        >
          {t('storageHost.permission.Permissions')}
        </Typography.Text>
        <Checkbox.Group
          value={editedKeys}
          onChange={(values) => setEditedKeys(values as string[])}
          style={{ width: '100%' }}
        >
          <BAIFlex direction="column" align="start" gap="xs">
            {permissionKeys.map((permKey) => {
              const display = PERMISSION_DISPLAY_MAP[permKey];
              return (
                <Checkbox key={permKey} value={permKey}>
                  {display ? t(display.labelKey) : permKey}
                </Checkbox>
              );
            })}
          </BAIFlex>
        </Checkbox.Group>
      </BAIFlex>
    </BAIModal>
  );
};

export default StoragePermissionEditModal;
