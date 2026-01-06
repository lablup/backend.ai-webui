import { BAITrashBinIcon } from '../../../icons';
import { BAIButtonProps } from '../../BAIButton';
import BAIFlex from '../../BAIFlex';
import useConnectedBAIClient from '../../provider/BAIClientProvider/hooks/useConnectedBAIClient';
import { VFolderFile } from '../../provider/BAIClientProvider/types';
import { FolderInfoContext } from './BAIFileExplorer';
import { MoreOutlined } from '@ant-design/icons';
import { useMutation } from '@tanstack/react-query';
import { App, Button, theme, Dropdown } from 'antd';
import { DownloadIcon, EditIcon } from 'lucide-react';
import { use } from 'react';
import { useTranslation } from 'react-i18next';

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

const TEXT_FILE_EXTENSIONS = [
  '.txt',
  '.md',
  '.json',
  '.yaml',
  '.yml',
  '.xml',
  '.csv',
  '.js',
  '.ts',
  '.jsx',
  '.tsx',
  '.py',
  '.sh',
  '.bash',
  '.html',
  '.css',
  '.scss',
  '.less',
  '.sql',
  '.log',
  '.env',
  '.conf',
  '.config',
  '.ini',
  '.toml',
];

const isTextFile = (fileName: string): boolean => {
  const lastDotIndex = fileName.lastIndexOf('.');
  if (lastDotIndex === -1) return false;
  const ext = fileName.toLowerCase().slice(lastDotIndex);
  return TEXT_FILE_EXTENSIONS.includes(ext);
};

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
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const { message } = App.useApp();
  const { targetVFolderId, currentPath } = use(FolderInfoContext);
  const baiClient = useConnectedBAIClient();

  const downloadFileMutation = useMutation({
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

  const handleDownload = () => {
    if (!selectedItem || downloadFileMutation.isPending) return;

    downloadFileMutation.mutate({
      fileName: `${currentPath}/${selectedItem.name}`,
      currentFolder: targetVFolderId,
      archive: selectedItem.type === 'DIRECTORY',
    });
  };

  return (
    <BAIFlex gap="xs">
      <Button
        type="text"
        size="small"
        icon={<DownloadIcon color={token.colorInfo} />}
        disabled={!enableDownload || downloadFileMutation.isPending}
        loading={downloadFileMutation.isPending}
        onClick={(e) => {
          e.stopPropagation();
          handleDownload();
        }}
        {...downloadButtonProps}
      />
      <Button
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
        menu={{
          items: [
            {
              key: 'fileEdit',
              icon: <EditIcon size={14} />,
              label: t('comp:FileExplorer.EditFile'),
              disabled:
                !enableEdit ||
                selectedItem.type === 'DIRECTORY' ||
                !isTextFile(selectedItem.name),
              onClick: (e) => {
                e.domEvent.stopPropagation();
                onClickEdit?.();
              },
            },
          ],
        }}
        trigger={['click']}
      >
        <Button
          type="text"
          size="small"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          icon={<MoreOutlined />}
          style={{ color: token.colorTextSecondary }}
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
