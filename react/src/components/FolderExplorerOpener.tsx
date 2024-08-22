import React from 'react';
import { StringParam, useQueryParam } from 'use-query-params';

const LegacyFolderExplorer = React.lazy(() => import('./LegacyFolderExplorer'));

const FolderExplorerOpener = () => {
  const [folderId, setFolderId] = useQueryParam('folder', StringParam);
  const normalizedFolderId = folderId?.replaceAll('-', '');

  return (
    <LegacyFolderExplorer
      vfolderID={normalizedFolderId || ''}
      open={!!normalizedFolderId}
      onRequestClose={() => {
        setFolderId(null, 'replaceIn');
      }}
      destroyOnClose
    />
  );
};

export default FolderExplorerOpener;

export const useFolderExplorerOpener = () => {
  const [, setFolderId] = useQueryParam('folder', StringParam);
  return {
    open: (id: string) => {
      setFolderId(id);
    },
  };
};
