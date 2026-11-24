/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type { DashboardChatContext } from './dashboardChat';
import {
  DASHBOARD_DRAFT_PARAM,
  createGetCurrentDashboardTool,
  createPrepareDashboardTool,
  draftOfRawActions,
  parseConditionsText,
  rawActionOfInput,
  rawActionsOfParam,
  type DashboardWebMCPDeps,
} from './dashboardWebMCP';

const ctx: DashboardChatContext = {
  page: 'admin',
  cards: [
    { id: 'agents', title: 'Agents', shown: true, columnSpan: 4, rowSpan: 4 },
    { id: 'pendingSessions', title: 'Pending Sessions', shown: false },
  ],
  panels: [
    {
      id: 'session-1',
      title: 'Running',
      input: {
        panelType: 'resourceTable',
        resourceType: 'session',
        title: 'Running',
        filter: 'status == "RUNNING"',
        order: '-created_at',
        gridView: null,
        chart: null,
      },
    },
  ],
  sources: [
    {
      key: 'session',
      label: 'Sessions',
      panelTypes: ['resourceTable', 'resourceCount', 'resourceChart'],
      filter: {
        kind: 'minilang',
        properties: [
          {
            key: 'type',
            propertyLabel: 'Type',
            type: 'string',
            strictSelection: true,
            options: [
              { label: 'interactive', value: 'interactive' },
              { label: 'batch', value: 'batch' },
            ],
          },
        ],
      },
      groupings: [{ key: 'status', label: 'Status' }],
    },
  ],
  canCreateBoard: true,
};

const depsWith = (
  draft: ReadonlyArray<unknown> = [],
  overrides: Partial<DashboardWebMCPDeps> = {},
): DashboardWebMCPDeps & { opened: Array<string> } => {
  const opened: Array<string> = [];
  return {
    opened,
    getContext: () => ctx,
    getSavedContext: () => ctx,
    getRawDraft: () => draft,
    getSearch: () => '?board=main',
    pathWith: (search) => `/admin/dashboard${search}`,
    openPreview: (search) => opened.push(search),
    describe: (action) => action.type,
    ...overrides,
  };
};

describe('parseConditionsText', () => {
  it('reads conditions, list values and quotes', () => {
    expect(
      parseConditionsText(
        'type == batch; type in interactive, batch ;name ilike "my job"',
      ),
    ).toEqual({
      conditions: [
        { property: 'type', operator: '==', value: 'batch' },
        { property: 'type', operator: 'in', value: ['interactive', 'batch'] },
        { property: 'name', operator: 'ilike', value: 'my job' },
      ],
    });
  });

  it('names the part that does not read', () => {
    expect(parseConditionsText('type ==')).toEqual({ invalid: 'type ==' });
  });
});

describe('rawActionOfInput', () => {
  it('asks for the field an action needs', () => {
    expect(rawActionOfInput({ type: 'hide' })).toMatchObject({ field: 'id' });
    expect(rawActionOfInput({ type: 'createBoard' })).toMatchObject({
      field: 'title',
    });
    expect(rawActionOfInput({ type: 'addPanel' })).toMatchObject({
      field: 'resourceType',
    });
  });

  it('drops clearDraft and parses conditions', () => {
    expect(
      rawActionOfInput({
        type: 'addPanel',
        resourceType: 'session',
        conditions: 'type == batch',
        clearDraft: true,
      }),
    ).toEqual({
      raw: {
        type: 'addPanel',
        resourceType: 'session',
        conditions: [{ property: 'type', operator: '==', value: 'batch' }],
      },
    });
  });
});

describe('draftOfRawActions', () => {
  it('keeps the stored panel id so a later edit resolves on the saved board', () => {
    const result = draftOfRawActions(
      [
        {
          type: 'addPanel',
          resourceType: 'session',
          title: 'Batch',
          id: 'session-new',
        },
        { type: 'editPanel', id: 'session-new', panelType: 'resourceCount' },
        { type: 'hide', id: 'nope' },
      ],
      ctx,
    );
    expect(result.map((item) => item.action?.type ?? null)).toEqual([
      'addPanel',
      'editPanel',
      null,
    ]);
    const added = result[0].action;
    expect(added?.type === 'addPanel' && added.panel.id).toBe('session-new');
  });
});

describe('rawActionsOfParam', () => {
  it('reads only a JSON array', () => {
    expect(rawActionsOfParam('[{"type":"reset"}]')).toEqual([
      { type: 'reset' },
    ]);
    expect(rawActionsOfParam('{"type":"reset"}')).toEqual([]);
    expect(rawActionsOfParam('not json')).toEqual([]);
    expect(rawActionsOfParam(null)).toEqual([]);
  });
});

