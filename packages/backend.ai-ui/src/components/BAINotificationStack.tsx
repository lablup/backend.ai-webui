/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 ui-common `NotificationStack` in the WebUI's place: the
 `bai-notification-stack` test id e2e reads, and the z-index ladder and
 header height from `BAINotificationStack.css`. `useBAINotification` feeds it
 through `toBAINotificationStackItems`.
*/
import './BAINotificationStack.css';
import {
  NotificationStack,
  type NotificationStackItem,
  type NotificationStackProps,
} from '@lablup/ui-common/components/NotificationStack';
import React from 'react';

export type BAINotificationStackItem = NotificationStackItem;
export type BAINotificationStackProps = NotificationStackProps;

const BAINotificationStack: React.FC<BAINotificationStackProps> = ({
  className,
  'data-testid': testId = 'bai-notification-stack',
  ...props
}) => {
  'use memo';
  return (
    <NotificationStack
      {...props}
      data-testid={testId}
      className={['bai-notification-stack', className]
        .filter(Boolean)
        .join(' ')}
    />
  );
};

export default BAINotificationStack;
