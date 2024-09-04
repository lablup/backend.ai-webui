import Flex from './Flex';
import { Typography, Progress, theme } from 'antd';
import React from 'react';

export interface ResourceUnitProps {
  name: string;
  displayUnit: string;
  value: number;
  percentage: number;
}

const ResourceUnit: React.FC<ResourceUnitProps> = ({
  name,
  displayUnit,
  value,
  percentage,
}) => {
  const { token } = theme.useToken();
  return (
    <Flex
      direction="column"
      style={{
        // width: 88,
        // height: 70,
        marginTop: 14,
      }}
      align="start"
      justify="center"
    >
      <Typography.Text
        style={{
          marginBottom: token.margin,
          fontSize: token.fontSizeLG,
          fontWeight: token.fontWeightStrong,
        }}
      >
        {name}
      </Typography.Text>
      <Flex direction="column" align="start" justify="start" gap={8}>
        <Flex align="baseline">
          <Typography.Text
            style={{
              fontSize: token.sizeXL,
              fontWeight: token.fontWeightStrong,
              color: '#00BD9B',
            }}
          >
            {value}
          </Typography.Text>
          <Typography.Text
            style={{
              fontSize: token.fontSize,
            }}
          >
            {displayUnit}
          </Typography.Text>
        </Flex>
        <Progress
          percent={percentage}
          steps={12}
          showInfo={false}
          size={[5, 12]}
          strokeColor="#00BD9B"
        />
      </Flex>
    </Flex>
  );
};

export default ResourceUnit;
