/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import {
  getVFolderMountConfigStatuses,
  inputToMountDestination,
  mountDestinationToInput,
  toMountCreationConfig,
} from './BAIVFolderMountConfigInput';

// The module keeps its default base path private; restate it for the fixtures.
const DEFAULT_ALIAS_BASE_PATH = '/home/work/';

describe('mountDestinationToInput', () => {
  it.each([
    ['an empty destination', undefined, ''],
    ['an empty destination', '', ''],
    ['the default path', `${DEFAULT_ALIAS_BASE_PATH}my-data`, ''],
    [
      'a path under the base path',
      `${DEFAULT_ALIAS_BASE_PATH}renamed`,
      'renamed',
    ],
    ['a path outside the base path', '/data', '/data'],
  ])('unwraps %s', (_label, mountDestination, expected) => {
    expect(mountDestinationToInput('my-data', mountDestination)).toBe(expected);
  });

  it.each(['', 'renamed', '/data'])(
    'round-trips the alias input %p',
    (aliasInput) => {
      expect(
        mountDestinationToInput(
          'my-data',
          inputToMountDestination('my-data', aliasInput),
        ),
      ).toBe(aliasInput);
    },
  );

  it('honours a custom base path', () => {
    expect(mountDestinationToInput('my-data', '/mnt/my-data', '/mnt/')).toBe(
      '',
    );
    expect(mountDestinationToInput('my-data', '/mnt/other', '/mnt/')).toBe(
      'other',
    );
  });
});

describe('toMountCreationConfig', () => {
  const dataFolder = '11111111-1111-1111-1111-111111111111';
  const sharedFolder = '22222222-2222-2222-2222-222222222222';

  it('maps every entry into mount_ids and mount_id_map', () => {
    expect(
      toMountCreationConfig([
        { vfolderId: dataFolder, name: 'my-data', mountDestination: 'data' },
        { vfolderId: sharedFolder, name: 'shared', mountDestination: '' },
      ]),
    ).toEqual({
      mount_ids: [dataFolder, sharedFolder],
      mount_id_map: {
        [dataFolder]: '/home/work/data',
        [sharedFolder]: '/home/work/shared',
      },
    });
  });

  it('adds mount_options only for the entries that carry a subpath', () => {
    const config = toMountCreationConfig([
      {
        vfolderId: dataFolder,
        name: 'my-data',
        mountDestination: '',
        subpath: 'dataset/train',
      },
      {
        vfolderId: sharedFolder,
        name: 'shared',
        mountDestination: '',
        subpath: '',
      },
    ]);
    expect(config.mount_options).toEqual({
      [dataFolder]: { subpath: 'dataset/train' },
    });
  });

  it('drops a whitespace-only subpath instead of sending it', () => {
    expect(
      toMountCreationConfig([
        {
          vfolderId: dataFolder,
          name: 'my-data',
          mountDestination: '',
          subpath: '   ',
        },
      ]),
    ).not.toHaveProperty('mount_options');
  });

  it('returns empty mount fields for an empty value', () => {
    expect(toMountCreationConfig(undefined)).toEqual({
      mount_ids: [],
      mount_id_map: {},
    });
  });
});

describe('getVFolderMountConfigStatuses', () => {
  const dataFolder = '11111111-1111-1111-1111-111111111111';
  const sharedFolder = '22222222-2222-2222-2222-222222222222';

  it('flags an alias that resolves onto an auto-mounted folder default path', () => {
    const statuses = getVFolderMountConfigStatuses(
      [{ vfolderId: dataFolder, name: 'my-data', mountDestination: '.config' }],
      { autoMountedFolders: [{ name: '.config' }] },
    );
    expect(statuses[dataFolder]).toMatchObject({
      mountDestination: '/home/work/.config',
      aliasError: 'overlappingWithAutoMount',
    });
  });

  it('leaves an alias alone when no auto-mounted folder claims its path', () => {
    const statuses = getVFolderMountConfigStatuses(
      [{ vfolderId: dataFolder, name: 'my-data', mountDestination: 'data' }],
      { autoMountedFolders: [{ name: '.config' }] },
    );
    expect(statuses[dataFolder].aliasError).toBeUndefined();
  });

  it('reports a plain overlap between two user aliases', () => {
    const statuses = getVFolderMountConfigStatuses([
      { vfolderId: dataFolder, name: 'my-data', mountDestination: 'shared' },
      {
        vfolderId: sharedFolder,
        name: 'shared-data',
        mountDestination: 'shared',
      },
    ]);
    expect(statuses[dataFolder].aliasError).toBe('overlapping');
    expect(statuses[sharedFolder].aliasError).toBe('overlapping');
  });
});
