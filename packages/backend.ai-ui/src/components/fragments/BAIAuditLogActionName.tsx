/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useBAIi18n } from '../../hooks/useBAIi18n';
import React from 'react';

export interface BAIAuditLogActionNameProps {
  /** The `actionName` of an audit log entry, such as `create_vfolder`. */
  actionName?: string | null;
}

/** An audit log action's label, as the audit log table shows it; the raw name when no label exists. */
const BAIAuditLogActionName: React.FC<BAIAuditLogActionNameProps> = ({
  actionName,
}) => {
  'use memo';
  const { t } = useBAIi18n();
  if (!actionName) return <>-</>;
  return (
    <>
      {t(`comp:BAIAuditLogNodes.ActionName_${actionName}`, {
        defaultValue: actionName,
      })}
    </>
  );
};

export default BAIAuditLogActionName;
