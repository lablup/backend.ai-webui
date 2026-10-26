/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { DEFAULT_BOARD_VARS } from './dashboardConfig';
import {
  EMPTY_DASHBOARD_URL_STATE,
  effectiveVars,
  rangeFromUrl,
  rangeToUrl,
  refreshToMs,
  urlToVars,
  varsToStore,
  varsToUrl,
} from './dashboardFilterUrl';
import type { DashboardBoardVars } from './types';

const idByName = new Map([
  ['team-nlp', 'p-1'],
  ['team-vision', 'p-2'],
]);
const nameById = new Map([
  ['p-1', 'team-nlp'],
  ['p-2', 'team-vision'],
]);

const boardVars: DashboardBoardVars = {
  project: ['p-1'],
  rg: ['default'],
  range: 'now-7d',
  refresh: '1m',
};

describe('refreshToMs', () => {
  it('converts the refresh choices', () => {
    expect(refreshToMs('5s')).toBe(5_000);
    expect(refreshToMs('10m')).toBe(600_000);
    expect(refreshToMs('off')).toBeNull();
    expect(refreshToMs(undefined)).toBeNull();
  });
});

describe('range params', () => {
  it('round-trips relative and custom ranges', () => {
    expect(rangeToUrl('now-24h')).toEqual({ from: 'now-24h', to: null });
    expect(rangeFromUrl('now-24h', null)).toBe('now-24h');
    expect(rangeToUrl('2026-10-01/2026-10-07')).toEqual({
      from: '2026-10-01',
      to: '2026-10-07',
    });
    expect(rangeFromUrl('2026-10-01', '2026-10-07')).toBe(
      '2026-10-01/2026-10-07',
    );
  });

  it('ignores an invalid range', () => {
    expect(rangeFromUrl('yesterday', null)).toBeNull();
    expect(rangeFromUrl(null, '2026-10-07')).toBeNull();
  });
});

describe('urlToVars', () => {
  it('maps names to ids and keeps the other params', () => {
    expect(
      urlToVars(
        {
          project: ['team-nlp', 'team-vision'],
          rg: ['default', 'a100'],
          from: 'now-1h',
          to: null,
          refresh: '10s',
        },
        idByName,
      ),
    ).toEqual({
      project: ['p-1', 'p-2'],
      rg: ['default', 'a100'],
      range: 'now-1h',
      refresh: '10s',
    });
  });

  it('leaves out params that are absent, unknown or invalid', () => {
    expect(urlToVars(EMPTY_DASHBOARD_URL_STATE, idByName)).toEqual({});
    expect(
      urlToVars(
        {
          project: ['unknown'],
          rg: [],
          from: 'soon',
          to: null,
          refresh: '7s',
        },
        idByName,
      ),
    ).toEqual({});
  });
});

describe('varsToUrl', () => {
  it('writes names, not ids', () => {
    expect(varsToUrl(boardVars, nameById)).toEqual({
      project: ['team-nlp'],
      rg: ['default'],
      from: 'now-7d',
      to: null,
      refresh: '1m',
    });
  });

  it('drops the params of "all"', () => {
    expect(
      varsToUrl({ ...DEFAULT_BOARD_VARS, refresh: 'off' }, nameById),
    ).toEqual({
      project: null,
      rg: null,
      from: 'now-24h',
      to: null,
      refresh: 'off',
    });
  });

  it('round-trips through urlToVars', () => {
    const vars: DashboardBoardVars = {
      project: ['p-1', 'p-2'],
      rg: ['a'],
      range: '2026-10-01/2026-10-07',
      refresh: '5m',
    };
    expect(urlToVars(varsToUrl(vars, nameById), idByName)).toEqual(vars);
  });
});

describe('effectiveVars', () => {
  it('lets the URL override the board on the superadmin page', () => {
    expect(
      effectiveVars('admin', boardVars, { project: ['p-2'], range: 'now-1h' }),
    ).toEqual({ ...boardVars, project: ['p-2'], range: 'now-1h' });
    expect(effectiveVars('admin', boardVars, {})).toEqual(boardVars);
  });

  it('does not reuse the board projects on the project admin page', () => {
    expect(effectiveVars('projectAdmin', boardVars, {}).project).toBe('all');
    expect(
      effectiveVars('projectAdmin', boardVars, { project: ['p-2'] }).project,
    ).toEqual(['p-2']);
  });

  it('never picks projects on the member page', () => {
    expect(
      effectiveVars('project', boardVars, { project: ['p-2'] }).project,
    ).toBe('all');
  });

  it('repairs a stored range or refresh that is not offered', () => {
    expect(
      effectiveVars('admin', { ...boardVars, range: 'x', refresh: '7s' }, {}),
    ).toMatchObject({
      range: DEFAULT_BOARD_VARS.range,
      refresh: DEFAULT_BOARD_VARS.refresh,
    });
  });
});

describe('varsToStore', () => {
  const next: DashboardBoardVars = {
    project: ['p-2'],
    rg: 'all',
    range: 'now-1h',
    refresh: '5s',
  };

  it('stores every value on the superadmin page', () => {
    expect(varsToStore('admin', boardVars, next)).toEqual(next);
  });

  it('keeps the stored project list elsewhere', () => {
    expect(varsToStore('projectAdmin', boardVars, next)).toEqual({
      ...next,
      project: ['p-1'],
    });
    expect(varsToStore('project', boardVars, next).project).toEqual(['p-1']);
  });
});
