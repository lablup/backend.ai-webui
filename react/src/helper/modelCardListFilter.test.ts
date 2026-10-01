/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import {
  scopeModelCardListFilter,
  unscopeModelCardListFilter,
} from './modelCardListFilter';
import { describe, expect, it } from 'vitest';

const domainCondition = { domainName: { equals: 'default' } };

describe('scopeModelCardListFilter', () => {
  it('sends only the domain condition when the user set no filter', () => {
    expect(scopeModelCardListFilter(undefined, 'default')).toEqual(
      domainCondition,
    );
    expect(scopeModelCardListFilter(null, 'default')).toEqual(domainCondition);
  });

  it('ANDs a simple user filter with the domain condition', () => {
    expect(
      scopeModelCardListFilter({ name: { contains: 'llama' } }, 'default'),
    ).toEqual({ ...domainCondition, AND: [{ name: { contains: 'llama' } }] });
  });

  it('nests an OR user filter under AND so it cannot widen past the domain', () => {
    const userFilter = {
      OR: [{ name: { contains: 'a' } }, { task: { equals: 'chat' } }],
    };
    expect(scopeModelCardListFilter(userFilter, 'default')).toEqual({
      ...domainCondition,
      AND: [userFilter],
    });
  });

  it('keeps a user domain condition inside AND instead of replacing ours', () => {
    const stale = { domainName: { equals: 'other' }, name: { equals: 'x' } };
    expect(scopeModelCardListFilter(stale, 'default')).toEqual({
      ...domainCondition,
      AND: [stale],
    });
  });

  it('is idempotent and follows a domain change', () => {
    const user = { name: { contains: 'llama' } };
    const scoped = scopeModelCardListFilter(user, 'default');
    expect(scopeModelCardListFilter(scoped, 'default')).toEqual(scoped);
    expect(scopeModelCardListFilter(scoped, 'frontend')).toEqual({
      domainName: { equals: 'frontend' },
      AND: [user],
    });
  });

  it('passes the user filter through when there is no domain to scope to', () => {
    const user = { name: { contains: 'llama' } };
    expect(scopeModelCardListFilter(user, undefined)).toEqual(user);
    expect(scopeModelCardListFilter(user, '')).toEqual(user);
    expect(scopeModelCardListFilter(undefined, undefined)).toBeUndefined();
  });
});

describe('unscopeModelCardListFilter', () => {
  it('returns the user filter from a scoped one', () => {
    const user = { OR: [{ name: { contains: 'a' } }] };
    expect(
      unscopeModelCardListFilter(scopeModelCardListFilter(user, 'default')),
    ).toEqual(user);
    expect(
      unscopeModelCardListFilter(
        scopeModelCardListFilter(undefined, 'default'),
      ),
    ).toBeUndefined();
  });

  it('leaves an unscoped user filter as is', () => {
    const user = {
      AND: [{ name: { contains: 'a' } }, { task: { equals: 'x' } }],
    };
    expect(unscopeModelCardListFilter(user)).toBe(user);
    expect(unscopeModelCardListFilter(undefined)).toBeUndefined();
  });
});
