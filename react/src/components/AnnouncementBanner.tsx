/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import {
  isAnnouncementCollapsible,
  summarizeAnnouncement,
} from '../helper/announcementSummary';
import { useCurrentUserRole } from '../hooks/backendai';
import { useSuspenseGetAnnouncement } from '../hooks/useSuspenseGetAnnouncement';
import AnnouncementEditModal from './AnnouncementEditModal';
import { Banner } from '@astryxdesign/core/Banner';
import { Button } from '@astryxdesign/core/Button';
import { Markdown } from '@astryxdesign/core/Markdown';
import {
  BAIUnmountAfterClose,
  useSessionStorageState,
  useToggle,
} from 'backend.ai-ui';
import * as _ from 'lodash-es';
import { SquarePenIcon } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

/**
 * The system announcement as AppShell's top banner (FR-3612), replacing the
 * StartPage-only `AnnouncementAlert`. A long announcement renders collapsed —
 * one-line summary plus Banner's built-in expand toggle revealing the full
 * markdown. Dismissal is remembered per session and per message, so a new
 * announcement resurfaces the banner.
 */
const AnnouncementBanner: React.FC = () => {
  'use memo';

  const { t } = useTranslation();
  const userRole = useCurrentUserRole();
  const isSuperAdmin = userRole === 'superadmin';
  const [isEditOpen, { toggle: toggleEditModal }] = useToggle(false);
  const { data: announcement } = useSuspenseGetAnnouncement();
  const [dismissedMessage, setDismissedMessage] = useSessionStorageState<
    string | undefined
  >('backendaiwebui.dismissed_announcement');

  const message = announcement.message ?? '';
  if (_.isEmpty(message) || dismissedMessage === message) {
    return null;
  }

  // Must be the same renderer as the editor preview (FR-3402); the banner
  // sits above the page h1, so markdown `#` starts at h3.
  const fullMarkdown = (
    <Markdown density="compact" headingLevelStart={3} autolink="gfm">
      {message}
    </Markdown>
  );
  const isCollapsible = isAnnouncementCollapsible(message);

  return (
    <>
      <Banner
        status="info"
        container="section"
        isDismissable
        onDismiss={() => setDismissedMessage(message)}
        // Collapsed shape: summary in `title`, full markdown in the
        // collapsible `children` area (Banner adds the expand toggle).
        // Short shape: body in `description`, not `title` — Banner centres
        // its header on `description == null && hasActions`, which misaligns
        // the icon and Edit button against a multi-line announcement
        // (FR-3482).
        title={isCollapsible ? summarizeAnnouncement(message) : null}
        description={isCollapsible ? undefined : fullMarkdown}
        endContent={
          isSuperAdmin ? (
            <Button
              variant="ghost"
              size="sm"
              icon={<SquarePenIcon size="1em" />}
              label={t('button.Edit')}
              onClick={toggleEditModal}
            />
          ) : undefined
        }
      >
        {isCollapsible ? fullMarkdown : undefined}
      </Banner>
      {isSuperAdmin && (
        <BAIUnmountAfterClose>
          <AnnouncementEditModal
            open={isEditOpen}
            onRequestClose={toggleEditModal}
          />
        </BAIUnmountAfterClose>
      )}
    </>
  );
};

export default AnnouncementBanner;
