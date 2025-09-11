import { FileItemControlsFragment$key } from '../../../__generated__/FileItemControlsFragment.graphql';
import { useMergedAllowedStorageHostPermission } from '../../../hooks';
import { BAITrashBinIcon } from '../../../icons';
import BAIFlex from '../../BAIFlex';
import useConnectedBAIClient from '../../provider/BAIClientProvider/hooks/useConnectedBAIClient';
import { VFolderFile } from '../../provider/BAIClientProvider/types';
import { FolderInfoContext } from './BAIFileExplorer';
import { useMutation } from '@tanstack/react-query';
import { App, Button, theme } from 'antd';
import _ from 'lodash';
import { DownloadIcon } from 'lucide-react';
import { use } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment } from 'react-relay';

interface FileItemControlsProps {
  vfolderNodeFrgmt?: FileItemControlsFragment$key | null;
  selectedItem: VFolderFile;
  onClickDelete: () => void;
}

const FileItemControls: React.FC<FileItemControlsProps> = ({
  vfolderNodeFrgmt,
  selectedItem,
  onClickDelete,
}) => {
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const { message } = App.useApp();
  const { targetVFolderId } = use(FolderInfoContext);
  const { unitedAllowedPermissionByVolume } =
    useMergedAllowedStorageHostPermission();
  const baiClient = useConnectedBAIClient();

  const vFolderNode = useFragment(
    graphql`
      fragment FileItemControlsFragment on VirtualFolderNode {
        host @required(action: THROW)
      }
    `,
    vfolderNodeFrgmt,
  );

  const enableDownload = _.includes(
    unitedAllowedPermissionByVolume[vFolderNode?.host ?? ''],
    'download-file',
  );

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
      fileName: selectedItem.name,
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
      />
      <Button
        type="text"
        size="small"
        icon={<BAITrashBinIcon style={{ color: token.colorError }} />}
        onClick={(e) => {
          e.stopPropagation();
          onClickDelete();
        }}
      />
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
