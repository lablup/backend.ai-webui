/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import {
  buildSessionPrefill,
  isRequestedImage,
  PREPARE_SESSION_INPUT_SCHEMA,
  sessionNameProblem,
  type SessionPrefillContext,
} from './webmcpSessionPrefill';
import { validateWebMCPInput } from 'backend.ai-ui';
import { describe, expect, it } from 'vitest';

const context: SessionPrefillContext = {
  folders: [
    { vfolderId: 'aaaaaaaa-0000-0000-0000-000000000001', name: 'data' },
    { vfolderId: 'aaaaaaaa-0000-0000-0000-000000000002', name: 'models' },
    { vfolderId: 'aaaaaaaa-0000-0000-0000-000000000003', name: 'dup' },
    { vfolderId: 'aaaaaaaa-0000-0000-0000-000000000004', name: 'dup' },
  ],
  allowCustomResourceAllocation: true,
};

describe('buildSessionPrefill', () => {
  it('maps every field onto the launcher formValues shape', () => {
    const result = buildSessionPrefill(
      {
        sessionType: 'batch',
        sessionName: 'agent-prefill-demo',
        startupCommand: 'python train.py',
        image: 'cr.backend.ai/stable/python:3.9-ubuntu20.04@x86_64',
        cpu: 2,
        memoryGiB: 4,
        accelerator: 0.5,
        acceleratorType: 'cuda.shares',
        clusterMode: 'single-node',
        clusterSize: 2,
        folders: 'data, models',
      },
      context,
    );

    expect(result.formValues).toEqual({
      sessionType: 'batch',
      sessionName: 'agent-prefill-demo',
      batch: { command: 'python train.py' },
      environments: {
        version: 'cr.backend.ai/stable/python:3.9-ubuntu20.04@x86_64',
      },
      allocationPreset: 'custom',
      resource: {
        cpu: 2,
        mem: '4g',
        accelerator: 0.5,
        acceleratorType: 'cuda.shares',
      },
      cluster_mode: 'single-node',
      cluster_size: 2,
      vfolderMounts: [
        {
          vfolderId: 'aaaaaaaa-0000-0000-0000-000000000001',
          name: 'data',
          mountDestination: '',
          subpath: '',
        },
        {
          vfolderId: 'aaaaaaaa-0000-0000-0000-000000000002',
          name: 'models',
          mountDestination: '',
          subpath: '',
        },
      ],
    });
    expect(result.rejected).toEqual([]);
    // The image is confirmed only after the launcher resolves it.
    expect(result.applied).not.toHaveProperty('image');
    expect(result.applied).toMatchObject({
      sessionName: 'agent-prefill-demo',
      folders: ['data', 'models'],
      cpu: 2,
      memoryGiB: 4,
    });
  });

  it('leaves the launcher defaults alone for an empty input', () => {
    expect(buildSessionPrefill({}, context)).toEqual({
      formValues: {},
      applied: {},
      rejected: [],
    });
  });

  it.each([
    ['-starts-with-dash', 'must start'],
    ['ends-with-dot.', 'must end'],
    ['has space', 'may contain only'],
  ])('rejects the session name %j', (sessionName, reason) => {
    const result = buildSessionPrefill({ sessionName }, context);
    expect(result.formValues).not.toHaveProperty('sessionName');
    expect(result.rejected).toEqual([
      { field: 'sessionName', reason: expect.stringContaining(reason) },
    ]);
  });

  it('rejects a startup command outside batch mode', () => {
    const result = buildSessionPrefill({ startupCommand: 'echo hi' }, context);
    expect(result.formValues).toEqual({});
    expect(result.rejected[0].field).toBe('startupCommand');
  });

  it('rejects unknown and ambiguous folders but keeps the rest', () => {
    const result = buildSessionPrefill(
      { folders: 'data,missing,dup,.local,data' },
      context,
    );
    expect(result.formValues.vfolderMounts).toHaveLength(1);
    expect(result.applied.folders).toEqual(['data']);
    expect(result.rejected.map((r) => r.reason)).toEqual([
      expect.stringContaining('"missing"'),
      expect.stringContaining('"dup"'),
      expect.stringContaining('".local"'),
    ]);
  });

  it('requires cpu and memory together', () => {
    const result = buildSessionPrefill({ cpu: 2, accelerator: 1 }, context);
    expect(result.formValues).toEqual({});
    expect(result.rejected.map((r) => r.field)).toEqual(['cpu', 'accelerator']);
  });

  it('rejects resource amounts when custom allocation is off', () => {
    const result = buildSessionPrefill(
      { cpu: 2, memoryGiB: 4 },
      { ...context, allowCustomResourceAllocation: false },
    );
    expect(result.formValues).toEqual({});
    expect(result.rejected).toHaveLength(2);
  });

  it('rejects a non-accelerator slot as acceleratorType', () => {
    const result = buildSessionPrefill(
      { cpu: 1, memoryGiB: 1, acceleratorType: 'mem.x' },
      context,
    );
    expect(result.formValues).toEqual({});
    expect(result.rejected.map((r) => r.field)).toContain('acceleratorType');
  });
});

describe('PREPARE_SESSION_INPUT_SCHEMA', () => {
  it('refuses keys it does not declare and enforces types', () => {
    expect(
      validateWebMCPInput(PREPARE_SESSION_INPUT_SCHEMA, { submit: true }).ok,
    ).toBe(false);
    expect(
      validateWebMCPInput(PREPARE_SESSION_INPUT_SCHEMA, {
        sessionType: 'inference',
      }).ok,
    ).toBe(false);
    expect(
      validateWebMCPInput(PREPARE_SESSION_INPUT_SCHEMA, { sessionName: 'ab' })
        .ok,
    ).toBe(false);
    expect(
      validateWebMCPInput(PREPARE_SESSION_INPUT_SCHEMA, { clusterSize: 1.5 })
        .ok,
    ).toBe(false);
  });
});

describe('sessionNameProblem', () => {
  it('accepts names the launcher accepts', () => {
    expect(sessionNameProblem('my_session-1.2')).toBeNull();
  });
});

describe('isRequestedImage', () => {
  const version = 'cr.backend.ai/stable/python:3.9-ubuntu20.04@x86_64';

  it.each([
    [version, true],
    ['cr.backend.ai/stable/python:3.9-ubuntu20.04', true],
    ['cr.backend.ai/stable/python', true],
    ['cr.backend.ai/stable/python:3.10-ubuntu22.04', false],
    ['cr.backend.ai/stable/python:3.9-ubuntu20.04@aarch64', false],
  ])('%s -> %s', (requested, expected) => {
    expect(isRequestedImage(requested, { version })).toBe(expected);
  });

  it('accepts a manual image the launcher kept verbatim', () => {
    expect(isRequestedImage('my/image:1', { manual: 'my/image:1' })).toBe(true);
  });
});
