import { initiateDownload } from '../../../helper';
import { useTanMutation } from '../../../helper/reactQueryAlias';
import { BAITrashBinIcon } from '../../../icons';
import BAIButton from '../../BAIButton';
import BAIFlex from '../../BAIFlex';
import BAISelectionLabel from '../../BAISelectionLabel';
import useConnectedBAIClient from '../../provider/BAIClientProvider/hooks/useConnectedBAIClient';
import { VFolderFile } from '../../provider/BAIClientProvider/types';
import { FolderInfoContext } from './BAIFileExplorer';
import CreateDirectoryModal from './CreateDirectoryModal';
import CreateFileModal from './CreateFileModal';
import DeleteSelectedItemsModal, {
  DeleteSelectedItemsModalProps,
} from './DeleteSelectedItemsModal';
import { useUploadVFolderFiles } from './hooks';
import {
  FileAddOutlined,
  FolderAddOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import { useToggle } from 'ahooks';
import { App, Button, Dropdown, Grid, theme, Tooltip, Upload } from 'antd';
import { createStyles } from 'antd-style';
import type { RcFile } from 'antd/es/upload';
import { DownloadIcon } from 'lucide-react';
import { use, useRef } from 'react';
import { useTranslation } from 'react-i18next';

const useStyles = createStyles(({ css }) => ({
  upload: css`
    .ant-btn,
    .ant-upload,
    .ant-upload-wrapper {
      width: 100% !important;
    }
    .ant-btn {
      justify-content: start;
    }
  `,
}));

interface ExplorerActionControlsProps {
  selectedFiles: Array<VFolderFile>;
  onRequestClose: (
    success: boolean,
    modifiedItems?: Array<VFolderFile>,
  ) => void;
  onUpload: (files: Array<RcFile>, currentPath: string) => void;
  onDeleteFilesInBackground: DeleteSelectedItemsModalProps['onDeleteFilesInBackground'];
  onClearSelection?: () => void;
  enableDownload?: boolean;
  enableDelete?: boolean;
  enableWrite?: boolean;
  // onClickRefresh?: (key: string) => void;
  extra?: React.ReactNode;
}

const ExplorerActionControls: React.FC<ExplorerActionControlsProps> = ({
  selectedFiles,
  onRequestClose,
  onUpload,
  onDeleteFilesInBackground,
  onClearSelection,
  enableDownload = false,
  enableDelete = false,
  enableWrite = false,
  extra,
}) => {
  const { t } = useTranslation();
  const { lg } = Grid.useBreakpoint();
  const { token } = theme.useToken();
  const { styles } = useStyles();
  const { message } = App.useApp();
  const { uploadFiles } = useUploadVFolderFiles();
  const { targetVFolderId, targetVFolderName, currentPath } =
    use(FolderInfoContext);
  const baiClient = useConnectedBAIClient();
  const [openUploadDropdown, { toggle: toggleUploadDropdown }] =
    useToggle(false);
  const [openCreateModal, { toggle: toggleCreateModal }] = useToggle(false);
  const [openCreateFileModal, { toggle: toggleCreateFileModal }] =
    useToggle(false);
  const [openDeleteModal, { toggle: toggleDeleteModal }] = useToggle(false);
  const lastFileListRef = useRef<Array<RcFile>>([]);

  const downloadArchiveMutation = useTanMutation({
    mutationFn: async (filePaths: Array<string>) => {
      const timestamp = new Date()
        .toISOString()
        .replace(/[-:]/g, '')
        .replace(/\.\d{3}/, '');
      const fileName = `vfolder-${targetVFolderName}-${timestamp}.zip`;

      const tokenResponse = await baiClient.vfolder.request_download_archive(
        filePaths,
        targetVFolderId,
        fileName,
      );
      const downloadURL = `${tokenResponse.url}?token=${encodeURIComponent(tokenResponse.token)}`;

      await initiateDownload(downloadURL, fileName);
    },
    onSuccess: () => {
      message.success(
        t('comp:FileExplorer.ArchiveDownloadStarted', {
          count: selectedFiles.length,
        }),
      );
    },
    onError: (err: any) => {
      if (err && err.message) {
        message.error(err.message);
      } else if (err && err.title) {
        message.error(err.title);
      }
    },
  });

  return (
    <BAIFlex gap="xs">
      <BAIFlex gap={'sm'}>
        {selectedFiles.length > 0 && (
          <>
            <BAISelectionLabel
              count={selectedFiles.length}
              onClearSelection={onClearSelection}
            />
            <Tooltip title={t('general.button.Delete')} placement="topLeft">
              <Button
                disabled={!enableDelete}
                icon={<BAITrashBinIcon style={{ color: token.colorError }} />}
                onClick={() => {
                  toggleDeleteModal();
                }}
              />
            </Tooltip>
            {baiClient.supports('download-archive') && (
              <Tooltip
                title={t('comp:FileExplorer.DownloadSelected')}
                placement="topLeft"
              >
                <BAIButton
                  disabled={!enableDownload}
                  icon={<DownloadIcon />}
                  action={async () => {
                    const filePaths = selectedFiles.map((file) =>
                      currentPath === '.'
                        ? file.name
                        : `${currentPath}/${file.name}`,
                    );
                    await downloadArchiveMutation.mutateAsync(filePaths);
                  }}
                />
              </Tooltip>
            )}
          </>
        )}
        <Tooltip title={!lg && t('comp:FileExplorer.CreateFolder')}>
          <Button
            disabled={!enableWrite}
            icon={<FolderAddOutlined />}
            onClick={() => {
              toggleCreateModal();
            }}
          >
            {lg && t('comp:FileExplorer.CreateFolder')}
          </Button>
        </Tooltip>
        <Tooltip title={!lg && t('comp:FileExplorer.CreateFile')}>
          <Button
            disabled={!enableWrite}
            icon={<FileAddOutlined />}
            onClick={() => {
              toggleCreateFileModal();
            }}
          >
            {lg && t('comp:FileExplorer.CreateFile')}
          </Button>
        </Tooltip>
        <Dropdown
          disabled={!enableWrite}
          trigger={['click']}
          open={openUploadDropdown}
          onOpenChange={toggleUploadDropdown}
          popupRender={() => {
            return (
              <BAIFlex
                align="start"
                direction="column"
                className={styles.upload}
                style={{
                  padding: 5,
                  backgroundColor: token.colorBgElevated,
                  borderRadius: token.borderRadiusLG,
                  boxShadow: token.boxShadowSecondary,
                }}
              >
                <Upload
                  beforeUpload={(_, fileList) => {
                    if (fileList !== lastFileListRef.current) {
                      uploadFiles(fileList, onUpload);
                    }
                    lastFileListRef.current = fileList;
                    return false; // Prevent default upload behavior
                  }}
                  multiple
                  showUploadList={false}
                >
                  <Button
                    type="text"
                    icon={<FileAddOutlined />}
                    onClick={() => toggleUploadDropdown()}
                  >
                    {t('comp:FileExplorer.UploadFiles')}
                  </Button>
                </Upload>
                <Upload
                  directory
                  beforeUpload={(_, fileList) => {
                    if (fileList !== lastFileListRef.current) {
                      uploadFiles(fileList, onUpload);
                    }
                    lastFileListRef.current = fileList;
                    return false;
                  }}
                  showUploadList={false}
                >
                  <Button
                    type="text"
                    icon={<FolderAddOutlined />}
                    onClick={() => toggleUploadDropdown()}
                  >
                    {t('comp:FileExplorer.UploadFolder')}
                  </Button>
                </Upload>
              </BAIFlex>
            );
          }}
        >
          <Tooltip title={!lg && t('general.button.Upload')}>
            <Button icon={<UploadOutlined />} disabled={!enableWrite}>
              {lg && t('general.button.Upload')}
            </Button>
          </Tooltip>
        </Dropdown>
      </BAIFlex>
      <DeleteSelectedItemsModal
        destroyOnHidden
        open={openDeleteModal}
        selectedFiles={selectedFiles}
        onDeleteFilesInBackground={onDeleteFilesInBackground}
        onRequestClose={(success: boolean) => {
          if (success) {
            onRequestClose(true, selectedFiles);
          }
          toggleDeleteModal();
        }}
      />
      <CreateDirectoryModal
        destroyOnHidden
        open={openCreateModal}
        onRequestClose={(success: boolean) => {
          if (success) {
            onRequestClose(true);
          }
          toggleCreateModal();
        }}
      />
      <CreateFileModal
        destroyOnHidden
        open={openCreateFileModal}
        onRequestClose={(success: boolean) => {
          if (success) {
            onRequestClose(true);
          }
          toggleCreateFileModal();
        }}
      />
      {extra}
    </BAIFlex>
  );
};

export default ExplorerActionControls;