describe('bai_prepare_dashboard', () => {
  it('appends the change to the URL draft and returns the link', () => {
    const deps = depsWith([{ type: 'hide', id: 'agents' }]);
    const result = createPrepareDashboardTool(deps).execute({
      type: 'show',
      id: 'Pending Sessions',
    }) as Record<string, unknown>;
    expect(result.rejected).toEqual([]);
    expect(result.applied).toEqual(['show']);
    expect(result.target).toBe('pendingSessions');
    expect(result.draft).toEqual(['hide', 'show']);
    expect(deps.opened).toHaveLength(1);
    const params = new URLSearchParams(deps.opened[0]);
    expect(params.get('board')).toBe('main');
    expect(params.get('agentPrefill')).toBeTruthy();
    // The resolved id is stored, not the agent's paraphrase.
    expect(JSON.parse(params.get(DASHBOARD_DRAFT_PARAM) ?? '')).toEqual([
      { type: 'hide', id: 'agents' },
      { type: 'show', id: 'pendingSessions' },
    ]);
    expect(result.path).toBe(`/admin/dashboard${deps.opened[0]}`);
    expect(String(result.webui_url)).toMatch(/\/admin\/dashboard\?/);
  });

  it('starts over with clearDraft', () => {
    const deps = depsWith([{ type: 'hide', id: 'agents' }]);
    const result = createPrepareDashboardTool(deps).execute({
      type: 'reset',
      clearDraft: true,
    }) as Record<string, unknown>;
    expect(result.draft).toEqual(['reset']);
  });

  it('leaves the preview alone and says why when the change does not fit', () => {
    const deps = depsWith();
    const tool = createPrepareDashboardTool(deps);
    expect(tool.execute({ type: 'hide', id: 'unknownCard' })).toMatchObject({
      path: null,
      webui_url: null,
      rejected: [{ field: 'id' }],
    });
    expect(
      tool.execute({
        type: 'addPanel',
        resourceType: 'session',
        conditions: 'type == gpu',
      }),
    ).toMatchObject({ rejected: [{ field: 'conditions' }] });
    expect(
      tool.execute({ type: 'addPanel', resourceType: 'vfolder' }),
    ).toMatchObject({ rejected: [{ field: 'resourceType' }] });
    expect(deps.opened).toHaveLength(0);
    const unknown = tool.execute({ type: 'hide', id: 'status' }) as {
      rejected: Array<{ reason: string }>;
    };
    expect(unknown.rejected[0].reason).toContain('agents (Agents)');
  });

  it('refuses createBoard on a page with a single board', () => {
    const deps = depsWith([], {
      getContext: () => ({ ...ctx, canCreateBoard: false }),
      getSavedContext: () => ({ ...ctx, canCreateBoard: false }),
    });
    expect(
      createPrepareDashboardTool(deps).execute({
        type: 'createBoard',
        title: 'Incidents',
      }),
    ).toMatchObject({ rejected: [{ field: 'type' }] });
  });

  it('gives the new panel id as target for a later edit', () => {
    const deps = depsWith();
    const result = createPrepareDashboardTool(deps).execute({
      type: 'addPanel',
      resourceType: 'session',
      panelType: 'resourceCount',
      conditions: 'type == batch',
    }) as Record<string, unknown>;
    expect(String(result.target)).toMatch(/^session-/);
    const [stored] = JSON.parse(
      new URLSearchParams(deps.opened[0]).get(DASHBOARD_DRAFT_PARAM) ?? '',
    );
    expect(stored.id).toBe(result.target);
  });
});

describe('bai_prepare_dashboard guards', () => {
  it('refuses a change the preview already holds', () => {
    const deps = depsWith([{ type: 'hide', id: 'agents' }]);
    expect(
      createPrepareDashboardTool(deps).execute({ type: 'hide', id: 'agents' }),
    ).toMatchObject({
      rejected: [{ reason: expect.stringMatching(/already/) }],
    });
    expect(deps.opened).toHaveLength(0);
  });

  it('takes the same kind of change on another card', () => {
    const bothShown = {
      ...ctx,
      cards: ctx.cards.map((card) => ({ ...card, shown: true })),
    };
    const deps = depsWith([{ type: 'hide', id: 'agents' }], {
      getContext: () => bothShown,
      getSavedContext: () => bothShown,
    });
    expect(
      createPrepareDashboardTool(deps).execute({
        type: 'hide',
        id: 'pendingSessions',
      }),
    ).toMatchObject({ rejected: [] });
  });

  it('refuses a repeated addPanel, whose id differs each call', () => {
    const deps = depsWith();
    const tool = createPrepareDashboardTool(deps);
    const first = tool.execute({
      type: 'addPanel',
      resourceType: 'session',
    }) as Record<string, unknown>;
    const deps2 = depsWith(
      JSON.parse(
        new URLSearchParams(deps.opened[0]).get('dashboardDraft') ?? '[]',
      ),
    );
    expect(first.rejected).toEqual([]);
    expect(
      createPrepareDashboardTool(deps2).execute({
        type: 'addPanel',
        resourceType: 'session',
      }),
    ).toMatchObject({
      rejected: [{ reason: expect.stringMatching(/already/) }],
    });
  });

  it('makes the new panel id itself, ignoring one in the input', () => {
    const deps = depsWith();
    const result = createPrepareDashboardTool(deps).execute({
      type: 'addPanel',
      id: 'session-1',
      resourceType: 'session',
    }) as Record<string, unknown>;
    expect(result.target).not.toBe('session-1');
  });

  it('reports the conditions it left out', () => {
    const deps = depsWith();
    const result = createPrepareDashboardTool(deps).execute({
      type: 'addPanel',
      resourceType: 'session',
      conditions: 'type == batch; type in a,b',
    }) as Record<string, unknown>;
    expect(result.applied).toHaveLength(1);
    expect(result.rejected).toEqual([
      { field: 'conditions', reason: expect.stringContaining('type in a,b') },
    ]);
  });

  it('reads earlier changes against the saved board, not the preview', () => {
    const preview = { ...ctx, cards: [], panels: [] };
    const deps = depsWith([{ type: 'createBoard', title: 'X' }], {
      getContext: () => preview,
      getSavedContext: () => ctx,
    });
    const result = createPrepareDashboardTool(deps).execute({
      type: 'hide',
      id: 'agents',
    }) as Record<string, unknown>;
    expect(result.rejected).toEqual([]);
  });
});

