import { parseAsString, useQueryState } from 'nuqs';
import React from 'react';
import { useLocation } from 'react-router-dom';

const FolderExplorerModal = React.lazy(() => import('./FolderExplorerModal'));

const FolderExplorerOpener = () => {
  const [folderId, setFolderId] = useQueryState(
    'folder',
    parseAsString.withOptions({ history: 'replace' }),
  );
  const [, setCurrentPath] = useQueryState(
    'path',
    parseAsString.withOptions({ history: 'replace' }),
  );
  const normalizedFolderId = folderId?.replaceAll('-', '');

  return (
    <FolderExplorerModal
      vfolderID={normalizedFolderId || ''}
      open={!!normalizedFolderId}
      onRequestClose={() => {
        setFolderId(null);
        setCurrentPath(null);
      }}
      destroyOnHidden
    />
  );
};

export default FolderExplorerOpener;

export const useFolderExplorerOpener = () => {
  const [, setFolderId] = useQueryState('folder', parseAsString);

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
