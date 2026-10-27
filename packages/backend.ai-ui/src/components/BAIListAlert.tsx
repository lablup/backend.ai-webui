/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 ui-common `ListBanner` under its BUI name (FR-4096), with BAIAlert's
 antd-shaped props mapped the way BAIAlert maps them (`toBannerProps`).
*/
import { toBannerProps, type BAIAlertProps } from './BAIAlert';
import {
  ListBanner,
  type ListBannerItem,
} from '@lablup/ui-common/components/ListBanner';
import React from 'react';

export type BAIListAlertItem = ListBannerItem;

export interface BAIListAlertProps extends Omit<BAIAlertProps, 'description'> {
  items: Array<BAIListAlertItem>;
  /** Height at which the list scrolls. Defaults to 165 (about seven rows). */
  maxHeight?: number | string;
}

/**
 * An alert that lists items (e.g. the resources a modal acts on) and scrolls
 * the list past `maxHeight`. Say how many items there are in `title`.
 */
const BAIListAlert: React.FC<BAIListAlertProps> = ({
  items,
  maxHeight,
  ...alertProps
}) => {
  'use memo';
  const { description: _description, ...bannerProps } =
    toBannerProps(alertProps);
  return <ListBanner {...bannerProps} items={items} maxHeight={maxHeight} />;
};

export default BAIListAlert;