describe('bai_prepare_dashboard order and no-ops', () => {
  it('takes a change again after an opposite one', () => {
    const deps = depsWith([
      { type: 'hide', id: 'agents' },
      { type: 'show', id: 'agents' },
    ]);
    expect(
      createPrepareDashboardTool(deps).execute({ type: 'hide', id: 'agents' }),
    ).toMatchObject({ rejected: [] });
  });

  it('refuses a repeated addPanel even after other changes', () => {
    const deps = depsWith([
      { type: 'addPanel', resourceType: 'session', id: 'session-x' },
      { type: 'hide', id: 'agents' },
    ]);
    expect(
      createPrepareDashboardTool(deps).execute({
        type: 'addPanel',
        resourceType: 'session',
      }),
    ).toMatchObject({
      rejected: [{ reason: expect.stringMatching(/already/) }],
    });
  });

  it('judges a no-op on the saved board when the draft is cleared', () => {
    const deps = depsWith([{ type: 'hide', id: 'agents' }], {
      getContext: () => ({
        ...ctx,
        cards: ctx.cards.map((card) => ({ ...card, shown: false })),
      }),
    });
    expect(
      createPrepareDashboardTool(deps).execute({
        type: 'hide',
        id: 'agents',
        clearDraft: true,
      }),
    ).toMatchObject({ rejected: [] });
  });

  it('refuses a change the board already shows', () => {
    const deps = depsWith();
    expect(
      createPrepareDashboardTool(deps).execute({ type: 'show', id: 'agents' }),
    ).toMatchObject({
      rejected: [{ reason: expect.stringMatching(/already/) }],
    });
  });

  it('refuses a second new board in one preview', () => {
    const deps = depsWith([{ type: 'createBoard', title: 'Ops' }]);
    expect(
      createPrepareDashboardTool(deps).execute({
        type: 'createBoard',
        title: 'Ops2',
      }),
    ).toMatchObject({
      rejected: [{ reason: expect.stringMatching(/one per/) }],
    });
  });

  it('lets a panel added earlier in the preview be resized', () => {
    const [, resized] = draftOfRawActions(
      [
        { type: 'addPanel', resourceType: 'session', id: 'session-new' },
        { type: 'resize', id: 'session-new', columnSpan: 2 },
      ],
      ctx,
    );
    expect(resized.action).toMatchObject({ type: 'resize', id: 'session-new' });
  });
});

describe('draftOfRawActions stored ids', () => {
  it('does not take a stored id that names an existing card or panel', () => {
    const [result] = draftOfRawActions(
      [{ type: 'addPanel', resourceType: 'session', id: 'agents' }],
      ctx,
    );
    const added = result.action;
    expect(added?.type === 'addPanel' && added.panel.id).not.toBe('agents');
  });
});

describe('bai_get_current_dashboard', () => {
  it('reads the board, the sources and the previewed changes', () => {
    const result = createGetCurrentDashboardTool(
      depsWith([{ type: 'hide', id: 'agents' }]),
    ).execute({ withSources: true }) as Record<string, unknown>;
    expect(result.cards).toEqual([
      {
        id: 'agents',
        title: 'Agents',
        onBoard: true,
        columnSpan: 4,
        rowSpan: 4,
      },
      { id: 'pendingSessions', title: 'Pending Sessions', onBoard: false },
    ]);
    expect(result.panels).toEqual([
      {
        id: 'session-1',
        title: 'Running',
        resourceType: 'session',
        panelType: 'resourceTable',
        filter: 'status == "RUNNING"',
      },
    ]);
    expect(String(result.sourcesHelp)).toContain('type (Type, string)');
    expect(result.draft).toEqual(['hide']);
    expect(result.canCreateBoard).toBe(true);
    expect(
      createGetCurrentDashboardTool(depsWith()).execute({}),
    ).not.toHaveProperty('sourcesHelp');
  });
});
