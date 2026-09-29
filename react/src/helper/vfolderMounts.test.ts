/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import {
  autoMountedFoldersFrom,
  isAutoMountFolderName,
  normalizeLegacyMountFields,
  ownerEmailFromOwner,
} from './vfolderMounts';
import type { LegacyVFolder } from 'backend.ai-ui';

const HEX_ID = '2f9d4a1b6c7e4f0aa1b2c3d4e5f60718';
const UUID_ID = '2f9d4a1b-6c7e-4f0a-a1b2-c3d4e5f60718';
const OTHER_HEX_ID = '7a1c2b3d4e5f60718293a4b5c6d7e8f9';
const OTHER_UUID_ID = '7a1c2b3d-4e5f-6071-8293-a4b5c6d7e8f9';

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

describe('ownerEmailFromOwner', () => {
  it('returns undefined when the owner block is disabled', () => {
    expect(
      ownerEmailFromOwner({
        enabled: false,
        email: 'owner@lablup.com',
        domainName: 'default',
      }),
    ).toBeUndefined();
  });

  it('returns undefined while an enabled owner block is still half-filled', () => {
    expect(
      ownerEmailFromOwner({
        enabled: true,
        email: 'owner@lablup.com',
        accessKey: undefined,
      }),
    ).toBeUndefined();
  });

  it('returns the email of a complete, enabled owner block', () => {
    expect(
      ownerEmailFromOwner({
        enabled: true,
        email: 'owner@lablup.com',
        accessKey: 'AKIA',
        domainName: 'default',
      }),
    ).toBe('owner@lablup.com');
  });
});

describe('isAutoMountFolderName', () => {
  it('treats a dotfile folder name as auto-mounted', () => {
    expect(isAutoMountFolderName('.bashrc')).toBe(true);
    expect(isAutoMountFolderName('my-data')).toBe(false);
  });
});

describe('autoMountedFoldersFrom', () => {
  const PROJECT_ID = 'c2b0a4de-0d1e-4f5a-9b6c-7d8e9f001122';

  const folder = (overrides: Partial<LegacyVFolder>): LegacyVFolder =>
    ({
      id: HEX_ID,
      name: '.bashrc',
      host: 'local:volume1',
      status: 'ready',
      group: null,
      ownership_type: 'user',
      ...overrides,
    }) as LegacyVFolder;

  it("picks the ready dotfile folders out of the owner's list, with dashed ids", () => {
    expect(
      autoMountedFoldersFrom(
        [
          folder({ name: '.bashrc' }),
          folder({ name: 'owner-data' }),
          folder({ name: '.local', id: OTHER_HEX_ID }),
        ],
        { currentProjectId: PROJECT_ID, mountableHosts: ['local:volume1'] },
      ),
    ).toEqual([
      { vfolderId: UUID_ID, name: '.bashrc' },
      { vfolderId: OTHER_UUID_ID, name: '.local' },
    ]);
  });

  it('excludes a dotfile folder that is not ready', () => {
    expect(
      autoMountedFoldersFrom(
        [folder({ name: '.deleted', status: 'delete-pending' })],
        { currentProjectId: PROJECT_ID, mountableHosts: ['local:volume1'] },
      ),
    ).toEqual([]);
  });

  it('excludes a dotfile folder on a host that does not allow mounting', () => {
    expect(
      autoMountedFoldersFrom(
        [
          folder({ name: '.bashrc', host: 'local:volume1' }),
          folder({
            name: '.ssh',
            host: 'local:no-mount',
            id: OTHER_HEX_ID,
          }),
        ],
        { currentProjectId: PROJECT_ID, mountableHosts: ['local:volume1'] },
      ),
    ).toEqual([{ vfolderId: UUID_ID, name: '.bashrc' }]);
  });

  it('keeps every host when no mountable host list is given', () => {
    expect(
      autoMountedFoldersFrom(
        [folder({ name: '.ssh', host: 'local:no-mount' })],
        {
          currentProjectId: PROJECT_ID,
        },
      ),
    ).toEqual([{ vfolderId: UUID_ID, name: '.ssh' }]);
  });

  it('excludes a project folder owned by another project', () => {
    expect(
      autoMountedFoldersFrom(
        [
          folder({
            name: '.shared',
            ownership_type: 'group',
            group: PROJECT_ID,
          }),
          folder({
            name: '.elsewhere',
            ownership_type: 'group',
            group: 'ffffffff-0000-0000-0000-000000000000',
            id: OTHER_HEX_ID,
          }),
        ],
        { currentProjectId: PROJECT_ID },
      ),
    ).toEqual([{ vfolderId: UUID_ID, name: '.shared' }]);
  });
});
