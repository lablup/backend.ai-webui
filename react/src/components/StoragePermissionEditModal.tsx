/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import {
  PERMISSION_DISPLAY_MAP,
  hasMountWithoutFileOps,
} from '../helper/storageHostPermission';
import { App, Checkbox, Divider, Typography, theme } from 'antd';
import type { CheckboxChangeEvent } from 'antd/es/checkbox';
import { BAIFlex, BAIModal, type BAIModalProps } from 'backend.ai-ui';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface Props extends Omit<BAIModalProps, 'onOk' | 'okText' | 'cancelText'> {
  /** Canonical permission key list (driven by `vfolder_host_permissions`). */
  permissionKeys: string[];
  /** Currently-saved enabled keys for this entity + storage host. */
  initialEnabled: ReadonlySet<string>;
  onRequestClose: () => void;
  /**
   * Persist the user's edited keys. Implementations build the merged
   * `allowed_vfolder_hosts` JSON payload and run the appropriate
   * `modify_*` mutation, returning the result's ok/msg.
   */
  onSave: (
    enabledKeys: string[],
  ) => Promise<{ ok: boolean; msg?: string | null }>;
}

const StoragePermissionEditModal: React.FC<Props> = ({
  permissionKeys,
  initialEnabled,
  onRequestClose,
  onSave,
  open,
  ...baiModalProps
}) => {
  'use memo';
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const { message, modal } = App.useApp();
  const [editedKeys, setEditedKeys] = useState<string[]>(() => [
    ...initialEnabled,
  ]);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Reset the editable state when the modal is (re-)opened or when the
  // baseline changes (e.g. after a successful save in a sibling card).
  useEffect(() => {
    if (open) {
      setEditedKeys([...initialEnabled]);
    }
  }, [open, initialEnabled]);

  const handleOk = async (): Promise<void> => {
    const enabledSet = new Set(editedKeys);
    if (hasMountWithoutFileOps(enabledSet)) {
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
        message.success(t('storageHost.permission.SaveSuccess'));
        onRequestClose();
      } else {
        message.error(result.msg || t('storageHost.permission.SaveFailed'));
      }
    } finally {
      setIsSaving(false);
    }
  };

  const totalCount = permissionKeys.length;
  const selectedCount = editedKeys.length;
  const allSelected = totalCount > 0 && selectedCount === totalCount;
  const indeterminate = selectedCount > 0 && selectedCount < totalCount;

  return (
    <BAIModal
      {...baiModalProps}
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
          onChange={(values: string[]) => setEditedKeys(values)}
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
