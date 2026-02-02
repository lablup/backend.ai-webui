import { BAIUnmountAfterClose } from 'backend.ai-ui';
import { parseAsString, useQueryState } from 'nuqs';
import React from 'react';

const FolderInvitationResponseModal = React.lazy(
  () => import('./FolderInvitationResponseModal'),
);

const FolderInvitationResponseModalOpener = () => {
  const [isInvitationOpen, setIsInvitationOpen] = useQueryState(
    'invitation',
    parseAsString.withOptions({ history: 'replace' }),
  );

  return (
    <BAIUnmountAfterClose>
      <FolderInvitationResponseModal
        open={isInvitationOpen === 'true'}
        onCancel={() => {
          setIsInvitationOpen(null);
        }}
      />
    </BAIUnmountAfterClose>
  );
};

export default FolderInvitationResponseModalOpener;
