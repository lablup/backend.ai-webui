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
import './AnnouncementBanner.css';
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
import { ChevronDownIcon, ChevronUpIcon, SquarePenIcon } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

/**
 * The system announcement as AppShell's top banner (FR-3612), replacing the
 * StartPage-only `AnnouncementAlert`. A long announcement renders collapsed —
 * a one-line summary followed by an explicit labelled expand toggle revealing
 * the full markdown. Dismissal is remembered per session and per message, so
 * a new announcement resurfaces the banner.
 */
const AnnouncementBanner: React.FC = () => {
  'use memo';

  const { t } = useTranslation();
  const userRole = useCurrentUserRole();
  const isSuperAdmin = userRole === 'superadmin';
  const [isEditOpen, { toggle: toggleEditModal }] = useToggle(false);
  // Expansion is owned here rather than by Banner's `children` slot: Banner's
  // own toggle is uncontrolled (`defaultIsExpanded` only) and sits at the far
  // end of the header, away from the text it reveals.
  const [isExpanded, { toggle: toggleExpanded }] = useToggle(false);
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
        // Collapsible shape: one-line summary in `title` with the expand
        // toggle right beside it; the full markdown moves into `description`
        // once expanded, and the summary steps aside so the announcement's
        // first line is not shown twice. Short shape: body in `description`,
        // not `title` — Banner centres its header on
        // `description == null && hasActions`, which misaligns the icon and
        // Edit button against a multi-line announcement (FR-3482).
        title={
          isCollapsible ? (
            <span className="webui-announcement-title">
              {!isExpanded && (
                <span className="webui-announcement-summary">
                  {summarizeAnnouncement(message)}
                </span>
              )}
              <Button
                className="webui-announcement-toggle"
                variant="ghost"
                size="sm"
                label={t(
                  isExpanded
                    ? 'notification.SeeSummary'
                    : 'notification.SeeDetail',
                )}
                endContent={
                  isExpanded ? (
                    <ChevronUpIcon size="1em" />
                  ) : (
                    <ChevronDownIcon size="1em" />
                  )
                }
                onClick={toggleExpanded}
              />
            </span>
          ) : null
        }
        description={
          isCollapsible ? (isExpanded ? fullMarkdown : undefined) : fullMarkdown
        }
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
      />
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
