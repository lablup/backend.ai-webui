/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import {
  buildPanelPrompt,
  filterOfConditions,
  parsePanelReply,
  sanitizeConditions,
  type PanelSourceSpec,
} from './panelFromRequest';

const session: PanelSourceSpec = {
  key: 'session',
  label: 'Sessions',
  panelTypes: ['resourceTable', 'resourceCount', 'resourceChart'],
  filter: {
    kind: 'minilang',
    properties: [
      { key: 'name', propertyLabel: 'Name', type: 'string' },
      {
        key: 'status',
        propertyLabel: 'Status',
        type: 'string',
        defaultOperator: '==',
        strictSelection: true,
        options: [
          { label: 'RUNNING', value: 'RUNNING' },
          { label: 'PENDING', value: 'PENDING' },
        ],
      },
      { key: 'occupied_slots', propertyLabel: 'Slots', type: 'number' },
      {
        key: 'id',
        propertyLabel: 'Session ID',
        type: 'uuid',
        rule: {
          message: 'Invalid UUID',
          validate: (value: string) => /^[0-9a-f-]{36}$/.test(value),
        },
      },
    ],
  },
  groupings: [{ key: 'status', label: 'Status' }],
};

const vfolder: PanelSourceSpec = {
  key: 'vfolder',
  label: 'Folders',
  panelTypes: ['resourceTable', 'resourceCount', 'resourceChart'],
  filter: {
    kind: 'graphql',
    properties: [
      { key: 'name', propertyLabel: 'Name', type: 'string' },
      {
        key: 'usageMode',
        propertyLabel: 'Usage mode',
        type: 'enum',
        strictSelection: true,
        options: [
          { label: 'General', value: 'GENERAL' },
          { label: 'Model', value: 'MODEL' },
        ],
      },
    ],
  },
  groupings: [{ key: 'usageMode', label: 'Usage mode' }],
};

describe('sanitizeConditions', () => {
  it('keeps listed properties, offered operators and allowed values', () => {
    expect(
      sanitizeConditions(
        [
          { property: 'status', operator: '==', value: 'RUNNING' },
          { property: 'status', operator: '==', value: 'ACTIVE' },
          { property: 'status', operator: 'ilike', value: 'RUN' },
          { property: 'unknown', operator: '==', value: 'x' },
          { property: 'name', operator: 'ilike', value: 'train' },
          { property: 'occupied_slots', operator: '>', value: 2 },
          { property: 'id', operator: '==', value: '<uuid>' },
          { property: 'id', operator: '==', value: 'abc' },
          { property: 'name', operator: 'ilike', value: '<name>' },
          'name ilike x',
        ],
        session,
      ),
    ).toEqual([
      { property: 'status', operator: '==', value: 'RUNNING' },
      { property: 'name', operator: 'ilike', value: 'train' },
      { property: 'occupied_slots', operator: '>', value: '2' },
    ]);
  });
});

describe('filterOfConditions', () => {
  it('writes the session minilang', () => {
    expect(
      filterOfConditions(session, [
        { property: 'status', operator: '==', value: 'RUNNING' },
        { property: 'name', operator: 'ilike', value: 'train' },
        { property: 'occupied_slots', operator: '>', value: '2' },
      ]),
    ).toBe('status == "RUNNING" & name ilike "%train%" & occupied_slots > 2');
  });

  it('builds a GraphQL filter', () => {
    expect(
      filterOfConditions(vfolder, [
        { property: 'usageMode', operator: 'equals', value: 'MODEL' },
      ]),
    ).toEqual({ usageMode: { equals: 'MODEL' } });
  });

  it('escapes backslashes and quotes in a minilang value', () => {
    expect(
      filterOfConditions(session, [
        { property: 'name', operator: '==', value: String.raw`a\"b\\` },
      ]),
    ).toBe(String.raw`name == "a\\\"b\\\\"`);
  });

  it('is undefined without conditions', () => {
    expect(filterOfConditions(session, [])).toBeUndefined();
  });
});

describe('parsePanelReply', () => {
  it('reads the panel a reply describes', () => {
    expect(
      parsePanelReply(
        '```json\n{"resourceType":"session","panelType":"resourceTable","title":"Running","conditions":[{"property":"status","operator":"==","value":"RUNNING"}]}\n```',
        [session, vfolder],
      ),
    ).toEqual({
      resourceType: 'session',
      panelType: 'resourceTable',
      title: 'Running',
      filter: 'status == "RUNNING"',
    });
  });

  it('keeps chart settings only on a chart and drops unknown values', () => {
    expect(
      parsePanelReply(
        '{"resourceType":"vfolder","panelType":"resourceChart","chartType":"donut","groupBy":"usageMode","range":"yesterday"}',
        [session, vfolder],
      ),
    ).toEqual({
      resourceType: 'vfolder',
      panelType: 'resourceChart',
      filter: undefined,
      chartType: 'donut',
      groupBy: 'usageMode',
      range: undefined,
    });
  });

  it('falls back to a table and rejects an unknown source', () => {
    expect(
      parsePanelReply('{"resourceType":"session","panelType":"map"}', [session])
        ?.panelType,
    ).toBe('resourceTable');
    expect(parsePanelReply('{"resourceType":"users"}', [session])).toBeNull();
    expect(parsePanelReply('no json here', [session])).toBeNull();
  });
});

describe('buildPanelPrompt', () => {
  it('lists properties with their operators and values', () => {
    const prompt = buildPanelPrompt([session, vfolder]);
    expect(prompt).toContain(
      '- status (Status, string); operators: == !=; values: RUNNING PENDING',
    );
    expect(prompt).toContain('- session (Sessions); panel types:');
    expect(prompt).toContain('Reply with only a JSON object');
  });
});
