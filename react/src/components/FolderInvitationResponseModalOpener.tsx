import { useVFolderInvitationsValue } from '../hooks/useVFolderInvitations';
import React from 'react';
import { useQueryParam, BooleanParam } from 'use-query-params';

const FolderInvitationResponseModal = React.lazy(
  () => import('./FolderInvitationResponseModal'),
);

const FolderInvitationResponseModalOpener = () => {
  const [isInvitationOpen, setIsInvitationOpen] = useQueryParam(
    'invitation',
    BooleanParam,
  );
  const { count } = useVFolderInvitationsValue();

  return (
    <FolderInvitationResponseModal
      open={!!isInvitationOpen}
      onRequestClose={(success) => {
        if (success) {
          if (count === 1) {
            setIsInvitationOpen(null, 'replaceIn');
          }
        } else {
          setIsInvitationOpen(null, 'replaceIn');
        }
      }}
    />
  );
};

export default FolderInvitationResponseModalOpener;

export const useFolderInvitationResponseModalOpener = () => {
  const [, setIsInvitationOpen] = useQueryParam('invitation', BooleanParam);

  return {
    open: () => {
      setIsInvitationOpen(true);
    },
  };
};
