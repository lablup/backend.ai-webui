/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useCurrentUserRole } from '../hooks/backendai';
import { useSuspenseGetAnnouncement } from '../hooks/useSuspenseGetAnnouncement';
import AnnouncementEditModal from './AnnouncementEditModal';
import { Banner } from '@astryxdesign/core/Banner';
import { Button } from '@astryxdesign/core/Button';
import { Markdown } from '@astryxdesign/core/Markdown';
import { BAIUnmountAfterClose, useToggle } from 'backend.ai-ui';
import * as _ from 'lodash-es';
import { SquarePenIcon } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

// `showIcon` is accepted and ignored — Banner always renders its status icon.
// The announcement has no severity in the data model, hence a fixed `info`.
interface Props {
  showIcon?: boolean;
  closable?: boolean;
}
const AnnouncementAlert: React.FC<Props> = ({ closable }) => {
  'use memo';

  const { t } = useTranslation();
  const userRole = useCurrentUserRole();
  const isSuperAdmin = userRole === 'superadmin';
  const [isEditOpen, { toggle: toggleEditModal }] = useToggle(false);
  const { data: announcement } = useSuspenseGetAnnouncement();

  return !_.isEmpty(announcement.message) ? (
    <>
      <Banner
        status="info"
        isDismissable={closable}
        // Keep the body in `description`, not `title`: Banner centres its
        // header on `description == null && hasActions`, which misaligns the
        // icon and Edit button against a multi-line announcement (FR-3482).
        title={null}
        description={
          // Must be the same renderer as the editor preview (FR-3402); the
          // banner sits under an h2, so markdown `#` starts at h3.
          <Markdown density="compact" headingLevelStart={3} autolink="gfm">
            {announcement.message}
          </Markdown>
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
  ) : (
    ''
  );
};

export default AnnouncementAlert;
