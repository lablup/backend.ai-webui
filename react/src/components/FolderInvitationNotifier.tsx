/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useSetBAINotification } from '../hooks/useBAINotification';
import { useVFolderInvitations } from '../hooks/useVFolderInvitations';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

/** Pins a notification while folder invitations wait; it opens the response modal. */
const FolderInvitationNotifier: React.FC = () => {
  'use memo';
  const { t } = useTranslation();
  const { upsertNotification } = useSetBAINotification();
  const [invitations] = useVFolderInvitations();

  useEffect(() => {
    if (invitations.length <= 0) return;
    upsertNotification({
      key: 'invitedFolders',
      message: t('data.InvitedFoldersTooltip', { count: invitations.length }),
      to: { search: new URLSearchParams({ invitation: 'true' }).toString() },
      open: true,
      duration: 0,
    });
  }, [invitations.length, t, upsertNotification]);

  return null;
};

export default FolderInvitationNotifier;
