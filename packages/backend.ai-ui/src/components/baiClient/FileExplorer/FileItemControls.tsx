import { App } from '../../../app-shim';
import { convertToBinaryUnit, initiateDownload } from '../../../helper';
import { useTanMutation } from '../../../helper/reactQueryAlias';
import { useBAIi18n } from '../../../hooks/useBAIi18n';
import { theme } from '../../../theme-shim';
import BAIButton, { BAIButtonProps } from '../../BAIButton';
import BAIFlex from '../../BAIFlex';
import useConnectedBAIClient from '../../provider/BAIClientProvider/hooks/useConnectedBAIClient';
import { VFolderFile } from '../../provider/BAIClientProvider/types';
import { FolderInfoContext } from './BAIFileExplorer';
import { DropdownMenu } from '@astryxdesign/core/DropdownMenu';
import { Trash2, EllipsisVertical, DownloadIcon, EditIcon } from 'lucide-react';
import { use, useState } from 'react';

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

  const { t } = useBAIi18n();
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

  const editDisabledReason = isDirectory
    ? t('comp:FileExplorer.UnsupportedFileFormat')
    : t('comp:FileExplorer.FileTooLargeToEdit', {
        size: convertToBinaryUnit(MAX_EDITABLE_FILE_SIZE, 'auto')?.numberFixed,
      });

  return (
    <BAIFlex gap="xs">
      <BAIButton
        type="text"
        size="small"
        icon={
          <DownloadIcon
            color={enableDownload ? token.colorInfo : token.colorTextDisabled}
          />
        }
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
        icon={
          <Trash2
            style={{
              color: enableDelete ? token.colorError : token.colorTextDisabled,
            }}
            size="1em"
          />
        }
        disabled={!enableDelete}
        onClick={(e) => {
          e.stopPropagation();
          onClickDelete();
        }}
        {...deleteButtonProps}
      />
      {/* PILOT-DECISION (to-astryx W2-D): antd `Dropdown popupRender` with a
          hand-built surface -> `DropdownMenu items`. `DropdownMenu` owns its
          elevation, radius and shadow, so the three `token.*` reads that
          reproduced them are gone (defaults-first).

          The disabled-edit explanation loses its tooltip: `DropdownMenuItemData`
          has no tooltip slot, and Astryx explicitly advises against tooltips on
          disabled controls (P18). Rather than drop the information, the reason
          is folded into the row's own LABEL — "Edit file (file too large)" —
          which every user sees, not just the ones who hover. */}
      <DropdownMenu
        isMenuOpen={dropdownOpen}
        onOpenChange={setDropdownOpen}
        items={[
          {
            label: isEditDisabled
              ? `${t('comp:FileExplorer.EditFile')} (${editDisabledReason})`
              : t('comp:FileExplorer.EditFile'),
            icon: <EditIcon />,
            isDisabled: isEditDisabled,
            onClick: () => {
              setDropdownOpen(false);
              onClickEdit?.();
            },
          },
        ]}
        button={{
          variant: 'ghost',
          size: 'sm',
          isIconOnly: true,
          icon: <EllipsisVertical size="1em" />,
          label: t('comp:FileExplorer.MoreOptions'),
          isDisabled: isDirectory,
        }}
        hasChevron={false}
      />
    </BAIFlex>
  );
};

export default FileItemControls;
