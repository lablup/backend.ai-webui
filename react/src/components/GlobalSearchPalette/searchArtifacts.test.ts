/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { tEn as resolveEn } from '../../../__test__/i18nBundles';
import { PALETTE_ACTIONS } from './actions';
import type { MenuHitSource } from './buildHits';
import {
  getBootstrapRows,
  getSearchArtifacts,
  getTranslators,
  resetSearchArtifacts,
  warmGlobalSearch,
} from './searchArtifacts';
import { getSearchIndex } from './searchIndex.types';
import type { HitTranslator, RecentSearchHit, SearchContext } from './types';
import type { i18n as I18n } from 'i18next';
import * as _ from 'lodash-es';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const index = getSearchIndex();
const indexedMenuKeys = _.uniq(
  _.compact(
    _.map(
      _.filter(index.entries, (entry) => !!entry.menuKey && !!entry.labelKey),
      'menuKey',
    ),
  ),
);

const t: HitTranslator = resolveEn;

const menuSources = (): Array<MenuHitSource> =>
  _.map(indexedMenuKeys, (key) => ({
    key,
    labelText: key,
    groupLabel: `group:${key}`,
  }));

const context = (): SearchContext => ({
  isSuperAdmin: true,
  supports: () => true,
  config: { fasttrackEndpoint: 'https://fasttrack.example' },
  visibleMenuKeys: new Set(indexedMenuKeys),
  disabledMenuKeys: new Set<string>(),
  t,
  tEn: t,
});

/** A fresh params object every call — the palette rebuilds both per render. */
const params = () => ({
  menuSources: menuSources(),
  projectName: 'my project',
  ctx: context(),
  fallbackGroup: 'General',
  groupLabels: {
    create: 'Create',
    appearance: 'Appearance',
    panels: 'Panels & Help',
  },
});

/** An i18next stand-in whose `getFixedT` hands back one countable resolver. */
const fakeI18n = (resolve: HitTranslator) =>
  ({
    language: 'en',
    resolvedLanguage: 'en',
    getFixedT: () => resolve,
  }) as unknown as I18n;

beforeEach(() => {
  resetSearchArtifacts();
});

describe('getSearchArtifacts', () => {
  it('returns the identical artifact for a second call with equal inputs', () => {
    const first = getSearchArtifacts(params());
    const second = getSearchArtifacts(params());

    expect(first.hits.length).toBeGreaterThan(0);
    expect(second).toBe(first);
    expect(second.hits).toBe(first.hits);
  });

  it('rebuilds when the visible menu changes', () => {
    const first = getSearchArtifacts(params());
    const narrowed = params();
    narrowed.ctx.visibleMenuKeys = new Set(_.take(indexedMenuKeys, 3));

    const second = getSearchArtifacts(narrowed);

    expect(second.hits).not.toBe(first.hits);
    expect(second.hits.length).toBeLessThan(first.hits.length);
  });

  it('rebuilds when the translators change, i.e. on a locale switch', () => {
    const first = getSearchArtifacts(params());
    const switched = params();
    switched.ctx.t = (key: string) => `ko:${key}`;

    expect(getSearchArtifacts(switched).hits).not.toBe(first.hits);
  });
});

describe('getBootstrapRows', () => {
  const noRecents: Array<RecentSearchHit> = [];

  it('returns every recent, page and action row in ONE array', () => {
    const artifacts = getSearchArtifacts(params());
    const pages = _.filter(artifacts.hits, { kind: 'page' });
    const actions = _.filter(artifacts.hits, { kind: 'action' });
    const recents: Array<RecentSearchHit> = [
      { id: pages[0]!.id, kind: 'page', selectedAt: new Date().toISOString() },
    ];

    const rows = getBootstrapRows(artifacts, recents, t);

    expect(pages.length).toBeGreaterThan(0);
    // Every action but the ones whose page the fixture menu does not offer.
    expect(actions.length).toBeGreaterThan(PALETTE_ACTIONS.length - 3);
    expect(rows.length).toBe(recents.length + pages.length + actions.length);
  });

  it('does not grow between two immediate calls, and keeps its identity', () => {
    const artifacts = getSearchArtifacts(params());

    const first = getBootstrapRows(artifacts, noRecents, t);
    const second = getBootstrapRows(artifacts, noRecents, t);

    // Identity is the contract: Astryx bootstraps more than once per open, and
    // an equal-but-new array is a second full commit of the list.
    expect(second).toBe(first);
    expect(second.length).toBe(first.length);
  });

  it('survives a re-derived source, so a reopen commits the same array', () => {
    const first = getBootstrapRows(getSearchArtifacts(params()), noRecents, t);
    const second = getBootstrapRows(getSearchArtifacts(params()), noRecents, t);

    expect(second).toBe(first);
  });
});

describe('warmGlobalSearch', () => {
  it('resolves the whole index once, so the ranker reads a warm cache', () => {
    const resolve = vi.fn((key: string) => resolveEn(key));
    const i18n = fakeI18n(resolve);

    warmGlobalSearch(i18n);
    const afterFirstWarm = resolve.mock.calls.length;
    warmGlobalSearch(i18n);
    const secondPass = resolve.mock.calls.length - afterFirstWarm;

    expect(afterFirstWarm).toBeGreaterThan(1000);
    // The second pass reads the memo. Only keys that resolve to themselves —
    // a handful of index keys the bundle has no entry for — are re-resolved,
    // because caching those would freeze a bundle that had not loaded yet.
    expect(secondPass).toBeLessThan(afterFirstWarm / 100);
  });

  it('leaves the palette nothing to resolve when it builds its hits', () => {
    const resolve = vi.fn((key: string) => resolveEn(key));
    const i18n = fakeI18n(resolve);
    warmGlobalSearch(i18n);
    const afterWarm = resolve.mock.calls.length;

    const warmed = getTranslators(i18n);
    const built = params();
    built.ctx.t = warmed.t;
    built.ctx.tEn = warmed.tEn;
    getSearchArtifacts(built);

    expect(resolve.mock.calls.length).toBe(afterWarm);
  });

  it('hands back translators that are stable per language', () => {
    const i18n = fakeI18n(resolveEn);

    expect(getTranslators(i18n).t).toBe(getTranslators(i18n).t);
  });
});
