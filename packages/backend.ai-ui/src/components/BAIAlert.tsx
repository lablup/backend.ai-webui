import { theme } from '../theme-shim';
import { Alert, type AlertProps, type GlobalToken } from 'antd';
import { createStyles } from 'antd-style';
import classNames from 'classnames';
import React from 'react';

export interface BAIAlertProps extends AlertProps {
  ghostInfoBg?: boolean;
}
// Token values come in as props from the shim (`theme.useToken()`), not from
// antd-style's own theme context (to-astryx ticket 10; createStyles itself is
// ticket 33).
const useStyle = createStyles(({ css }, { token }: { token: GlobalToken }) => ({
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
  const { token } = theme.useToken();
  const { styles } = useStyle({ token });
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
