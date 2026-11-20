/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import {
  buildDashboardChatPrompt,
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

  it('keeps plain text as the reply when there is no JSON', () => {
    expect(parseDashboardChatReply('I cannot do that.', ctx)).toEqual({
      reply: 'I cannot do that.',
      actions: [],
    });
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
    expect(
      buildDashboardChatPrompt({ ...ctx, canCreateBoard: false }),
    ).not.toContain('createBoard');
  });
});
