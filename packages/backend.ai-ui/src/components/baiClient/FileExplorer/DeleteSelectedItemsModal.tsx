import BAIConfirmModalWithInput from '../../BAIConfirmModalWithInput';
import BAIFlex from '../../BAIFlex';
import useConnectedBAIClient from '../../provider/BAIClientProvider/hooks/useConnectedBAIClient';
import { VFolderFile } from '../../provider/BAIClientProvider/types';
import { FolderInfoContext } from './BAIFileExplorer';
import { useMutation } from '@tanstack/react-query';
import { Alert, App, theme, Typography, type ModalProps } from 'antd';
import _ from 'lodash';
import { use } from 'react';
import { useTranslation } from 'react-i18next';

export interface DeleteSelectedItemsModalProps extends ModalProps {
  onRequestClose: (success: boolean, deletingFilePaths?: Array<string>) => void;
  onDeleteFilesInBackground?: (
    bgTaskId: string,
    targetVFolderId: string,
    deletingFilePaths: Array<string>,
  ) => void;
  selectedFiles: Array<VFolderFile>;
}

const DeleteSelectedItemsModal: React.FC<DeleteSelectedItemsModalProps> = ({
  onRequestClose,
  onDeleteFilesInBackground,
  selectedFiles,
  ...modalProps
}) => {
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const { message } = App.useApp();
  const { currentPath, targetVFolderId } = use(FolderInfoContext);
  const baiClient = useConnectedBAIClient();

  const deleteFilesMutation = useMutation({
    mutationFn: ({
      files,
      recursive,
      name,
    }: {
      files: Array<string>;
      recursive: boolean;
      name: string;
    }) => {
      return baiClient.vfolder.delete_files(files, recursive, name);
    },
  });

  const handleDelete = () => {
    const selectedFileNames = _.map(selectedFiles, (item) =>
      _.join([currentPath, item.name], '/'),
    );
    deleteFilesMutation
      .mutateAsync({
        files: selectedFileNames,
        recursive: true,
        name: targetVFolderId,
      })
      .then(({ bgtask_id }: { bgtask_id: string }) => {
        onRequestClose(true, selectedFileNames);
        if (bgtask_id) {
          onDeleteFilesInBackground?.(
            bgtask_id,
            targetVFolderId,
            selectedFileNames,
          );
        } else {
          message.success(
            t('comp:FileExplorer.SelectedItemsDeletedSuccessfully'),
          );
        }
      })
      .catch((err) => {
        if (err && err.message) {
          message.error(err.message);
        } else if (err && err.title) {
          message.error(err.title);
        }
      });
  };

  return (
    <BAIConfirmModalWithInput
      title={t('comp:FileExplorer.DeleteSelectedItemsDialog')}
      okText={t('general.button.Delete')}
      okButtonProps={{ danger: true, loading: deleteFilesMutation.isPending }}
      inputProps={{ disabled: deleteFilesMutation.isPending }}
      onOk={handleDelete}
      onCancel={() => onRequestClose(false)}
      confirmText={
        selectedFiles.length > 1
          ? t('general.button.Delete')
          : selectedFiles[0]?.name
      }
      content={
        <BAIFlex align="stretch" direction="column" gap="md">
          <Alert type="warning" title={t('general.modal.DeleteForeverDesc')} />
          {selectedFiles.length > 1 ? (
            <BAIFlex gap="sm" direction="column" align="stretch">
              <Typography.Text strong>
                {t('general.modal.ItemSelectedWithCount', {
                  count: selectedFiles.length,
                })}
              </Typography.Text>
              <BAIFlex
                direction="column"
                align="stretch"
                style={{ maxHeight: 200, overflowY: 'auto' }}
              >
                {_.map(selectedFiles, (item) => (
                  <Typography.Text
                    code
                    key={item.name + item.created}
                    style={{ width: '100%', wordBreak: 'keep-all' }}
                  >
                    {item.name}
                  </Typography.Text>
                ))}
              </BAIFlex>
              <Typography.Text style={{ marginRight: token.marginXXS }}>
                {t('comp:FileExplorer.TypeDeleteToConfirm')}
              </Typography.Text>
            </BAIFlex>
          ) : (
            <BAIFlex>
              <Typography.Text style={{ marginRight: token.marginXXS }}>
                {t('comp:FileExplorer.TypeFolderNameToDelete')}
                <Typography.Text code style={{ wordBreak: 'keep-all' }}>
                  {selectedFiles[0]?.name}
                </Typography.Text>
              </Typography.Text>
            </BAIFlex>
          )}
        </BAIFlex>
      }
      {...modalProps}
    />
  );
};

export default DeleteSelectedItemsModal;
