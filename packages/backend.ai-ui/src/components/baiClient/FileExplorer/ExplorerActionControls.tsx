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
import { use } from 'react';
import { useTranslation } from 'react-i18next';
import * as tus from 'tus-js-client';

interface ExplorerActionControlsProps {
  selectedFiles: Array<VFolderFile>;
  onRequestClose: (
    success: boolean,
    modifiedItems?: Array<VFolderFile>,
  ) => void;
}

const ExplorerActionControls: React.FC<ExplorerActionControlsProps> = ({
  selectedFiles,
  onRequestClose,
}) => {
  const baiClient = useConnectedBAIClient();
  const { t } = useTranslation();
  const { lg } = Grid.useBreakpoint();
  const { token } = theme.useToken();
  const { message } = App.useApp();
  const { targetVFolderId, currentPath } = use(FolderInfoContext);
  const [openCreateModal, { toggle: toggleCreateModal }] = useToggle(false);
  const [openDeleteModal, { toggle: toggleDeleteModal }] = useToggle(false);

  const { data: vfolderInfo, isFetching } = useQuery({
    queryKey: ['vfolderInfo', targetVFolderId],
    queryFn: () => baiClient.vfolder.info(targetVFolderId),
    enabled: !!targetVFolderId,
    // not using cache, always refetch
    staleTime: 5 * 60 * 1000,
    gcTime: 0,
  });

  const handleUpload = (fileList: Array<RcFile>) => {
    const maxUploadSize = baiClient?._config?.maxFileUploadSize;
    if (
      maxUploadSize > 0 &&
      _.some(fileList, (file) => file.size > maxUploadSize)
    ) {
      message.error(t('comp:FileExplorer.error.FileUploadSizeLimit'));
      return;
    }

    // TODO: show confirmation modal before upload already existing files
    // TODO: show progress during upload via using bai-notification
    const uploadFiles: Array<Promise<tus.Upload>> = _.map(
      fileList,
      async (file) => {
        const fullPath = _.join(
          [currentPath, file.webkitRelativePath || file.name],
          '/',
        );

        try {
          const url = await baiClient?.vfolder?.create_upload_session(
            fullPath,
            file,
            targetVFolderId,
          );
          const upload = new tus.Upload(file, {
            endpoint: url,
            uploadUrl: url,
            retryDelays: [0, 3000, 5000, 10000, 20000],
            chunkSize: 15 * 1024 * 1024, // 15MB
            metadata: {
              filename: fullPath,
              filetype: file.type,
            },
            // TODO: use baiNotification after notification migration to backend.ai-ui
            onError: (err) => {},
            onProgress: (bytesUploaded, bytesTotal) => {},
            onSuccess: () => {
              onRequestClose(true);
            },
          });
          return upload;
        } catch (err: any) {
          if (err && err.message) {
            message.error(err.message);
          } else if (err && err.title) {
            message.error(err.title);
          }
          return Promise.reject(err);
        }
      },
    );
    Promise.all(uploadFiles).then((uploads) => {
      uploads.forEach((upload) => {
        upload.start();
      });
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
            <Button icon={<UploadOutlined />} onClick={() => {}}>
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
