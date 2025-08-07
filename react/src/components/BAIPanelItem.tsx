import usePrimaryColors from '../hooks/usePrimaryColors';
import { Progress, ProgressProps, theme, Typography } from 'antd';
import { createStyles } from 'antd-style';
import { BAIFlex } from 'backend.ai-ui';
import _ from 'lodash';
import React, { ReactNode } from 'react';

interface BAIPanelItemProps {
  title: ReactNode | string;
  value: ReactNode | string | number;
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
  const primaryColors = usePrimaryColors();
  return (
    <BAIFlex
      {...props}
      direction="column"
      style={{
        maxWidth: 88,
        textAlign: 'center',
        height: '100%',
        alignContent: 'center',
      }}
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
      <BAIFlex align="baseline" gap={'xxs'}>
        {_.isString(value) || _.isNumber(value) ? (
          <Typography.Text
            strong
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
