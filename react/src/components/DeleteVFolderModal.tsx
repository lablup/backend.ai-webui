/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { DeleteVFolderModalFragment$key } from '../__generated__/DeleteVFolderModalFragment.graphql';
import { VFolderNodesFragment$data } from '../__generated__/VFolderNodesFragment.graphql';
import { useSuspendedBackendaiClient } from '../hooks';
import { useTanMutation } from '../hooks/reactQueryAlias';
import { Typography, message } from 'antd';
import {
  BAIFlex,
  BAIListAlert,
  BAIModal,
  BAIModalProps,
  toLocalId,
  useErrorMessageResolver,
} from 'backend.ai-ui';
import * as _ from 'lodash-es';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment } from 'react-relay';
import { PayloadError } from 'relay-runtime';

type VFolderType = NonNullable<VFolderNodesFragment$data[number]>;

interface DeleteVFolderModalProps extends BAIModalProps {
  vfolderFrgmts?: DeleteVFolderModalFragment$key;
  onRequestClose?: (success: boolean) => void;
}

const DeleteVFolderModal: React.FC<DeleteVFolderModalProps> = ({
  vfolderFrgmts,
  onRequestClose,
  ...baiModalProps
}) => {
  const { t } = useTranslation();
  const baiClient = useSuspendedBackendaiClient();
  const { getErrorMessage } = useErrorMessageResolver();

  const vfolders = useFragment(
    graphql`
      fragment DeleteVFolderModalFragment on VirtualFolderNode
      @relay(plural: true) {
        id
        name
        permissions
      }
    `,
    vfolderFrgmts,
  );

  const deleteMutation = useTanMutation({
    mutationFn: (id: string) => {
      return baiClient.vfolder.delete_by_id(toLocalId(id));
    },
  });

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
      onCancel={() => onRequestClose?.(false)}
      onOk={() => {
        const promises = _.map(
          foldersByPermission.deletable,
          (vfolder: VFolderType) =>
            deleteMutation.mutateAsync(vfolder.id).catch((error) => {
              return Promise.reject({ vfolder, error });
            }),
        );
        Promise.allSettled(promises).then((results) => {
          const fulfilled = results.filter((r) => r.status === 'fulfilled');
          const rejected = results.filter((r) => r.status === 'rejected');

          if (rejected.length > 0) {
            const failedVfolderNames = rejected
              .map((r) => {
                const reason = r.reason;
                return reason?.vfolder?.name || '';
              })
              .join(', ');

            failedVfolderNames &&
              message.error(
                t('data.folders.FailedToDeleteFolders', {
                  folderNames: failedVfolderNames,
                }),
              );

            const error =
              rejected[0]?.reason?.error?.isError && rejected[0].reason.error;
            error && message.error(getErrorMessage(error as PayloadError));
          }

          if (fulfilled.length > 0) {
            if (foldersByPermission.deletable?.length === 1) {
              message.success(
                t('data.folders.FolderDeleted', {
                  folderName: foldersByPermission.deletable?.[0]?.name,
                }),
              );
              onRequestClose?.(true);
              return;
            }
            message.success(
              t('data.folders.MultipleFolderDeleted', {
                count: fulfilled.length,
                total: foldersByPermission.deletable?.length,
              }),
            );
            onRequestClose?.(true);
            return;
          }
        });
      }}
      {...baiModalProps}
    >
      <BAIFlex direction="column" gap={'sm'} align="stretch">
        {vfolders &&
          vfolders.length !== foldersByPermission.deletable?.length && (
            <BAIListAlert
              showIcon
              ghostInfoBg={false}
              title={t('data.folders.ExcludedFolders', {
                count: foldersByPermission.undeletable?.length || 0,
              })}
              items={_.map(foldersByPermission.undeletable, (vfolder) => ({
                key: vfolder.id,
                content: vfolder.name,
              }))}
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

export default DeleteVFolderModal;
