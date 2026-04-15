/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type { GraphQLFilter } from 'backend.ai-ui';

/**
 * Usage-mode preset filters for the data pages.
 * Mirrors the legacy `getUsageModeFilter` ILIKE strings, expressed as
 * `VFolderFilter` object literals.
 */
export type VFolderUsageModePreset =
  | 'all'
  | 'automount'
  | 'general'
  | 'pipeline'
  | 'model';

export function getVFolderUsageModePresetFilter(
  mode: VFolderUsageModePreset | string | undefined,
): GraphQLFilter | undefined {
  switch (mode) {
    case undefined:
    case 'all':
      return undefined;
    case 'automount':
      // name ilike ".%"
      return { name: { startsWith: '.' } };
    case 'general':
      // (! name ilike ".%") & (usage_mode == "general")
      return {
        AND: [
          { NOT: { name: { startsWith: '.' } } },
          { usageMode: { in: ['GENERAL'] } },
        ],
      };
    case 'pipeline':
      return { usageMode: { in: ['DATA'] } };
    case 'model':
      return { usageMode: { in: ['MODEL'] } };
    default:
      return undefined;
  }
}

export const VFOLDER_ACTIVE_STATUSES = ['READY', 'CLONING'] as const;
export const VFOLDER_DELETED_STATUSES = [
  'DELETE_PENDING',
  'DELETE_ONGOING',
  'DELETE_COMPLETE',
  'DELETE_ERROR',
] as const;

/**
 * Status-category preset filters used by the Active / Trash tab counts.
 */
export const VFOLDER_STATUS_CATEGORY_FILTERS = {
  active: {
    status: { in: [...VFOLDER_ACTIVE_STATUSES] },
  } as GraphQLFilter,
  deleted: {
    status: { in: [...VFOLDER_DELETED_STATUSES] },
  } as GraphQLFilter,
} as const;

export type VFolderStatusCategory =
  keyof typeof VFOLDER_STATUS_CATEGORY_FILTERS;

export const isDeletedVFolderStatus = (
  status: string | null | undefined,
): boolean => {
  if (!status) return false;
  return (VFOLDER_DELETED_STATUSES as readonly string[]).includes(status);
};

/**
 * `VFolderOrderField` enum values that the list page allows sorting by.
 * Used by the table sorter → `orderBy` mapping.
 */
export const availableVFolderOrderFields = [
  'NAME',
  'CREATED_AT',
  'STATUS',
  'USAGE_MODE',
  'HOST',
] as const;

export type VFolderOrderFieldKey = (typeof availableVFolderOrderFields)[number];

/**
 * Table sort-column key → `VFolderOrderField` enum value.
 * Keys match column `dataIndex`/`key` used in `VFolderList.tsx`.
 */
export const VFOLDER_SORT_KEY_TO_ORDER_FIELD: Record<
  string,
  VFolderOrderFieldKey
> = {
  name: 'NAME',
  created_at: 'CREATED_AT',
  createdAt: 'CREATED_AT',
  status: 'STATUS',
  usage_mode: 'USAGE_MODE',
  usageMode: 'USAGE_MODE',
  host: 'HOST',
};

/**
 * Combine an arbitrary number of `VFolderFilter` object literals into a
 * single filter using `AND`. Undefined entries are skipped. Returns
 * `undefined` if nothing is left.
 */
export function mergeVFolderFilters(
  ...filters: Array<GraphQLFilter | undefined>
): GraphQLFilter | undefined {
  const nonEmpty = filters.filter(
    (f): f is GraphQLFilter => !!f && Object.keys(f).length > 0,
  );
  if (nonEmpty.length === 0) return undefined;
  if (nonEmpty.length === 1) return nonEmpty[0];
  return { AND: nonEmpty };
}
