import { Alert, AlertProps } from 'antd';
import { createStyles } from 'antd-style';
import classNames from 'classnames';
import React from 'react';

export interface BAIAlertProps extends AlertProps {
  ghostInfoBg?: boolean;
}
const useStyle = createStyles(({ css, token }) => ({
  baiAlertDefault: css`
    .ant-alert-message {
      font-size: 14px;
      font-weight: 500;
      margin-bottom: 0;
    }
    .ant-alert-icon {
      font-size: 22px;
    }
  `,
  ghostInfoBg: css`
    &.ant-alert-info {
      background-color: ${token.colorBgContainer};
      border-color: ${token.colorBorder};
    }
  `,
}));

const BAIAlert: React.FC<BAIAlertProps> = ({
  className,
  description,
  ghostInfoBg = true,
  ...otherProps
}) => {
  const { styles } = useStyle();
  return (
    <Alert
      className={classNames(
        styles.baiAlertDefault,
        ghostInfoBg && styles.ghostInfoBg,
        className,
      )}
      // Add empty description to follow the NEO style
      description={description || ' '}
      {...otherProps}
    />
  );
};

export default BAIAlert;
