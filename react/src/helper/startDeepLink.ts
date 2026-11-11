/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */

export interface StartDeepLinkData {
  url?: string;
  branch?: string;
}

/** What the import deep links the retired Start page served ask to open. */
export type StartDeepLink =
  | { kind: 'url'; data: StartDeepLinkData }
  | { kind: 'legacyGithub'; data: StartDeepLinkData };

/**
 * Reads `?type=url&data=<json>` and the legacy `/github?owner/repo/path`
 * form, a bare query with no `=`. Anything else is not a deep link.
 */
export const parseStartDeepLink = (search: string): StartDeepLink | null => {
  const query = search.startsWith('?') ? search.slice(1) : search;
  if (!query) return null;
  if (!query.includes('=')) {
    return {
      kind: 'legacyGithub',
      data: { url: `https://github.com/${query}` },
    };
  }
  const params = new URLSearchParams(query);
  if (params.get('type') !== 'url') return null;
  try {
    const data: unknown = JSON.parse(params.get('data') ?? '');
    if (!data || typeof data !== 'object') return null;
    const { url, branch } = data as Record<string, unknown>;
    return {
      kind: 'url',
      data: {
        ...(typeof url === 'string' ? { url } : {}),
        ...(typeof branch === 'string' ? { branch } : {}),
      },
    };
  } catch {
    return null;
  }
};

/** The query left once the deep link's own keys are consumed. */
export const withoutStartDeepLink = (search: string): string => {
  const query = search.startsWith('?') ? search.slice(1) : search;
  if (!query.includes('=')) return '';
  const params = new URLSearchParams(query);
  params.delete('type');
  params.delete('data');
  return params.toString();
};
