/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import {
  answersFromManual,
  buildDashboardChatPrompt,
  dashboardExamplesOf,
  looksLikeQuestion,
  parseDashboardChatReply,
  type DashboardChatContext,
} from './dashboardChat';

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

describe('parseDashboardChatReply', () => {
  it('reads the reply and every kind of action', () => {
    const { reply, actions } = parseDashboardChatReply(
      JSON.stringify({
        reply: 'Done',
        actions: [
          { type: 'createBoard', title: 'Incidents' },
          { type: 'show', id: 'pendingSessions' },
          {
            type: 'addPanel',
            resourceType: 'session',
            panelType: 'resourceCount',
            title: 'Batch',
            conditions: [{ property: 'type', operator: '==', value: 'batch' }],
          },
          { type: 'editPanel', id: 'Running', title: 'Interactive' },
          { type: 'explode' },
        ],
      }),
      ctx,
    );
    expect(reply).toBe('Done');
    expect(actions.map((action) => action.type)).toEqual([
      'createBoard',
      'show',
      'addPanel',
      'editPanel',
    ]);
    const added = actions[2];
    expect(added.type === 'addPanel' && added.panel).toMatchObject({
      key: expect.any(String),
      title: 'Batch',
      filter: 'type == "batch"',
    });
    const edited = actions[3];
    // An omitted condition and order keep the panel's own.
    expect(edited.type === 'editPanel' && edited.input).toMatchObject({
      title: 'Interactive',
      filter: 'status == "RUNNING"',
      order: '-created_at',
    });
  });

  it('replaces a condition only when the edit names one', () => {
    const { actions } = parseDashboardChatReply(
      '{"actions":[{"type":"editPanel","id":"session-1","conditions":[]}]}',
      ctx,
    );
    expect(actions[0].type === 'editPanel' && actions[0].input.filter).toBe(
      null,
    );
  });

  it('drops createBoard on a page with a single board', () => {
    const { actions } = parseDashboardChatReply(
      '{"actions":[{"type":"createBoard","title":"X"}]}',
      { ...ctx, canCreateBoard: false },
    );
    expect(actions).toEqual([]);
  });

  it('treats prose without JSON as a question for the manual', () => {
    expect(parseDashboardChatReply('I cannot do that.', ctx)).toEqual({
      reply: 'I cannot do that.',
      actions: [],
      isQuestion: true,
    });
  });

  it('reads the question flag, unless the reply also changes the board', () => {
    expect(parseDashboardChatReply('{"question":true}', ctx).isQuestion).toBe(
      true,
    );
    expect(
      parseDashboardChatReply(
        '{"question":true,"actions":[{"type":"show","id":"pendingSessions"}]}',
        ctx,
      ).isQuestion,
    ).toBe(false);
    expect(
      parseDashboardChatReply('{"reply":"Nothing to do.","actions":[]}', ctx)
        .isQuestion,
    ).toBe(false);
  });
});

describe('buildDashboardChatPrompt', () => {
  it('lists cards, panels and the actions the page allows', () => {
    const prompt = buildDashboardChatPrompt(ctx);
    expect(prompt).toContain('- agents | Agents | on board | size 4x4');
    expect(prompt).toContain(
      '- session-1 | Running | session | resourceTable | status == "RUNNING"',
    );
    expect(prompt).toContain('createBoard {title}');
    expect(prompt).toContain('{"question":true}');
    expect(
      buildDashboardChatPrompt({ ...ctx, canCreateBoard: false }),
    ).not.toContain('createBoard');
  });
});

describe('parseDashboardChatReply with a small model reply', () => {
  // Qwen3-0.6B, verbatim: two objects in a row, a stray quote, no resourceType.
  const reply = String.raw`{"reply":"Add a table of running interactive sessions","actions":[{"type":"addPanel","id":"sessionLaunches","title":"Running Interactive Sessions","conditions":[{"property":"status","operator":"==","value":"RUNNING"}"],"chartType":"resourceChart","groupBy":"status","range":{"now-1h":true,"now-24h":true,"now-7d":true}}]} {"reply":"Added a new resourceTable panel for running interactive sessions","actions":[{"type":"show","id":"sessionLaunches"}]}`;
  const withStatus: DashboardChatContext = {
    ...ctx,
    sources: [
      {
        ...ctx.sources[0],
        filter: {
          kind: 'minilang',
          properties: [
            {
              key: 'status',
              propertyLabel: 'Status',
              type: 'string',
              strictSelection: true,
              options: [{ label: 'RUNNING', value: 'RUNNING' }],
            },
          ],
        },
      },
    ],
  };

  it('repairs the JSON, infers the source and keeps the panel', () => {
    const { reply: text, actions } = parseDashboardChatReply(reply, withStatus);
    expect(text).toBe('Add a table of running interactive sessions');
    expect(actions).toHaveLength(1);
    expect(actions[0].type === 'addPanel' && actions[0].panel).toMatchObject({
      title: 'Running Interactive Sessions',
      filter: 'status == "RUNNING"',
      viz: 'table',
    });
  });

  it('never shows unreadable JSON as the reply', () => {
    expect(parseDashboardChatReply('{"reply": broken', ctx).reply).toBe('');
  });
});

