/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { DEFAULT_BOARD_VARS } from './dashboardConfig';
import { customRange, isValidTimeRange, parseTimeRange } from './timeRange';
import type { DashboardBoardVars, PanelPage } from './types';
import * as _ from 'lodash-es';

/** The auto refresh choices, slowest last; `off` stops the timer. */
export const REFRESH_OPTIONS = [
  'off',
  '5s',
  '10s',
  '15s',
  '30s',
  '1m',
  '5m',
  '10m',
] as const;
export type RefreshOption = (typeof REFRESH_OPTIONS)[number];

const REFRESH_UNIT_MS: Record<string, number> = { s: 1000, m: 60_000 };

/** `'30s'` → 30000, `'off'` or anything unparsable → null. */
export const refreshToMs = (
  value: string | null | undefined,
): number | null => {
  const match = /^(\d+)([sm])$/.exec(value ?? '');
  if (!match) return null;
  const ms = Number(match[1]) * REFRESH_UNIT_MS[match[2]];
  return ms > 0 ? ms : null;
};

const isRefreshOption = (value: string | null | undefined) =>
  _.includes(REFRESH_OPTIONS, value);

/** The dashboard's URL query: names, not ids, so a link reads and survives as text. */
export interface DashboardUrlState {
  project: Array<string> | null;
  rg: Array<string> | null;
  /** A relative range (`now-24h`) or the first day of a custom one. */
  from: string | null;
  /** The last day of a custom range. */
  to: string | null;
  refresh: string | null;
}

export const EMPTY_DASHBOARD_URL_STATE: DashboardUrlState = {
  project: null,
  rg: null,
  from: null,
  to: null,
  refresh: null,
};

export const rangeFromUrl = (
  from: string | null,
  to: string | null,
): string | null => {
  if (!from) return null;
  const range = to ? customRange(from, to) : from;
  return isValidTimeRange(range) ? range : null;
};

export const rangeToUrl = (
  range: string,
): Pick<DashboardUrlState, 'from' | 'to'> => {
  const parsed = parseTimeRange(range);
  if (!parsed) return { from: null, to: null };
  return parsed.kind === 'custom'
    ? { from: parsed.start, to: parsed.end }
    : { from: range, to: null };
};

/**
 * The filter values a URL query sets. A param that is absent, unparsable, or
 * names no known project leaves the board's value in place.
 */
export const urlToVars = (
  url: DashboardUrlState,
  projectIdByName: ReadonlyMap<string, string>,
): Partial<DashboardBoardVars> => {
  const projectIds = _.compact(
    _.map(url.project, (name) => projectIdByName.get(name)),
  );
  const range = rangeFromUrl(url.from, url.to);
  return {
    ...(projectIds.length ? { project: _.uniq(projectIds) } : {}),
    ...(url.rg?.length ? { rg: _.uniq(url.rg) } : {}),
    ...(range ? { range } : {}),
    ...(isRefreshOption(url.refresh) ? { refresh: url.refresh! } : {}),
  };
};

/** The URL query for a set of filter values; `'all'` and defaults drop their param. */
export const varsToUrl = (
  vars: DashboardBoardVars,
  projectNameById: ReadonlyMap<string, string>,
): DashboardUrlState => {
  const projectNames =
    vars.project === 'all'
      ? []
      : _.compact(vars.project.map((id) => projectNameById.get(id)));
  return {
    project: projectNames.length ? projectNames : null,
    rg: vars.rg === 'all' || vars.rg.length === 0 ? null : vars.rg,
    ...rangeToUrl(vars.range),
    refresh: vars.refresh,
  };
};

/**
 * The values in effect: the board's, overridden by the URL query. On the
 * project admin page the board's project list is not reused; an unpinned
 * board opens on the URL project.
 */
export const effectiveVars = (
  page: PanelPage,
  boardVars: DashboardBoardVars,
  fromUrl: Partial<DashboardBoardVars>,
): DashboardBoardVars => {
  const merged: DashboardBoardVars = {
    ...DEFAULT_BOARD_VARS,
    ...boardVars,
    ...fromUrl,
  };
  if (page === 'projectAdmin') merged.project = fromUrl.project ?? 'all';
  if (page === 'project') merged.project = 'all';
  if (!isValidTimeRange(merged.range)) merged.range = DEFAULT_BOARD_VARS.range;
  if (!isRefreshOption(merged.refresh))
    merged.refresh = DEFAULT_BOARD_VARS.refresh;
  return merged;
};

/**
 * The board values to store after the user changed the filter bar. Pages
 * whose project list is not reused keep the board's stored one.
 */
export const varsToStore = (
  page: PanelPage,
  boardVars: DashboardBoardVars,
  next: DashboardBoardVars,
): DashboardBoardVars =>
  page === 'admin' ? next : { ...next, project: boardVars.project };
