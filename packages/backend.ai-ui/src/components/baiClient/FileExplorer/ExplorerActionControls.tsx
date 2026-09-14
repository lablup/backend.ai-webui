import { App } from '../../../app-shim';
import { initiateDownload } from '../../../helper';
import { useTanMutation } from '../../../helper/reactQueryAlias';
import { useToggle } from '../../../hooks';
import { useBAIBreakpoint } from '../../../hooks/useBAIBreakpoint';
import { useBAIi18n } from '../../../hooks/useBAIi18n';
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
import type { RcFile } from './hooks';
import { DropdownMenu } from '@astryxdesign/core/DropdownMenu';
import { Tooltip } from '@astryxdesign/core/Tooltip';
import { useTheme } from '@astryxdesign/core/theme';
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
  // to-astryx W2-D: `Grid.useBreakpoint()` -> the theme-shim's
  // `useBAIBreakpoint()`. MAPPING §3.9 grades antd's breakpoint hook NONE and
  // warns that Astryx's `useMediaQuery` returns `false` on FIRST RENDER for
  // SSR safety — which would make every label here flash in and out. The shim
  // exists for exactly this (RESPONSIVE-POLICY §2) and is a pure import swap.
  const { lg } = useBAIBreakpoint();
  const { token } = useTheme();
  const { message } = App.useApp();
  const { uploadFiles } = useUploadVFolderFiles();
  const { targetVFolderId, targetVFolderName, currentPath } =
    use(FolderInfoContext);
  const baiClient = useConnectedBAIClient();
  // QA-FINDINGS Q-28: the upload menu is driven by `set`, not `toggle`.
  // `useToggle`'s `toggle` takes no argument — it flips whatever the current
  // state is and ignores the boolean `onOpenChange` hands it. Astryx's
  // `DropdownMenu` fires `onOpenChange` TWICE for one pointer transition (once
  // from the trigger's own click handler, once from the popover lifecycle), so
  // an argument-blind toggle flips twice and lands back where it started —
  // and because each flip re-renders `isMenuOpen`, the lifecycle fires again
  // and the menu oscillates open/closed indefinitely. `set(value)` is
  // idempotent, so a duplicate notification with the same value is a no-op.
  // (The keyboard path was never affected: it calls `popover.show()` directly
  // and notifies once, which is why Enter always worked.)
  const [openUploadDropdown, { set: setUploadDropdownOpen }] = useToggle(false);
  const [openCreateModal, { toggle: toggleCreateModal }] = useToggle(false);
  const [openCreateFileModal, { toggle: toggleCreateFileModal }] =
    useToggle(false);
  const [openDeleteModal, { toggle: toggleDeleteModal }] = useToggle(false);
  const lastFileListRef = useRef<Array<RcFile>>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const directoryInputRef = useRef<HTMLInputElement>(null);

  /**
   * The half of antd `Upload` this component actually used: take the picked
   * `FileList`, hand it to the existing tus uploader, and reset the input so
   * picking the SAME selection twice fires again (antd's hidden input did the
   * same). The `lastFileListRef` de-dupe guard is kept verbatim.
   */
  const handlePickedFiles = (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    const files = Array.from(fileList) as Array<RcFile>;
    if (files !== lastFileListRef.current) {
      uploadFiles(files, onUpload);
    }
    lastFileListRef.current = files;
    // Q-28: an explicit close, not a flip — the menu is already closed by the
    // time the native picker returns, so a flip would REOPEN it.
    setUploadDropdownOpen(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (directoryInputRef.current) directoryInputRef.current.value = '';
  };

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
            <Tooltip
              content={t('general.button.Delete')}
              placement="above"
              alignment="start"
            >
              <BAIButton
                disabled={!enableDelete}
                aria-label={t('general.button.Delete')}
                icon={
                  <Trash2
                    size="1em"
                    style={{
                      color: enableDelete
                        ? token('--color-error')
                        : token('--color-text-disabled'),
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
                content={t('comp:FileExplorer.DownloadSelected')}
                placement="above"
                alignment="start"
              >
                <BAIButton
                  disabled={!enableDownload}
                  icon={
                    <DownloadIcon
                      style={{
                        color: enableDownload
                          ? token('--color-info')
                          : token('--color-text-disabled'),
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
        <Tooltip content={t('comp:FileExplorer.CreateFolder')} isEnabled={!lg}>
          <BAIButton
            disabled={!enableWrite}
            aria-label={t('comp:FileExplorer.CreateFolder')}
            icon={<FolderPlus size="1em" />}
            onClick={() => {
              toggleCreateModal();
            }}
          >
            {lg ? t('comp:FileExplorer.CreateFolder') : undefined}
          </BAIButton>
        </Tooltip>
        {mode !== 'directoryPicker' && (
          <Tooltip content={t('comp:FileExplorer.CreateFile')} isEnabled={!lg}>
            <BAIButton
              disabled={!enableWrite}
              aria-label={t('comp:FileExplorer.CreateFile')}
              icon={<FilePlus size="1em" />}
              onClick={() => {
                toggleCreateFileModal();
              }}
            >
              {lg ? t('comp:FileExplorer.CreateFile') : undefined}
            </BAIButton>
          </Tooltip>
        )}
        {/* PILOT-DECISION (to-astryx W2-D): antd `Dropdown popupRender` +
            two `Upload` pickers -> `DropdownMenu items` + two HIDDEN native
            `<input type="file">` elements.

            MAPPING §3.12 records that this repo already uses `Upload` as a
            file PICKER (`beforeUpload` returning `false`,
            `showUploadList={false}`), so what it actually contributed was the
            hidden input and the click proxy — both one line of DOM.
            `FileInput` was rejected HERE (unlike `DragAndDrop`, which is a
            real dropzone) for two reasons: it renders its own control, which
            cannot live inside a menu row, and `webkitdirectory` — the whole
            point of "Upload Folder" — has no `FileInput` prop (§3.12 lists
            `directory` as NONE). Driving the inputs directly keeps folder
            upload working AND makes the rows real `menuitem`s, so the menu is
            keyboard-operable, which antd's button-inside-a-popup was not.

            `popupRender`'s hand-built surface (elevated background, radius,
            shadow from antd tokens) goes with it — `DropdownMenu` owns its own
            surface, which is the defaults-first answer. */}
        {mode !== 'directoryPicker' && (
          <>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              hidden
              onChange={(e) => handlePickedFiles(e.target.files)}
            />
            <input
              ref={directoryInputRef}
              type="file"
              hidden
              // `webkitdirectory` is not in React's typings; it is the
              // attribute antd's `Upload directory` set too.
              {...{ webkitdirectory: '' }}
              onChange={(e) => handlePickedFiles(e.target.files)}
            />
            <DropdownMenu
              isMenuOpen={openUploadDropdown}
              // Q-28: pass the value through; see the `useToggle` note above.
              onOpenChange={setUploadDropdownOpen}
              items={[
                {
                  label: t('comp:FileExplorer.UploadFiles'),
                  icon: <FilePlus size="1em" />,
                  onClick: () => fileInputRef.current?.click(),
                },
                {
                  label: t('comp:FileExplorer.UploadFolder'),
                  icon: <FolderPlus size="1em" />,
                  onClick: () => directoryInputRef.current?.click(),
                },
              ]}
              button={{
                icon: <UploadIcon size="1em" />,
                label: t('general.button.Upload'),
                isIconOnly: !lg,
                isDisabled: !enableUpload,
                tooltip: !enableUpload
                  ? t('comp:FileExplorer.NoUploadPermissionForHost')
                  : t('general.button.Upload'),
              }}
              hasChevron={false}
            />
          </>
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
