/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { DeleteVFolderModalV2Fragment$key } from '../__generated__/DeleteVFolderModalV2Fragment.graphql';
import { DeleteVFolderModalV2Mutation } from '../__generated__/DeleteVFolderModalV2Mutation.graphql';
import { App, Typography } from 'antd';
import {
  BAIFlex,
  BAIModal,
  BAIModalProps,
  toLocalId,
  useErrorMessageResolver,
} from 'backend.ai-ui';
import * as _ from 'lodash-es';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment, useMutation } from 'react-relay';

interface DeleteVFolderModalV2Props extends BAIModalProps {
  vfolderFrgmts?: DeleteVFolderModalV2Fragment$key;
  onRequestClose?: (success: boolean) => void;
}

const DeleteVFolderModalV2: React.FC<DeleteVFolderModalV2Props> = ({
  vfolderFrgmts,
  onRequestClose,
  ...baiModalProps
}) => {
  'use memo';
  const { t } = useTranslation();
  const { message } = App.useApp();
  const { getErrorMessage } = useErrorMessageResolver();

  const vfolders = useFragment(
    graphql`
      fragment DeleteVFolderModalV2Fragment on VFolder @relay(plural: true) {
        id
        metadata {
          name
        }
      }
    `,
    vfolderFrgmts,
  );

  const [commitBulkDeleteMutation, isInFlightBulkDelete] =
    useMutation<DeleteVFolderModalV2Mutation>(graphql`
      mutation DeleteVFolderModalV2Mutation(
        $input: BulkDeleteVFoldersV2Input!
      ) {
        bulkDeleteVfoldersV2(input: $input) {
          deletedCount
        }
      }
    `);

  // TODO(needs-backend): V2 `VFolder` does not expose a per-user action
  // permission (legacy `VirtualFolderNode.permissions` had `delete_vfolder`).
  // `accessControl.permission` is a mount-level enum (RO/RW/RW_DELETE), not
  // an entity-level action permission, so it cannot be used to filter out
  // undeletable folders here. Send all selected folders and let the backend
  // reject unauthorized ones until a proper permission field is exposed.
  const folders = vfolders ?? [];

  return (
    <BAIModal
      title={t('data.folders.MoveToTrash')}
      centered
      okText={t('data.folders.Delete')}
      okButtonProps={{ danger: true }}
      confirmLoading={isInFlightBulkDelete}
      onCancel={() => onRequestClose?.(false)}
      onOk={() => {
        if (folders.length === 0) {
          onRequestClose?.(false);
          return;
        }
        const ids = _.map(folders, (vfolder) => toLocalId(vfolder.id));
        commitBulkDeleteMutation({
          variables: { input: { ids } },
          onCompleted: (data, errors) => {
            if (errors && errors.length > 0) {
              const firstError = errors[0];
              message.error(firstError?.message ?? getErrorMessage(firstError));
              return;
            }
            const deletedCount = data?.bulkDeleteVfoldersV2?.deletedCount ?? 0;
            if (deletedCount === 0) {
              message.error(
                t('data.folders.FailedToDeleteFolders', {
                  folderNames: _.map(folders, (v) => v?.metadata?.name).join(
                    ', ',
                  ),
                }),
              );
              return;
            }
            if (folders.length === 1) {
              message.success(
                t('data.folders.FolderDeleted', {
                  folderName: folders[0]?.metadata?.name,
                }),
              );
            } else {
              message.success(
                t('data.folders.MultipleFolderDeleted', {
                  count: deletedCount,
                  total: folders.length,
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
      {...baiModalProps}
    >
      <BAIFlex direction="column" gap={'sm'} align="stretch">
        <Typography.Text>
          {folders.length === 1
            ? t('data.folders.MoveToTrashDescription', {
                folderName: folders[0]?.metadata?.name,
              })
            : t('data.folders.MoveToTrashMultipleDescription', {
                folderLength: folders.length,
              })}
        </Typography.Text>
      </BAIFlex>
    </BAIModal>
  );
};

export default DeleteVFolderModalV2;
