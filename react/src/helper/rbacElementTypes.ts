/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */

// Since manager 26.9.0 an RBAC scope/entity type is a lowercase snake_case
// name (`project`, `resource_group`); the `rbac.types.*` labels keep the
// uppercase spelling of the retired `RBACElementType` enum.
export const rbacTypeI18nKey = (entityType: string) =>
  `rbac.types.${entityType.toUpperCase()}`;

/**
 * A type's RBAC label, the raw name when none exists. Audit log entity types
 * (`vfolder`, `resource_group`, `artifact_registry`) share the RBAC spelling.
 */
export const rbacTypeLabel = (
  t: (key: string, options: { defaultValue: string }) => string,
  entityType: string,
) => t(rbacTypeI18nKey(entityType), { defaultValue: entityType });
