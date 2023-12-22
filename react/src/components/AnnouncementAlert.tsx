import { useSuspendedBackendaiClient } from '../hooks';
import { useTanQuery } from '../hooks/reactQueryAlias';
import { Alert, Tag, theme } from 'antd';
import { marked } from 'marked';
import React from 'react';

const AnnouncementAlert: React.FC = () => {
  const baiClient = useSuspendedBackendaiClient();
  const { token } = theme.useToken();
  const { data: announcement } = useTanQuery({
    queryKey: 'announcement',
    queryFn: () => {
      return baiClient.service.get_announcement();
    },
  });

  return announcement.message ? (
    <Alert
      banner
      style={{
        alignItems: 'flex-start',
        overflow: 'auto',
        whiteSpace: 'pre-wrap',
      }}
      icon={
        //use <> because tag border is not displayed normally when Tag component is used only
        <>
          <Tag color="error" style={{ fontSize: token.fontSize }}>
            Notice
          </Tag>
        </>
      }
      message={
        <span
          dangerouslySetInnerHTML={{ __html: marked(announcement.message) }}
        />
      }
    />
  ) : (
    ''
  );
};

export default AnnouncementAlert;
