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
