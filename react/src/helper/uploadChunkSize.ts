/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
const MiB = 1024 * 1024;

/**
 * `chunkSizeMiB` (System Settings) in whole MiB when it is at least 1, else a
 * size-based default: a sub-MiB chunk would stall or flood the tus upload.
 */
export const resolveUploadChunkSize = (
  chunkSizeMiB: number,
  fileSize: number,
): number => {
  const wholeMiB = Math.floor(chunkSizeMiB);
  return Number.isFinite(wholeMiB) && wholeMiB >= 1
    ? wholeMiB * MiB
    : getOptimalChunkSize(fileSize);
};

const getOptimalChunkSize = (fileSize: number): number => {
  if (fileSize >= 5 * 1024 * MiB) {
    return 200 * MiB;
  } else if (fileSize >= 1 * 1024 * MiB) {
    return 100 * MiB;
  } else if (fileSize >= 100 * MiB) {
    return 50 * MiB;
  } else {
    return 15 * MiB;
  }
};
