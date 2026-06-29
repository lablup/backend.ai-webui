/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useCurrentUserRole } from '../hooks/backendai';
import { useSuspenseGetAnnouncement } from '../hooks/useAnnouncement';
import AnnouncementEditModal from './AnnouncementEditModal';
import AnnouncementMarkdown from './AnnouncementMarkdown';
import { EditOutlined } from '@ant-design/icons';
import { useToggle } from 'ahooks';
import { Button } from 'antd';
import { BAIAlert, BAIAlertProps, BAIUnmountAfterClose } from 'backend.ai-ui';
import * as _ from 'lodash-es';
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
        description={
          <AnnouncementMarkdown>{announcement.message}</AnnouncementMarkdown>
        }
        action={
          isSuperAdmin ? (
            <Button
              type="text"
              size="small"
              icon={<EditOutlined />}
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
            initialMessage={announcement.message}
            initialEnabled={announcement.enabled}
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
