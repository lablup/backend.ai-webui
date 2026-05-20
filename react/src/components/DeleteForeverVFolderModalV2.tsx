/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { DeleteForeverVFolderModalV2Fragment$key } from '../__generated__/DeleteForeverVFolderModalV2Fragment.graphql';
import { DeleteForeverVFolderModalV2Mutation } from '../__generated__/DeleteForeverVFolderModalV2Mutation.graphql';
import { App } from 'antd';
import {
  BAIDeleteConfirmModal,
  BAIDeleteConfirmModalProps,
  toLocalId,
  useErrorMessageResolver,
} from 'backend.ai-ui';
import * as _ from 'lodash-es';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment, useMutation } from 'react-relay';

interface DeleteForeverVFolderModalV2Props extends Omit<
  BAIDeleteConfirmModalProps,
  'confirmText' | 'items' | 'title' | 'onOk' | 'onCancel'
> {
  vfolderFrgmts?: DeleteForeverVFolderModalV2Fragment$key;
  onRequestClose?: (success: boolean) => void;
}

const DeleteForeverVFolderModalV2: React.FC<
  DeleteForeverVFolderModalV2Props
> = ({ vfolderFrgmts, onRequestClose, ...modalProps }) => {
  'use memo';
  const { t } = useTranslation();
  const { message } = App.useApp();
  const { getErrorMessage } = useErrorMessageResolver();

  const vfolders = useFragment(
    graphql`
      fragment DeleteForeverVFolderModalV2Fragment on VFolder
      @relay(plural: true) {
        id
        metadata {
          name
        }
      }
    `,
    vfolderFrgmts,
  );

  const [commitBulkPurgeMutation, isInFlightBulkPurge] =
    useMutation<DeleteForeverVFolderModalV2Mutation>(graphql`
      mutation DeleteForeverVFolderModalV2Mutation(
        $input: BulkPurgeVFoldersV2Input!
      ) {
        bulkPurgeVfoldersV2(input: $input) {
          purgedCount
        }
      }
    `);

  const purgeable = vfolders ?? [];

  return (
    <BAIDeleteConfirmModal
      {...modalProps}
      title={t('dialog.title.DeleteForever')}
      target={t('general.Folder')}
      okText={t('data.folders.DeleteForever')}
      confirmLoading={isInFlightBulkPurge}
      items={_.map(purgeable, (vfolder) => ({
        key: vfolder.id ?? '',
        label: vfolder.metadata?.name ?? '',
      }))}
      requireConfirmInput
      onOk={() => {
        if (purgeable.length === 0) {
          onRequestClose?.(false);
          return;
        }
        const ids = _.map(purgeable, (vfolder) => toLocalId(vfolder.id));
        commitBulkPurgeMutation({
          variables: { input: { ids } },
          onCompleted: (data, errors) => {
            if (errors && errors.length > 0) {
              const firstError = errors[0];
              message.error(firstError?.message ?? getErrorMessage(firstError));
              return;
            }
            const purgedCount = data?.bulkPurgeVfoldersV2?.purgedCount ?? 0;
            if (purgedCount === 0) {
              message.error(
                t('data.folders.FailedToDeleteFolders', {
                  folderNames: _.map(purgeable, (v) => v?.metadata?.name).join(
                    ', ',
                  ),
                }),
              );
              return;
            }
            if (purgeable.length === 1) {
              message.success(
                t('data.folders.FolderDeletedForever', {
                  folderName: purgeable[0]?.metadata?.name,
                }),
              );
            } else {
              message.success(
                t('data.folders.MultipleFolderDeletedForever', {
                  count: purgedCount,
                  total: purgeable.length,
                }),
              );
            }
            onRequestClose?.(true);
          },
          onError: (error) => {
            message.error(getErrorMessage(error));
          },
        });
      }}
      onCancel={() => onRequestClose?.(false)}
    />
  );
};

export default DeleteForeverVFolderModalV2;
