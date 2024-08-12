import { useBaiSignedRequestWithPromise } from '../helper';
import { useCurrentProjectValue } from '../hooks/useCurrentProject';
import { jotaiStore } from './DefaultProviders';
import LegacyFolderExplorer from './LegacyFolderExplorer';
import { VFolder } from './VFolderSelect';
import { atom, useAtomValue } from 'jotai';
import { useEffect, useState } from 'react';
import { StringParam, useQueryParam } from 'use-query-params';

const isDataViewReadyAtom = atom(false);
document.addEventListener('backend-ai-data-view:connected', () => {
  jotaiStore.set(isDataViewReadyAtom, true);
});
document.addEventListener('backend-ai-data-view:disconnected', () => {
  jotaiStore.set(isDataViewReadyAtom, false);
});

const FolderExplorerOpener = () => {
  const [folderId] = useQueryParam('folder', StringParam) || '';
  const [vfolderName, setVFolderName] = useState<string>('');
  const [open, setOpen] = useState(false);
  const normalizedFolderId = folderId?.replaceAll('-', '');
  const currentProject = useCurrentProjectValue();
  const baiRequestWithPromise = useBaiSignedRequestWithPromise();

  const isDataViewReady = useAtomValue(isDataViewReadyAtom);
  useEffect(() => {
    if (isDataViewReady && folderId) {
      const search = new URLSearchParams();
      search.set('group_id', currentProject.id);
      (
        baiRequestWithPromise({
          method: 'GET',
          url: `/folders?${search.toString()}`,
        }) as Promise<VFolder[]>
      )
        .then((vFolders) => {
          const vFolder = vFolders?.find(
            // `id` of `/folders` API is not UUID, but UUID without `-`
            (vFolder) => vFolder.id === normalizedFolderId,
          );
          setVFolderName(vFolder?.name || '');
        })
        .catch(() => {
          // do nothing
        });
      setOpen(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDataViewReady, folderId]); // don't need to watch `folderId` because this used only once right after the backend-ai-data-view is ready

  return (
    <LegacyFolderExplorer
      vfolderName={vfolderName}
      vfolderID={normalizedFolderId || ''}
      open={open}
      onRequestClose={() => setOpen(false)}
      destroyOnClose
    />
  );
};

export default FolderExplorerOpener;
