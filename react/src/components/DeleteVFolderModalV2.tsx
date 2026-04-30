/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { DeleteVFolderModalV2Fragment$key } from '../__generated__/DeleteVFolderModalV2Fragment.graphql';
import { DeleteVFolderModalV2Mutation } from '../__generated__/DeleteVFolderModalV2Mutation.graphql';
import { App, Typography, theme } from 'antd';
import {
  BAIAlert,
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
  const { token } = theme.useToken();

  const vfolders = useFragment(
    graphql`
      fragment DeleteVFolderModalV2Fragment on VirtualFolderNode
      @relay(plural: true) {
        id
        name
        permissions
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

  const foldersByPermission = _.groupBy(vfolders, (vfolder) => {
    if (vfolder.permissions?.includes('delete_vfolder')) {
      return 'deletable';
    }
    return 'undeletable';
  });

  return (
    <BAIModal
      title={t('data.folders.MoveToTrash')}
      centered
      okText={t('data.folders.Delete')}
      okButtonProps={{ danger: true }}
      confirmLoading={isInFlightBulkDelete}
      onCancel={() => onRequestClose?.(false)}
      onOk={() => {
        const deletable = foldersByPermission.deletable ?? [];
        if (deletable.length === 0) {
          onRequestClose?.(false);
          return;
        }
        const ids = _.map(deletable, (vfolder) => toLocalId(vfolder.id));
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
                  folderNames: _.map(deletable, 'name').join(', '),
                }),
              );
              return;
            }
            if (deletable.length === 1) {
              message.success(
                t('data.folders.FolderDeleted', {
                  folderName: deletable[0]?.name,
                }),
              );
            } else {
              message.success(
                t('data.folders.MultipleFolderDeleted', {
                  count: deletedCount,
                  total: deletable.length,
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
        {vfolders &&
          vfolders.length !== foldersByPermission.deletable?.length && (
            <BAIAlert
              showIcon
              ghostInfoBg={false}
              title={t('data.folders.ExcludedFolders', {
                count: foldersByPermission.undeletable?.length || 0,
              })}
              description={
                <ul
                  style={{
                    margin: 0,
                    padding: 0,
                    paddingTop: token.paddingXXS,
                    listStyle: 'circle',
                  }}
                >
                  {_.map(foldersByPermission.undeletable, (vfolder) => (
                    <li key={vfolder.id}>{vfolder.name}</li>
                  ))}
                </ul>
              }
            />
          )}
        <Typography.Text>
          {foldersByPermission.deletable?.length === 1
            ? t('data.folders.MoveToTrashDescription', {
                folderName: foldersByPermission.deletable?.[0]?.name,
              })
            : t('data.folders.MoveToTrashMultipleDescription', {
                folderLength: foldersByPermission.deletable?.length,
              })}
        </Typography.Text>
      </BAIFlex>
    </BAIModal>
  );
};

export default DeleteVFolderModalV2;
