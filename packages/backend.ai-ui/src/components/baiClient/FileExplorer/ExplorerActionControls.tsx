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
  const [isUploading, { toggle: toggleUploading }] = useToggle(false);
  const uploadProcessingRef = useRef<string | null>(null);

  const { data: vfolderInfo, isFetching } = useQuery({
    queryKey: ['vfolderInfo', targetVFolderId],
    queryFn: () => baiClient.vfolder.info(targetVFolderId),
    enabled: !!targetVFolderId,
    // not using cache, always refetch
    staleTime: 5 * 60 * 1000,
    gcTime: 0,
  });

  const handleUpload = async (fileList: RcFile[], currentPath: string) => {
    // When uploading folder, ant design trigger `beforeUpload` for each file in the folder.
    // We need to ensure that the upload is processed only once for the entire batch.
    const batchId = fileList.map((f) => f.name + f.size).join('|');
    if (uploadProcessingRef.current === batchId) {
      return;
    }

    uploadProcessingRef.current = batchId;
    toggleUploading();

    const existFilePromises = _.map(fileList, async (file) => {
      // Currently, backend.ai only supports finding existing files by using list_files API.
      // This API throw an error if the file does not exist in the target vfolder.
      // So, we need to catch the error and return undefined.
      const searchPath = [
        currentPath,
        file.webkitRelativePath.split('/').slice(0, -1).join('/'),
      ].join('/');
      return baiClient.vfolder
        .list_files(searchPath, targetVFolderId)
        .then((files) => {
          return _.find(files.items, { name: file.name });
        })
        .catch(() => {
          return undefined;
        });
    });

    await Promise.all(existFilePromises).then((res) => {
      const result = _.filter(res, (item) => item !== undefined);
      toggleUploading();
      if (!_.isEmpty(result)) {
        modal.confirm({
          title: t('comp:FileExplorer.DuplicatedFiles'),
          content: t('comp:FileExplorer.DuplicatedFilesDesc'),
          onOk: () => {
            onUpload(fileList, currentPath);
          },
        });
      } else {
        onUpload(fileList, currentPath);
      }
      uploadProcessingRef.current = null;
    });
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
                      handleUpload(fileList, currentPath);
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
