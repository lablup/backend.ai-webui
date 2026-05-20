import BAIDeleteConfirmModal from '../../BAIDeleteConfirmModal';
import useConnectedBAIClient from '../../provider/BAIClientProvider/hooks/useConnectedBAIClient';
import { VFolderFile } from '../../provider/BAIClientProvider/types';
import { FolderInfoContext } from './BAIFileExplorer';
import { useMutation } from '@tanstack/react-query';
import { App, type ModalProps } from 'antd';
import * as _ from 'lodash-es';
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
    <BAIDeleteConfirmModal
      title={t('comp:FileExplorer.DeleteSelectedItemsDialog')}
      target={t('general.File')}
      items={_.map(selectedFiles, (item) => ({
        key: item.name + item.created,
        label: item.name,
      }))}
      requireConfirmInput
      okButtonProps={{ loading: deleteFilesMutation.isPending }}
      inputProps={{ disabled: deleteFilesMutation.isPending }}
      onOk={handleDelete}
      onCancel={() => onRequestClose(false)}
      {...modalProps}
    />
  );
};

export default DeleteSelectedItemsModal;
