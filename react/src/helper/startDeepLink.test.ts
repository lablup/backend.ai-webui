/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { parseStartDeepLink, withoutStartDeepLink } from './startDeepLink';

const urlLink = (data: unknown) =>
  `?${new URLSearchParams({ type: 'url', data: JSON.stringify(data) })}`;

describe('parseStartDeepLink', () => {
  it('reads the import link with its url and branch', () => {
    expect(
      parseStartDeepLink(
        urlLink({ url: 'https://github.com/a/b.ipynb', branch: 'main' }),
      ),
    ).toEqual({
      kind: 'url',
      data: { url: 'https://github.com/a/b.ipynb', branch: 'main' },
    });
  });

  it('turns the legacy bare GitHub path into a full URL', () => {
    expect(parseStartDeepLink('?owner/repo/blob/main/nb.ipynb')).toEqual({
      kind: 'legacyGithub',
      data: { url: 'https://github.com/owner/repo/blob/main/nb.ipynb' },
    });
  });

  it('ignores other queries and malformed data', () => {
    expect(parseStartDeepLink('')).toBeNull();
    expect(parseStartDeepLink('?rg=default&from=now-24h')).toBeNull();
    expect(parseStartDeepLink('?type=url&data=not-json')).toBeNull();
    expect(parseStartDeepLink('?type=url')).toBeNull();
  });
});

describe('withoutStartDeepLink', () => {
  it('drops only the deep link keys', () => {
    expect(withoutStartDeepLink(`${urlLink({ url: 'x' })}&rg=default`)).toBe(
      'rg=default',
    );
    expect(withoutStartDeepLink('?owner/repo')).toBe('');
  });
});
