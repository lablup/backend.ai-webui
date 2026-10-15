export interface AuditLogTargetInput<TScope> {
    actionKind?: string | null;
    entityType?: string | null;
    entityId?: string | null;
    lookupKind?: string | null;
    lookupKey?: string | null;
    scopes: ReadonlyArray<TScope>;
    scopeCount: number;
}
interface AuditLogTargetEntity {
    entityType: string | null;
    entityId: string | null;
}
export type AuditLogTarget<TScope> = ({
    kind: 'legacy';
} & AuditLogTargetEntity) | ({
    kind: 'singleEntity';
} & AuditLogTargetEntity) | ({
    kind: 'bulk';
} & AuditLogTargetEntity) | ({
    kind: 'scope';
    scopes: ReadonlyArray<TScope>;
    hiddenScopeCount: number;
} & AuditLogTargetEntity) | {
    kind: 'relation';
    from: TScope;
    to: TScope;
} | {
    kind: 'incompleteRelation';
    scopes: ReadonlyArray<TScope>;
    hiddenScopeCount: number;
} | ({
    kind: 'membership';
    scope: TScope | null;
} & AuditLogTargetEntity) | {
    kind: 'global';
} | ({
    kind: 'lookup';
    lookupKind: string | null;
    lookupKey: string | null;
} & AuditLogTargetEntity);
export declare const resolveAuditLogTarget: <TScope>(input: AuditLogTargetInput<TScope>) => AuditLogTarget<TScope>;
export {};
