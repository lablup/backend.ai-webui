/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
/**
 * Characterization (golden) tests for the payload builder in
 * `useStartSession` (rules PAY-xx in the launcher map). They pin what is sent
 * to `client.createIfNotExists` today, bugs included, so a rewrite can be
 * checked against it. Expected values were observed on origin/main 5b80b205e8.
 */
import '../../../__test__/matchMedia.mock.js';
import { useStartSession } from '../../hooks/useStartSession';
import type { SessionLauncherFormValue } from '../../pages/SessionLauncherPage';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import {
  type ComponentProps,
  createElement,
  type ReactNode,
  Suspense,
} from 'react';
import { RelayEnvironmentProvider } from 'react-relay';
import { createMockEnvironment, MockPayloadGenerator } from 'relay-test-utils';

vi.mock('react-i18next', async () => {
  const React = await import('react');
  return {
    useTranslation: () => ({
      t: (key: string) => key,
      i18n: { language: 'en', changeLanguage: () => new Promise(() => {}) },
      ready: true,
    }),
    Trans: (props: any) => React.createElement('span', null, props.i18nKey),
    initReactI18next: { type: '3rdParty', init: () => {} },
  };
});

const createIfNotExists = vi.fn();
let clientConfig: Record<string, unknown> = {};

vi.mock('../../hooks', async (importOriginal) => {
  const original = await importOriginal<typeof import('../../hooks')>();
  return {
    ...original,
    useSuspendedBackendaiClient: () => ({
      _config: clientConfig,
      createIfNotExists,
    }),
  };
});

vi.mock('../../hooks/useCurrentProject', () => ({
  useCurrentProjectValue: () => ({
    id: 'ambient-project-id',
    name: 'ambient-project',
  }),
  useCurrentResourceGroupState: () => ['global-rg', vi.fn()],
}));

vi.mock('../../hooks/useBAINotification', () => ({
  useSetBAINotification: () => ({ upsertNotification: vi.fn() }),
}));

// Images known to the tag-less resolver (`resolveImageReference`).
const IMAGES = [
  {
    id: 'img-1',
    registry: 'cr.backend.ai',
    namespace: 'stable/python',
    tag: '3.9-ubuntu20.04',
    architecture: 'x86_64',
    labels: [],
    tags: [],
    resource_limits: [],
  },
  {
    id: 'img-2',
    registry: 'cr.backend.ai',
    namespace: 'stable/python',
    tag: '3.11-ubuntu22.04',
    architecture: 'x86_64',
    labels: [],
    tags: [],
    resource_limits: [],
  },
];

const renderStartSession = () => {
  const environment = createMockEnvironment();
  environment.mock.queueOperationResolver((operation) =>
    MockPayloadGenerator.generate(operation, {
      Query: () => ({ images: IMAGES }),
    }),
  );
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return renderHook(() => useStartSession(), {
    wrapper: ({ children }: { children: ReactNode }) =>
      createElement(
        RelayEnvironmentProvider,
        // `children` goes positionally (react/no-children-prop).
        { environment } as unknown as ComponentProps<
          typeof RelayEnvironmentProvider
        >,
        createElement(
          QueryClientProvider,
          { client: queryClient },
          createElement(Suspense, { fallback: null }, children),
        ),
      ),
  });
};

const BASE_VALUES = {
  sessionType: 'interactive',
  sessionName: 'my-session',
  environments: {
    environment: 'cr.backend.ai/stable/python',
    version: 'cr.backend.ai/stable/python:3.11-ubuntu22.04@x86_64',
  },
  resourceGroup: 'rg-a',
  allocationPreset: 'custom',
  resource: {
    cpu: 2,
    mem: '4g',
    shmem: '1g',
    accelerator: 0,
    acceleratorType: 'cuda.device',
  },
  cluster_mode: 'single-node',
  cluster_size: 1,
  enabledAutomaticShmem: true,
  agent: ['auto'],
  hpcOptimization: { autoEnabled: true },
  batch: {
    enabled: false,
    timeoutEnabled: false,
    timeoutUnit: 's',
  },
  envvars: [],
  ports: [],
  vfolderMounts: [],
} as unknown as SessionLauncherFormValue;

