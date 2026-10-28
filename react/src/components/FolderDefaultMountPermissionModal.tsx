/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 Edits the folder's default mount permission: the level a shared user mounts
 the folder at unless a mount policy of their own says otherwise (#10647).
*/
import { FolderDefaultMountPermissionModalRefreshQuery } from '../__generated__/FolderDefaultMountPermissionModalRefreshQuery.graphql';
import { App } from '../app-shim';
import { useBaiSignedRequestWithPromise } from '../helper';
import { Field } from '@lablup/ui-common/Field';
import { HStack } from '@lablup/ui-common/Stack';
import {
  BAIModal,
  type BAIModalProps,
  BAIQuestionIconWithTooltip,
  BAISelector,
  useErrorMessageResolver,
} from 'backend.ai-ui';
import React, { useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { fetchQuery, graphql, useRelayEnvironment } from 'react-relay';

export type FolderMountLevel = 'ro' | 'rw';

export interface FolderDefaultMountPermissionModalProps extends Omit<
  BAIModalProps,
  'isOpen' | 'onOpenChange' | 'onOk' | 'onCancel' | 'title' | 'children'
> {
  open?: boolean;
  vfolderId: string;
  mountLevel: FolderMountLevel;
  /** Model-type project folders stay read-only (FR-1290). */
  restrictToReadOnly?: boolean;
  onRequestClose: () => void;
}

const FolderDefaultMountPermissionModal: React.FC<
  FolderDefaultMountPermissionModalProps
> = ({
  open,
  vfolderId,
  mountLevel,
  restrictToReadOnly = false,
  onRequestClose,
  afterClose,
  ...baiModalProps
}) => {
  'use memo';
  const { t } = useTranslation();
  const { message } = App.useApp();
  const { getErrorMessage } = useErrorMessageResolver();
  const relayEnv = useRelayEnvironment();
  const request = useBaiSignedRequestWithPromise();
  const inputId = useId();

  const [picked, setPicked] = useState<FolderMountLevel | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const value = picked ?? mountLevel;

  const handleSave = async () => {
    if (value === mountLevel) {
      onRequestClose();
      return;
    }
    setIsSaving(true);
    try {
      // TODO(needs-backend): the V2 schema has no mutation for the folder's
      // mount permission, so the legacy update-options endpoint still owns it.
      await request({
        method: 'POST',
        url: `/folders/${vfolderId}/update-options`,
        body: { permission: value },
      });
      // Re-read the record so every fragment on this folder sees the new value.
      await fetchQuery<FolderDefaultMountPermissionModalRefreshQuery>(
        relayEnv,
        graphql`
          query FolderDefaultMountPermissionModalRefreshQuery(
            $vfolderId: UUID!
          ) {
            vfolderV2(vfolderId: $vfolderId) {
              id
              accessControl {
                permission
              }
            }
          }
        `,
        { vfolderId },
      )
        .toPromise()
        .catch(() => {});
      message.success(t('data.permission.PermissionModified'));
      document.dispatchEvent(new CustomEvent('backend-ai-folder-updated'));
      onRequestClose();
    } catch (error) {
      message.error(getErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <BAIModal
      {...baiModalProps}
      isOpen={open}
      onOpenChange={(next) => {
        if (!next) onRequestClose();
      }}
      afterClose={() => {
        setPicked(null);
        afterClose?.();
      }}
      title={
        <HStack gap={1} align="center">
          {t('data.folders.EditDefaultMountPermission')}
          <BAIQuestionIconWithTooltip
            title={t('data.folders.SharedMountPermissionDesc')}
          />
        </HStack>
      }
      okText={t('button.Save')}
      onOk={handleSave}
      onCancel={() => onRequestClose()}
      confirmLoading={isSaving}
      okButtonProps={{ disabled: value === mountLevel }}
      width={480}
    >
      <Field label={t('data.folders.DefaultMountPermission')} inputID={inputId}>
        <BAISelector
          id={inputId}
          aria-label={t('data.folders.DefaultMountPermission')}
          placement="below"
          width="100%"
          options={[
            { value: 'ro', label: t('data.ReadOnly') },
            {
              value: 'rw',
              label: t('data.ReadWrite'),
              disabled: restrictToReadOnly,
              description: restrictToReadOnly
                ? t('data.folders.ModelProjectFolderRestrictedToReadOnly')
                : undefined,
            },
          ]}
          value={value}
          onChange={(next) => setPicked(next as FolderMountLevel)}
        />
      </Field>
    </BAIModal>
  );
};

export default FolderDefaultMountPermissionModal;
