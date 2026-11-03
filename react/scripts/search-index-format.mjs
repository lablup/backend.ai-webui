/**
 * The shape and ordering of `react/src/generated/searchIndex.json`, shared by
 * the extractor (`build-search-index.mjs`) and the merge driver
 * (`scripts/merge-search-index.mjs`). Dependency-free on purpose: the driver
 * runs mid-merge, possibly without node_modules and while the extractor itself
 * is conflicted.
 */

export const INDEX_VERSION = 1;
export const GENERATED_FROM = 'react/src/routes.tsx';

export const byString = (a, b) => (a < b ? -1 : a > b ? 1 : 0);

export const tabId = (t) => `${t.param}=${t.key}`;
export const compareTabs = (a, b) => byString(tabId(a), tabId(b));

/** Keyed by key+group: the same title can legitimately appear in two groups. */
export const settingId = (s) =>
  `${s.groupId ?? s.groupKey ?? ''}\u0000${s.key}`;
export const compareSettings = (a, b) =>
  byString(a.key, b.key) || byString(a.groupId ?? '', b.groupId ?? '');

export const compareEntries = (a, b) => byString(a.path, b.path);

export const serialize = (index) => JSON.stringify(index, null, 2) + '\n';
