/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 Adapter over ui-common `ConfirmPopover` (FR-4054): keeps the antd
 `Popconfirm` names its call sites pass (`okText`, `cancelText`,
 `onConfirm`) and the `isDanger` / `isOkDisabled` flags that replaced
 `okButtonProps`. The default labels come from ui-common's catalog.
*/
import {
  ConfirmPopover,
  type ConfirmPopoverProps,
} from '@lablup/ui-common/components/ConfirmPopover';
import React from 'react';

export interface BAIPopconfirmProps extends Omit<
  ConfirmPopoverProps,
  | 'onAction'
  | 'actionLabel'
  | 'actionVariant'
  | 'isActionDisabled'
  | 'cancelLabel'
> {
  /** Confirm button label. */
  okText?: string;
  /** Cancel button label. */
  cancelText?: string;
  /** Confirm styled as destructive (antd `okType="danger"`). */
  isDanger?: boolean;
  /** antd `okButtonProps={{ disabled }}`. */
  isOkDisabled?: boolean;
  /**
   * May return a promise: the confirm button stays pending and the popover
   * closes once it resolves.
   */
  onConfirm?: (e: React.MouseEvent<HTMLButtonElement>) => void | Promise<void>;
}

const BAIPopconfirm: React.FC<BAIPopconfirmProps> = ({
  okText,
  cancelText,
  isDanger = false,
  isOkDisabled,
  onConfirm,
  ...confirmPopoverProps
}) => {
  'use memo';
  return (
    <ConfirmPopover
      {...confirmPopoverProps}
      actionLabel={okText}
      cancelLabel={cancelText}
      actionVariant={isDanger ? 'destructive' : 'primary'}
      isActionDisabled={isOkDisabled}
      onAction={onConfirm}
    />
  );
};

export default BAIPopconfirm;
