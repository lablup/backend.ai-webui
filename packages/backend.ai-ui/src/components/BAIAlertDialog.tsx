/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 `BAIAlertDialog` — ui-common `AlertModal` under its BUI name (FR-4087). Its
 props were already Astryx-shaped, so nothing is mapped.

 NOT the irreversible-delete tier: that is `BAIDeleteConfirmModal` with
 `requireConfirmInput` (`.claude/rules/destructive-confirmation.md`).
*/
import {
  AlertModal,
  type AlertModalProps,
} from '@lablup/ui-common/components/AlertModal';
import React from 'react';

export type BAIAlertDialogProps = AlertModalProps;

const BAIAlertDialog: React.FC<BAIAlertDialogProps> = (props) => {
  'use memo';
  return <AlertModal {...props} />;
};

BAIAlertDialog.displayName = 'BAIAlertDialog';

export default BAIAlertDialog;
