/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
/** `chunkSizeMiB` (System Settings) when positive, else a size-based default. */
export const resolveUploadChunkSize = (
  chunkSizeMiB: number,
  fileSize: number,
): number =>
  chunkSizeMiB > 0 ? chunkSizeMiB * 1024 * 1024 : getOptimalChunkSize(fileSize);

export const getOptimalChunkSize = (fileSize: number): number => {
  const MB = 1024 * 1024;

  if (fileSize >= 5 * 1024 * MB) {
    return 200 * MB;
  } else if (fileSize >= 1 * 1024 * MB) {
    return 100 * MB;
  } else if (fileSize >= 100 * MB) {
    return 50 * MB;
  } else {
    return 15 * MB;
  }
};
