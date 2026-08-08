import './BAIAlert.css';
import { Alert, type AlertProps } from 'antd';
import classNames from 'classnames';
import React from 'react';

export interface BAIAlertProps extends AlertProps {
  ghostInfoBg?: boolean;
}

const BAIAlert: React.FC<BAIAlertProps> = ({
  className,
  description,
  ghostInfoBg = true,
  ...otherProps
}) => {
  return (
    <Alert
      className={classNames(
        'bai-alert',
        ghostInfoBg && 'bai-alert-ghost-info',
        className,
      )}
      // Add empty description to follow the NEO style
      description={description || ' '}
      {...otherProps}
    />
  );
};

export default BAIAlert;
