import { useBaiSignedRequestWithPromise } from '../helper';
import { useCurrentProjectValue } from '../hooks/useCurrentProject';
import { jotaiStore } from './DefaultProviders';
import { VFolder } from './VFolderSelect';
import { atom, useAtomValue } from 'jotai';
import { useEffect } from 'react';
import { StringParam, useQueryParam } from 'use-query-params';

// TODO: Separate Folder Explorer from `backend-ai-data-view` and make it opened directly on all pages.

const isDataViewReadyAtom = atom(false);
document.addEventListener('backend-ai-data-view:connected', () => {
  jotaiStore.set(isDataViewReadyAtom, true);
});
document.addEventListener('backend-ai-data-view:disconnected', () => {
  jotaiStore.set(isDataViewReadyAtom, false);
});

const FolderExplorerOpener = () => {
  const [folderId] = useQueryParam('folder', StringParam) || '';
  const normalizedFolderId = folderId?.replaceAll('-', '');
  const currentProject = useCurrentProjectValue();
  const baiRequestWithPromise = useBaiSignedRequestWithPromise();

  const isDataViewReady = useAtomValue(isDataViewReadyAtom);
  useEffect(() => {
    if (isDataViewReady && folderId) {
      (
        baiRequestWithPromise({
          method: 'GET',
          url: `/folders?group_id=${currentProject.id}`,
        }) as Promise<VFolder[]>
      )
        .then((vFolders) => {
          const vFolder = vFolders?.find(
            // `id` of `/folders` API is not UUID, but UUID without `-`
            (vFolder) => vFolder.id === normalizedFolderId,
          );
          document.dispatchEvent(
            new CustomEvent('folderExplorer:open', {
              detail: {
                vFolder,
              },
            }),
          );
        })
        .catch(() => {
          // do nothing
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDataViewReady]); // don't need to watch `folderId` because this used only once right after the backend-ai-data-view is ready

  return null;
};

export default FolderExplorerOpener;
