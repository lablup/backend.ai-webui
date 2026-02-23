import { ConfigProvider, Tag, theme } from 'antd';
import type { TagProps } from 'antd/lib/tag';
import React from 'react';

interface BAITagProps extends TagProps {}

const BAITag: React.FC<BAITagProps> = ({ ...tagProps }) => {
  const { token } = theme.useToken();
  return (
    <ConfigProvider
      theme={{
        components: {
          Tag: {
            borderRadiusSM: 11,
            colorText: '#999999',
            defaultBg: 'transparent',
            colorInfoBg: 'transparent',
            colorWarningBg: 'transparent',
            colorErrorBg: 'transparent',
            colorSuccessBg: 'transparent',
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
