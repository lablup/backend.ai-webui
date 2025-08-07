import useConnectedBAIClient from '../../provider/BAIClientProvider/hooks/useConnectedBAIClient';
import { FolderInfoContext } from './BAIFileExplorer';
import { useQuery } from '@tanstack/react-query';
import { App } from 'antd';
import { RcFile } from 'antd/es/upload';
import _ from 'lodash';
import { use, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StringParam, useQueryParam, withDefault } from 'use-query-params';

export const useSearchVFolderFiles = (vfolder: string) => {
  const baiClient = useConnectedBAIClient();
  const [currentPath, setCurrentPath] = useState<string>('.');
  const [, setCurrentPathParam] = useQueryParam(
    'path',
    withDefault(StringParam, '.'),
  );

  const {
    data: files,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ['searchVFolderFiles', vfolder, currentPath],
    queryFn: () => baiClient.vfolder.list_files(currentPath, vfolder),
    enabled: !!vfolder,
    // not using cache, always refetch
    staleTime: 5 * 60 * 1000,
    gcTime: 0,
  });

  const navigateDown = (folderName: string) => {
    const newPath =
      currentPath === '.' ? folderName : `${currentPath}/${folderName}`;
    setCurrentPath(newPath);
    setCurrentPathParam(newPath);
  };

  const navigateUp = () => {
    const pathParts = currentPath.split('/');
    if (pathParts.length > 1) {
      const newPath = pathParts.join('/');
      pathParts.pop();
      setCurrentPath(newPath || '.');
      newPath === '.'
        ? setCurrentPathParam(null, 'replaceIn')
        : setCurrentPathParam(newPath);
    }
  };

  const navigateToPath = (path: string) => {
    setCurrentPath(path);
    path === '.'
      ? setCurrentPathParam(null, 'replaceIn')
      : setCurrentPathParam(path);
  };

  return {
    files,
    currentPath,
    navigateDown,
    navigateUp,
    navigateToPath,
    refetch,
    isFetching,
  };
};

export const useUploadVFolderFiles = () => {
  const { t } = useTranslation();
  const { modal } = App.useApp();
  const { targetVFolderId, currentPath } = use(FolderInfoContext);
  const baiClient = useConnectedBAIClient();

  const upload = async (
    fileList: Array<RcFile>,
    onUpload: (files: Array<RcFile>, currentPath: string) => void,
    afterUpload?: () => void,
  ) => {
    try {
      const existFilePromises = _.map(fileList, (file) => {
        // Currently, backend.ai only supports finding existing files by using list_files API.
        // This API throw an error if the file does not exist in the target vfolder.
        // So, we need to catch the error and return undefined.
        const searchPath = [
          currentPath,
          file.webkitRelativePath.split('/').slice(0, -1).join('/'),
        ].join('/');
        return baiClient.vfolder
          .list_files(searchPath, targetVFolderId)
          .then((files) => {
            return _.find(files.items, { name: file.name });
          })
          .catch(() => {
            return undefined;
          });
      });

      await Promise.all(existFilePromises).then((res) => {
        const result = _.filter(res, (item) => item !== undefined);
        if (!_.isEmpty(result)) {
          modal.confirm({
            title: t('comp:FileExplorer.DuplicatedFiles'),
            content: t('comp:FileExplorer.DuplicatedFilesDesc'),
            onOk: () => {
              onUpload(fileList, currentPath);
            },
          });
        } else {
          onUpload(fileList, currentPath);
        }
        afterUpload?.();
      });
    } catch (error) {}
  };

  return {
    upload,
  };
};
