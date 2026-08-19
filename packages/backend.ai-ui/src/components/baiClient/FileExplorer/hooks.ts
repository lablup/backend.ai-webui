import { App } from '../../../app-shim';
import { useBAIi18n } from '../../../hooks/useBAIi18n';
import useConnectedBAIClient from '../../provider/BAIClientProvider/hooks/useConnectedBAIClient';
import { VFolderFile } from '../../provider/BAIClientProvider/types';
import { FolderInfoContext } from './BAIFileExplorer';
import { useQuery } from '@tanstack/react-query';
import * as _ from 'lodash-es';
import { use, useEffect, useState } from 'react';

/**
 * `RcFile` from `antd/es/upload`, restated locally (to-astryx W2-D).
 *
 * It is the ONE antd specifier the FileExplorer's upload path carried, across
 * four modules (`hooks.ts`, `BAIFileExplorer`, `DragAndDrop`,
 * `ExplorerActionControls`) — a type that renders nothing and is therefore
 * invisible to a screenshot (MAPPING §6 rule 1). The upstream definition is
 * two lines (`interface RcFile extends File { uid: string }` in
 * rc-component's `upload`, plus antd's `readonly lastModifiedDate: Date`), and
 * the file objects themselves come from the browser's `DataTransfer` /
 * `<input type="file">` — never from antd's `Upload`, which this component
 * tree no longer renders. Consumers keep importing the name from here.
 */
export interface RcFile extends File {
  uid: string;
  readonly lastModifiedDate: Date;
}

/**
 * Tracks whether a file is being dragged over the page, so the explorer can
 * show its upload overlay.
 *
 * Three listener phases are load-bearing here, because the overlay's Astryx
 * `FileInput` calls `stopPropagation()` on its own `dragenter`/`dragover`/
 * `dragleave`/`drop`, and it now covers the whole overlay (FR-3575):
 *
 * - `dragleave` on CAPTURE — on bubble the dropzone swallows every leave,
 *   including the one that fires when the drag exits the window, and the
 *   overlay is left up for good.
 * - `drop` on BUBBLE — a capture listener runs before React dispatches
 *   `FileInput`'s handler, and since `drop` is discrete priority the state
 *   update flushes synchronously and unmounts the dropzone, silently
 *   discarding the file. Closing on a drop that HITS the dropzone is the
 *   overlay's own job, via `close` (`DragAndDrop`'s deferred `onDropCapture`).
 * - `mousedown`/`keydown`/`wheel` while open — a cancelled drag (Escape, or a
 *   drop the OS rejects) fires no drag event at all, so the overlay needs some
 *   non-drag signal to come down. It must be one the browser CANNOT deliver
 *   mid-drag: a pointer-motion signal looks earlier but is not suppressed on
 *   every platform, and one stray `mousemove` unmounts the dropzone with the
 *   drag still in flight — the drop then has nothing to land on and the
 *   browser opens the file instead of uploading it (FR-3575).
 */
export const useDragOverlay = (
  containerRef?: React.RefObject<HTMLDivElement | null>,
) => {
  const [isDragMode, setIsDragMode] = useState(false);
  const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(
    null,
  );

  useEffect(() => {
    const handleDragEnter = (e: DragEvent) => {
      e.preventDefault();
      setPortalContainer(containerRef?.current ?? null);
      setIsDragMode(true);
    };
    const handleDragLeave = (e: DragEvent) => {
      e.preventDefault();
      if (!e.relatedTarget || !document.contains(e.relatedTarget as Node)) {
        setIsDragMode(false);
      }
    };
    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
    };
    const handleDrop = (e: DragEvent) => {
      e.preventDefault();
      setIsDragMode(false);
    };

    document.addEventListener('dragenter', handleDragEnter);
    document.addEventListener('dragleave', handleDragLeave, true);
    document.addEventListener('dragover', handleDragOver);
    document.addEventListener('drop', handleDrop);

    return () => {
      document.removeEventListener('dragenter', handleDragEnter);
      document.removeEventListener('dragleave', handleDragLeave, true);
      document.removeEventListener('dragover', handleDragOver);
      document.removeEventListener('drop', handleDrop);
    };
  }, [containerRef]);

  useEffect(() => {
    if (!isDragMode) {
      return;
    }
    const dismiss = () => setIsDragMode(false);

    document.addEventListener('dragend', dismiss, true);
    document.addEventListener('mousedown', dismiss, true);
    document.addEventListener('keydown', dismiss, true);
    document.addEventListener('wheel', dismiss, true);

    return () => {
      document.removeEventListener('dragend', dismiss, true);
      document.removeEventListener('mousedown', dismiss, true);
      document.removeEventListener('keydown', dismiss, true);
      document.removeEventListener('wheel', dismiss, true);
    };
  }, [isDragMode]);

  const close = () => setIsDragMode(false);

  return { isDragMode, portalContainer, close };
};

