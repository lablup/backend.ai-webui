/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { WEBUI_SETTING_DEFINITIONS } from '../../../helper/webuiSettings';
import { toSizeString, toStoredSize } from './sizeSetting';
import { describe, expect, it } from 'vitest';

const sizeOf = (key: string) => {
  const size = WEBUI_SETTING_DEFINITIONS.find((d) => d.key === key)?.size;
  if (!size) throw new Error(`${key} has no size definition`);
  return size;
};
const chunkSize = sizeOf('fileUploadChunkSize');
const maxFileUploadSize = sizeOf('maxFileUploadSize');

describe('toStoredSize', () => {
  it('converts a size string into the stored unit', () => {
    expect(toStoredSize('64m', chunkSize)).toBe(64);
    expect(toStoredSize('2g', maxFileUploadSize)).toBe(2 * 1024 ** 3);
  });

  it('clamps a unit switch that leaves the range to the size bounds', () => {
    // 512 MiB switched to GiB keeps the number: 512 GiB.
    expect(toStoredSize('512g', chunkSize)).toBe(1024);
    expect(toStoredSize('50t', maxFileUploadSize)).toBe(100 * 1024 ** 3);
    expect(toStoredSize('0.5m', maxFileUploadSize)).toBe(1024 ** 2);
  });

  it('stores nothing for an empty or non-positive size', () => {
    expect(toStoredSize('', chunkSize)).toBe(0);
    expect(toStoredSize(null, chunkSize)).toBe(0);
    expect(toStoredSize('0m', chunkSize)).toBe(0);
  });

  it('keeps every clamped value valid for its definition', () => {
    for (const key of ['fileUploadChunkSize', 'maxFileUploadSize']) {
      const definition = WEBUI_SETTING_DEFINITIONS.find((d) => d.key === key)!;
      const stored = toStoredSize('999t', definition.size!);
      expect(stored).toBeLessThanOrEqual(definition.max!);
      expect(stored).toBeGreaterThanOrEqual(definition.min!);
    }
  });
});

describe('toSizeString', () => {
  it('shows the stored number in the largest unit it fills', () => {
    expect(toSizeString(1024, chunkSize)).toBe('1g');
    expect(toSizeString(512, chunkSize)).toBe('512m');
  });
});

describe('memory sizes', () => {
  it('stores the session memory caps in GiB, a fraction included', () => {
    expect(toStoredSize('2t', sizeOf('maxMemoryPerContainer'))).toBe(2048);
    expect(toStoredSize('512m', sizeOf('maxShmPerContainer'))).toBe(0.5);
    expect(toSizeString(0.5, sizeOf('maxShmPerContainer'))).toBe('512m');
  });

  it('caps the session memory sizes at the keypair resource policy bound (300 PiB)', () => {
    expect(toStoredSize('400p', sizeOf('maxMemoryPerContainer'))).toBe(
      300 * 1024 * 1024,
    );
    expect(toSizeString(300 * 1024 * 1024, sizeOf('maxShmPerContainer'))).toBe(
      '300p',
    );
  });
});
