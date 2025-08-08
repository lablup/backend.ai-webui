import useConnectedBAIClient from '../../provider/BAIClientProvider/hooks/useConnectedBAIClient';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';

export const useSearchVFolderFiles = (vfolder: string) => {
  const baiClient = useConnectedBAIClient();
  const [currentPath, setCurrentPath] = useState<string>('.');

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
  };

  const navigateUp = () => {
    const pathParts = currentPath.split('/');
    if (pathParts.length > 1) {
      pathParts.pop();
      setCurrentPath(pathParts.join('/') || '.');
    }
  };

  const navigateToPath = (path: string) => {
    setCurrentPath(path);
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
