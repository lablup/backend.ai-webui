/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import {
  buildSessionPayload,
  type SessionPayloadContext,
  type SessionPayloadValues,
} from './payload';

const values = (
  overrides: Partial<SessionPayloadValues> = {},
): SessionPayloadValues =>
  ({
    sessionType: 'interactive',
    sessionName: 'my-session',
    environments: {
      environment: 'cr.backend.ai/stable/python',
      version: 'cr.backend.ai/stable/python:3.11@x86_64',
    },
    resourceGroup: 'default',
    resource: { cpu: 2, mem: '4g', shmem: '64m', accelerator: 0 },
    cluster_mode: 'single-node',
    cluster_size: 1,
    envvars: [],
    hpcOptimization: { autoEnabled: true },
    batch: { enabled: false, timeoutEnabled: false, timeoutUnit: 's' },
    ports: [],
    agent: ['auto'],
    ...overrides,
  }) as SessionPayloadValues;

const ctx = (
  overrides: Partial<SessionPayloadContext> = {},
): SessionPayloadContext => ({
  imageFullName: 'cr.backend.ai/stable/python:3.11@x86_64',
  generateSessionName: () => 'generated-session',
  currentProjectName: 'ambient',
  domainName: 'default',
  hideAgents: false,
  ...overrides,
});

