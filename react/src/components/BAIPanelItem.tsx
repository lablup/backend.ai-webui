import Flex from './Flex';
import { Progress, theme, Typography } from 'antd';
import _ from 'lodash';
import React, { ReactNode } from 'react';

interface BAIPanelItemProps {
  title: ReactNode | string;
  value: string | number;
  unit?: string;
  percent?: number;
  color?: string;
}

const BAIPanelItem: React.FC<BAIPanelItemProps> = ({
  title,
  value,
  unit,
  percent,
  color,
  ...props
}) => {
  const { token } = theme.useToken();
  return (
    <Flex {...props} direction="column" align="start">
      {_.isString(title) ? (
        <Typography.Title level={5}>{title}</Typography.Title>
      ) : (
        title
      )}
      <Flex>
        <Typography.Text
          strong
          style={{
            fontSize: token.fontSizeXL,
            color: color ?? token.colorPrimary,
          }}
        >
          {value}
        </Typography.Text>
        {unit && <Typography.Text>{unit}</Typography.Text>}
      </Flex>
      {_.isNumber(percent) && (
        <Progress
          percent={percent}
          strokeColor={color ?? token.colorPrimary}
          showInfo={false}
        />
      )}
    </Flex>
  );
};

export default BAIPanelItem;
