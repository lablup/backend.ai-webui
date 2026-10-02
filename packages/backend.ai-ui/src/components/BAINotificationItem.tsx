/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 ui-common `NotificationItem` under its BUI name, with the
 `bai-notification-item` class the notification stack hooks onto.
*/
import {
  NotificationItem,
  type NotificationItemProps,
} from '@lablup/ui-common/components/NotificationItem';
import classNames from 'classnames';
import React from 'react';

export type BAINotificationItemProps = NotificationItemProps;

const BAINotificationItem: React.FC<BAINotificationItemProps> = ({
  className,
  ...itemProps
}) => {
  'use memo';
  return (
    <NotificationItem
      {...itemProps}
      className={classNames('bai-notification-item', className)}
    />
  );
};

export { BAINotificationItem };

export default BAINotificationItem;
