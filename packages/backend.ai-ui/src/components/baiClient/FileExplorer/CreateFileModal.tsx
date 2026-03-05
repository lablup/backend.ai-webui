import BAIModal, { type BAIModalProps } from '../../BAIModal';
import useConnectedBAIClient from '../../provider/BAIClientProvider/hooks/useConnectedBAIClient';
import { FolderInfoContext } from './BAIFileExplorer';
import { useMutation } from '@tanstack/react-query';
import { App, Form, Input, type FormInstance } from 'antd';
import _ from 'lodash';
import React, { use, useRef } from 'react';
import { useTranslation } from 'react-i18next';

interface CreateFileModalProps extends BAIModalProps {
  onRequestClose: (success: boolean) => void;
}

const CreateFileModal: React.FC<CreateFileModalProps> = ({
  onRequestClose,
  ...modalProps
}) => {
  'use memo';
  const { t } = useTranslation();
  const { message, modal } = App.useApp();
  const { targetVFolderId, currentPath } = use(FolderInfoContext);
  const baiClient = useConnectedBAIClient();
  const formRef = useRef<FormInstance>(null);

  const createFileMutation = useMutation({
    mutationFn: async ({
      filePath,
      vfolderId,
    }: {
      filePath: string;
      vfolderId: string;
    }) => {
      // Use a newline (1 byte) since tus servers may reject 0-byte uploads.
      // A newline is preferred over a space as it makes the file show line numbers (up to 2),
      // making it clearer that the file has initial content.
      const blob = new Blob(['\n'], { type: 'application/octet-stream' });
      const tusUrl: string = await baiClient.vfolder.create_upload_session(
        filePath,
        blob,
        vfolderId,
      );
      // Complete the tus upload by sending the file content via PATCH
      const res = await fetch(tusUrl, {
        method: 'PATCH',
        headers: {
          'Tus-Resumable': '1.0.0',
          'Upload-Offset': '0',
          'Content-Type': 'application/offset+octet-stream',
        },
        body: blob,
      });
      if (!res.ok) {
        throw new Error(`Failed to create file: ${res.statusText}`);
      }
      return res;
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
    <BAIModal
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
    </BAIModal>
  );
};

export default CreateFileModal;
