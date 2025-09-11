import { EditableNameFragment$key } from '../../../__generated__/EditableNameFragment.graphql';
import useConnectedBAIClient from '../../provider/BAIClientProvider/hooks/useConnectedBAIClient';
import { VFolderFile } from '../../provider/BAIClientProvider/types';
import { FolderInfoContext } from './BAIFileExplorer';
import { useMutation } from '@tanstack/react-query';
import { App, Form, GetProps, Input, theme, Typography } from 'antd';
import { createStyles } from 'antd-style';
import _ from 'lodash';
import { CornerDownLeftIcon } from 'lucide-react';
import { use, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment } from 'react-relay';

interface ServerError extends Error {
  title?: string;
  msg?: string;
}

const useStyles = createStyles(({ css }) => ({
  hoverEdit: css`
    .ant-typography-edit {
      opacity: 0;
      transition: opacity 0.2s;
    }

    &:hover .ant-typography-edit {
      opacity: 1;
    }
  `,
}));

type EditableNameProps = {
  vfolderNodeFrgmt?: EditableNameFragment$key | null;
  fileInfo: VFolderFile;
  existingFiles: Array<VFolderFile>;
  children?: string | React.ReactNode;
  afterEdit?: () => void;
  beforeEdit?: () => void;
} & (
  | ({ component?: typeof Typography.Text } & Omit<
      GetProps<typeof Typography.Text>,
      'children'
    >)
  | ({ component: typeof Typography.Title } & Omit<
      GetProps<typeof Typography.Title>,
      'children'
    >)
);

const EditableName: React.FC<EditableNameProps> = ({
  vfolderNodeFrgmt,
  fileInfo,
  existingFiles,
  children,
  afterEdit,
  beforeEdit,
  component: Component = Typography.Text,
  style,
  ...props
}) => {
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const { modal, message } = App.useApp();
  const { styles } = useStyles();
  const { targetVFolderId, currentPath } = use(FolderInfoContext);
  const [isEditing, setIsEditing] = useState(false);
  const baiClient = useConnectedBAIClient();

  const renameMutation = useMutation({
    mutationFn: ({
      target_path,
      new_name,
      targetFolder,
      is_dir,
    }: {
      target_path: string;
      new_name: string;
      targetFolder: string;
      is_dir: boolean;
    }): Promise<any> => {
      return baiClient.vfolder.rename_file(
        target_path,
        new_name,
        targetFolder,
        is_dir,
      );
    },
  });

  const vFolderNode = useFragment(
    graphql`
      fragment EditableNameFragment on VirtualFolderNode {
        permissions
      }
    `,
    vfolderNodeFrgmt,
  );
  const hasWritePermission =
    vFolderNode?.permissions?.includes('write_content');

  // filter existing file names but exclude the current file name
  const existingFileNames = existingFiles
    .filter((file) => file.name !== fileInfo.name)
    .map((file) => file.name);
  const getFileExtension = (filename: string): string => {
    const match = filename.match(/\.([^.]+)$/);
    return match ? match[1] : '';
  };

  return (
    <>
      {!isEditing ? (
        <Component
          editable={
            hasWritePermission
              ? {
                  onStart: () => {
                    setIsEditing(true);
                    beforeEdit?.();
                  },
                  onEnd: () => {
                    setIsEditing(false);
                    afterEdit?.();
                  },
                  onCancel: () => {
                    setIsEditing(false);
                  },
                  triggerType: ['icon'],
                }
              : false
          }
          className={hasWritePermission ? styles.hoverEdit : undefined}
          style={{
            ...style,
          }}
          {...props}
        >
          {children}
        </Component>
      ) : (
        <Form
          onFinish={(values) => {
            setIsEditing(false);

            let variables = {
              target_path: _.join([currentPath, fileInfo?.name], '/'),
              new_name: values.newName,
              targetFolder: targetVFolderId,
              is_dir: fileInfo?.type === 'DIRECTORY',
            };

            if (fileInfo?.type === 'FILE') {
              const originExtension = getFileExtension(fileInfo.name);
              const newExtension = getFileExtension(values.newName);
              if (!newExtension && originExtension) {
                variables.new_name = values.newName + '.' + originExtension;
              }
              if (_.includes(existingFileNames, variables.new_name)) {
                message.error(t('comp:FileExplorer.error.DuplicatedName'));
              } else if (newExtension && newExtension !== originExtension) {
                modal.confirm({
                  title: t('comp:FileExplorer.ChangeFileExtension'),
                  content: t('comp:FileExplorer.ChangeFileExtensionDesc'),
                  onOk: () => {
                    renameMutation.mutate(variables, {
                      onSuccess: () => {
                        message.success(t('comp:FileExplorer.RenameSuccess'));
                        afterEdit?.();
                      },
                      onError: (err: ServerError) => {
                        message.error(err?.title || err?.msg);
                      },
                    });
                  },
                });
              } else {
                renameMutation.mutate(variables, {
                  onSuccess: () => {
                    message.success(t('comp:FileExplorer.RenameSuccess'));
                    afterEdit?.();
                  },
                  onError: (err: ServerError) => {
                    message.error(err?.title || err?.msg);
                  },
                });
              }
            } else if (fileInfo?.type === 'DIRECTORY') {
              if (_.includes(existingFileNames, values.newName)) {
                message.error(t('comp:FileExplorer.error.DuplicatedName'));
              } else {
                renameMutation.mutate(variables, {
                  onSuccess: () => {
                    message.success(t('comp:FileExplorer.RenameSuccess'));
                    afterEdit?.();
                  },
                  onError: (err: ServerError) => {
                    message.error(err?.title || err?.msg);
                  },
                });
              }
            }
          }}
        >
          <Form.Item
            name="newName"
            rules={[
              {
                required: true,
                message: t('comp:FileExplorer.error.FileNameRequired'),
              },
            ]}
          >
            <Input
              size="small"
              placeholder={fileInfo?.name || undefined}
              suffix={
                <CornerDownLeftIcon
                  style={{
                    fontSize: '0.8em',
                    color: token.colorTextTertiary,
                  }}
                />
              }
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  setIsEditing(false);
                }
              }}
            />
          </Form.Item>
        </Form>
      )}
    </>
  );
};

export default EditableName;
