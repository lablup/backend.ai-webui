import Flex from './Flex';
import { Progress, ProgressProps, theme, Typography } from 'antd';
import { createStyles } from 'antd-style';
import _ from 'lodash';
import React, { ReactNode } from 'react';

interface BAIPanelItemProps {
  title: ReactNode | string;
  value: string | number;
  unit?: string;
  percent?: number;
  color?: string;
  progressProps?: ProgressProps;
}

const useStyles = createStyles(({ css, token }) => ({
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
  return (
    <Flex
      {...props}
      direction="column"
      style={{ maxWidth: 88, textAlign: 'center', height: '100%' }}
      justify="between"
      wrap="wrap"
    >
      {_.isString(title) ? (
        <Typography.Text
          strong
          style={{
            fontSize: token.fontSizeHeading5,
            wordBreak: 'keep-all',
          }}
        >
          {title}
        </Typography.Text>
      ) : (
        title
      )}
      <Flex align="baseline" gap={'xxs'}>
        <Typography.Text
          strong
          style={{
            fontSize: token.fontSizeHeading1,
            color: color ?? token.Layout?.headerBg,
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
          steps={12}
          size={[5, 12]}
          className={styles.progressSteps}
          {...progressProps}
        />
      )}
    </Flex>
  );
};

export default BAIPanelItem;
