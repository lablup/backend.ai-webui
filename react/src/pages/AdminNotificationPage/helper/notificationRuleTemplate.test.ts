/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import {
  buildDefaultTemplate,
  buildSampleNotificationData,
  getTemplateVariables,
  insertAtSelection,
} from './notificationRuleTemplate';
import { describe, expect, it } from 'vitest';

// Trimmed from the manager's SessionTerminatedMessage schema.
const sessionTerminatedSchema = {
  title: 'SessionTerminatedMessage',
  type: 'object',
  properties: {
    session_id: { title: 'Session Id', type: 'string' },
    session_name: {
      anyOf: [{ type: 'string' }, { type: 'null' }],
      default: null,
      description: 'User-defined name for the session, if provided',
      title: 'Session Name',
    },
    status: { type: 'string', description: 'Final status of the session' },
    retries: { type: 'integer' },
  },
  required: ['session_id', 'status'],
};

describe('getTemplateVariables', () => {
  it('lists the required variables first and resolves anyOf types', () => {
    const variables = getTemplateVariables(sessionTerminatedSchema);
    expect(variables.map((v) => [v.name, v.isRequired, v.type])).toEqual([
      ['session_id', true, 'string'],
      ['status', true, 'string'],
      ['session_name', false, 'string'],
      ['retries', false, 'integer'],
    ]);
    expect(variables[2]?.description).toBe(
      'User-defined name for the session, if provided',
    );
  });

  it('returns nothing for a missing or malformed schema', () => {
    expect(getTemplateVariables(null)).toEqual([]);
    expect(getTemplateVariables('schema')).toEqual([]);
    expect(getTemplateVariables({ properties: 3 })).toEqual([]);
  });
});

describe('buildDefaultTemplate', () => {
  it('writes one line per required variable', () => {
    expect(
      buildDefaultTemplate(getTemplateVariables(sessionTerminatedSchema)),
    ).toBe('session_id: {{ session_id }}\nstatus: {{ status }}');
  });
});

describe('buildSampleNotificationData', () => {
  it('fills a value of the right type for every variable', () => {
    expect(
      buildSampleNotificationData(
        getTemplateVariables(sessionTerminatedSchema),
      ),
    ).toEqual({
      session_id: 'sample-session_id',
      status: 'sample-status',
      session_name: 'sample-session_name',
      retries: 1,
    });
  });
});

describe('insertAtSelection', () => {
  it('replaces the selection and moves the caret past the insert', () => {
    expect(insertAtSelection('ab cd', '{{ x }}', 3, 5)).toEqual({
      value: 'ab {{ x }}',
      caret: 10,
    });
  });

  it('appends when there is no selection', () => {
    expect(insertAtSelection('ab', '!', null, null)).toEqual({
      value: 'ab!',
      caret: 3,
    });
  });

  it('clamps an out-of-range selection', () => {
    expect(insertAtSelection('ab', '!', 10, 20)).toEqual({
      value: 'ab!',
      caret: 3,
    });
  });
});
