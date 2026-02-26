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
import _ from 'lodash';
import React, { use, useRef } from 'react';
import { useTranslation } from 'react-i18next';

// FIXME: After migrate BAIModal into backend.ai-ui, should be use BAIModal instead of Antd's Modal
interface CreateFileModalProps extends ModalProps {
  onRequestClose: (success: boolean) => void;
}

const CreateFileModal: React.FC<CreateFileModalProps> = ({
  onRequestClose,
  ...modalProps
}) => {
  const { t } = useTranslation();
  const { message, modal } = App.useApp();
  const { targetVFolderId, currentPath } = use(FolderInfoContext);
  const baiClient = useConnectedBAIClient();
  const formRef = useRef<FormInstance>(null);

  const createFileMutation = useMutation({
    mutationFn: ({
      filePath,
      vfolderId,
    }: {
      filePath: string;
      vfolderId: string;
    }) => {
      const emptyBlob = new Blob([''], { type: 'application/octet-stream' });
      // baiClient.vfolder.upload exists at runtime but is not yet declared in BAIClient types
      return (
        baiClient.vfolder as unknown as {
          upload: (path: string, fs: Blob, name: string) => Promise<unknown>;
        }
      ).upload(filePath, emptyBlob, vfolderId);
    },
  });

  const createFile = () => {
    formRef.current
      ?.validateFields()
      .then(async (values) => {
        const filePath = [currentPath, values.fileName].join('/');

        // Check for duplicate file name before creating
        const isDuplicate = await baiClient.vfolder
          .list_files(currentPath, targetVFolderId)
          .then((res) => _.some(res.items, (f) => f.name === values.fileName))
          .catch(() => false);

        if (isDuplicate) {
          modal.confirm({
            title: t('comp:FileExplorer.DuplicatedFiles'),
            content: t('comp:FileExplorer.DuplicatedFilesDesc'),
            onOk: () => {
              createFileMutation
                .mutateAsync({ filePath, vfolderId: targetVFolderId })
                .then(() => {
                  onRequestClose(true);
                  message.success(
                    t('comp:FileExplorer.FileCreatedSuccessfully'),
                  );
                })
                .catch((err) => {
                  message.error(err?.message || err?.title);
                });
            },
          });
          return;
        }

        createFileMutation
          .mutateAsync({ filePath, vfolderId: targetVFolderId })
          .then(() => {
            onRequestClose(true);
            message.success(t('comp:FileExplorer.FileCreatedSuccessfully'));
          })
          .catch((err) => {
            message.error(err?.message || err?.title);
          });
      })
      .catch(() => {});
  };

  return (
    <Modal
      title={t('comp:FileExplorer.CreateANewFile')}
      onCancel={() => onRequestClose(false)}
      okText={t('general.button.Create')}
      onOk={createFile}
      okButtonProps={{ loading: createFileMutation.isPending }}
      {...modalProps}
      width={400}
    >
      <Form ref={formRef} layout="vertical">
        <Form.Item
          name="fileName"
          label={t('comp:FileExplorer.FileName')}
          rules={[
            {
              required: true,
              message: t('comp:FileExplorer.PleaseEnterAFileName'),
            },
            {
              max: 255,
              message: t('comp:FileExplorer.MaxFileNameLength'),
            },
            {
              validator: (_, value) => {
                if (value && (value.includes('/') || value.includes('\\'))) {
                  return Promise.reject(
                    new Error(t('comp:FileExplorer.InvalidFileNameCharacters')),
                  );
                }
                return Promise.resolve();
              },
            },
          ]}
        >
          <Input placeholder={t('comp:FileExplorer.FileNamePlaceholder')} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CreateFileModal;
