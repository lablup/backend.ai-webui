import { App } from '../../../app-shim';
import { useBAIi18n } from '../../../hooks/useBAIi18n';
import useConnectedBAIClient from '../../provider/BAIClientProvider/hooks/useConnectedBAIClient';
import { VFolderFile } from '../../provider/BAIClientProvider/types';
import { FolderInfoContext } from './BAIFileExplorer';
import { useQuery } from '@tanstack/react-query';
import * as _ from 'lodash-es';
import { use, useState } from 'react';

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
