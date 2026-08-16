/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { tEn, tKo } from '../../../__test__/i18nBundles';
import { buildHits } from './buildHits';
import type { MenuHitSource } from './buildHits';
import {
  BODY_HIT_ID_MARKER,
  MAX_BODY_HITS_PER_HIT,
  MAX_RESULTS,
  baseHitId,
  rankHits,
} from './rank';
import { getSearchIndex } from './searchIndex.types';
import type { SearchHit } from './types';
import * as _ from 'lodash-es';
import { describe, expect, it } from 'vitest';

const allMenuKeys = _.uniq(
  _.compact(_.map(getSearchIndex().entries, 'menuKey')),
);
const menuSources: Array<MenuHitSource> = _.map(allMenuKeys, (key) => ({
  key,
  labelText: key,
  groupLabel: '',
}));
const hits = buildHits({ menuSources, projectName: 'default', t: tEn });
const koHits = buildHits({ menuSources, projectName: 'default', t: tKo });

const rank = (query: string, options = {}) =>
  rankHits(query, hits, { t: tEn, tEn, ...options });

describe('rankHits — matching', () => {
  it('returns nothing for an empty query', () => {
    expect(rank('')).toEqual([]);
    expect(rank('   ')).toEqual([]);
  });

  it('puts the exact page title first', () => {
    const [first] = rank('Sessions');
    expect(first?.kind).toBe('page');
    expect(first?.labelKey).toBe('webui.menu.Sessions');
  });

  it('tolerates a typo on an ASCII query (fuzzy)', () => {
    expect(_.map(rank('sesions'), 'labelKey')).toContain('webui.menu.Sessions');
  });

  it('matches a non-ASCII query by case-folded substring, in the current locale', () => {
    const results = rankHits('세션', koHits, { t: tKo, tEn });
    expect(results.length).toBeGreaterThan(0);
    expect(_.map(results, 'labelKey')).toContain('webui.menu.Sessions');
  });

  it('matches English even when the UI locale is Korean', () => {
    const results = rankHits('Statistics', koHits, { t: tKo, tEn });
    expect(_.map(results, 'labelKey')).toContain('webui.menu.Statistics');
    // …and shows the Korean label.
    expect(_.find(results, { labelKey: 'webui.menu.Statistics' })?.label).toBe(
      '통계',
    );
  });

  it('does not fuzzy-match a non-ASCII query', () => {
    expect(rankHits('없는단어', koHits, { t: tKo, tEn })).toEqual([]);
  });
});

describe('rankHits — ordering', () => {
  const scoreOf = (results: Array<SearchHit>, id: string) =>
    _.findIndex(results, { id });

  it('ranks a title match above the same word inside body text', () => {
    const results = rank('Registries');
    const titleRow = _.findIndex(results, {
      labelKey: 'environment.Registries',
    });
    const bodyRow = _.findIndex(results, (hit) => !!hit.matchedIn);
    expect(titleRow).toBeGreaterThanOrEqual(0);
    if (bodyRow >= 0) expect(titleRow).toBeLessThan(bodyRow);
  });

  it('ranks a page title above a tab title of equal text quality', () => {
    const results = rank('Data');
    expect(results[0]?.kind).toBe('page');
  });

  it('boosts hits the user picked recently', () => {
    const target = 'page:/project/:projectName/statistics';
    const plain = rank('history');
    const boosted = rank('history', { recentIds: [target] });
    expect(scoreOf(boosted, target)).toBeLessThanOrEqual(
      scoreOf(plain, target),
    );
  });
});

describe('rankHits — body matches and caps', () => {
  it('attaches matchedIn and a distinct id to body rows', () => {
    const bodyRow = _.find(rank('Rescan'), (hit) => !!hit.matchedIn);
    expect(bodyRow?.matchedIn?.kind).toBe('body');
    expect(bodyRow?.id).toContain(BODY_HIT_ID_MARKER);
    expect(baseHitId(bodyRow?.id ?? '')).not.toContain(BODY_HIT_ID_MARKER);
  });

  it('never shows more than 3 body rows for one hit', () => {
    const grouped = _.groupBy(
      _.filter(rank('resource'), (hit) => !!hit.matchedIn),
      (hit) => baseHitId(hit.id),
    );
    expect(
      _.every(grouped, (rows) => rows.length <= MAX_BODY_HITS_PER_HIT),
    ).toBe(true);
  });

  it('does not repeat a hit as a body row when its title already matched', () => {
    const results = rank('Sessions');
    const titles = new Set(
      _.map(
        _.filter(results, (hit) => !hit.matchedIn),
        'id',
      ),
    );
    expect(
      _.some(
        _.filter(results, (hit) => !!hit.matchedIn),
        (hit) => titles.has(baseHitId(hit.id)),
      ),
    ).toBe(false);
  });

  it('caps the result list at 30 and honours an explicit limit', () => {
    expect(rank('e').length).toBeLessThanOrEqual(MAX_RESULTS);
    expect(rank('e', { limit: 5 })).toHaveLength(5);
  });

  it('keeps every returned id unique', () => {
    const ids = _.map(rank('session'), 'id');
    expect(_.uniq(ids)).toHaveLength(ids.length);
  });
});

describe('baseHitId', () => {
  it('strips the recent prefix and the body marker', () => {
    expect(baseHitId('recent:page:/admin/agent')).toBe('page:/admin/agent');
    expect(
      baseHitId(`page:/admin/agent${BODY_HIT_ID_MARKER}agent.Status`),
    ).toBe('page:/admin/agent');
    expect(baseHitId('page:/admin/agent')).toBe('page:/admin/agent');
  });
});
