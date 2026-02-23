/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { Progress, theme } from 'antd';
import _ from 'lodash';
import { NotificationState } from 'src/hooks/useBAINotification';

interface BAINotificationBackgroundProgressProps {
  backgroundTask: NotificationState['backgroundTask'];
  showDate?: boolean;
}

const BAINotificationBackgroundProgress: React.FC<
  BAINotificationBackgroundProgressProps
> = ({ backgroundTask, showDate }) => {
  'use memo';

  const { token } = theme.useToken();

  return _.isNumber(backgroundTask?.percent) ? (
    <Progress
      size="small"
      showInfo={false}
      percent={backgroundTask.percent}
      strokeColor={
        backgroundTask.status === 'rejected'
          ? token.colorTextDisabled
          : undefined
      }
      style={{
        margin: 0,
        opacity: backgroundTask.status === 'resolved' && showDate ? 0 : 1,
      }}
    />
  ) : null;
};

export default BAINotificationBackgroundProgress;
