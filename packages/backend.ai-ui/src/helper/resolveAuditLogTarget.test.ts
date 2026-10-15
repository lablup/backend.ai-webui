import { resolveAuditLogTarget } from './resolveAuditLogTarget';

type Scope = { scopeType: string; scopeId: string };

const projectScope: Scope = { scopeType: 'project', scopeId: 'p-1' };
const userScope: Scope = { scopeType: 'user', scopeId: 'u-1' };
const domainScope: Scope = { scopeType: 'domain', scopeId: 'd-1' };

describe('resolveAuditLogTarget', () => {
  test('keeps a record without an action kind as raw entity type and id', () => {
    expect(
      resolveAuditLogTarget<Scope>({
        actionKind: null,
        entityType: 'session',
        entityId: 's-1',
        scopes: [],
        scopeCount: 0,
      }),
    ).toEqual({ kind: 'legacy', entityType: 'session', entityId: 's-1' });
  });

  test('treats an action kind it does not know as a record without one', () => {
    expect(
      resolveAuditLogTarget<Scope>({
        actionKind: 'FUTURE_KIND',
        entityType: 'session',
        entityId: 's-1',
        scopes: [],
        scopeCount: 0,
      }),
    ).toEqual({ kind: 'legacy', entityType: 'session', entityId: 's-1' });
  });

  test('normalizes empty entity values to null', () => {
    expect(
      resolveAuditLogTarget<Scope>({
        entityType: '',
        entityId: '',
        scopes: [],
        scopeCount: 0,
      }),
    ).toEqual({ kind: 'legacy', entityType: null, entityId: null });
  });

  test('SINGLE_ENTITY names the target entity', () => {
    expect(
      resolveAuditLogTarget<Scope>({
        actionKind: 'SINGLE_ENTITY',
        entityType: 'vfolder',
        entityId: 'v-1',
        scopes: [],
        scopeCount: 0,
      }),
    ).toEqual({ kind: 'singleEntity', entityType: 'vfolder', entityId: 'v-1' });
  });

  test('SINGLE_ENTITY without an entity id keeps the id null', () => {
    expect(
      resolveAuditLogTarget<Scope>({
        actionKind: 'SINGLE_ENTITY',
        entityType: 'vfolder',
        entityId: null,
        scopes: [],
        scopeCount: 0,
      }),
    ).toEqual({ kind: 'singleEntity', entityType: 'vfolder', entityId: null });
  });

  test('BULK names the target entity', () => {
    expect(
      resolveAuditLogTarget<Scope>({
        actionKind: 'BULK',
        entityType: 'session',
        entityId: 's-2',
        scopes: [],
        scopeCount: 0,
      }),
    ).toEqual({ kind: 'bulk', entityType: 'session', entityId: 's-2' });
  });

  test('SCOPE carries the scopes and counts the ones not fetched', () => {
    expect(
      resolveAuditLogTarget<Scope>({
        actionKind: 'SCOPE',
        entityType: 'image',
        entityId: 'i-1',
        scopes: [projectScope, userScope],
        scopeCount: 5,
      }),
    ).toEqual({
      kind: 'scope',
      entityType: 'image',
      entityId: 'i-1',
      scopes: [projectScope, userScope],
      hiddenScopeCount: 3,
    });
  });

  test('SCOPE without an affected entity keeps the id null', () => {
    expect(
      resolveAuditLogTarget<Scope>({
        actionKind: 'SCOPE',
        entityType: 'image',
        entityId: null,
        scopes: [projectScope],
        scopeCount: 1,
      }),
    ).toEqual({
      kind: 'scope',
      entityType: 'image',
      entityId: null,
      scopes: [projectScope],
      hiddenScopeCount: 0,
    });
  });

  test('RELATION pairs the first two scopes', () => {
    expect(
      resolveAuditLogTarget<Scope>({
        actionKind: 'RELATION',
        entityType: null,
        entityId: null,
        scopes: [projectScope, userScope],
        scopeCount: 2,
      }),
    ).toEqual({ kind: 'relation', from: projectScope, to: userScope });
  });

  test('RELATION with fewer than two scopes falls back to the scope list', () => {
    expect(
      resolveAuditLogTarget<Scope>({
        actionKind: 'RELATION',
        entityType: null,
        entityId: null,
        scopes: [projectScope],
        scopeCount: 1,
      }),
    ).toEqual({
      kind: 'incompleteRelation',
      scopes: [projectScope],
      hiddenScopeCount: 0,
    });
    expect(
      resolveAuditLogTarget<Scope>({
        actionKind: 'RELATION',
        scopes: [],
        scopeCount: 0,
      }),
    ).toEqual({ kind: 'incompleteRelation', scopes: [], hiddenScopeCount: 0 });
  });

  test('MEMBERSHIP names the entity and the scope it joined or left', () => {
    expect(
      resolveAuditLogTarget<Scope>({
        actionKind: 'MEMBERSHIP',
        entityType: 'user',
        entityId: 'u-2',
        scopes: [domainScope],
        scopeCount: 1,
      }),
    ).toEqual({
      kind: 'membership',
      entityType: 'user',
      entityId: 'u-2',
      scope: domainScope,
    });
  });

  test('MEMBERSHIP without a scope keeps the scope null', () => {
    expect(
      resolveAuditLogTarget<Scope>({
        actionKind: 'MEMBERSHIP',
        entityType: 'user',
        entityId: 'u-2',
        scopes: [],
        scopeCount: 0,
      }),
    ).toEqual({
      kind: 'membership',
      entityType: 'user',
      entityId: 'u-2',
      scope: null,
    });
  });

  test('GLOBAL ignores the entity columns', () => {
    expect(
      resolveAuditLogTarget<Scope>({
        actionKind: 'GLOBAL',
        entityType: 'global',
        entityId: null,
        scopes: [],
        scopeCount: 0,
      }),
    ).toEqual({ kind: 'global' });
  });

  test('LOOKUP carries the key and the entity it resolved to', () => {
    expect(
      resolveAuditLogTarget<Scope>({
        actionKind: 'LOOKUP',
        entityType: 'user',
        entityId: 'u-3',
        lookupKind: 'email',
        lookupKey: 'user@example.com',
        scopes: [],
        scopeCount: 0,
      }),
    ).toEqual({
      kind: 'lookup',
      entityType: 'user',
      entityId: 'u-3',
      lookupKind: 'email',
      lookupKey: 'user@example.com',
    });
  });

  test('LOOKUP miss keeps the entity id null', () => {
    expect(
      resolveAuditLogTarget<Scope>({
        actionKind: 'LOOKUP',
        entityType: 'user',
        entityId: null,
        lookupKind: 'email',
        lookupKey: 'missing@example.com',
        scopes: [],
        scopeCount: 0,
      }),
    ).toEqual({
      kind: 'lookup',
      entityType: 'user',
      entityId: null,
      lookupKind: 'email',
      lookupKey: 'missing@example.com',
    });
  });
});
