/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import {
  DEFAULT_ALIAS_BASE_PATH,
  inputToMountDestination,
  mountDestinationToInput,
} from './BAIVFolderMountConfigInput';

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
