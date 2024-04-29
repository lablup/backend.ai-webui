import { useSuspendedBackendaiClient } from '../hooks';
import { useTanQuery } from '../hooks/reactQueryAlias';
import { Alert, theme } from 'antd';
import { AlertProps } from 'antd/lib';
import _ from 'lodash';
import Markdown from 'markdown-to-jsx';
import React from 'react';

interface Props extends AlertProps {}
const AnnouncementAlert: React.FC<Props> = ({ style, ...otherProps }) => {
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
        // overflow: 'auto',
        alignItems: 'center',
        ...style,
      }}
      // icon={
      //   //use <> because tag border is not displayed normally when Tag component is used only
      //   <>
      //     <Tag color="error" style={{ fontSize: token.fontSize }}>
      //       Notice
      //     </Tag>
      //   </>
      // }
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
