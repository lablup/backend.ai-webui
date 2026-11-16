/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { resolveUploadChunkSize } from './uploadChunkSize';
import { describe, expect, it } from 'vitest';

const MiB = 1024 * 1024;
const GiB = 1024 * MiB;

describe('resolveUploadChunkSize', () => {
  it('picks the chunk size from the file size when none is set', () => {
    expect(resolveUploadChunkSize(0, 10 * MiB)).toBe(15 * MiB);
    expect(resolveUploadChunkSize(0, 100 * MiB - 1)).toBe(15 * MiB);
    expect(resolveUploadChunkSize(0, 100 * MiB)).toBe(50 * MiB);
    expect(resolveUploadChunkSize(0, GiB - 1)).toBe(50 * MiB);
    expect(resolveUploadChunkSize(0, GiB)).toBe(100 * MiB);
    expect(resolveUploadChunkSize(0, 5 * GiB - 1)).toBe(100 * MiB);
    expect(resolveUploadChunkSize(0, 5 * GiB)).toBe(200 * MiB);
  });

  it('uses the configured size in MiB for every file', () => {
    expect(resolveUploadChunkSize(32, 10 * MiB)).toBe(32 * MiB);
    expect(resolveUploadChunkSize(32, 6 * GiB)).toBe(32 * MiB);
    expect(resolveUploadChunkSize(1, 10 * MiB)).toBe(MiB);
  });

  it('rounds a fractional size down to whole MiB', () => {
    expect(resolveUploadChunkSize(32.9, 10 * MiB)).toBe(32 * MiB);
  });

  it('keeps the size-based default below 1 MiB or for a non-finite value', () => {
    for (const value of [0.0000001, 0.001, 0.999, -5, Number.NaN]) {
      expect(resolveUploadChunkSize(value, 10 * MiB)).toBe(15 * MiB);
    }
  });
});
