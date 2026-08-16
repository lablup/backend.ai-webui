/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { tEn } from '../../../__test__/i18nBundles';
import { buildHits } from './buildHits';
import type { MenuHitSource } from './buildHits';
import { getSearchIndex } from './searchIndex.types';
import type { SearchContext, SearchHit } from './types';
import {
  ALWAYS_VISIBLE_MENU_KEYS,
  TAB_GATES,
  isHitVisible,
} from './visibility';
import * as _ from 'lodash-es';
import { describe, expect, it } from 'vitest';

const allMenuKeys = _.uniq(
  _.compact(_.map(getSearchIndex().entries, 'menuKey')),
);
const fullMenu: Array<MenuHitSource> = _.map(allMenuKeys, (key) => ({
  key,
  labelText: key,
  groupLabel: '',
}));
const hits = buildHits({
  menuSources: fullMenu,
  projectName: 'default',
  t: tEn,
});

const makeCtx = (overrides: Partial<SearchContext> = {}): SearchContext => ({
  projectName: 'default',
  isSuperAdmin: false,
  isAdmin: true,
  supports: () => false,
  config: {
    hideAgents: true,
    enableReservoir: false,
    fasttrackEndpoint: null,
    allowThemeMode: false,
  },
  visibleMenuKeys: new Set(allMenuKeys),
  disabledMenuKeys: new Set(),
  t: tEn,
  tEn,
  ...overrides,
});

const hitById = (id: string): SearchHit => {
  const hit = _.find(hits, { id });
  if (!hit) throw new Error(`missing fixture hit: ${id}`);
  return hit;
};

describe('isHitVisible', () => {
  it('hides a page whose menu key the menu did not emit', () => {
    const hit = hitById('page:/admin/reservoir');
    expect(isHitVisible(hit, makeCtx())).toBe(true);
    expect(
      isHitVisible(
        hit,
        makeCtx({
          visibleMenuKeys: new Set(_.without(allMenuKeys, 'reservoir')),
        }),
      ),
    ).toBe(false);
  });

  it('keeps /usersettings visible without a menu entry', () => {
    expect(ALWAYS_VISIBLE_MENU_KEYS.has('usersettings')).toBe(true);
    expect(
      isHitVisible(
        hitById('page:/usersettings'),
        makeCtx({ visibleMenuKeys: new Set() }),
      ),
    ).toBe(true);
  });

  it('hides inactiveList pages instead of disabling them', () => {
    const ctx = makeCtx({ disabledMenuKeys: new Set(['statistics']) });
    expect(
      isHitVisible(hitById('page:/project/:projectName/statistics'), ctx),
    ).toBe(false);
    expect(
      isHitVisible(
        hitById('tab:/project/:projectName/statistics?tab=allocation-history'),
        ctx,
      ),
    ).toBe(false);
  });

  it('makes tabs and setting items inherit the page gate', () => {
    const ctx = makeCtx({
      visibleMenuKeys: new Set(_.without(allMenuKeys, 'usersettings')),
    });
    const settingHit = hitById('setting:/usersettings#userSettings.AutoLogout');
    // Whitelisted globally, so the page gate is not what hides it.
    expect(isHitVisible(settingHit, ctx)).toBe(true);
    expect(
      isHitVisible(
        settingHit,
        makeCtx({ disabledMenuKeys: new Set(['usersettings']) }),
      ),
    ).toBe(false);
  });

  it.each([
    [
      'tab:/project/:projectName/statistics?tab=user-session-history',
      'user-metrics',
      false,
    ],
    [
      'tab:/admin/deployments?tab=prometheus-preset',
      'prometheus-query-preset',
      false,
    ],
    [
      'tab:/admin/deployments?tab=deployment-presets',
      'deployment-preset',
      false,
    ],
  ])('gates %s on supports(%s)', (id, feature, isSuperAdmin) => {
    const hit = hitById(id);
    expect(isHitVisible(hit, makeCtx({ isSuperAdmin }))).toBe(false);
    expect(
      isHitVisible(
        hit,
        makeCtx({ isSuperAdmin, supports: (f) => f === feature }),
      ),
    ).toBe(true);
  });

  it('gates the container registry tab on superadmin', () => {
    const hit = hitById('tab:/admin/environment?tab=registry');
    expect(isHitVisible(hit, makeCtx())).toBe(false);
    expect(isHitVisible(hit, makeCtx({ isSuperAdmin: true }))).toBe(true);
  });

  it('leaves ungated sibling tabs alone', () => {
    expect(
      isHitVisible(hitById('tab:/admin/environment?tab=image'), makeCtx()),
    ).toBe(true);
    expect(_.size(TAB_GATES)).toBe(4);
  });

  it('lets actions bring their own gate', () => {
    const action: SearchHit = {
      id: 'action:test',
      label: 'Test',
      kind: 'action',
      menuKey: null,
      scope: null,
      labelKey: 'button.Confirm',
      breadcrumbKeys: [],
      group: '',
      target: { path: '/' },
      keywords: [],
      bodyKeys: [],
    };
    expect(isHitVisible(action, makeCtx())).toBe(true);
    expect(
      isHitVisible({ ...action, gate: (ctx) => ctx.isSuperAdmin }, makeCtx()),
    ).toBe(false);
  });
});
