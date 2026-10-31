/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type { DashboardScope } from './types';

/**
 * Whose data a card reads (ADR 0018): the viewer's own in the page's project,
 * one project, or every project of the current domain. A card shared by
 * several pages picks its fields from this and keeps one UI.
 */
export type CardScope =
  | { kind: 'mine'; projectId: string }
  | { kind: 'project'; projectId: string }
  | { kind: 'domain'; domainId: string; domainName: string };

export type CardScopeKind = CardScope['kind'];

/** The scope kind of a page, known even before its project resolves. */
export const cardScopeKind = (scope: DashboardScope): CardScopeKind =>
  scope.kind === 'mine'
    ? 'mine'
    : scope.projectIds === 'all'
      ? 'domain'
      : 'project';

/** The card scope of a page; null while the page has no project. */
export const resolveCardScope = (scope: DashboardScope): CardScope | null => {
  if (scope.kind === 'mine') {
    return scope.projectId
      ? { kind: 'mine', projectId: scope.projectId }
      : null;
  }
  if (scope.projectIds === 'all') {
    return scope.domain.id
      ? {
          kind: 'domain',
          domainId: scope.domain.id,
          domainName: scope.domain.name,
        }
      : null;
  }
  const projectId = scope.projectIds[0];
  return projectId ? { kind: 'project', projectId } : null;
};

/** The legacy `scope_id` of the scope, for the graphene fields a card still reads. */
export const legacyScopeId = (scope: CardScope): string => {
  switch (scope.kind) {
    case 'mine':
    case 'project':
      return `project:${scope.projectId}`;
    case 'domain':
      return `domain:${scope.domainName}`;
  }
};

/** The domain of the superadmin page; null on every other page. */
export const domainOf = (
  scope: DashboardScope,
): Extract<CardScope, { kind: 'domain' }> | null => {
  const cardScope = resolveCardScope(scope);
  return cardScope?.kind === 'domain' ? cardScope : null;
};