describe('buildSessionPayload', () => {
  it('PAY-01: kernel and architecture come from the image reference', () => {
    expect(buildSessionPayload(values(), ctx())).toMatchObject({
      kernelName: 'cr.backend.ai/stable/python:3.11',
      architecture: 'x86_64',
    });
    expect(
      buildSessionPayload(values(), ctx({ imageFullName: 'my/img:1' }))
        .architecture,
    ).toBeUndefined();
  });

  it.each([
    ['my-session', 'my-session'],
    ['', 'generated-session'],
    [undefined, 'generated-session'],
  ])('PAY-02: session name %s -> %s', (sessionName, expected) => {
    expect(
      buildSessionPayload(values({ sessionName }), ctx()).sessionName,
    ).toBe(expected);
  });

  it.each([
    { project: 'explicit', expected: 'explicit' },
    { project: undefined, expected: 'ambient' },
  ])('PAY-03: group_name $project -> $expected', ({ project, expected }) => {
    expect(
      buildSessionPayload(values({ projectName: project }), ctx()).resources
        .group_name,
    ).toBe(expected);
  });

  it.each([
    { mode: 'multi-node', size: 1, expected: 'single-node' },
    { mode: 'multi-node', size: 2, expected: 'multi-node' },
    { mode: 'single-node', size: 1, expected: 'single-node' },
  ] as const)(
    'PAY-05: $mode x$size -> $expected',
    ({ mode, size, expected }) => {
      const { resources } = buildSessionPayload(
        values({ cluster_mode: mode, cluster_size: size }),
        ctx(),
      );
      expect(resources.cluster_mode).toBe(expected);
      expect(resources.cluster_size).toBe(size);
    },
  );

  it('PAY-06: batch fields and the batchTimeout quirk', () => {
    const { resources } = buildSessionPayload(
      values({
        sessionType: 'batch',
        batch: {
          enabled: true,
          command: 'python run.py',
          scheduleDate: '2026-10-21T00:00:00Z',
          timeoutEnabled: true,
          timeout: '30',
          timeoutUnit: 'm',
        },
      } as Partial<SessionPayloadValues>),
      ctx(),
    );
    expect(resources).toMatchObject({
      starts_at: '2026-10-21T00:00:00Z',
      startupCommand: 'python run.py',
      batchTimeout: '30m',
    });
  });

  it('PAY-06: a disabled schedule sends no start time', () => {
    const { resources } = buildSessionPayload(
      values({
        sessionType: 'batch',
        batch: {
          enabled: false,
          command: 'x',
          scheduleDate: '2026-10-21T00:00:00Z',
          timeoutEnabled: false,
          timeoutUnit: 's',
        },
      } as Partial<SessionPayloadValues>),
      ctx(),
    );
    expect(resources.starts_at).toBeUndefined();
    expect(resources).not.toHaveProperty('batchTimeout');
  });

  it.each([
    {
      name: 'discrete accelerator > 0 is sent',
      resource: {
        cpu: 1,
        mem: '1g',
        accelerator: 2,
        acceleratorType: 'cuda.device',
      },
      expectedResources: { cpu: 1, mem: '1g', 'cuda.device': 2 },
      tag: undefined,
    },
    {
      name: 'accelerator 0 is omitted',
      resource: {
        cpu: 1,
        mem: '1g',
        accelerator: 0,
        acceleratorType: 'cuda.device',
      },
      expectedResources: { cpu: 1, mem: '1g' },
      tag: undefined,
    },
    {
      name: 'unified slot: tag, no quantity',
      resource: {
        cpu: 1,
        mem: '1g',
        accelerator: 2,
        acceleratorType: 'cuda.unified',
      },
      expectedResources: { cpu: 1, mem: '1g' },
      tag: 'unified-slot:cuda.unified',
    },
  ])('PAY-07: $name', ({ resource, expectedResources, tag }) => {
    const { resources } = buildSessionPayload(
      values({ resource } as Partial<SessionPayloadValues>),
      ctx(),
    );
    expect(resources.config?.resources).toEqual(expectedResources);
    expect((resources as { tag?: string }).tag).toBe(tag);
  });

  it('PAY-08: scaling group and shmem', () => {
    expect(buildSessionPayload(values(), ctx()).resources.config).toMatchObject(
      { scaling_group: 'default', resource_opts: { shmem: '64m' } },
    );
  });

  it.each([
    {
      name: 'HPC auto keeps only env vars',
      hpc: { autoEnabled: true, OMP_NUM_THREADS: '4' },
      expected: { A: '1' },
    },
    {
      name: 'HPC manual adds thread vars',
      hpc: {
        autoEnabled: false,
        OMP_NUM_THREADS: '4',
        OPENBLAS_NUM_THREADS: '2',
      },
      expected: { A: '1', OMP_NUM_THREADS: '4', OPENBLAS_NUM_THREADS: '2' },
    },
  ])('PAY-09: $name', ({ hpc, expected }) => {
    expect(
      buildSessionPayload(
        values({
          envvars: [{ variable: 'A', value: '1' }],
          hpcOptimization: hpc,
        } as Partial<SessionPayloadValues>),
        ctx(),
      ).resources.config?.environ,
    ).toEqual(expected);
  });

  it('PAY-10: mounts', () => {
    const vfolderId = '0b9c2c6e-62e7-4c1a-8d36-1f36f8c4a4b1';
    expect(
      buildSessionPayload(
        values({
          vfolderMounts: [{ vfolderId, name: 'data' }],
        } as Partial<SessionPayloadValues>),
        ctx(),
      ).resources.config,
    ).toMatchObject({
      mount_ids: [vfolderId],
      mount_id_map: { [vfolderId]: '/home/work/data' },
    });
  });

  it.each([
    { agent: ['auto'], hide: false, expected: undefined },
    { agent: 'auto', hide: false, expected: undefined },
    { agent: ['i-1', 'i-2'], hide: false, expected: ['i-1', 'i-2'] },
    { agent: 'i-1', hide: false, expected: ['i-1'] },
    { agent: ['i-1', ''], hide: false, expected: ['i-1'] },
    { agent: ['i-1'], hide: true, expected: undefined },
    { agent: undefined, hide: false, expected: undefined },
  ])('PAY-11: agent $agent (hidden $hide)', ({ agent, hide, expected }) => {
    expect(
      buildSessionPayload(
        values({ agent } as Partial<SessionPayloadValues>),
        ctx({ hideAgents: hide }),
      ).resources.config?.agent_list,
    ).toEqual(expected);
  });

  it('PAY-12: queue defaults', () => {
    expect(buildSessionPayload(values(), ctx()).resources).toMatchObject({
      enqueueOnly: true,
      maxWaitSeconds: 15,
      reuseIfExists: false,
    });
    expect(
      buildSessionPayload(values({ reuseIfExists: true }), ctx()).resources
        .reuseIfExists,
    ).toBe(true);
  });
});
