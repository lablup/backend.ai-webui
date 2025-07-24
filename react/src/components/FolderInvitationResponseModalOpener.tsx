import { useVFolderInvitationsValue } from '../hooks/useVFolderInvitations';
import UnmountAfterClose from './UnmountAfterClose';
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
  const { count } = useVFolderInvitationsValue();

  return (
    <UnmountAfterClose>
      <FolderInvitationResponseModal
        open={isInvitationOpen === 'true'}
        onRequestClose={(success) => {
          if (!success || count === 1) {
            setIsInvitationOpen(null, 'replaceIn');
          }
        }}
      />
    </UnmountAfterClose>
  );
};

export default FolderInvitationResponseModalOpener;
