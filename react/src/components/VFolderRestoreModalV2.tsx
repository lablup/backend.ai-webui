/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { VFolderRestoreModalV2Fragment$key } from '../__generated__/VFolderRestoreModalV2Fragment.graphql';
import { useSuspendedBackendaiClient } from '../hooks';
import { useTanMutation } from '../hooks/reactQueryAlias';
import { useSetBAINotification } from '../hooks/useBAINotification';
import { App, Typography } from 'antd';
import {
  BAIModal,
  BAIModalProps,
  toLocalId,
  useErrorMessageResolver,
} from 'backend.ai-ui';
import * as _ from 'lodash-es';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment } from 'react-relay';

interface VFolderRestoreModalV2Props extends BAIModalProps {
  vfolderFrgmts?: VFolderRestoreModalV2Fragment$key;
  onRequestClose?: (success: boolean) => void;
}

const VFolderRestoreModalV2: React.FC<VFolderRestoreModalV2Props> = ({
  vfolderFrgmts,
  onRequestClose,
  ...baiModalProps
}) => {
  'use memo';
  const { t } = useTranslation();
  const { message } = App.useApp();
  const { upsertNotification } = useSetBAINotification();
  const { getErrorMessage } = useErrorMessageResolver();
  const baiClient = useSuspendedBackendaiClient();

  const vfolders = useFragment(
    graphql`
      fragment VFolderRestoreModalV2Fragment on VFolder @relay(plural: true) {
        id @required(action: NONE)
        metadata {
          name
        }
      }
    `,
    vfolderFrgmts ?? null,
  );

  // FIXME(FR-2573): migrate to restoreVfolderV2 when backend adds it
  const restoreMutation = useTanMutation({
    mutationFn: (id: string) => {
      return baiClient.vfolder.restore_from_trash_bin(toLocalId(id));
    },
  });

  const items = vfolders ?? [];

  return (
    <BAIModal
      title={t('data.folders.Restore')}
      centered
      okText={t('data.folders.Restore')}
      onCancel={() => onRequestClose?.(false)}
      onOk={() => {
        const promises = _.map(items, (vfolder) =>
          restoreMutation.mutateAsync(vfolder!.id).catch((error) => {
            upsertNotification({
              message: getErrorMessage(error),
              description: error?.description,
              open: true,
            });
            return Promise.reject(error);
          }),
        );
        Promise.allSettled(promises).then((results) => {
          const success = results.every((r) => r.status === 'fulfilled');
          if (success) {
            if (items.length === 1) {
              message.success(
                t('data.folders.FolderRestored', {
                  folderName: items[0]?.metadata?.name,
                }),
              );
            } else {
              message.success(
                t('data.folders.MultipleFolderRestored', {
                  folderLength: items.length,
                }),
              );
            }
          }
          onRequestClose?.(success);
        });
      }}
      {...baiModalProps}
    >
      <Typography.Text>
        {items.length === 1
          ? t('data.folders.RestoreDescription', {
              folderName: items[0]?.metadata?.name,
            })
          : t('data.folders.RestoreMultipleDescription', {
              folderLength: items.length,
            })}
      </Typography.Text>
    </BAIModal>
  );
};

export default VFolderRestoreModalV2;
