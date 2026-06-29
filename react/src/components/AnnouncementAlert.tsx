/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useSuspendedBackendaiClient } from '../hooks';
import { useCurrentUserRole } from '../hooks/backendai';
import { useSuspenseTanQuery } from '../hooks/reactQueryAlias';
import AnnouncementEditModal from './AnnouncementEditModal';
import { EditOutlined } from '@ant-design/icons';
import { Button, theme } from 'antd';
import { BAIAlert, BAIAlertProps, BAIUnmountAfterClose } from 'backend.ai-ui';
import * as _ from 'lodash-es';
import Markdown from 'markdown-to-jsx';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface Props extends BAIAlertProps {}
const AnnouncementAlert: React.FC<Props> = ({ ...otherProps }) => {
  'use memo';

  const { t } = useTranslation();
  const baiClient = useSuspendedBackendaiClient();
  const { token } = theme.useToken();
  const userRole = useCurrentUserRole();
  const isSuperAdmin = userRole === 'superadmin';
  const [isEditOpen, setIsEditOpen] = useState(false);
  const { data: announcement } = useSuspenseTanQuery({
    queryKey: ['baiClient', 'service', 'get_announcement'],
    queryFn: () => {
      return baiClient.service.get_announcement();
    },
  });

  return !_.isEmpty(announcement.message) ? (
    <>
      <BAIAlert
        description={
          <div style={{ marginBottom: token.marginSM * -1 }}>
            <Markdown
              options={{
                overrides: {
                  p: {
                    props: {
                      style: {
                        marginTop: 0,
                        marginBottom: token.marginSM,
                      },
                    },
                  },
                },
              }}
            >
              {/* add dummy <p> to remove unnecessary margin bottom  */}
              {announcement.message + '<p></p>'}
            </Markdown>
          </div>
        }
        action={
          isSuperAdmin ? (
            <Button
              type="text"
              size="small"
              icon={<EditOutlined />}
              onClick={() => setIsEditOpen(true)}
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
            onRequestClose={() => setIsEditOpen(false)}
          />
        </BAIUnmountAfterClose>
      )}
    </>
  ) : (
    ''
  );
};

export default AnnouncementAlert;
