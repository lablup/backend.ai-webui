/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { normalizeLegacyMountFields } from './vfolderMounts';

const HEX_ID = '2f9d4a1b6c7e4f0aa1b2c3d4e5f60718';
const UUID_ID = '2f9d4a1b-6c7e-4f0a-a1b2-c3d4e5f60718';

describe('normalizeLegacyMountFields', () => {
  it('converts 32-hex mount_ids to dashed UUIDs and drops the legacy keys', () => {
    const result = normalizeLegacyMountFields({
      sessionName: 'x',
      mount_ids: [HEX_ID],
      vfoldersNameMap: { [HEX_ID]: 'my-data' },
      mount_id_map: { [HEX_ID]: '/home/work/my-data' },
    });

    expect(result).toEqual({
      sessionName: 'x',
      vfolderMounts: [
        {
          vfolderId: UUID_ID,
          name: 'my-data',
          mountDestination: '',
          subpath: '',
        },
      ],
    });
  });

  it.each([
    ['the default path', '/home/work/my-data', ''],
    ['a path under the base path', '/home/work/renamed', 'renamed'],
    ['a path outside the base path', '/data', '/data'],
  ])('unwraps %s back to the raw alias', (_label, mountPath, expected) => {
    const { vfolderMounts } = normalizeLegacyMountFields({
      mount_ids: [HEX_ID],
      vfoldersNameMap: { [HEX_ID]: 'my-data' },
      mount_id_map: { [HEX_ID]: mountPath },
    });

    expect(vfolderMounts?.[0].mountDestination).toBe(expected);
  });

  it('leaves a value without any legacy field untouched', () => {
    const values = { sessionName: 'x', ports: ['8080'] };

    expect(normalizeLegacyMountFields(values)).toBe(values);
  });

  it('drops a legacy key that is present but undefined', () => {
    expect(normalizeLegacyMountFields({ mount_ids: undefined })).toEqual({
      vfolderMounts: [],
    });
  });

  it('keeps an existing vfolderMounts and only drops the legacy fields', () => {
    const vfolderMounts = [
      { vfolderId: UUID_ID, name: 'my-data', subpath: 'train' },
    ];

    expect(
      normalizeLegacyMountFields({
        vfolderMounts,
        mount_ids: ['ffffffffffffffffffffffffffffffff'],
        mount_id_map: {},
      }),
    ).toEqual({ vfolderMounts });
  });

  it('maps an empty mount_ids to an empty vfolderMounts', () => {
    expect(normalizeLegacyMountFields({ mount_ids: [] })).toEqual({
      vfolderMounts: [],
    });
  });
});
