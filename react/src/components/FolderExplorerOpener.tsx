/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { App } from '../app-shim';
import { useWebUINavigate } from '../hooks';
import { useBAILogger } from 'backend.ai-ui';
import { parseAsString, useQueryState } from 'nuqs';
import React, { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';

const FolderExplorerModal = React.lazy(() => import('./FolderExplorerModalV2'));

const FolderExplorerOpener = () => {
  'use memo';
  const { t } = useTranslation();
  const { message } = App.useApp();
  const { logger } = useBAILogger();
  const navigate = useWebUINavigate();
  // Read from the router, not nuqs: nuqs applies a link's URL change in a
  // transition, which React holds back while any async action is pending.
  const location = useLocation();
  const folderId = new URLSearchParams(location.search).get('folder');
  const normalizedFolderId = folderId?.replaceAll('-', '');

  // Replaces history, so Back never reopens a folder that was closed.
  const close = () => {
    const searchParams = new URLSearchParams(location.search);
    searchParams.delete('folder');
    searchParams.delete('path');
    navigate(
      { search: searchParams.toString(), hash: location.hash },
      { replace: true },
    );
  };

  return (
    // The boundary around this opener in routes.tsx never resets; this one
    // retries on the next folder, and says so instead of opening nothing.
    <ErrorBoundary
      resetKeys={[normalizedFolderId]}
      fallbackRender={() => null}
      onError={(error) => {
        logger.error('Failed to open the folder explorer:', error);
        message.error(t('error.UnexpectedError'));
        close();
      }}
    >
      {/* Rendered while closed too, so the lazy chunk is resolved before the
          first click; the modal unmounts its own content after each close
          (FR-4005). Its own Suspense, so the chunk never holds back the login
          view it shares a boundary with in routes.tsx. */}
      <Suspense fallback={null}>
        <FolderExplorerModal
          vfolderID={normalizedFolderId || ''}
          open={!!normalizedFolderId}
          onRequestClose={close}
        />
      </Suspense>
    </ErrorBoundary>
  );
};

export default FolderExplorerOpener;

export const useFolderExplorerOpener = () => {
  const [, setFolderId] = useQueryState(
    'folder',
    // Push (nuqs defaults to replace), so Back closes a folder opened in-app.
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