describe('parseDashboardChatReply with repeated actions', () => {
  it('keeps one of the same action written twice', () => {
    const add = {
      type: 'addPanel',
      resourceType: 'session',
      panelType: 'resourceTable',
      title: 'Batch',
      conditions: [{ property: 'type', operator: '==', value: 'batch' }],
    };
    const { actions } = parseDashboardChatReply(
      `${JSON.stringify({ reply: 'a', actions: [add, { type: 'show', id: 'pendingSessions' }] })} ${JSON.stringify({ reply: 'b', actions: [add, { type: 'show', id: 'pendingSessions' }] })}`,
      ctx,
    );
    expect(actions.map((action) => action.type)).toEqual(['addPanel', 'show']);
  });
});

describe('buildDashboardChatPrompt examples', () => {
  it('shows a worked addPanel example built from a real source', () => {
    const prompt = buildDashboardChatPrompt(ctx);
    expect(prompt).toContain('Examples:');
    expect(prompt).toContain('User: Hide the Agents card');
    expect(prompt).toContain('"type":"addPanel","resourceType":"session"');
    expect(prompt).toContain(
      '"conditions":[{"property":"type","operator":"==","value":"interactive"}]',
    );
  });
});

describe('looksLikeQuestion', () => {
  it('recognises questions in English and Korean', () => {
    expect(looksLikeQuestion('How do I start a session?')).toBe(true);
    expect(looksLikeQuestion('what is a resource group')).toBe(true);
    expect(looksLikeQuestion('세션은 어떻게 시작하나요?')).toBe(true);
    expect(looksLikeQuestion('어떻게 폴더를 공유해')).toBe(true);
    expect(looksLikeQuestion('Hide the Agents card')).toBe(false);
    expect(looksLikeQuestion('실행 중인 세션 표 추가해 줘')).toBe(false);
  });
});

describe('dashboardExamplesOf', () => {
  const t = ((key: string) => key) as unknown as Parameters<
    typeof dashboardExamplesOf
  >[1];

  it('gives two examples: a board on pages with boards, else a panel', () => {
    expect(dashboardExamplesOf(ctx, t)).toEqual([
      'webuiAssistant.DashboardChatExampleLayout',
      'webuiAssistant.DashboardChatExampleBoard',
    ]);
    expect(dashboardExamplesOf({ ...ctx, canCreateBoard: false }, t)).toEqual([
      'webuiAssistant.DashboardChatExampleLayout',
      'webuiAssistant.DashboardChatExamplePanel',
    ]);
  });
});

describe('answersFromManual', () => {
  const route = (request: string, isQuestion: boolean, hasChange = false) =>
    answersFromManual({ request, isQuestion, hasChange });

  it('sends questions to the manual and keeps instructions on the dashboard', () => {
    expect(route('세션은 어떻게 시작하나요?', false)).toBe(true);
    expect(route('세션 시작하는 법 알려 줘', false)).toBe(true);
    // A small model prefixes {"question":true} to an instruction.
    expect(route('자원 할당 카드로 장애 대응 보드 만들어 줘', true)).toBe(
      false,
    );
    expect(route('Create a board named Incidents', true)).toBe(false);
    expect(route('session quota', true)).toBe(true);
    expect(route('session quota', false)).toBe(false);
    expect(route('How do I start a session?', true, true)).toBe(false);
  });
});

describe('buildDashboardChatPrompt board example', () => {
  it('fills a new board in its example and puts the question example last', () => {
    const prompt = buildDashboardChatPrompt(ctx);
    expect(prompt).toContain(
      '{"type":"createBoard","title":"Incidents"},{"type":"show","id":"agents"},{"type":"show","id":"pendingSessions"}',
    );
    expect(prompt.indexOf('{"question":true}\n')).toBeGreaterThan(
      prompt.indexOf('createBoard","title":"Incidents"'),
    );
    expect(
      buildDashboardChatPrompt({ ...ctx, canCreateBoard: false }),
    ).not.toContain('Incidents');
  });
});

describe('parseDashboardChatReply guards', () => {
  it('keeps the panel condition when every new one is rejected', () => {
    const { actions } = parseDashboardChatReply(
      '{"actions":[{"type":"editPanel","id":"session-1","conditions":[{"property":"gpu","operator":"==","value":"yes"}]}]}',
      ctx,
    );
    expect(actions[0]).toMatchObject({
      type: 'editPanel',
      input: { filter: 'status == "RUNNING"' },
    });
  });

  it('drops an added panel whose named conditions were all rejected', () => {
    expect(
      parseDashboardChatReply(
        '{"actions":[{"type":"addPanel","resourceType":"session","conditions":[{"property":"gpu","operator":"==","value":"yes"}]}]}',
        ctx,
      ).actions,
    ).toEqual([]);
  });

  it('keeps only the first createBoard of a reply', () => {
    const { actions } = parseDashboardChatReply(
      '{"actions":[{"type":"createBoard","title":"A"},{"type":"show","id":"pendingSessions"},{"type":"createBoard","title":"B"}]}',
      ctx,
    );
    expect(actions.map((action) => action.type)).toEqual([
      'createBoard',
      'show',
    ]);
  });
});
