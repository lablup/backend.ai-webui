import BAIFlex from '../../BAIFlex';
import useConnectedBAIClient from '../../provider/BAIClientProvider/hooks/useConnectedBAIClient';
import { VFolderFile } from '../../provider/BAIClientProvider/types';
import { FolderInfoContext } from './BAIFileExplorer';
import { useMutation } from '@tanstack/react-query';
import { App, Modal, ModalProps, theme, Typography } from 'antd';
import _ from 'lodash';
import { use } from 'react';
import { useTranslation } from 'react-i18next';

interface DeleteSelectedItemsModalProps extends ModalProps {
  onRequestClose: (success: boolean) => void;
  selectedFiles: Array<VFolderFile>;
}

const DeleteSelectedItemsModal: React.FC<DeleteSelectedItemsModalProps> = ({
  onRequestClose,
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
      .then(() => {
        onRequestClose(true);
        message.success(
          t('comp:FileExplorer.SelectedItemsDeletedSuccessfully'),
        );
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
    <Modal
      title={t('comp:FileExplorer.DeleteSelectedItemsDialog')}
      onCancel={() => onRequestClose(false)}
      okText={t('general.button.Delete')}
      okButtonProps={{ danger: true, loading: deleteFilesMutation.isPending }}
      onOk={handleDelete}
      {...modalProps}
      width={400}
    >
      <BAIFlex align="stretch" direction="column" gap="md">
        <Typography.Text>
          {t('comp:FileExplorer.DeleteSelectedItemDesc')}
        </Typography.Text>
        <div
          style={{
            marginLeft: token.sizeMD,
            marginRight: token.sizeMD,
            textAlign: 'center',
          }}
        >
          {_.map(selectedFiles, (item) => (
            <Typography.Text
              mark
              key={item.name + item.created}
              style={{
                wordBreak: 'break-all',
                display: 'inline',
                marginRight: token.marginSM,
              }}
            >
              {item.name}
            </Typography.Text>
          ))}
        </div>
      </BAIFlex>
    </Modal>
  );
};

export default DeleteSelectedItemsModal;
