import { ConfigProvider, Tag } from 'antd';
import { TagProps } from 'antd/lib/tag';
import React from 'react';

interface BAITagProps extends TagProps {}

const BAITag: React.FC<BAITagProps> = ({ ...tagProps }) => {
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
      <Tag {...tagProps} />
    </ConfigProvider>
  );
};

export default BAITag;
