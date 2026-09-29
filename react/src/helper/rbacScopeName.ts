/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */

/**
 * A role scope with the name fields the RBAC documents select on the resolved
 * `scope` entity — plain (`name`, `email`) or aliased per type. Every field is
 * optional so any Relay-generated selection of them is accepted.
 */
export interface RBACScopeNameSource {
  scopeType?: string | null;
  scope?: {
    basicInfo?: {
      name?: string | null;
      email?: string | null;
      domainName?: string | null;
      projectName?: string | null;
      userEmail?: string | null;
    } | null;
    name?: string | null;
    metadata?: {
      name?: string | null;
      sessionName?: string | null;
      deploymentName?: string | null;
    } | null;
    vfolderName?: string | null;
    resourceGroupName?: string | null;
    registryName?: string | null;
    project?: string | null;
  } | null;
}

/**
 * The scope's human-readable name from its resolved entity, or `null` when the
 * type is unknown or the entity carries no name — callers fall back to the raw
 * scope id. 26.8 answers the enum spelling (`PROJECT`), 26.9 the lowercase name.
 */
export const resolveRBACScopeName = (
  source: RBACScopeNameSource,
): string | null => {
  const scope = source.scope;
  if (!scope || !source.scopeType) return null;
  switch (source.scopeType.toUpperCase()) {
    case 'DOMAIN':
      return scope.basicInfo?.domainName ?? scope.basicInfo?.name ?? null;
    case 'PROJECT':
      return scope.basicInfo?.projectName ?? scope.basicInfo?.name ?? null;
    case 'USER':
      return scope.basicInfo?.email ?? scope.basicInfo?.userEmail ?? null;
    case 'VFOLDER':
      return scope.vfolderName ?? scope.name ?? null;
    case 'SESSION':
      return scope.metadata?.sessionName ?? scope.metadata?.name ?? null;
    case 'MODEL_DEPLOYMENT':
      return scope.metadata?.deploymentName ?? scope.metadata?.name ?? null;
    case 'RESOURCE_GROUP':
      return scope.resourceGroupName ?? scope.name ?? null;
    case 'CONTAINER_REGISTRY':
      if (!scope.registryName) return null;
      return scope.project
        ? `${scope.registryName} - ${scope.project}`
        : scope.registryName;
    default:
      return null;
  }
};
