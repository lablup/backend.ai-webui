/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type { HitTranslator, SearchHit, SearchHitKind } from './types';
import Fuse from 'fuse.js';
import * as _ from 'lodash-es';

/** Field weights from the matching/ranking contract. */
export const FIELD_WEIGHTS = {
  page: 1,
  tab: 0.8,
  settingItem: 0.8,
  action: 0.7,
  keywords: 0.6,
  body: 0.35,
} as const;

export const MAX_RESULTS = 30;
export const MAX_BODY_HITS_PER_HIT = 3;
const EXACT_BOOST = 2;
const PREFIX_BOOST = 1.5;
const RECENT_BOOST = 1.25;
const FUZZY_THRESHOLD = 0.35;

/** Marks a row produced by a body-key match; strip it to reach the real hit. */
export const BODY_HIT_ID_MARKER = '#found=';
export const RECENT_HIT_ID_PREFIX = 'recent:';

/** The id of the underlying hit, whatever decoration a row carries. */
export const baseHitId = (id: string): string =>
  _.split(
    _.startsWith(id, RECENT_HIT_ID_PREFIX)
      ? id.slice(RECENT_HIT_ID_PREFIX.length)
      : id,
    BODY_HIT_ID_MARKER,
  )[0] ?? id;

const KIND_ORDER: Record<SearchHitKind, number> = {
  page: 0,
  tab: 1,
  settingItem: 2,
  action: 3,
};

/** Non-ASCII queries (CJK, …) fall back to case-folded substring matching. */
const isAsciiQuery = (query: string): boolean =>
  // eslint-disable-next-line no-control-regex
  /^[\x00-\x7F]*$/.test(query);

type FieldName = 'title' | 'keywords' | 'body';

interface FieldRecord {
  hitIndex: number;
  field: FieldName;
  weight: number;
  text: string;
  folded: string;
  bodyKey?: string;
}

interface PreparedHits {
  t: HitTranslator;
  tEn: HitTranslator;
  records: Array<FieldRecord>;
  fuse: Fuse<FieldRecord>;
}

const preparedCache = new WeakMap<object, PreparedHits>();

const titleWeight = (kind: SearchHitKind): number =>
  kind === 'page'
    ? FIELD_WEIGHTS.page
    : kind === 'action'
      ? FIELD_WEIGHTS.action
      : FIELD_WEIGHTS[kind];

const buildRecords = (
  hits: ReadonlyArray<SearchHit>,
  t: HitTranslator,
  tEn: HitTranslator,
): Array<FieldRecord> => {
  const records: Array<FieldRecord> = [];
  const push = (
    hitIndex: number,
    field: FieldName,
    weight: number,
    texts: Array<string>,
    bodyKey?: string,
  ) => {
    _.forEach(_.uniq(_.compact(texts)), (text) => {
      records.push({
        hitIndex,
        field,
        weight,
        text,
        folded: text.toLowerCase(),
        bodyKey,
      });
    });
  };

  _.forEach(hits, (hit, hitIndex) => {
    push(hitIndex, 'title', titleWeight(hit.kind), [
      hit.label,
      t(hit.labelKey),
      tEn(hit.labelKey),
    ]);
    push(hitIndex, 'keywords', FIELD_WEIGHTS.keywords, hit.keywords);
    _.forEach(hit.bodyKeys, (key) => {
      push(hitIndex, 'body', FIELD_WEIGHTS.body, [t(key), tEn(key)], key);
    });
  });

  return records;
};

const prepare = (
  hits: ReadonlyArray<SearchHit>,
  t: HitTranslator,
  tEn: HitTranslator,
): PreparedHits => {
  const cached = preparedCache.get(hits as object);
  if (cached && cached.t === t && cached.tEn === tEn) return cached;

  const records = buildRecords(hits, t, tEn);
  const prepared: PreparedHits = {
    t,
    tEn,
    records,
    fuse: new Fuse(records, {
      keys: ['text'],
      includeScore: true,
      ignoreLocation: true,
      threshold: FUZZY_THRESHOLD,
      minMatchCharLength: 1,
      shouldSort: false,
    }),
  };
  preparedCache.set(hits as object, prepared);
  return prepared;
};

