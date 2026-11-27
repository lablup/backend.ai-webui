import type { VFolderFilter } from '../__generated__/AdminVFolderNodeListPageQuery.graphql';

const DELETED_STATUSES: ReadonlyArray<string> = [
  // V1 `VirtualFolderNode.status` (kebab-case)
  'delete-pending',
  'delete-ongoing',
  'delete-complete',
  'delete-error',
  // V2 `VFolder.status` (UPPERCASE enum, VFolderOperationStatus)
  'DELETE_PENDING',
  'DELETE_ONGOING',
  'DELETE_COMPLETE',
  'DELETE_ERROR',
];

export const isDeletedCategory = (status?: string | null) => {
  return status != null && DELETED_STATUSES.includes(status);
};

// V2 status filters of the Data pages' tabs; Trash leaves DELETE_COMPLETE out.
const V2_DELETE_STATUSES = [
  'DELETE_PENDING',
  'DELETE_ONGOING',
  'DELETE_ERROR',
  'DELETE_COMPLETE',
] as const;
const V2_TRASH_STATUSES = [
  'DELETE_PENDING',
  'DELETE_ONGOING',
  'DELETE_ERROR',
] as const;

export const VFOLDER_STATUS_FILTER_ACTIVE = {
  status: { notIn: V2_DELETE_STATUSES },
} as const satisfies VFolderFilter;
export const VFOLDER_STATUS_FILTER_TRASH = {
  status: { in: V2_TRASH_STATUSES },
} as const satisfies VFolderFilter;
export const VFOLDER_STATUS_FILTER_DELETE_COMPLETE = {
  status: { equals: 'DELETE_COMPLETE' },
} as const satisfies VFolderFilter;
