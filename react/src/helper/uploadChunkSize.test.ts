/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { resolveUploadChunkSize } from './uploadChunkSize';
import { describe, expect, it } from 'vitest';

const MiB = 1024 * 1024;

describe('resolveUploadChunkSize', () => {
  it('picks the chunk size from the file size when none is set', () => {
    expect(resolveUploadChunkSize(0, 10 * MiB)).toBe(15 * MiB);
    expect(resolveUploadChunkSize(0, 2 * 1024 * MiB)).toBe(100 * MiB);
    expect(resolveUploadChunkSize(0, 6 * 1024 * MiB)).toBe(200 * MiB);
  });

  it('uses the configured size in MiB for every file', () => {
    expect(resolveUploadChunkSize(32, 10 * MiB)).toBe(32 * MiB);
    expect(resolveUploadChunkSize(32, 6 * 1024 * MiB)).toBe(32 * MiB);
  });
});
