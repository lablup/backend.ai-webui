import { DeleteVFolderModalFragment$key } from '../__generated__/DeleteVFolderModalFragment.graphql';
import { VFolderNodesFragment$data } from '../__generated__/VFolderNodesFragment.graphql';
import { useSuspendedBackendaiClient } from '../hooks';
import { useTanMutation } from '../hooks/reactQueryAlias';
import BAIModal, { BAIModalProps } from './BAIModal';
import { Typography, message } from 'antd';
import { toLocalId, useErrorMessageResolver } from 'backend.ai-ui';
import _ from 'lodash';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment } from 'react-relay';

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
      }
    `,
    vfolderFrgmts,
  );

  const deleteMutation = useTanMutation({
    mutationFn: (id: string) => {
      return baiClient.vfolder.delete_by_id(toLocalId(id));
    },
  });

  return (
    <BAIModal
      title={t('data.folders.MoveToTrash')}
      centered
      okText={t('data.folders.Delete')}
      okButtonProps={{ danger: true }}
      onCancel={() => onRequestClose?.(false)}
      onOk={() => {
        const promises = _.map(vfolders, (vfolder: VFolderType) =>
          deleteMutation.mutateAsync(vfolder.id).catch((error) => {
            message.error(getErrorMessage(error));
            return Promise.reject();
          }),
        );
        Promise.allSettled(promises).then((results) => {
          const success = results.every(
            (result) => result.status === 'fulfilled',
          );
          if (success) {
            if (vfolders?.length === 1) {
              message.success(
                t('data.folders.FolderDeleted', {
                  folderName: vfolders?.[0]?.name,
                }),
              );
            } else {
              message.success(
                t('data.folders.MultipleFolderDeleted', {
                  folderLength: vfolders?.length,
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
        {vfolders?.length === 1
          ? t('data.folders.MoveToTrashDescription', {
              folderName: vfolders?.[0]?.name,
            })
          : t('data.folders.MoveToTrashMultipleDescription', {
              folderLength: vfolders?.length,
            })}
      </Typography.Text>
    </BAIModal>
  );
};

export default DeleteVFolderModal;
