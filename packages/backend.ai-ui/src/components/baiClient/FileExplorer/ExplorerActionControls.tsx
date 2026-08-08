import { App } from '../../../app-shim';
import { initiateDownload } from '../../../helper';
import { useTanMutation } from '../../../helper/reactQueryAlias';
import { useBAIi18n } from '../../../hooks/useBAIi18n';
import { theme } from '../../../theme-shim';
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
import './ExplorerActionControls.css';
import { useUploadVFolderFiles } from './hooks';
import { useToggle } from 'ahooks';
import { Button, Dropdown, Grid, Tooltip, Upload } from 'antd';
import type { RcFile } from 'antd/es/upload';
import {
  DownloadIcon,
  FilePlus,
  FolderPlus,
  Trash2,
  Upload as UploadIcon,
} from 'lucide-react';
import { use, useRef } from 'react';

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
  // Gates the upload entry points (dropdown + drag-drop). The corresponding
  // server operation is `upload-file` on the storage host, which is distinct
  // from generic write capability (mkdir / create-file / rename) and from
  // file edit (which is also an upload underneath). Defaults to `enableWrite`
  // so callers that don't pass it explicitly keep the previous bundled
  // behavior.
  enableUpload?: boolean;
  // 'directoryPicker' keeps only the directory-relevant actions (create
  // folder); file creation and upload entry points are hidden entirely
  // instead of rendered disabled.
  mode?: 'explorer' | 'directoryPicker';
  // Fired with the new folder's name right after a successful mkdir, in
  // addition to onRequestClose(true). The directory picker uses this to jump
  // straight into the created folder.
  onFolderCreated?: (folderName: string) => void;
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
  enableUpload = enableWrite,
  mode = 'explorer',
  onFolderCreated,
  extra,
}) => {
  const { t } = useBAIi18n();
  const { lg } = Grid.useBreakpoint();
  const { token } = theme.useToken();
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
                icon={
                  <Trash2
                    size="1em"
                    style={{
                      color: enableDelete
                        ? token.colorError
                        : token.colorTextDisabled,
                    }}
                  />
                }
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
                  icon={
                    <DownloadIcon
                      style={{
                        color: enableDownload
                          ? token.colorInfo
                          : token.colorTextDisabled,
                      }}
                    />
                  }
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
            icon={<FolderPlus size="1em" />}
            onClick={() => {
              toggleCreateModal();
            }}
          >
            {lg && t('comp:FileExplorer.CreateFolder')}
          </Button>
        </Tooltip>
        {mode !== 'directoryPicker' && (
          <Tooltip title={!lg && t('comp:FileExplorer.CreateFile')}>
            <Button
              disabled={!enableWrite}
              icon={<FilePlus size="1em" />}
              onClick={() => {
                toggleCreateFileModal();
              }}
            >
              {lg && t('comp:FileExplorer.CreateFile')}
            </Button>
          </Tooltip>
        )}
        {mode !== 'directoryPicker' && (
          <Dropdown
            disabled={!enableUpload}
            trigger={['click']}
            open={openUploadDropdown}
            onOpenChange={toggleUploadDropdown}
            popupRender={() => {
              return (
                <BAIFlex
                  align="start"
                  direction="column"
                  className="bai-explorer-upload"
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
                      icon={<FilePlus size="1em" />}
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
                      icon={<FolderPlus size="1em" />}
                      onClick={() => toggleUploadDropdown()}
                    >
                      {t('comp:FileExplorer.UploadFolder')}
                    </Button>
                  </Upload>
                </BAIFlex>
              );
            }}
          >
            <Tooltip
              title={
                !enableUpload
                  ? t('comp:FileExplorer.NoUploadPermissionForHost')
                  : !lg
                    ? t('general.button.Upload')
                    : undefined
              }
            >
              <Button icon={<UploadIcon size="1em" />} disabled={!enableUpload}>
                {lg && t('general.button.Upload')}
              </Button>
            </Tooltip>
          </Dropdown>
        )}
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
        onRequestClose={(success: boolean, createdFolderName?: string) => {
          if (success) {
            onRequestClose(true);
            if (createdFolderName) {
              onFolderCreated?.(createdFolderName);
            }
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
