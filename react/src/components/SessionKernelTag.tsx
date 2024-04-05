import { useBackendAIImageMetaData } from '../hooks';
import DoubleTag from './DoubleTag';
import Flex from './Flex';
import { Tag } from 'antd';
import React from 'react';

const SessionKernelTag: React.FC<{
  image: string | null;
  style?: React.CSSProperties;
  border?: boolean;
}> = ({ image, style = {} }, bordered) => {
  image = image || '';
  const [
    ,
    {
      getImageAliasName,
      getBaseVersion,
      getBaseImage,
      getArchitecture,
      tagAlias,
    },
  ] = useBackendAIImageMetaData();

  return (
    <>
      <DoubleTag
        values={[
          {
            label: tagAlias(getImageAliasName(image)),
            color: 'blue',
          },
          {
            label: getBaseVersion(image),
            color: 'green',
          },
        ]}
      />
      <Tag color="green">{tagAlias(getBaseImage(image))}</Tag>
      <Tag color="green">{tagAlias(getArchitecture(image))}</Tag>
    </>
  );
};

export default React.memo(SessionKernelTag);
