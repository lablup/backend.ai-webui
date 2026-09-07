import { BAIBadgeProps } from './BAIBadge';
/**
 * Status values of an audit log entry, mirroring the backend `AuditLogStatus`
 * enum (`SUCCESS | ERROR | UNKNOWN | RUNNING`). Defined as a hand-written union
 * so the badge stays a presentational component with no Relay dependency.
 */
export type AuditLogStatus = 'SUCCESS' | 'ERROR' | 'UNKNOWN' | 'RUNNING';
export interface BAIAuditLogStatusTagProps extends Omit<BAIBadgeProps, 'text' | 'color' | 'processing'> {
    status: AuditLogStatus | null;
}
/**
 * BAIAuditLogStatusTag - Semantic color-coded status badge for audit log
 * entries. Wraps {@link BAIBadge}, mapping each `AuditLogStatus` to a semantic
 * color (`SUCCESS` → success, `ERROR` → error, `RUNNING` → info + processing
 * ripple, `UNKNOWN` → outline dot). Presentational only, no Relay dependency.
 */
declare const BAIAuditLogStatusTag: ({ status, ...badgeProps }: BAIAuditLogStatusTagProps) => import("react").JSX.Element;
export default BAIAuditLogStatusTag;
