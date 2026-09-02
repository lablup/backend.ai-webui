import { App } from '../../../app-shim';
import { convertToBinaryUnit, initiateDownload } from '../../../helper';
import { useTanMutation } from '../../../helper/reactQueryAlias';
import { useBAIi18n } from '../../../hooks/useBAIi18n';
import BAIFlex from '../../BAIFlex';
import BAINameActionCell, {
  type BAINameActionCellAction,
} from '../../Table/BAINameActionCell';
import useConnectedBAIClient from '../../provider/BAIClientProvider/hooks/useConnectedBAIClient';
import { VFolderFile } from '../../provider/BAIClientProvider/types';
import { FolderInfoContext } from './BAIFileExplorer';
import EditableFileName from './EditableFileName';
import { Trash2, DownloadIcon, EditIcon } from 'lucide-react';
import { use } from 'react';

const MAX_EDITABLE_FILE_SIZE = 1024 * 1024; // 1 MB

interface FileNameCellProps {
  selectedItem: VFolderFile;
  existingFiles: Array<VFolderFile>;
  onClickName: (e: React.MouseEvent) => void;
  onEndRename: () => void;
  onClickDelete: () => void;
  onClickEdit?: () => void;
  enableRename?: boolean;
  enableDownload?: boolean;
  enableDelete?: boolean;
  enableEdit?: boolean;
  isPendingDelete?: boolean;
}

const FileNameCell: React.FC<FileNameCellProps> = ({
  selectedItem,
  existingFiles,
  onClickName,
  onEndRename,
  onClickDelete,
  onClickEdit,
  enableRename = false,
  enableDownload = false,
  enableDelete = false,
  enableEdit = false,
  isPendingDelete = false,
}) => {
  'use memo';

  const { t } = useBAIi18n();
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

  const actions: Array<BAINameActionCellAction> = [
    {
      key: 'download',
      title: t('comp:FileExplorer.Download'),
      icon: <DownloadIcon size="1em" />,
      disabled: !enableDownload,
      action: async () => {
        await downloadFileMutation.mutateAsync({
          fileName: `${currentPath}/${selectedItem.name}`,
          currentFolder: targetVFolderId,
          archive: isDirectory,
        });
      },
    },
    {
      key: 'delete',
      title: t('general.button.Delete'),
      icon: <Trash2 size="1em" />,
      type: 'danger',
      disabled: !enableDelete,
      loading: isPendingDelete,
      onClick: onClickDelete,
    },
    // Only offered where editing is permitted at all — a permanently disabled
    // row would be the whole menu when it is not.
    ...(enableEdit
      ? [
          {
            key: 'edit',
            title: t('comp:FileExplorer.EditFile'),
            icon: <EditIcon size="1em" />,
            showInMenu: 'always' as const,
            disabled: isDirectory
              ? { reason: t('comp:FileExplorer.UnsupportedFileFormat') }
              : isFileTooLarge
                ? {
                    reason: t('comp:FileExplorer.FileTooLargeToEdit', {
                      size: convertToBinaryUnit(MAX_EDITABLE_FILE_SIZE, 'auto')
                        ?.numberFixed,
                    }),
                  }
                : false,
            onClick: onClickEdit,
          },
        ]
      : []),
  ];

  return (
    // The explorer table owns a row `onClick` (select / enter directory), and
    // `BAINameActionCellAction.onClick` gets no event to stop — so the guard
    // the row-action buttons used to carry themselves lives here.
    <BAIFlex
      style={{ width: '100%', minWidth: 0 }}
      onClick={(e) => e.stopPropagation()}
    >
      <BAINameActionCell
        showActions="always"
        title={
          <EditableFileName
            fileInfo={selectedItem}
            existingFiles={existingFiles}
            disabled={!enableRename}
            onEndEdit={onEndRename}
            onClick={onClickName}
            // The name now shares its cell with the actions, so it has to yield
            // width to them instead of painting over them.
            style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}
          />
        }
        actions={actions}
      />
    </BAIFlex>
  );
};

export default FileNameCell;
