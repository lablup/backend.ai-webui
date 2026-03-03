/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import usePrimaryColors from '../hooks/usePrimaryColors';
import { Progress, type ProgressProps, theme, Typography } from 'antd';
import { createStyles } from 'antd-style';
import { BAIFlex, BAIFlexProps } from 'backend.ai-ui';
import _ from 'lodash';
import React, { ReactNode } from 'react';

interface BAIPanelItemProps extends Omit<BAIFlexProps, 'title'> {
  title: ReactNode | string;
  value: ReactNode | string | number;
  unit?: string;
  percent?: number;
  color?: string;
  progressProps?: ProgressProps;
}

const useStyles = createStyles(({ css }) => ({
  progressSteps: css`
    .ant-progress-steps-item {
      border-radius: 100px;
    }
  `,
}));

const BAIPanelItem: React.FC<BAIPanelItemProps> = ({
  title,
  value,
  unit,
  percent,
  color,
  progressProps,
  ...props
}) => {
  const { token } = theme.useToken();
  const { styles } = useStyles();
  const primaryColors = usePrimaryColors();
  return (
    <BAIFlex
      {...props}
      direction="column"
      style={{
        minWidth: 80,
        ...props.style,
      }}
      justify="between"
      align="start"
      wrap="wrap"
    >
      {_.isString(title) ? (
        <Typography.Text
          style={{
            fontSize: token.fontSizeHeading5,
            wordBreak: 'keep-all',
            textAlign: 'left',
          }}
        >
          {title}
        </Typography.Text>
      ) : (
        title
      )}
      <BAIFlex>
        {_.isString(value) || _.isNumber(value) ? (
          <Typography.Text
            style={{
              fontSize: token.fontSizeHeading1,
              color: color ?? primaryColors.primary5,
            }}
          >
            {value}
          </Typography.Text>
        ) : (
          value
        )}
        {unit && <Typography.Text>{unit}</Typography.Text>}
      </BAIFlex>
      {_.isNumber(percent) && (
        <Progress
          percent={percent}
          strokeColor={color ?? token.colorPrimary}
          showInfo={false}
          steps={12}
          size={[5, 12]}
          className={styles.progressSteps}
          {...progressProps}
        />
      )}
    </BAIFlex>
  );
};

export default BAIPanelItem;
