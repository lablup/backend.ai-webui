/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
/**
 * Tests for the read-time migration of the launcher's legacy mount fields.
 *
 * Coverage:
 * - 32-hex `mount_ids` become dashed UUIDs
 * - `mount_id_map` absolute paths unwrap back to the raw alias
 * - an absolute alias outside the base path is kept verbatim
 * - no legacy field -> the value is returned untouched
 * - an existing `vfolderMounts` wins and the legacy fields are dropped
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

  it('unwraps an alias under the base path to its relative segment', () => {
    const { vfolderMounts } = normalizeLegacyMountFields({
      mount_ids: [HEX_ID],
      vfoldersNameMap: { [HEX_ID]: 'my-data' },
      mount_id_map: { [HEX_ID]: '/home/work/renamed' },
    });

    expect(vfolderMounts?.[0].mountDestination).toBe('renamed');
  });

  it('keeps an absolute alias outside the base path verbatim', () => {
    const { vfolderMounts } = normalizeLegacyMountFields({
      mount_ids: [HEX_ID],
      mount_id_map: { [HEX_ID]: '/data' },
    });

    expect(vfolderMounts?.[0]).toEqual({
      vfolderId: UUID_ID,
      mountDestination: '/data',
      subpath: '',
    });
  });

  it('leaves a value without any legacy field untouched', () => {
    const values = { sessionName: 'x', ports: ['8080'] };

    expect(normalizeLegacyMountFields(values)).toBe(values);
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
