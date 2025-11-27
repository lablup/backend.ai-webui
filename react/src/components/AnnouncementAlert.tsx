import { useSuspendedBackendaiClient } from '../hooks';
import { useSuspenseTanQuery } from '../hooks/reactQueryAlias';
import { theme } from 'antd';
import { BAIAlert, BAIAlertProps } from 'backend.ai-ui';
import _ from 'lodash';
import Markdown from 'markdown-to-jsx';
import React from 'react';

interface Props extends BAIAlertProps {}
const AnnouncementAlert: React.FC<Props> = ({ ...otherProps }) => {
  const baiClient = useSuspendedBackendaiClient();
  const { token } = theme.useToken();
  const { data: announcement } = useSuspenseTanQuery({
    queryKey: ['baiClient', 'service', 'get_announcement'],
    queryFn: () => {
      return baiClient.service.get_announcement();
    },
  });

  return !_.isEmpty(announcement.message) ? (
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
      {...otherProps}
    />
  ) : (
    ''
  );
};

export default AnnouncementAlert;
