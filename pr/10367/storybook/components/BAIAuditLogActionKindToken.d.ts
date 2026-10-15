import { TokenProps } from '@lablup/ui-common/Token';
export type AuditLogActionKind = 'SINGLE_ENTITY' | 'BULK' | 'SCOPE' | 'RELATION' | 'MEMBERSHIP' | 'GLOBAL' | 'LOOKUP';
export declare const AUDIT_LOG_ACTION_KINDS: ReadonlyArray<AuditLogActionKind>;
export declare const useAuditLogActionKindOptions: () => {
    value: AuditLogActionKind;
    label: string;
}[];
export interface BAIAuditLogActionKindTokenProps extends Omit<TokenProps, 'label'> {
    actionKind: string;
}
declare const BAIAuditLogActionKindToken: ({ actionKind, ...tokenProps }: BAIAuditLogActionKindTokenProps) => import("react").JSX.Element;
export default BAIAuditLogActionKindToken;
