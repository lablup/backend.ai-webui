/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import {
  isAnnouncementCollapsible,
  splitAnnouncement,
  summarizeAnnouncement,
} from '../helper/announcementSummary';
import { useCurrentUserRole } from '../hooks/backendai';
import { useSuspenseGetAnnouncement } from '../hooks/useSuspenseGetAnnouncement';
import { theme } from '../theme-shim';
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
  const { token } = theme.useToken();
  const userRole = useCurrentUserRole();
  const isSuperAdmin = userRole === 'superadmin';
  const [isEditOpen, { toggle: toggleEditModal }] = useToggle(false);
  // Expansion is owned here rather than by Banner's `children` slot: Banner's
  // own toggle sits at the far end of the header, away from the text it
  // reveals. (0.5.0's `collapsible` config added a controlled mode; the
  // placement is what still rules the slot out.)
  const [isExpanded, { toggle: toggleExpanded }] = useToggle(false);
  const { data: announcement } = useSuspenseGetAnnouncement();
  const [dismissedMessage, setDismissedMessage] = useSessionStorageState<
    string | undefined
  >('backendaiwebui.dismissed_announcement');

  const message = announcement.message ?? '';
  if (_.isEmpty(message) || dismissedMessage === message) {
    return null;
  }

  // Must use the same renderer settings as the editor preview (FR-3402); the
  // banner sits above the page h1, so markdown `#` starts at h3.
  const renderMarkdown = (source: string) => (
    <Markdown density="compact" headingLevelStart={3} autolink="gfm">
      {source}
    </Markdown>
  );
  const isCollapsible = isAnnouncementCollapsible(message);
  // The first line is the banner's title in both states, so the expanded body
  // is the source WITHOUT it — expanding adds only what the title does not
  // already show.
  const { headline, body } = splitAnnouncement(message);

  return (
    <>
      <Banner
        status="info"
        container="section"
        className="webui-announcement-banner"
        // The header's own inline-padding source (WebUIHeader.tsx), so the two
        // bands share one rhythm (FR-3828 review feedback); the height token
        // is bridged globally as --webui-header-height (CSSTokenVariables).
        style={
          {
            '--webui-header-padding-inline': `${token.marginLG}px`,
          } as React.CSSProperties
        }
        isDismissable
        onDismiss={() => setDismissedMessage(message)}
        // Collapsible shape: the first line is the title in BOTH states, with
        // the expand toggle right beside it — collapsed it is cut to one row,
        // expanded it shows in full (so a cropped long line is never lost) and
        // `description` adds the rest of the source below it. Short shape:
        // body in `description`, not `title` — Banner centres its header on
        // `description == null && hasActions`, which misaligns the icon and
        // Edit button against a multi-line announcement (FR-3482).
        title={
          isCollapsible ? (
            <span className="webui-announcement-title">
              <span
                className={
                  isExpanded
                    ? 'webui-announcement-headline'
                    : 'webui-announcement-summary'
                }
              >
                {isExpanded ? headline : summarizeAnnouncement(message)}
              </span>
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
          isCollapsible
            ? isExpanded && body.length > 0
              ? renderMarkdown(body)
              : undefined
            : renderMarkdown(message)
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
