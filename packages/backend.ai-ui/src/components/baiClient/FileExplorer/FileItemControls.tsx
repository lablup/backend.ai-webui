import { convertToBinaryUnit } from '../../../helper';
import { useTanMutation } from '../../../helper/reactQueryAlias';
import { BAITrashBinIcon } from '../../../icons';
import BAIButton, { BAIButtonProps } from '../../BAIButton';
import BAIFlex from '../../BAIFlex';
import useConnectedBAIClient from '../../provider/BAIClientProvider/hooks/useConnectedBAIClient';
import { VFolderFile } from '../../provider/BAIClientProvider/types';
import { FolderInfoContext } from './BAIFileExplorer';
import { MoreOutlined } from '@ant-design/icons';
import { App, theme, Dropdown, Tooltip } from 'antd';
import { DownloadIcon, EditIcon } from 'lucide-react';
import { use, useState } from 'react';
import { useTranslation } from 'react-i18next';

const MAX_EDITABLE_FILE_SIZE = 1024 * 1024; // 1 MB

interface FileItemControlsProps {
  selectedItem: VFolderFile;
  onClickDelete: () => void;
  onClickEdit?: () => void;
  enableDownload?: boolean;
  enableDelete?: boolean;
  enableEdit?: boolean;
  downloadButtonProps?: BAIButtonProps;
  deleteButtonProps?: BAIButtonProps;
}

const FileItemControls: React.FC<FileItemControlsProps> = ({
  selectedItem,
  onClickDelete,
  onClickEdit,
  enableDownload = false,
  enableDelete = false,
  enableEdit = false,
  downloadButtonProps,
  deleteButtonProps,
}) => {
  'use memo';

  const { t } = useTranslation();
  const { token } = theme.useToken();
  const { message } = App.useApp();
  const { targetVFolderId, currentPath } = use(FolderInfoContext);
  const baiClient = useConnectedBAIClient();

  const downloadFileMutation = useTanMutation({
    mutationFn: async ({
      fileName,
      currentFolder,
      archive = false,
    }: {
      fileName: string;
      currentFolder: string;
      archive?: boolean;
    }): Promise<{ success: boolean; fileName: string }> => {
      try {
        const tokenResponse = await baiClient.vfolder.request_download_token(
          fileName,
          currentFolder,
          archive,
        );
        const downloadParams = new URLSearchParams({
          token: tokenResponse.token,
          archive: archive ? 'true' : 'false',
        });
        const downloadURL = `${tokenResponse.url}?${downloadParams.toString()}`;

        await initiateDownload(downloadURL, fileName);
        return { success: true, fileName };
      } catch (error) {
        throw error;
      }
    },
    onSuccess: ({ fileName }) => {
      message.success(t('comp:FileExplorer.DownloadStarted', { fileName }));
    },
    onError: (err: any) => {
      if (err && err.message) {
        message.error(err.message);
      } else if (err && err.title) {
        message.error(err.title);
      }
    },
  });

  const isDirectory = selectedItem.type === 'DIRECTORY';
  const isFileTooLarge = selectedItem.size > MAX_EDITABLE_FILE_SIZE;
  const isEditDisabled = !enableEdit || isDirectory || isFileTooLarge;

  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <BAIFlex gap="xs">
      <BAIButton
        type="text"
        size="small"
        icon={<DownloadIcon color={token.colorInfo} />}
        disabled={!enableDownload}
        onClick={(e) => e.stopPropagation()}
        action={async () => {
          if (!selectedItem) return;
          await downloadFileMutation.mutateAsync({
            fileName: `${currentPath}/${selectedItem.name}`,
            currentFolder: targetVFolderId,
            archive: isDirectory,
          });
        }}
        {...downloadButtonProps}
      />
      <BAIButton
        type="text"
        size="small"
        icon={<BAITrashBinIcon style={{ color: token.colorError }} />}
        disabled={!enableDelete}
        onClick={(e) => {
          e.stopPropagation();
          onClickDelete();
        }}
        {...deleteButtonProps}
      />
      <Dropdown
        trigger={['click']}
        open={dropdownOpen}
        disabled={isDirectory}
        onOpenChange={setDropdownOpen}
        popupRender={() => {
          return (
            <BAIFlex
              direction="column"
              align="stretch"
              style={{
                padding: 4,
                backgroundColor: token.colorBgElevated,
                borderRadius: token.borderRadiusLG,
                boxShadow: token.boxShadowSecondary,
              }}
            >
              <Tooltip
                title={
                  isEditDisabled
                    ? isDirectory
                      ? t('comp:FileExplorer.UnsupportedFileFormat')
                      : t('comp:FileExplorer.FileTooLargeToEdit', {
                          size: convertToBinaryUnit(
                            MAX_EDITABLE_FILE_SIZE,
                            'auto',
                          )?.numberFixed,
                        })
                    : undefined
                }
              >
                <BAIButton
                  type="text"
                  icon={<EditIcon />}
                  disabled={isEditDisabled}
                  onClick={(e: React.MouseEvent) => {
                    e.stopPropagation();
                    setDropdownOpen(false);
                    onClickEdit?.();
                  }}
                  style={{ justifyContent: 'start' }}
                >
                  {t('comp:FileExplorer.EditFile')}
                </BAIButton>
              </Tooltip>
            </BAIFlex>
          );
        }}
      >
        <BAIButton
          type="text"
          size="small"
          onClick={(e) => {
            e.stopPropagation();
          }}
          icon={<MoreOutlined />}
          aria-label={t('comp:FileExplorer.MoreOptions')}
        />
      </Dropdown>
    </BAIFlex>
  );
};

export default FileItemControls;

/**
 *
 * @param downloadURL
 * @param fileName
 */
const initiateDownload = async (
  downloadURL: string,
  fileName: string,
): Promise<void> => {
  return new Promise((resolve, reject) => {
    try {
      // @ts-ignore - iOS Safari
      if (globalThis.iOSSafari) {
        const newWindow = window.open(downloadURL, '_blank');
        newWindow && resolve();
      } else {
        const downloadLink = document.createElement('a');
        downloadLink.style.display = 'none';
        downloadLink.href = downloadURL;
        downloadLink.download = fileName;
        downloadLink.addEventListener('click', (e) => {
          e.stopPropagation();
        });
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);

        resolve();
      }
    } catch (error) {
      reject(error);
    }
  });
};
