/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useCurrentUserRole } from '../hooks/backendai';
import { useSuspenseGetAnnouncement } from '../hooks/useSuspenseGetAnnouncement';
import AnnouncementEditModal from './AnnouncementEditModal';
import MarkdownContent from './MarkdownContent';
import { useToggle } from 'ahooks';
import { Button } from 'antd';
import { BAIAlert, BAIAlertProps, BAIUnmountAfterClose } from 'backend.ai-ui';
import * as _ from 'lodash-es';
import { SquarePenIcon } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

interface Props extends BAIAlertProps {}
const AnnouncementAlert: React.FC<Props> = ({ ...otherProps }) => {
  'use memo';

  const { t } = useTranslation();
  const userRole = useCurrentUserRole();
  const isSuperAdmin = userRole === 'superadmin';
  const [isEditOpen, { toggle: toggleEditModal }] = useToggle(false);
  const { data: announcement } = useSuspenseGetAnnouncement();

  return !_.isEmpty(announcement.message) ? (
    <>
      <BAIAlert
        description={<MarkdownContent>{announcement.message}</MarkdownContent>}
        action={
          isSuperAdmin ? (
            <Button
              type="text"
              size="small"
              icon={<SquarePenIcon />}
              onClick={toggleEditModal}
            >
              {t('button.Edit')}
            </Button>
          ) : undefined
        }
        {...otherProps}
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
