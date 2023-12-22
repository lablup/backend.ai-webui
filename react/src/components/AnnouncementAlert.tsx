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
      closable
      showIcon={false}
      style={{ marginLeft: 14 }}
      message={
        <Tag color="error" style={{ fontSize: token.fontSize }}>
          Notice
        </Tag>
      }
      description={
        <span
          dangerouslySetInnerHTML={{ __html: marked(announcement.message) }}
          style={{ overflow: 'auto', whiteSpace: 'pre-wrap' }}
        />
      }
    />
  ) : (
    ''
  );
};

export default AnnouncementAlert;
