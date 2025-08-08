import { ActionItemsFragment$key } from '../../../__generated__/ActionItemsFragment.graphql';
import { BAITrashBinIcon } from '../../../icons';
import BAIFlex from '../../BAIFlex';
import { VFolderFile } from '../../provider/BAIClientProvider/types';
import CreateDirectoryModal from './CreateDirectoryModal';
import DeleteSelectedItemsModal from './DeleteSelectedItemsModal';
import { useUploadVFolderFiles } from './hooks';
import {
  FileAddOutlined,
  FolderAddOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import { useToggle } from 'ahooks';
import { Button, Dropdown, Grid, theme, Tooltip, Upload } from 'antd';
import { RcFile } from 'antd/es/upload';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment } from 'react-relay';

interface ActionItemsProps {
  actionItemsFrgmt?: ActionItemsFragment$key | null;
  selectedItems: Array<VFolderFile>;
  onRequestClose: (
    success: boolean,
    modifiedItems?: Array<VFolderFile>,
  ) => void;
  onUpload: (files: Array<RcFile>, currentPath: string) => void;
}

const ActionItems: React.FC<ActionItemsProps> = ({
  actionItemsFrgmt,
  selectedItems,
  onRequestClose,
  onUpload,
}) => {
  const { t } = useTranslation();
  const { lg } = Grid.useBreakpoint();
  const { token } = theme.useToken();
  const [openCreateModal, { toggle: toggleCreateModal }] = useToggle(false);
  const [openDeleteModal, { toggle: toggleDeleteModal }] = useToggle(false);
  const [isUploading, { toggle: toggleUploading }] = useToggle(false);
  const uploadProcessingRef = useRef<string | null>(null);
  const { upload } = useUploadVFolderFiles();

  const virtualFolderNodeFrgmt = useFragment(
    graphql`
      fragment ActionItemsFragment on VirtualFolderNode {
        permission
      }
    `,
    actionItemsFrgmt,
  );
  const isEditable = virtualFolderNodeFrgmt?.permission?.includes('w');

  const handleUpload = async (fileList: Array<RcFile>) => {
    // When uploading folder, ant design trigger `beforeUpload` for each file in the folder.
    // We need to ensure that the upload is processed only once for the entire batch.
    const batchId = fileList.map((f) => f.name + f.size).join('|');
    if (uploadProcessingRef.current === batchId) {
      return;
    }

    uploadProcessingRef.current = batchId;
    toggleUploading();

    upload(fileList, onUpload, () => {
      uploadProcessingRef.current = null;
      toggleUploading();
    });
  };

  return (
    <BAIFlex gap="xs">
      <BAIFlex gap={'sm'}>
        {selectedItems.length > 0 && (
          <>
            {t('general.NSelected', {
              count: selectedItems.length,
            })}
            <Tooltip title={t('general.button.Delete')} placement="topLeft">
              <Button
                disabled={!isEditable}
                icon={<BAITrashBinIcon style={{ color: token.colorError }} />}
                onClick={() => {
                  toggleDeleteModal();
                }}
              />
            </Tooltip>
          </>
        )}
        <Tooltip title={!lg && t('general.button.Create')}>
          <Button
            disabled={!isEditable}
            icon={<FolderAddOutlined />}
            onClick={() => {
              toggleCreateModal();
            }}
          >
            {lg && t('general.button.Create')}
          </Button>
        </Tooltip>
        <Dropdown
          disabled={!isEditable}
          menu={{
            items: [
              {
                key: 'upload files',
                label: (
                  <Upload
                    beforeUpload={(_, fileList) => {
                      handleUpload(fileList);
                      return false; // Prevent default upload behavior
                    }}
                    showUploadList={false}
                  >
                    {t('comp:FileExplorer.UploadFiles')}
                  </Upload>
                ),
                icon: <FileAddOutlined />,
              },
              {
                key: 'upload folder',
                label: (
                  <Upload
                    directory
                    beforeUpload={(_, fileList) => {
                      handleUpload(fileList);
                      return false;
                    }}
                    showUploadList={false}
                  >
                    {t('comp:FileExplorer.UploadFolder')}
                  </Upload>
                ),
                icon: <FolderAddOutlined />,
              },
            ],
          }}
        >
          <Tooltip title={!lg && t('general.button.Upload')}>
            <Button icon={<UploadOutlined />} loading={isUploading}>
              {lg && t('general.button.Upload')}
            </Button>
          </Tooltip>
        </Dropdown>
      </BAIFlex>
      <DeleteSelectedItemsModal
        destroyOnClose
        open={openDeleteModal}
        selectedItems={selectedItems}
        onRequestClose={(success: boolean) => {
          if (success) {
            onRequestClose(true, selectedItems);
          }
          toggleDeleteModal();
        }}
      />
      <CreateDirectoryModal
        destroyOnClose
        open={openCreateModal}
        onRequestClose={(success: boolean) => {
          if (success) {
            onRequestClose(true);
          }
          toggleCreateModal();
        }}
      />
    </BAIFlex>
  );
};

export default ActionItems;
