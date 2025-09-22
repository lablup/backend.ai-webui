import useConnectedBAIClient from '../../provider/BAIClientProvider/hooks/useConnectedBAIClient';
import { VFolderFile } from '../../provider/BAIClientProvider/types';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { StringParam, useQueryParam, withDefault } from 'use-query-params';

export const useSearchVFolderFiles = (vfolder: string) => {
  const baiClient = useConnectedBAIClient();
  const [currentPath, setCurrentPath] = useState<string>('.');
  const [, setCurrentPathParam] = useQueryParam(
    'path',
    withDefault(StringParam, '.'),
  );
  const [directoryTree, setDirectoryTree] = useState<
    Record<string, Array<VFolderFile>>
  >({});

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

  const {
    data: files,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ['searchVFolderFiles', vfolder, currentPath],
    queryFn: () =>
      baiClient.vfolder.list_files(currentPath, vfolder).then((res) => {
        setDirectoryTree((prev) => ({
          ...prev,
          [currentPath]: res.items,
        }));
        return res;
      }),
    enabled: !!vfolder,
    // not using cache, always refetch
    staleTime: 5 * 60 * 1000,
    gcTime: 0,
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
  };
};
