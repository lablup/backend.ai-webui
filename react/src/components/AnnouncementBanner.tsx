/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import {
  DOMAIN_ANNOUNCEMENT_CONFIG_KEY,
  DomainAnnouncement,
  isAnnouncementCollapsible,
  isAnnouncementVisible,
  summarizeAnnouncementTitle,
} from '../helper/announcement';
import { useCurrentUserRole } from '../hooks/backendai';
import { useDomainAppConfig } from '../hooks/useAppConfig';
import './AnnouncementBanner.css';
import AnnouncementEditModal from './AnnouncementEditModal';
import { Banner } from '@astryxdesign/core/Banner';
import { Button } from '@astryxdesign/core/Button';
import { Markdown } from '@astryxdesign/core/Markdown';
import { useTheme } from '@astryxdesign/core/theme';
import {
  BAIUnmountAfterClose,
  useSessionStorageState,
  useToggle,
} from 'backend.ai-ui';
import { ChevronDownIcon, ChevronUpIcon, SquarePenIcon } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

/**
 * The domain's system announcement as AppShell's top banner (FR-3612), read
 * from the domain app config (FR-3877). The title shows in every state; a
 * body (or a title past the cutoff) renders collapsed behind an explicit
 * labelled expand toggle. Dismissal is remembered per session and per
 * publication, so a re-published announcement resurfaces the banner.
 */
const AnnouncementBanner: React.FC = () => {
  'use memo';

  const { t } = useTranslation();
  const { token } = useTheme();
  const userRole = useCurrentUserRole();
  const isSuperAdmin = userRole === 'superadmin';
  const [isEditOpen, { toggle: toggleEditModal }] = useToggle(false);
  // Expansion is owned here rather than by Banner's `children` slot: Banner's
  // own toggle sits at the far end of the header, away from the text it
  // reveals.
  const [isExpanded, { toggle: toggleExpanded }] = useToggle(false);
  const announcement = useDomainAppConfig<DomainAnnouncement>(
    DOMAIN_ANNOUNCEMENT_CONFIG_KEY,
  );
  const [dismissedKey, setDismissedKey] = useSessionStorageState<
    string | undefined
  >('backendaiwebui.dismissed_announcement');

  if (!isAnnouncementVisible(announcement)) {
    return null;
  }
  const dismissKey = announcement.updatedAt ?? announcement.title;
  if (dismissedKey === dismissKey) {
    return null;
  }

  const title = announcement.title.trim();
  const body = (announcement.body ?? '').trim();
  const isCollapsible = isAnnouncementCollapsible(announcement);

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
            '--webui-header-padding-inline': `${token('--spacing-6')}`,
          } as React.CSSProperties
        }
        isDismissable
        onDismiss={() => setDismissedKey(dismissKey)}
        // Collapsible shape: the title in BOTH states with the expand toggle
        // right beside it — collapsed it is cut to one row, expanded it shows
        // in full and `description` adds the body below it. Short shape: the
        // title in `description`, not `title` — Banner centres its header on
        // `description == null && hasActions`, which misaligns the icon and
        // Edit button against a wrapping line (FR-3482).
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
                {isExpanded ? title : summarizeAnnouncementTitle(title)}
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
          isCollapsible ? (
            isExpanded && body.length > 0 ? (
              // Must use the same renderer settings as the editor preview
              // (FR-3402); the banner sits above the page h1, so markdown `#`
              // starts at h3.
              <Markdown
                className="webui-announcement-body"
                density="compact"
                headingLevelStart={3}
                autolink="gfm"
              >
                {body}
              </Markdown>
            ) : undefined
          ) : (
            title
          )
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
