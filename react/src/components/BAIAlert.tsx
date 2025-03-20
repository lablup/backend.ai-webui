import { Alert } from 'antd';
import React, { PropsWithChildren } from 'react';

interface BAIAlertProps extends PropsWithChildren {
  message?: string;
  description?: string;
  infoType?: BAIAlertType;
}

type BAIAlertType = 'info' | 'success' | 'warning' | 'error';

const BAIAlert: React.FC<BAIAlertProps> = ({
  message = '',
  description = '',
  infoType = 'info',
  children,
}) => {
  return (
    <div>
      <Alert
        message={message}
        description={description}
        type={infoType}
        showIcon
      />
      {children}
    </div>
  );
};

export default BAIAlert;
