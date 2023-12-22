import { useSuspendedBackendaiClient } from '../hooks';
import { useTanQuery } from '../hooks/reactQueryAlias';
import { Alert, Tag, theme } from 'antd';
import _ from 'lodash';
import Markdown from 'markdown-to-jsx';
import React from 'react';

const AnnouncementAlert: React.FC = () => {
  const baiClient = useSuspendedBackendaiClient();
  const { token } = theme.useToken();
  const { data: announcement } = useTanQuery({
    queryKey: ['baiClient', 'service', 'get_announcement'],
    queryFn: () => {
      return baiClient.service.get_announcement();
    },
  });

  return !_.isEmpty(announcement.message) ? (
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
      message={<Markdown>{announcement.message}</Markdown>}
    />
  ) : (
    ''
  );
};

export default AnnouncementAlert;
