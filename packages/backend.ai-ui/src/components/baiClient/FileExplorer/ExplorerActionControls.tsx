import { BAITrashBinIcon } from '../../../icons';
import BAIFlex from '../../BAIFlex';
import useConnectedBAIClient from '../../provider/BAIClientProvider/hooks/useConnectedBAIClient';
import { VFolderFile } from '../../provider/BAIClientProvider/types';
import { FolderInfoContext } from './BAIFileExplorer';
import CreateDirectoryModal from './CreateDirectoryModal';
import DeleteSelectedItemsModal from './DeleteSelectedItemsModal';
import {
  FileAddOutlined,
  FolderAddOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { useToggle } from 'ahooks';
import { App, Button, Dropdown, Grid, theme, Tooltip, Upload } from 'antd';
import { RcFile } from 'antd/es/upload';
import _ from 'lodash';
import { use, useRef } from 'react';
import { useTranslation } from 'react-i18next';

interface ExplorerActionControlsProps {
  selectedFiles: Array<VFolderFile>;
  onRequestClose: (
    success: boolean,
    modifiedItems?: Array<VFolderFile>,
  ) => void;
  onUpload: (files: Array<RcFile>, currentPath: string) => void;
}

const ExplorerActionControls: React.FC<ExplorerActionControlsProps> = ({
  selectedFiles,
  onRequestClose,
  onUpload,
}) => {
  const baiClient = useConnectedBAIClient();
  const { t } = useTranslation();
  const { lg } = Grid.useBreakpoint();
  const { token } = theme.useToken();
  const { modal } = App.useApp();
  const { targetVFolderId, currentPath } = use(FolderInfoContext);
  const [openCreateModal, { toggle: toggleCreateModal }] = useToggle(false);
  const [openDeleteModal, { toggle: toggleDeleteModal }] = useToggle(false);
  const lastFileListRef = useRef<Array<RcFile>>([]);

  const { data: vfolderInfo, isFetching } = useQuery({
    queryKey: ['vfolderInfo', targetVFolderId],
    queryFn: () => baiClient.vfolder.info(targetVFolderId),
    enabled: !!targetVFolderId,
    // not using cache, always refetch
    staleTime: 5 * 60 * 1000,
    gcTime: 0,
  });

  const handleUpload = async (fileList: RcFile[], path: string) => {
    // Currently, backend.ai only supports finding existing files by using list_files API.
    // This API throw an error if the file does not exist in the target vfolder.
    // So, we need to catch the error and return undefined.
    const duplicateCheckResult = await baiClient.vfolder
      .list_files(currentPath, targetVFolderId)
      .then((files) => {
        return _.some(
          files.items,
          (existFiles) =>
            existFiles.name ===
            (fileList[0].webkitRelativePath.split('/')[0] || fileList[0].name),
        );
      });

    if (duplicateCheckResult) {
      modal.confirm({
        title: t('comp:FileExplorer.DuplicatedFiles'),
        content: t('comp:FileExplorer.DuplicatedFilesDesc'),
        onOk: () => {
          onUpload(fileList, path);
        },
      });
    } else {
      onUpload(fileList, path);
    }
  };

  return (
    <BAIFlex gap="xs">
      <BAIFlex gap={'sm'}>
        {selectedFiles.length > 0 && (
          <>
            {t('general.NSelected', {
              count: selectedFiles.length,
            })}
            <Tooltip title={t('general.button.Delete')} placement="topLeft">
              <Button
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
            disabled={isFetching || !vfolderInfo?.permission.includes('w')}
            icon={<FolderAddOutlined />}
            onClick={() => {
              toggleCreateModal();
            }}
          >
            {lg && t('general.button.Create')}
          </Button>
        </Tooltip>
        <Dropdown
          menu={{
            items: [
              {
                key: 'upload files',
                label: (
                  <Upload
                    beforeUpload={(_, fileList) => {
                      handleUpload(fileList, currentPath);
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
                      if (fileList !== lastFileListRef.current) {
                        handleUpload(fileList, currentPath);
                      }
                      lastFileListRef.current = fileList;
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
            <Button icon={<UploadOutlined />}>
              {lg && t('general.button.Upload')}
            </Button>
          </Tooltip>
        </Dropdown>
      </BAIFlex>
      <DeleteSelectedItemsModal
        destroyOnClose
        open={openDeleteModal}
        selectedFiles={selectedFiles}
        onRequestClose={(success: boolean) => {
          if (success) {
            onRequestClose(true, selectedFiles);
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

export default ExplorerActionControls;
