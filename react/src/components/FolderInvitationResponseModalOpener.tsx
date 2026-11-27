/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useCurrentProjectValue } from '../hooks/useCurrentProject';
import { useIsProjectAgnosticPage } from '../hooks/useIsProjectAgnosticPage';
import { toProjectContext } from '../types/projectContext';
import { BAIUnmountAfterClose } from 'backend.ai-ui';
import { parseAsString, useQueryState } from 'nuqs';
import React from 'react';

const FolderInvitationResponseModal = React.lazy(
  () => import('./FolderInvitationResponseModal'),
);

// Mounted once at the router root, so the route is its only project signal (ADR-0001).
const FolderInvitationResponseModalOpener = () => {
  'use memo';
  const isProjectAgnosticPage = useIsProjectAgnosticPage();
  const currentProject = useCurrentProjectValue();
  const [isInvitationOpen, setIsInvitationOpen] = useQueryState(
    'invitation',
    parseAsString.withOptions({ history: 'replace' }),
  );

  return (
    <BAIUnmountAfterClose>
      <FolderInvitationResponseModal
        open={isInvitationOpen === 'true'}
        project={
          isProjectAgnosticPage ? null : toProjectContext(currentProject)
        }
        onCancel={() => {
          setIsInvitationOpen(null);
        }}
      />
    </BAIUnmountAfterClose>
  );
};

export default FolderInvitationResponseModalOpener;
