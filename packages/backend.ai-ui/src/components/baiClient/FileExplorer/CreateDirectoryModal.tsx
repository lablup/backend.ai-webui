import useConnectedBAIClient from '../../provider/BAIClientProvider/hooks/useConnectedBAIClient';
import { FolderInfoContext } from './BAIFileExplorer';
import { useMutation } from '@tanstack/react-query';
import {
  App,
  Form,
  Input,
  Modal,
  type FormInstance,
  type ModalProps,
} from 'antd';
import React, { use, useRef } from 'react';
import { useTranslation } from 'react-i18next';

// FIXME: After migrate BAIModal into backend.ai-ui, should be use BAIModal instead of Antd's Modal
interface CreateDirectoryModalProps extends ModalProps {
  onRequestClose: (success: boolean) => void;
}

const CreateDirectoryModal: React.FC<CreateDirectoryModalProps> = ({
  onRequestClose,
  ...modalProps
}) => {
  const { t } = useTranslation();
  const { message } = App.useApp();
  const { targetVFolderId, currentPath } = use(FolderInfoContext);
  const baiClient = useConnectedBAIClient();
  const formRef = useRef<FormInstance>(null);

  const createDirectoryMutation = useMutation({
    mutationFn: ({ path, name }: { path: string; name: string }) => {
      return baiClient.vfolder.mkdir(path, name, null, null);
    },
  });

  const createDirectory = () => {
    formRef.current
      ?.validateFields()
      .then((values) => {
        createDirectoryMutation
          .mutateAsync({
            path: [currentPath, values.folderName].join('/'),
            name: targetVFolderId,
          })
          .then(() => {
            onRequestClose(true);
            message.success(t('comp:FileExplorer.FolderCreatedSuccessfully'));
          })
          .catch((err) => {
            if (err && err.message) {
              message.error(err.message);
            } else if (err && err.title) {
              message.error(err.title);
            }
          });
      })
      .catch(() => {});
  };

  return (
    <Modal
      title={t('comp:FileExplorer.CreateANewFolder')}
      onCancel={() => onRequestClose(false)}
      okText={t('general.button.Create')}
      onOk={createDirectory}
      okButtonProps={{ loading: createDirectoryMutation.isPending }}
      {...modalProps}
      width={400}
    >
      <Form ref={formRef} layout="vertical">
        <Form.Item
          name="folderName"
          label={t('comp:FileExplorer.FolderName')}
          rules={[
            {
              required: true,
              message: t('comp:FileExplorer.PleaseEnterAFolderName'),
            },
            {
              max: 255,
              message: t('comp:FileExplorer.MaxFolderNameLength'),
            },
          ]}
        >
          <Input />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CreateDirectoryModal;
