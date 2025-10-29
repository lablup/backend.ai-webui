import React from 'react';
import { useLocation } from 'react-router-dom';
import { StringParam, useQueryParam } from 'use-query-params';

const FolderExplorerModal = React.lazy(() => import('./FolderExplorerModal'));

const FolderExplorerOpener = () => {
  const [folderId, setFolderId] = useQueryParam('folder', StringParam);
  const [, setCurrentPath] = useQueryParam('path', StringParam);
  const normalizedFolderId = folderId?.replaceAll('-', '');

  return (
    <FolderExplorerModal
      vfolderID={normalizedFolderId || ''}
      open={!!normalizedFolderId}
      onRequestClose={() => {
        setFolderId(null, 'replaceIn');
        setCurrentPath(null, 'replaceIn');
      }}
      destroyOnHidden
    />
  );
};

export default FolderExplorerOpener;

export const useFolderExplorerOpener = () => {
  const [, setFolderId] = useQueryParam('folder', StringParam);

  const location = useLocation();
  // a function to generate new path with folder id based on current path
  const generateFolderPath = (id: string) => {
    // get current path
    const searchParams = new URLSearchParams(location.search);
    // set folder id
    searchParams.set('folder', id);
    return {
      pathname: location.pathname,
      search: searchParams.toString(),
    };
  };

  return {
    open: (id: string) => {
      setFolderId(id);
    },
    generateFolderPath,
  };
};