export const useSearchVFolderFiles = (vfolder: string, fetchKey?: string) => {
  const baiClient = useConnectedBAIClient();
  const [currentPath, setCurrentPath] = useState<string>('.');
  const [directoryTree, setDirectoryTree] = useState<
    Record<string, Array<VFolderFile>>
  >({});

  const navigateDown = (folderName: string) => {
    const newPath =
      currentPath === '.' ? folderName : `${currentPath}/${folderName}`;
    setCurrentPath(newPath);
  };

  const navigateUp = () => {
    const pathParts = currentPath.split('/');
    if (pathParts.length > 1) {
      pathParts.pop();
      const newPath = pathParts.join('/');
      setCurrentPath(newPath || '.');
    }
  };

  const navigateToPath = (path: string) => {
    setCurrentPath(path);
  };

  const {
    data: files,
    refetch,
    isFetching,
    isLoading,
  } = useQuery({
    queryKey: ['searchVFolderFiles', vfolder, currentPath, fetchKey],
    queryFn: () =>
      baiClient.vfolder.list_files(currentPath, vfolder).then((res) => {
        setDirectoryTree((prev) => ({
          ...prev,
          [currentPath]: res.items,
        }));
        return res;
      }),
    enabled: !!vfolder,
    staleTime: 3000,
  });

  return {
    files,
    directoryTree,
    currentPath,
    navigateDown,
    navigateUp,
    navigateToPath,
    refetch,
    isFetching,
    isLoading,
  };
};

export const useUploadVFolderFiles = () => {
  const { t } = useBAIi18n();
  const { modal } = App.useApp();
  const { targetVFolderId, currentPath } = use(FolderInfoContext);
  const baiClient = useConnectedBAIClient();

  const uploadFiles = async (
    fileList: Array<RcFile>,
    onUpload: (files: Array<RcFile>, currentPath: string) => void,
    afterUpload?: () => void,
  ) => {
    // Currently, backend.ai only supports finding existing files by using list_files API.
    // This API throw an error if the file does not exist in the target vfolder.
    // So, we need to catch the error and return undefined.
    const uploadFolderName = fileList[0].webkitRelativePath.split('/')[0];

    const duplicateCheckResult = await baiClient.vfolder
      .list_files(currentPath, targetVFolderId)
      .then((files) => {
        if (uploadFolderName) {
          return _.some(files.items, (f) => f.name === uploadFolderName);
        } else {
          return _.some(files.items, (f) => f.name === fileList[0].name);
        }
      })
      .catch(() => undefined);

    if (duplicateCheckResult) {
      modal.confirm({
        title: t('comp:FileExplorer.DuplicatedFiles'),
        content: t('comp:FileExplorer.DuplicatedFilesDesc'),
        onOk: () => {
          onUpload(fileList, currentPath);
          afterUpload?.();
        },
      });
    } else {
      onUpload(fileList, currentPath);
      afterUpload?.();
    }
  };

  return {
    uploadFiles,
  };
};
