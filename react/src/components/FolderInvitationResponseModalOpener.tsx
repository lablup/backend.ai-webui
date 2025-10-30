import { BAIUnmountAfterClose } from 'backend.ai-ui';
import React from 'react';
import { useQueryParam, StringParam } from 'use-query-params';

const FolderInvitationResponseModal = React.lazy(
  () => import('./FolderInvitationResponseModal'),
);

const FolderInvitationResponseModalOpener = () => {
  const [isInvitationOpen, setIsInvitationOpen] = useQueryParam(
    'invitation',
    StringParam,
  );

  return (
    <BAIUnmountAfterClose>
      <FolderInvitationResponseModal
        open={isInvitationOpen === 'true'}
        onCancel={() => {
          setIsInvitationOpen(null, 'replaceIn');
        }}
      />
    </BAIUnmountAfterClose>
  );
};

export default FolderInvitationResponseModalOpener;
