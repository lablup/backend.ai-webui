import { App } from '../../../app-shim';
import { Form, type FormInstance } from '../../../form-engine';
import { useBAIi18n } from '../../../hooks/useBAIi18n';
import BAIModal, { type BAIModalProps } from '../../BAIModal';
import { AstryxFormTextInput } from '../../astryxFormControls';
import useConnectedBAIClient from '../../provider/BAIClientProvider/hooks/useConnectedBAIClient';
import { FolderInfoContext } from './BAIFileExplorer';
import { useMutation } from '@tanstack/react-query';
import React, { use, useRef } from 'react';

// to-astryx W2-D: the standing TODO is done — this is `BAIModal` (Astryx
// `Dialog` under an antd-`Modal`-shaped surface, ticket p3-b), matching its
// `CreateFileModal` sibling, and the field is the shared Astryx form adapter.
interface CreateDirectoryModalProps extends BAIModalProps {
  onRequestClose: (success: boolean, createdFolderName?: string) => void;
}

const CreateDirectoryModal: React.FC<CreateDirectoryModalProps> = ({
  onRequestClose,
  ...modalProps
}) => {
  const { t } = useBAIi18n();
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
            onRequestClose(true, values.folderName);
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
    <BAIModal
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
          <AstryxFormTextInput label={t('comp:FileExplorer.FolderName')} />
        </Form.Item>
      </Form>
    </BAIModal>
  );
};

export default CreateDirectoryModal;
