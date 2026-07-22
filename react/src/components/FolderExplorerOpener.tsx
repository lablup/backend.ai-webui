/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { parseAsString, useQueryState } from 'nuqs';
import React from 'react';
import { useLocation } from 'react-router-dom';

const FolderExplorerModal = React.lazy(() => import('./FolderExplorerModalV2'));

// The modal's own folder/path updates replace history; `useFolderExplorerOpener`
// below opts into push explicitly (nuqs defaults to replace) so Back closes a
// folder opened from a link.
const explorerParam = parseAsString.withOptions({ history: 'replace' });

const FolderExplorerOpener = () => {
  const [folderId, setFolderId] = useQueryState('folder', explorerParam);
  const [, setCurrentPath] = useQueryState('path', explorerParam);
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
  const [, setFolderId] = useQueryState(
    'folder',
    parseAsString.withOptions({ history: 'push' }),
  );

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
