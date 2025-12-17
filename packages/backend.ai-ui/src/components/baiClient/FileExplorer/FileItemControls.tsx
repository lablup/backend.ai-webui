import { initiateDownload } from '../../../helper';
import { BAITrashBinIcon } from '../../../icons';
import { BAIButtonProps } from '../../BAIButton';
import BAIFlex from '../../BAIFlex';
import useConnectedBAIClient from '../../provider/BAIClientProvider/hooks/useConnectedBAIClient';
import { VFolderFile } from '../../provider/BAIClientProvider/types';
import { FolderInfoContext } from './BAIFileExplorer';
import { useMutation } from '@tanstack/react-query';
import { App, Button, theme } from 'antd';
import { DownloadIcon } from 'lucide-react';
import { use } from 'react';
import { useTranslation } from 'react-i18next';

interface FileItemControlsProps {
  selectedItem: VFolderFile;
  onClickDelete: () => void;
  enableDownload?: boolean;
  enableDelete?: boolean;
  downloadButtonProps?: BAIButtonProps;
  deleteButtonProps?: BAIButtonProps;
}

const FileItemControls: React.FC<FileItemControlsProps> = ({
  selectedItem,
  onClickDelete,
  enableDownload = false,
  enableDelete = false,
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
        icon={
          <DownloadIcon
            color={
              !enableDownload || downloadFileMutation.isPending
                ? token.colorTextDisabled
                : token.colorInfo
            }
          />
        }
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
        icon={
          <BAITrashBinIcon
            style={{
              color: !enableDelete ? token.colorTextDisabled : token.colorError,
            }}
          />
        }
        disabled={!enableDelete}
        onClick={(e) => {
          e.stopPropagation();
          onClickDelete();
        }}
        {...deleteButtonProps}
      />
    </BAIFlex>
  );
};

export default FileItemControls;
