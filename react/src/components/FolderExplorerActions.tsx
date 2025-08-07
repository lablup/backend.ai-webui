import { FolderExplorerElement } from './LegacyFolderExplorer';
import {
  DeleteOutlined,
  FileAddOutlined,
  FolderAddOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import { Button, Dropdown, Tooltip, theme } from 'antd';
import { BAIFlex } from 'backend.ai-ui';
import React, { RefObject } from 'react';
import { useTranslation } from 'react-i18next';

interface FolderExplorerActionsProps {
  isSelected: boolean;
  isWritable: boolean;
  folderExplorerRef: RefObject<FolderExplorerElement | null>;
  size?: 'small' | 'default';
}

const FolderExplorerActions: React.FC<FolderExplorerActionsProps> = ({
  isSelected,
  isWritable,
  folderExplorerRef,
  size = 'default',
}) => {
  const { token } = theme.useToken();
  const { t } = useTranslation();

  return (
    <BAIFlex
      justify="end"
      gap={token.marginSM}
      style={{
        right: 0,
      }}
    >
      <Tooltip title={size === 'small' && t('button.Delete')}>
        <Button
          danger
          disabled={!isSelected || !isWritable}
          icon={<DeleteOutlined />}
          onClick={() => {
            folderExplorerRef.current?._openDeleteMultipleFileDialog();
          }}
        >
          {size !== 'small' && t('button.Delete')}
        </Button>
      </Tooltip>
      <Tooltip title={size === 'small' && t('button.Create')}>
        <Button
          disabled={!isWritable}
          icon={<FileAddOutlined />}
          onClick={() => {
            folderExplorerRef.current?.openMkdirDialog();
          }}
        >
          {size !== 'small' && t('button.Create')}
        </Button>
      </Tooltip>
      <Dropdown
        disabled={!isWritable}
        menu={{
          items: [
            {
              key: 'upload files',
              label: t('data.explorer.UploadFiles'),
              icon: <FileAddOutlined />,
              onClick: () => {
                folderExplorerRef.current?.handleUpload('file');
              },
            },
            {
              key: 'upload folder',
              label: t('data.explorer.UploadFolder'),
              icon: <FolderAddOutlined />,
              onClick: () => {
                folderExplorerRef.current?.handleUpload('folder');
              },
            },
          ],
        }}
      >
        <Tooltip title={size === 'small' && t('button.Upload')}>
          <Button disabled={!isWritable} icon={<UploadOutlined />}>
            {size !== 'small' && t('button.Upload')}
          </Button>
        </Tooltip>
      </Dropdown>
    </BAIFlex>
  );
};

export default FolderExplorerActions;