const launch = async (overrides: Record<string, unknown> = {}) => {
  const { result } = renderStartSession();
  await waitFor(() => expect(result.current).toBeTruthy());
  let results: unknown;
  await act(async () => {
    results = await result.current.startSession({
      ...BASE_VALUES,
      ...overrides,
    } as SessionLauncherFormValue);
  });
  return { calls: createIfNotExists.mock.calls, results };
};

describe('session launcher payload (useStartSession) characterization', () => {
  beforeEach(() => {
    clientConfig = { domainName: 'default' };
    createIfNotExists.mockReset();
    createIfNotExists.mockResolvedValue({
      created: true,
      status: 'PENDING',
      sessionId: 'sid',
    });
  });

  it('PAY-01 PAY-03 PAY-04 PAY-08 PAY-12 interactive single-node golden payload', async () => {
    const { calls } = await launch();
    expect(calls).toHaveLength(1);
    const [kernelName, sessionName, resources, timeout, architecture] =
      calls[0];
    expect(kernelName).toBe('cr.backend.ai/stable/python:3.11-ubuntu22.04');
    expect(sessionName).toBe('my-session');
    expect(timeout).toBeUndefined();
    expect(architecture).toBe('x86_64');
    expect(resources).toEqual({
      enqueueOnly: true,
      group_name: 'ambient-project',
      domain: 'default',
      type: 'interactive',
      cluster_mode: 'single-node',
      cluster_size: 1,
      maxWaitSeconds: 15,
      reuseIfExists: false,
      config: {
        resources: { cpu: 2, mem: '4g' },
        scaling_group: 'rg-a',
        resource_opts: { shmem: '1g' },
        mount_ids: [],
        mount_id_map: {},
        environ: {},
        preopen_ports: [],
      },
    });
  });

  it('PAY-05 multi-node x size 1 is rewritten to single-node', async () => {
    const { calls } = await launch({
      cluster_mode: 'multi-node',
      cluster_size: 1,
    });
    expect(calls[0][2].cluster_mode).toBe('single-node');
    expect(calls[0][2].cluster_size).toBe(1);
  });

  it('PAY-05 multi-node cluster with size 3 is sent unchanged', async () => {
    const { calls } = await launch({
      cluster_mode: 'multi-node',
      cluster_size: 3,
    });
    expect(calls[0][2].cluster_mode).toBe('multi-node');
    expect(calls[0][2].cluster_size).toBe(3);
  });

  it('PAY-06 batch with schedule, command and timeout', async () => {
    const { calls } = await launch({
      sessionType: 'batch',
      batch: {
        enabled: true,
        scheduleDate: '2030-01-01T00:00:00.000Z',
        command: 'python main.py',
        timeoutEnabled: true,
        timeout: 30,
        timeoutUnit: 'm',
      },
    });
    const resources = calls[0][2];
    expect(resources.type).toBe('batch');
    expect(resources.starts_at).toBe('2030-01-01T00:00:00.000Z');
    expect(resources.startupCommand).toBe('python main.py');
    expect(resources.batchTimeout).toBe('30m');
  });

  it('PAY-06 batch without schedule sends starts_at undefined and no batchTimeout when disabled', async () => {
    const { calls } = await launch({
      sessionType: 'batch',
      batch: {
        enabled: false,
        scheduleDate: '2030-01-01T00:00:00.000Z',
        command: 'ls',
        timeoutEnabled: false,
        timeout: 30,
        timeoutUnit: 'm',
      },
    });
    const resources = calls[0][2];
    expect('starts_at' in resources).toBe(true);
    expect(resources.starts_at).toBeUndefined();
    expect(resources.startupCommand).toBe('ls');
    expect('batchTimeout' in resources).toBe(false);
  });

  it('PAY-06 [bug-compat] batch fields are dropped for an interactive session even if present', async () => {
    const { calls } = await launch({
      sessionType: 'interactive',
      batch: {
        enabled: true,
        scheduleDate: '2030-01-01T00:00:00.000Z',
        command: 'ls',
        timeoutEnabled: true,
        timeout: 10,
        timeoutUnit: 's',
      },
    });
    const resources = calls[0][2];
    expect('starts_at' in resources).toBe(false);
    expect('startupCommand' in resources).toBe(false);
    // The timeout block is not gated on sessionType.
    expect(resources.batchTimeout).toBe('10s');
  });

  it('PAY-07 accelerator is sent only when > 0, keyed by acceleratorType', async () => {
    const { calls } = await launch({
      resource: {
        cpu: 4,
        mem: '8g',
        shmem: '1g',
        accelerator: 2,
        acceleratorType: 'cuda.device',
      },
    });
    expect(calls[0][2].config.resources).toEqual({
      cpu: 4,
      mem: '8g',
      'cuda.device': 2,
    });
    expect('tag' in calls[0][2]).toBe(false);
  });

  it('PAY-07 unified accelerator slot sends a tag and no accelerator quantity', async () => {
    const { calls } = await launch({
      resource: {
        cpu: 4,
        mem: '8g',
        shmem: '1g',
        accelerator: 3,
        acceleratorType: 'cuda.unified',
      },
    });
    expect(calls[0][2].tag).toBe('unified-slot:cuda.unified');
    expect(calls[0][2].config.resources).toEqual({ cpu: 4, mem: '8g' });
  });

  it('PAY-08 preset vs custom: allocationPreset itself is never sent, only resource', async () => {
    const preset = await launch({
      allocationPreset: 'preset-id-1',
      resource: { cpu: 1, mem: '2g', shmem: '64m', accelerator: 0 },
    });
    const presetResources = preset.calls[0][2];
    createIfNotExists.mockClear();
    const custom = await launch({
      allocationPreset: 'custom',
      resource: { cpu: 1, mem: '2g', shmem: '64m', accelerator: 0 },
    });
    expect(custom.calls[0][2]).toEqual(presetResources);
    expect(JSON.stringify(presetResources)).not.toContain('preset-id-1');
    expect(presetResources.config.resource_opts).toEqual({ shmem: '64m' });
  });

  it('PAY-01 manual image is used verbatim (customizedTag ignored); arch split on @', async () => {
    const { calls } = await launch({
      environments: {
        manual: 'my.registry/ns/img:custom@aarch64',
        customizedTag: 'should-be-ignored',
      },
    });
    expect(calls[0][0]).toBe('my.registry/ns/img:custom');
    expect(calls[0][4]).toBe('aarch64');
  });

  it('PAY-01 manual image without @arch leaves architecture undefined', async () => {
    const { calls } = await launch({
      environments: { manual: 'my.registry/ns/img:custom' },
    });
    expect(calls[0][0]).toBe('my.registry/ns/img:custom');
    expect(calls[0][4]).toBeUndefined();
  });

  it('PAY-01 environment without tag resolves to the newest registered image', async () => {
    const { calls } = await launch({
      environments: { environment: 'cr.backend.ai/stable/python' },
    });
    expect(calls[0][0]).toBe('cr.backend.ai/stable/python:3.11-ubuntu22.04');
    expect(calls[0][4]).toBe('x86_64');
  });

  it('PAY-10 vfolderMounts → mount_ids / mount_id_map / mount_options', async () => {
    const { calls } = await launch({
      vfolderMounts: [
        { vfolderId: 'id-a', name: 'data' },
        {
          vfolderId: 'id-b',
          name: 'models',
          mountDestination: '/mnt/models',
          subpath: 'v1',
        },
        { vfolderId: 'id-c', name: 'rel', mountDestination: 'relative' },
      ],
    });
    const config = calls[0][2].config;
    expect(config.mount_ids).toEqual(['id-a', 'id-b', 'id-c']);
    expect(config.mount_id_map).toEqual({
      'id-a': '/home/work/data',
      'id-b': '/mnt/models',
      'id-c': '/home/work/relative',
    });
    expect(config.mount_options).toEqual({ 'id-b': { subpath: 'v1' } });
  });

  it('PAY-09 envvars and HPC threads (auto off) are merged into environ', async () => {
    const { calls } = await launch({
      envvars: [
        { variable: 'A', value: '1' },
        { variable: 'B', value: 'two' },
      ],
      hpcOptimization: {
        autoEnabled: false,
        OMP_NUM_THREADS: '4',
        OPENBLAS_NUM_THREADS: '2',
      },
    });
    expect(calls[0][2].config.environ).toEqual({
      A: '1',
      B: 'two',
      OMP_NUM_THREADS: '4',
      OPENBLAS_NUM_THREADS: '2',
    });
  });

  it('PAY-09 HPC threads are dropped while auto is on', async () => {
    const { calls } = await launch({
      hpcOptimization: {
        autoEnabled: true,
        OMP_NUM_THREADS: '4',
      },
    });
    expect(calls[0][2].config.environ).toEqual({});
  });

  it('N-01 ports are converted to numbers', async () => {
    const { calls } = await launch({ ports: ['8080', '9000'] });
    expect(calls[0][2].config.preopen_ports).toEqual([8080, 9000]);
  });

  it('PAY-11 agent_list is sent unless the value is ["auto"]; string "auto" also omitted', async () => {
    const withAgents = await launch({ agent: ['i-agent1', 'i-agent2'] });
    expect(withAgents.calls[0][2].config.agent_list).toEqual([
      'i-agent1',
      'i-agent2',
    ]);
    createIfNotExists.mockClear();
    const autoString = await launch({ agent: 'auto' });
    expect('agent_list' in autoString.calls[0][2].config).toBe(false);
    createIfNotExists.mockClear();
    const single = await launch({ agent: 'i-agent3' });
    expect(single.calls[0][2].config.agent_list).toEqual(['i-agent3']);
  });

  it('PAY-11 hideAgents drops agent_list', async () => {
    clientConfig = { domainName: 'default', hideAgents: true };
    const { calls } = await launch({ agent: ['i-agent1'] });
    expect('agent_list' in calls[0][2].config).toBe(false);
  });

  it('PAY-12 reuseIfExists defaults to false and passes true through', async () => {
    const off = await launch({});
    expect(off.calls[0][2].reuseIfExists).toBe(false);
    createIfNotExists.mockClear();
    const on = await launch({ reuseIfExists: true });
    expect(on.calls[0][2].reuseIfExists).toBe(true);
  });

  it('PAY-03 group_name comes from projectName over the ambient project', async () => {
    const { calls } = await launch({ projectName: 'explicit-project' });
    expect(calls[0][2].group_name).toBe('explicit-project');
  });

  it('PAY-02 empty sessionName generates "<8 chars>-session"; multi-launch suffixes "-<rand>-<i>"', async () => {
    const { calls } = await launch({ sessionName: '', num_of_sessions: 2 });
    expect(calls).toHaveLength(2);
    expect(calls[0][1]).toMatch(/^[A-Za-z0-9]{8}-session-[A-Za-z0-9]+-0$/);
    expect(calls[1][1]).toMatch(/^[A-Za-z0-9]{8}-session-[A-Za-z0-9]+-1$/);
  });

  it('PAY-xx bootstrap_script is sent only when non-empty', async () => {
    const empty = await launch({ bootstrap_script: '' });
    expect('bootstrap_script' in empty.calls[0][2]).toBe(false);
    createIfNotExists.mockClear();
    const set = await launch({ bootstrap_script: 'echo hi' });
    expect(set.calls[0][2].bootstrap_script).toBe('echo hi');
  });

  it('PAY-xx startSession groups results by settle status', async () => {
    createIfNotExists
      .mockResolvedValueOnce({ sessionId: 's1' })
      .mockRejectedValueOnce(new Error('The session already exists'));
    const { results } = await launch({ num_of_sessions: 2 });
    const typed = results as {
      fulfilled: Array<{ value: unknown }>;
      rejected: Array<{ reason: Error }>;
    };
    expect(typed.fulfilled.map((r) => r.value)).toEqual([{ sessionId: 's1' }]);
    expect(typed.rejected[0].reason.message).toBe(
      'session.launcher.SessionAlreadyExists',
    );
  });
});
