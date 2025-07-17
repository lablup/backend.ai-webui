import { useVFolderInvitationsValue } from '../hooks/useVFolderInvitations';
import UnmountModalAfterClose from './UnmountModalAfterClose';
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
    <UnmountModalAfterClose>
      <FolderInvitationResponseModal
        open={isInvitationOpen === 'true'}
        onRequestClose={(success) => {
          if (!success || count === 1) {
            setIsInvitationOpen(null, 'replaceIn');
          }
        }}
      />
    </UnmountModalAfterClose>
  );
};

export default FolderInvitationResponseModalOpener;