const matchBoost = (folded: string, foldedQuery: string): number =>
  folded === foldedQuery
    ? EXACT_BOOST
    : _.startsWith(folded, foldedQuery)
      ? PREFIX_BOOST
      : 1;

interface ScoredField {
  record: FieldRecord;
  score: number;
}

const scoreFields = (
  query: string,
  prepared: PreparedHits,
): Array<ScoredField> => {
  const foldedQuery = query.toLowerCase();

  if (!isAsciiQuery(query)) {
    return _.compact(
      _.map(prepared.records, (record) =>
        _.includes(record.folded, foldedQuery)
          ? {
              record,
              score: record.weight * matchBoost(record.folded, foldedQuery),
            }
          : null,
      ),
    );
  }

  return _.map(
    prepared.fuse.search(query, { limit: prepared.records.length }),
    ({ item, score }) => ({
      record: item,
      score:
        item.weight * (1 - (score ?? 0)) * matchBoost(item.folded, foldedQuery),
    }),
  );
};

export interface RankHitsOptions {
  t: HitTranslator;
  tEn: HitTranslator;
  /** Hit ids selected recently; their rows get a small boost. */
  recentIds?: ReadonlyArray<string>;
  limit?: number;
  bodyLimitPerHit?: number;
}

/**
 * Scores hits against a query. Title / tab / setting / keyword matches surface
 * the hit itself; body matches surface up to `bodyLimitPerHit` clones of the
 * page hit, each carrying the key it was found in.
 */
export const rankHits = (
  query: string,
  hits: ReadonlyArray<SearchHit>,
  {
    t,
    tEn,
    recentIds,
    limit = MAX_RESULTS,
    bodyLimitPerHit = MAX_BODY_HITS_PER_HIT,
  }: RankHitsOptions,
): Array<SearchHit> => {
  const trimmed = _.trim(query);
  if (trimmed.length < 1) return [];

  const prepared = prepare(hits, t, tEn);
  const recents = new Set(recentIds ?? []);

  const direct = new Map<number, number>();
  const body = new Map<number, Array<ScoredField>>();
  _.forEach(scoreFields(trimmed, prepared), (scored) => {
    const { hitIndex, field } = scored.record;
    if (field === 'body') {
      const bucket = body.get(hitIndex) ?? [];
      bucket.push(scored);
      body.set(hitIndex, bucket);
    } else {
      direct.set(hitIndex, Math.max(direct.get(hitIndex) ?? 0, scored.score));
    }
  });

  const boost = (hit: SearchHit, score: number) =>
    recents.has(hit.id) ? score * RECENT_BOOST : score;

  const rows: Array<{ hit: SearchHit; score: number }> = [];
  _.forEach([...direct.keys()], (hitIndex) => {
    const hit = hits[hitIndex];
    if (!hit) return;
    rows.push({ hit, score: boost(hit, direct.get(hitIndex) ?? 0) });
  });
  // A hit that already matched by title or keyword does not repeat itself as a
  // "found in" row.
  _.forEach([...body.keys()], (hitIndex) => {
    if (direct.has(hitIndex)) return;
    const hit = hits[hitIndex];
    if (!hit) return;
    const best = _.take(
      _.orderBy(
        _.uniqBy(body.get(hitIndex) ?? [], (scored) => scored.record.bodyKey),
        'score',
        'desc',
      ),
      bodyLimitPerHit,
    );
    _.forEach(best, (scored) => {
      const key = scored.record.bodyKey as string;
      rows.push({
        hit: {
          ...hit,
          id: `${hit.id}${BODY_HIT_ID_MARKER}${key}`,
          matchedIn: { key, kind: 'body' },
        },
        score: boost(hit, scored.score),
      });
    });
  });

  return _.map(
    _.take(
      _.orderBy(
        rows,
        [
          (row) => row.score,
          (row) => KIND_ORDER[row.hit.kind],
          (row) => row.hit.label,
        ],
        ['desc', 'asc', 'asc'],
      ),
      limit,
    ),
    'hit',
  );
};
