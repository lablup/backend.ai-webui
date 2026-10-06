/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 Adapter over ui-common `ConfirmPopover` (FR-4054): keeps the antd
 `Popconfirm` names its call sites pass (`okText`, `cancelText`,
 `onConfirm`) and the `isDanger` / `isOkDisabled` flags that replaced
 `okButtonProps`. The default labels come from ui-common's catalog.
*/
import { useBAILogger } from '../hooks';
import {
  ConfirmPopover,
  type ConfirmPopoverProps,
} from '@lablup/ui-common/components/ConfirmPopover';
import React, { useRef, useState } from 'react';

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
   * closes once it resolves. A rejection is logged and keeps the popover open;
   * surface it to the user from the handler (e.g. a notification).
   */
  onConfirm?: (e: React.MouseEvent<HTMLButtonElement>) => void | Promise<void>;
}

const BAIPopconfirm: React.FC<BAIPopconfirmProps> = ({
  okText,
  cancelText,
  isDanger = false,
  isOkDisabled,
  onConfirm,
  isOpen: controlledIsOpen,
  onOpenChange,
  ...confirmPopoverProps
}) => {
  'use memo';
  const { logger } = useBAILogger();
  const [uncontrolledIsOpen, setUncontrolledIsOpen] = useState(false);
  const isControlled = controlledIsOpen !== undefined;
  const keepOpenRef = useRef(false);

  // ConfirmPopover closes itself right after `onAction` settles, so a failed
  // confirm is swallowed here and the ensuing close request is vetoed.
  const handleConfirm: BAIPopconfirmProps['onConfirm'] = async (e) => {
    try {
      await onConfirm?.(e);
    } catch (error) {
      keepOpenRef.current = true;
      logger.error(error);
    }
  };

  const handleOpenChange = (next: boolean) => {
    if (!next && keepOpenRef.current) {
      keepOpenRef.current = false;
      return;
    }
    if (!isControlled) setUncontrolledIsOpen(next);
    onOpenChange?.(next);
  };

  return (
    <ConfirmPopover
      {...confirmPopoverProps}
      isOpen={isControlled ? controlledIsOpen : uncontrolledIsOpen}
      onOpenChange={handleOpenChange}
      actionLabel={okText}
      cancelLabel={cancelText}
      actionVariant={isDanger ? 'destructive' : 'primary'}
      isActionDisabled={isOkDisabled}
      onAction={handleConfirm}
    />
  );
};

export default BAIPopconfirm;
