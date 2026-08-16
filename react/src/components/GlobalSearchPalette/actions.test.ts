/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
/**
 * Contract of the static action registry: what each entry does when it runs,
 * and which entries a given deployment is allowed to see.
 */
import { PALETTE_ACTIONS } from './actions';
import { buildActionHits } from './buildHits';
import type { PaletteActionContext, SearchContext, SearchHit } from './types';
import { isHitVisible } from './visibility';
import * as _ from 'lodash-es';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const groupLabels = {
  create: 'Create',
  appearance: 'Appearance',
  panels: 'Panels & help',
};

const hits = (): Array<SearchHit> =>
  buildActionHits({ groupLabels, t: (key) => key });

const makeSearchContext = (
  overrides: Partial<SearchContext> = {},
): SearchContext => ({
  projectName: 'my project',
  isSuperAdmin: false,
  isAdmin: false,
  supports: () => true,
  config: {
    hideAgents: false,
    enableReservoir: false,
    fasttrackEndpoint: null,
    allowThemeMode: false,
  },
  visibleMenuKeys: new Set(['session', 'data', 'deployments']),
  disabledMenuKeys: new Set(),
  t: (key) => key,
  tEn: (key) => key,
  ...overrides,
});

const visibleIds = (ctx: SearchContext) =>
  _.map(
    _.filter(hits(), (hit) => isHitVisible(hit, ctx)),
    'id',
  );

const navigate = vi.fn();
const setThemeMode = vi.fn();
const openNotifications = vi.fn();
const toggleSider = vi.fn();
const openHelp = vi.fn();
const windowOpen = vi.fn();

const makeActionContext = (
  overrides: Partial<PaletteActionContext> = {},
): PaletteActionContext => ({
  navigate,
  projectName: 'my project',
  config: {
    hideAgents: false,
    enableReservoir: false,
    fasttrackEndpoint: 'https://fasttrack.example.com',
    allowThemeMode: true,
  },
  setThemeMode,
  openNotifications,
  toggleSider,
  openHelp,
  ...overrides,
});

const run = (id: string, ctx = makeActionContext()) => {
  const action = _.find(PALETTE_ACTIONS, { id });
  expect(action, `no action ${id}`).toBeTruthy();
  action?.run(ctx);
};

describe('PALETTE_ACTIONS gates', () => {
  it('hides the theme actions unless the deployment allows theme mode', () => {
    expect(visibleIds(makeSearchContext())).not.toContain('action:theme-light');

    const allowed = visibleIds(
      makeSearchContext({
        config: {
          ...makeSearchContext().config,
          allowThemeMode: true,
        },
      }),
    );
    expect(allowed).toEqual(
      expect.arrayContaining([
        'action:theme-light',
        'action:theme-dark',
        'action:theme-system',
      ]),
    );
  });

  it('hides FastTrack until an endpoint is configured', () => {
    expect(visibleIds(makeSearchContext())).not.toContain(
      'action:open-fasttrack',
    );
    expect(
      visibleIds(
        makeSearchContext({
          config: {
            ...makeSearchContext().config,
            fasttrackEndpoint: 'https://fasttrack.example.com',
          },
        }),
      ),
    ).toContain('action:open-fasttrack');
  });

  it('hides a create action when its page is not in the menu', () => {
    const ids = visibleIds(makeSearchContext({ visibleMenuKeys: new Set() }));
    expect(ids).not.toContain('action:start-session');
    expect(ids).not.toContain('action:create-folder');
    expect(ids).not.toContain('action:create-deployment');
  });

  it('keeps the ungated panel actions on every deployment', () => {
    expect(
      visibleIds(makeSearchContext({ visibleMenuKeys: new Set() })),
    ).toEqual(
      expect.arrayContaining([
        'action:open-notifications',
        'action:toggle-sidebar',
        'action:open-manual',
        'action:open-user-settings',
        'action:change-language',
      ]),
    );
  });
});

describe('PALETTE_ACTIONS run', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal('open', windowOpen);
  });

  it('navigates to the launcher in the current project', () => {
    run('action:start-session');
    expect(navigate).toHaveBeenCalledWith(
      '/project/my%20project/session/start',
    );
  });

  it('opens the create modal on the data page', () => {
    run('action:create-folder');
    expect(navigate).toHaveBeenCalledWith({
      pathname: '/project/my%20project/data',
      search: 'action=add',
    });
  });

  it('opens the create modal on the deployments page', () => {
    run('action:create-deployment');
    expect(navigate).toHaveBeenCalledWith({
      pathname: '/project/my%20project/deployments',
      search: 'action=add',
    });
  });

  it('opens the FastTrack endpoint in a new tab', () => {
    run('action:open-fasttrack');
    expect(windowOpen).toHaveBeenCalledWith(
      'https://fasttrack.example.com',
      '_blank',
      'noopener noreferrer',
    );
  });

  it('sets each theme mode', () => {
    run('action:theme-light');
    run('action:theme-dark');
    run('action:theme-system');
    expect(setThemeMode.mock.calls).toEqual([['light'], ['dark'], ['system']]);
  });

  it('deep-links to the language setting', () => {
    run('action:change-language');
    expect(navigate).toHaveBeenCalledWith({
      pathname: '/usersettings',
      search: 'tab=general&setting=userSettings.Language',
    });
  });

  it('drives the two shell panels and the manual', () => {
    run('action:open-notifications');
    run('action:toggle-sidebar');
    run('action:open-manual');
    expect(openNotifications).toHaveBeenCalledTimes(1);
    expect(toggleSider).toHaveBeenCalledTimes(1);
    expect(openHelp).toHaveBeenCalledTimes(1);
  });

  it('navigates to user settings', () => {
    run('action:open-user-settings');
    expect(navigate).toHaveBeenCalledWith({
      pathname: '/usersettings',
      search: '',
    });
  });
});

describe('buildActionHits', () => {
  it('builds one hit per registry entry, in the registry order', () => {
    expect(_.map(hits(), 'id')).toEqual(_.map(PALETTE_ACTIONS, 'id'));
    expect(_.every(hits(), (hit) => hit.kind === 'action')).toBe(true);
    expect(_.every(hits(), (hit) => !hit.target && !!hit.run)).toBe(true);
  });

  it('groups the hits into the three trailing headings', () => {
    expect(_.uniq(_.map(hits(), (hit) => hit.auxiliaryData?.group))).toEqual([
      'Create',
      'Appearance',
      'Panels & help',
    ]);
  });
});
