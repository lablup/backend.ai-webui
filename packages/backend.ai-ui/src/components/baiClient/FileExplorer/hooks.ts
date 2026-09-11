import useConnectedBAIClient from '../../provider/BAIClientProvider/hooks/useConnectedBAIClient';
import { VFolderFile } from '../../provider/BAIClientProvider/types';
import { useQuery } from '@tanstack/react-query';
import * as _ from 'lodash-es';
import { useEffect, useState } from 'react';

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

/** One top-level entry a picked file list will create in the target directory. */
export interface UploadEntry {
  name: string;
  isDirectory: boolean;
  files: Array<RcFile>;
}

/** An entry whose name is already taken in the target directory. */
export interface DuplicatedUploadEntry extends UploadEntry {
  existingItem: VFolderFile;
}

// A folder pick arrives as its leaf files, each carrying the path it will take
// inside the target directory; a plain file pick carries an empty one. Only the
// first segment lands in the current directory, so only it can collide.
const resolveUploadEntry = (file: RcFile) => {
  const relativePath = file.webkitRelativePath ?? '';
  const separatorIndex = relativePath.indexOf('/');
  return separatorIndex > 0
    ? { name: relativePath.slice(0, separatorIndex), isDirectory: true }
    : { name: file.name, isDirectory: false };
};

const EMPTY_DUPLICATED_ENTRIES: Array<DuplicatedUploadEntry> = [];

/**
 * Resolves name collisions before handing a pick to the uploader: the caller
 * gets `requestUpload`, and renders `OverwriteConfirmModal` with the returned
 * props so the user can keep or overwrite each colliding entry (FR-1564).
 *
 * Must be called where it outlives the upload trigger — the drag overlay
 * unmounts on drop, which would take the pending decision with it.
 */
export const useUploadVFolderFiles = ({
  targetVFolderId,
  currentPath,
  onUpload,
}: {
  targetVFolderId: string;
  currentPath: string;
  onUpload: (files: Array<RcFile>, currentPath: string) => void;
}) => {
  'use memo';
  const baiClient = useConnectedBAIClient();
  const [pendingUpload, setPendingUpload] = useState<{
    fileList: Array<RcFile>;
    // Captured at request time: the user may browse elsewhere while deciding.
    uploadPath: string;
    duplicatedEntries: Array<DuplicatedUploadEntry>;
    newEntryCount: number;
  } | null>(null);

  const requestUpload = async (fileList: Array<RcFile>) => {
    if (_.isEmpty(fileList)) return;
    const uploadPath = currentPath;

    const namedFiles = _.map(fileList, (file) => ({
      file,
      ...resolveUploadEntry(file),
    }));
    const entries: Array<UploadEntry> = _.map(
      _.groupBy(namedFiles, 'name'),
      (group, name) => ({
        name,
        isDirectory: group[0].isDirectory,
        files: _.map(group, 'file'),
      }),
    );

    // `list_files` throws when the directory cannot be listed. With nothing to
    // compare against there is no collision to report, so upload as-is.
    const existingItems = await baiClient.vfolder
      .list_files(uploadPath, targetVFolderId)
      .then((res) => res.items)
      .catch(() => undefined);
    const existingItemByName = _.keyBy(existingItems ?? [], 'name');

    const [duplicated, fresh] = _.partition(
      entries,
      (entry) => !!existingItemByName[entry.name],
    );

    if (_.isEmpty(duplicated)) {
      onUpload(fileList, uploadPath);
      return;
    }

    setPendingUpload({
      fileList,
      uploadPath,
      duplicatedEntries: _.map(duplicated, (entry) => ({
        ...entry,
        existingItem: existingItemByName[entry.name],
      })),
      newEntryCount: fresh.length,
    });
  };

  const resolvePendingUpload = (
    success: boolean,
    overwritingNames: Array<string> = [],
  ) => {
    if (success && pendingUpload) {
      const skippedNames = _.difference(
        _.map(pendingUpload.duplicatedEntries, 'name'),
        overwritingNames,
      );
      const filesToUpload = _.reject(pendingUpload.fileList, (file) =>
        _.includes(skippedNames, resolveUploadEntry(file).name),
      );
      if (!_.isEmpty(filesToUpload)) {
        onUpload(filesToUpload, pendingUpload.uploadPath);
      }
    }
    setPendingUpload(null);
  };

  return {
    requestUpload,
    overwriteConfirmModalProps: {
      open: !!pendingUpload,
      duplicatedEntries:
        pendingUpload?.duplicatedEntries ?? EMPTY_DUPLICATED_ENTRIES,
      newEntryCount: pendingUpload?.newEntryCount ?? 0,
      onRequestClose: resolvePendingUpload,
    },
  };
};
