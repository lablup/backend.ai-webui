import Flex from './Flex';
import { Typography, Progress, theme } from 'antd';
import React from 'react';

export interface ResourceUnitProps {
  name: string;
  displayUnit: string;
  value: string;
  percentage: number;
  color?: string;
  style?: React.CSSProperties;
}

const ResourceUnit: React.FC<ResourceUnitProps> = ({
  name,
  displayUnit,
  value,
  percentage,
  color,
  style,
}) => {
  const { token } = theme.useToken();
  return (
    <Flex direction="column" style={style} align="start" justify="center">
      <Typography.Text
        style={{
          // marginBottom: token.margin,
          fontSize: token.fontSizeLG,
          fontWeight: token.fontWeightStrong,
        }}
      >
        {name}
      </Typography.Text>
      <Flex direction="column" align="start" justify="start">
        <Flex align="baseline" gap="xxs">
          <Typography.Text
            style={{
              fontSize: token.sizeXL,
              fontWeight: token.fontWeightStrong,
              color: color,
            }}
          >
            {value}
          </Typography.Text>
          <Typography.Text
            style={{
              fontSize: token.fontSize,
              color: color,
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
          strokeColor={color}
        />
      </Flex>
    </Flex>
  );
};

export default ResourceUnit;
