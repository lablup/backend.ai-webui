import { SemanticColor } from '../helper';
import BAIBadge, { BAIBadgeProps } from './BAIBadge';
import * as _ from 'lodash-es';

/**
 * Status values of an audit log entry, mirroring the backend `AuditLogStatus`
 * enum (`SUCCESS | ERROR | UNKNOWN | RUNNING`). Defined as a hand-written union
 * so the badge stays a presentational component with no Relay dependency.
 */
export type AuditLogStatus = 'SUCCESS' | 'ERROR' | 'UNKNOWN' | 'RUNNING';

export interface BAIAuditLogStatusTagProps extends Omit<
  BAIBadgeProps,
  'text' | 'color' | 'processing'
> {
  status: AuditLogStatus | null;
}

const statusSemanticMap: Record<AuditLogStatus, SemanticColor | undefined> = {
  SUCCESS: 'success',
  ERROR: 'error',
  RUNNING: 'info',
  // Unknown / indeterminate — render an outline-only dot (color undefined).
  UNKNOWN: undefined,
} as const;

/**
 * BAIAuditLogStatusTag - Semantic color-coded status badge for audit log
 * entries. Wraps {@link BAIBadge}, mapping each `AuditLogStatus` to a semantic
 * color (`SUCCESS` → success, `ERROR` → error, `RUNNING` → info + processing
 * ripple, `UNKNOWN` → outline dot). Presentational only, no Relay dependency.
 */
const BAIAuditLogStatusTag = ({
  status,
  ...badgeProps
}: BAIAuditLogStatusTagProps) => {
  'use memo';
  const semanticColor = status ? _.get(statusSemanticMap, status) : undefined;

  return (
    <BAIBadge
      {...badgeProps}
      color={semanticColor}
      processing={status === 'RUNNING'}
      text={status}
      style={{ whiteSpace: 'nowrap', ...badgeProps.style }}
    />
  );
};

export default BAIAuditLogStatusTag;
