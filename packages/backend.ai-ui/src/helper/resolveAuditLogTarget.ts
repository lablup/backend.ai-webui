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

export type AuditLogTarget<TScope> =
  | ({ kind: 'legacy' } & AuditLogTargetEntity)
  | ({ kind: 'singleEntity' } & AuditLogTargetEntity)
  | ({ kind: 'bulk' } & AuditLogTargetEntity)
  | ({
      kind: 'scope';
      scopes: ReadonlyArray<TScope>;
      hiddenScopeCount: number;
    } & AuditLogTargetEntity)
  | { kind: 'relation'; from: TScope; to: TScope }
  | {
      kind: 'incompleteRelation';
      scopes: ReadonlyArray<TScope>;
      hiddenScopeCount: number;
    }
  | ({ kind: 'membership'; scope: TScope | null } & AuditLogTargetEntity)
  | { kind: 'global' }
  | ({
      kind: 'lookup';
      lookupKind: string | null;
      lookupKey: string | null;
    } & AuditLogTargetEntity);

export const resolveAuditLogTarget = <TScope>(
  input: AuditLogTargetInput<TScope>,
): AuditLogTarget<TScope> => {
  const entity: AuditLogTargetEntity = {
    entityType: input.entityType || null,
    entityId: input.entityId || null,
  };
  const hiddenScopeCount = Math.max(input.scopeCount - input.scopes.length, 0);

  switch (input.actionKind) {
    case 'SINGLE_ENTITY':
      return { kind: 'singleEntity', ...entity };
    case 'BULK':
      return { kind: 'bulk', ...entity };
    case 'SCOPE':
      return {
        kind: 'scope',
        ...entity,
        scopes: input.scopes,
        hiddenScopeCount,
      };
    case 'RELATION': {
      const [from, to] = input.scopes;
      return input.scopes.length >= 2
        ? { kind: 'relation', from, to }
        : {
            kind: 'incompleteRelation',
            scopes: input.scopes,
            hiddenScopeCount,
          };
    }
    case 'MEMBERSHIP':
      return { kind: 'membership', ...entity, scope: input.scopes[0] ?? null };
    case 'GLOBAL':
      return { kind: 'global' };
    case 'LOOKUP':
      return {
        kind: 'lookup',
        ...entity,
        lookupKind: input.lookupKind || null,
        lookupKey: input.lookupKey || null,
      };
    default:
      return { kind: 'legacy', ...entity };
  }
};
