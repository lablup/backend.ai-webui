/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import {
  isDomainScopeIdPending,
  isDomainScopeType,
  resolveCreateRoleScopeId,
} from './RoleFormModal';
import { describe, expect, it } from 'vitest';

const DOMAIN_ID = '14b593d9-6bbc-42ae-a3a9-c0c29391474b';
const PROJECT_ID = '11111111-2222-3333-4444-555555555555';

describe('isDomainScopeType', () => {
  it('matches DOMAIN in either spelling', () => {
    expect(isDomainScopeType('domain')).toBe(true);
    expect(isDomainScopeType('DOMAIN')).toBe(true);
    expect(isDomainScopeType('project')).toBe(false);
    expect(isDomainScopeType(undefined)).toBe(false);
  });
});

describe('resolveCreateRoleScopeId', () => {
  it('uses the current domain uuid for a DOMAIN scope, never the domain name', () => {
    expect(resolveCreateRoleScopeId('domain', undefined, DOMAIN_ID)).toBe(
      DOMAIN_ID,
    );
    expect(resolveCreateRoleScopeId('domain', 'default', DOMAIN_ID)).toBe(
      DOMAIN_ID,
    );
  });

  it('returns undefined for a DOMAIN scope when the domain uuid is unknown', () => {
    expect(resolveCreateRoleScopeId('domain', 'default', null)).toBeUndefined();
    expect(
      resolveCreateRoleScopeId('domain', undefined, undefined),
    ).toBeUndefined();
  });

  it('uses the picked id for other scope types', () => {
    expect(resolveCreateRoleScopeId('project', PROJECT_ID, DOMAIN_ID)).toBe(
      PROJECT_ID,
    );
    expect(
      resolveCreateRoleScopeId('project', undefined, DOMAIN_ID),
    ).toBeUndefined();
  });
});

describe('isDomainScopeIdPending', () => {
  it('is pending only while a DOMAIN scope waits on the domain uuid', () => {
    expect(isDomainScopeIdPending('domain', { status: 'loading' })).toBe(true);
    expect(isDomainScopeIdPending('DOMAIN', { status: 'loading' })).toBe(true);
  });

  it('is not pending once the uuid is known or the fetch failed', () => {
    expect(
      isDomainScopeIdPending('domain', {
        status: 'ready',
        domainId: DOMAIN_ID,
      }),
    ).toBe(false);
    expect(isDomainScopeIdPending('domain', { status: 'error' })).toBe(false);
    expect(isDomainScopeIdPending('domain', { status: 'idle' })).toBe(false);
  });

  it('never holds back another scope type', () => {
    expect(isDomainScopeIdPending('project', { status: 'loading' })).toBe(
      false,
    );
    expect(isDomainScopeIdPending(undefined, { status: 'loading' })).toBe(
      false,
    );
  });
});
