import LegacyFolderExplorer from './LegacyFolderExplorer';
import { StringParam, useQueryParam } from 'use-query-params';

const FolderExplorerOpener = () => {
  const [folderId, setFolderId] = useQueryParam('folder', StringParam) || '';
  const normalizedFolderId = folderId?.replaceAll('-', '');

  return (
    <LegacyFolderExplorer
      vfolderID={normalizedFolderId || ''}
      open={!!normalizedFolderId}
      onRequestClose={() => {
        setFolderId(null);
      }}
      destroyOnClose
    />
  );
};

export default FolderExplorerOpener;
