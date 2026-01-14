import { ConfigProvider, Tag, theme } from 'antd';
import { TagProps } from 'antd/lib/tag';
import React from 'react';

interface BAITagProps extends TagProps {}

const BAITag: React.FC<BAITagProps> = ({ ...tagProps }) => {
  const { token } = theme.useToken();
  return (
    <ConfigProvider
      theme={{
        token: {
          borderRadiusSM: 11,
        },
        components: {
          Tag: {
            defaultBg: 'transparent',
            defaultColor: '#999999',
          },
        },
      }}
    >
      <Tag
        style={{ paddingLeft: token.paddingSM, paddingRight: token.paddingSM }}
        {...tagProps}
      />
    </ConfigProvider>
  );
};

export default BAITag;
