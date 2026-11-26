/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useSetBAINotification } from '../hooks/useBAINotification';
import { useVFolderInvitations } from '../hooks/useVFolderInvitations';
import type { ProjectContextOrNull } from '../types/projectContext';
import { useEffect, useEffectEvent } from 'react';
import { useTranslation } from 'react-i18next';

const NOTIFICATION_KEY = 'invitedFolders';

/**
 * Pins a notification while folder invitations of the page's project wait; it
 * opens the response modal. A project with none takes the notification away.
 */
const FolderInvitationNotifier: React.FC<{ project: ProjectContextOrNull }> = ({
  project,
}) => {
  'use memo';
  const { t } = useTranslation();
  const { upsertNotification, clearNotification } = useSetBAINotification();
  const [invitations] = useVFolderInvitations(project);

  const syncNotification = useEffectEvent(() => {
    if (invitations.length <= 0) {
      clearNotification(NOTIFICATION_KEY);
      return;
    }
    upsertNotification({
      key: NOTIFICATION_KEY,
      // No count: the modal it opens lists the invitations of the page it opens on.
      message: t('data.invitation.PendingInvitationsNotice'),
      to: { search: new URLSearchParams({ invitation: 'true' }).toString() },
      open: true,
      duration: 0,
    });
  });

  const hasInvitations = invitations.length > 0;
  useEffect(() => {
    syncNotification();
  }, [hasInvitations, project?.id]);

  return null;
};

export default FolderInvitationNotifier;
