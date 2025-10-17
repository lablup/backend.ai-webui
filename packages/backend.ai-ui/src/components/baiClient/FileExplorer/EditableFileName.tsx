import BAIFlex from '../../BAIFlex';
import BAILink from '../../BAILink';
import useConnectedBAIClient from '../../provider/BAIClientProvider/hooks/useConnectedBAIClient';
import { VFolderFile } from '../../provider/BAIClientProvider/types';
import { FolderInfoContext } from './BAIFileExplorer';
import { FileOutlined, FolderOutlined } from '@ant-design/icons';
import { useMutation } from '@tanstack/react-query';
import { App, Form, GetProps, Input, theme, Typography } from 'antd';
import { createStyles } from 'antd-style';
import _ from 'lodash';
import { CornerDownLeftIcon } from 'lucide-react';
import { use, useState } from 'react';
import { useTranslation } from 'react-i18next';

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
  form: css`
    .ant-form-item,
    .ant-form-item-has-success {
      margin-bottom: 0px !important;
    }
  `,
}));

type EditableNameProps = {
  fileInfo: VFolderFile;
  existingFiles: Array<VFolderFile>;
  onEndEdit?: () => void;
  onStartEdit?: () => void;
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

const EditableFileName: React.FC<EditableNameProps> = ({
  fileInfo,
  existingFiles,
  disabled = false,
  onEndEdit,
  onStartEdit,
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

  const [optimisticName, setOptimisticName] = useState(fileInfo.name);
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

  // filter existing file names but exclude the current file name
  const existingFileNames = existingFiles
    .filter((file) => file.name !== fileInfo.name)
    .map((file) => file.name);
  const getFileExtension = (filename: string): string => {
    const match = filename.match(/\.([^.]+)$/);
    return match ? match[1] : '';
  };

  const isPendingRenamingAndRefreshing =
    renameMutation.isPending || optimisticName !== fileInfo.name;

  return (
    <>
      {!isEditing || isPendingRenamingAndRefreshing ? (
        <Component
          editable={
            !disabled && !isPendingRenamingAndRefreshing
              ? {
                  onStart: () => {
                    setIsEditing(true);
                    onStartEdit?.();
                  },
                  onEnd: () => {
                    onEndEdit?.();
                  },
                  triggerType: ['icon'],
                }
              : false
          }
          className={!disabled ? styles.hoverEdit : undefined}
          style={style}
          {...props}
        >
          {fileInfo?.type === 'DIRECTORY' ? (
            <BAILink
              type="hover"
              style={{
                maxWidth: 180,
                color: isPendingRenamingAndRefreshing
                  ? token.colorTextTertiary
                  : undefined,
              }}
              icon={<FolderOutlined style={{ color: token.colorLink }} />}
              ellipsis
              title={fileInfo.name}
            >
              {isPendingRenamingAndRefreshing ? optimisticName : fileInfo.name}
            </BAILink>
          ) : (
            <BAIFlex gap="xs" style={{ display: 'inline-flex' }}>
              <FileOutlined />
              <Typography.Text
                style={{
                  maxWidth: 200,
                  color: isPendingRenamingAndRefreshing
                    ? token.colorTextTertiary
                    : undefined,
                }}
                ellipsis
                title={fileInfo.name}
              >
                {isPendingRenamingAndRefreshing
                  ? optimisticName
                  : fileInfo.name}
              </Typography.Text>
            </BAIFlex>
          )}
        </Component>
      ) : (
        <Form
          className={styles.form}
          initialValues={{ newName: fileInfo?.name }}
          onFinish={(values) => {
            setIsEditing(false);
            setOptimisticName(values.newName);
            const variables = {
              target_path: _.join([currentPath, fileInfo?.name], '/'),
              new_name: values.newName,
              targetFolder: targetVFolderId,
              is_dir: fileInfo?.type === 'DIRECTORY',
            };

            const executeRename = () => {
              renameMutation.mutate(variables, {
                onSuccess: () => {
                  message.success(t('comp:FileExplorer.RenameSuccess'));
                  onEndEdit?.();
                },
                onError: (err: ServerError) => {
                  message.error(err?.title || err?.msg);
                  setOptimisticName(fileInfo.name);
                },
              });
            };

            if (fileInfo?.type === 'FILE') {
              const originExtension = getFileExtension(fileInfo.name);
              const newExtension = getFileExtension(values.newName);
              if (!newExtension && originExtension) {
                variables.new_name = values.newName + '.' + originExtension;
              }
              if (_.includes(existingFileNames, variables.new_name)) {
                message.error(t('comp:FileExplorer.error.DuplicatedName'));
                setOptimisticName(fileInfo.name);
              } else if (newExtension && newExtension !== originExtension) {
                modal.confirm({
                  title: t('comp:FileExplorer.ChangeFileExtension'),
                  content: t('comp:FileExplorer.ChangeFileExtensionDesc'),
                  onOk: () => {
                    executeRename();
                  },
                });
              } else {
                executeRename();
              }
            } else if (fileInfo?.type === 'DIRECTORY') {
              if (_.includes(existingFileNames, values.newName)) {
                message.error(t('comp:FileExplorer.error.DuplicatedName'));
                setOptimisticName(fileInfo.name);
              } else {
                executeRename();
              }
            }
          }}
          onClick={props.onClick}
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

export default EditableFileName;
