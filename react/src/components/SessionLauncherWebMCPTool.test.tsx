/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import SessionLauncherWebMCPTool, {
  createPrepareSessionTool,
  LAUNCHER_REVIEW_STEP,
  PREPARE_SESSION_LINK_TOO_LONG,
  PREPARE_SESSION_NEXT_STEP,
  PREPARE_SESSION_NO_INPUT,
  PREPARE_SESSION_NOTHING_FILLED,
  PREPARE_SESSION_PARTLY_FILLED,
  WEBUI_URL_SOFT_LIMIT,
} from './SessionLauncherWebMCPTool';
import toolSource from './SessionLauncherWebMCPTool.tsx?raw';
import { render, waitFor } from '@testing-library/react';
import { BAIWebMCPProvider, type WebMCPToolDescriptor } from 'backend.ai-ui';
import { Suspense } from 'react';
import { RelayEnvironmentProvider } from 'react-relay';
import { createMockEnvironment } from 'relay-test-utils';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../hooks', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../hooks')>()),
  useSuspendedBackendaiClient: () => ({
    _config: { allowCustomResourceAllocation: true },
    user_uuid: 'user-1',
  }),
}));
vi.mock('../hooks/useMountableStorageHosts', () => ({
  useMountableStorageHosts: () => ['local:volume1'],
}));

const VERSION = 'cr.backend.ai/stable/python:3.9-ubuntu20.04@x86_64';

const makeTool = (
  readEnvironment: (
    id: string,
  ) => { version?: string; manual?: string } | null = () => ({
    version: VERSION,
  }),
) => {
  const openLauncher = vi.fn<(search: string) => void>();
  const tool = createPrepareSessionTool({
    findFolders: async (names) => ({
      folders: names.includes('data')
        ? [{ vfolderId: 'uuid-data', name: 'data' }]
        : [],
      truncated: false,
    }),
    allowCustomResourceAllocation: true,
    openLauncher,
    readEnvironment,
    pollMs: 1,
    timeoutMs: 20,
  });
  return { tool, openLauncher };
};

const searchOf = (openLauncher: ReturnType<typeof vi.fn>) =>
  new URLSearchParams(openLauncher.mock.calls[0][0] as string);

describe('createPrepareSessionTool', () => {
  it('opens the launcher review step once with formValues and an agent marker', async () => {
    const { tool, openLauncher } = makeTool();
    const result = await tool.execute({
      sessionName: 'agent-prefill-demo',
      folders: 'data',
    });

    expect(openLauncher).toHaveBeenCalledTimes(1);
    const search = searchOf(openLauncher);
    expect(search.get('step')).toBe(String(LAUNCHER_REVIEW_STEP));
    expect(search.get('agentPrefill')).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
    );
    expect(JSON.parse(search.get('formValues')!)).toEqual({
      sessionName: 'agent-prefill-demo',
      vfolderMounts: [
        {
          vfolderId: 'uuid-data',
          name: 'data',
          mountDestination: '',
          subpath: '',
        },
      ],
    });
    const path = `${window.location.pathname}${openLauncher.mock.calls[0][0]}`;
    expect(result).toEqual({
      path,
      webui_url: new URL(path, window.location.origin).href,
      applied: { sessionName: 'agent-prefill-demo', folders: ['data'] },
      rejected: [],
      nextStep: PREPARE_SESSION_NEXT_STEP,
    });
  });

  it('hands back a webui_url that reopens exactly the same prefilled launcher', async () => {
    const { tool, openLauncher } = makeTool();
    const input = {
      sessionType: 'batch',
      sessionName: 'agent-prefill-demo',
      startupCommand: 'python train.py --epochs 3 && echo "done"',
      cpu: 2,
      memoryGiB: 4,
      folders: 'data',
    };
    const result = (await tool.execute(input)) as { webui_url: string };

    const url = new URL(result.webui_url);
    expect(url.origin).toBe(window.location.origin);
    expect(url.pathname).toBe(window.location.pathname);
    // Only the launcher's own params: nothing else (no token or session) rides along.
    expect([...url.searchParams.keys()].sort()).toEqual([
      'agentPrefill',
      'formValues',
      'step',
    ]);
    const sent = searchOf(openLauncher);
    expect(url.searchParams.get('agentPrefill')).toBe(sent.get('agentPrefill'));
    expect(JSON.parse(url.searchParams.get('formValues')!)).toEqual(
      JSON.parse(sent.get('formValues')!),
    );
    expect(JSON.parse(url.searchParams.get('formValues')!)).toMatchObject({
      sessionType: 'batch',
      batch: { command: input.startupCommand },
      resource: { cpu: 2, mem: '4g' },
    });
  });

  it('confirms the image from the form the prefill opened', async () => {
    const readEnvironment = vi.fn(() => ({ version: VERSION }));
    const { tool, openLauncher } = makeTool(readEnvironment);
    const result = await tool.execute({ image: VERSION });

    const prefillId = searchOf(openLauncher).get('agentPrefill');
    expect(readEnvironment).toHaveBeenCalledWith(prefillId);
    expect(result).toMatchObject({ applied: { image: VERSION }, rejected: [] });
  });

  it('rejects an image the launcher replaced with another one', async () => {
    const { tool } = makeTool();
    const result = await tool.execute({ image: 'cr.backend.ai/x/missing:1' });
    expect(result).toMatchObject({
      applied: {},
      rejected: [
        {
          field: 'image',
          reason: expect.stringContaining(`selected "${VERSION}"`),
        },
      ],
      nextStep: PREPARE_SESSION_PARTLY_FILLED,
    });
  });

  it('says the form was replaced when only an image was asked for and it missed', async () => {
    const { tool, openLauncher } = makeTool();
    const result = (await tool.execute({
      image: 'cr.backend.ai/x/missing:1',
    })) as { nextStep: string };

    expect(openLauncher).toHaveBeenCalledTimes(1);
    expect(result.nextStep).toContain('was replaced');
    expect(result.nextStep).not.toContain('Give webui_url');
  });

  it('asks to fix or report rejected fields instead of handing the link over', async () => {
    const { tool } = makeTool();
    const result = await tool.execute({
      sessionName: 'agent-prefill-demo',
      folders: 'missing',
    });
    expect(result).toMatchObject({
      applied: { sessionName: 'agent-prefill-demo' },
      rejected: [{ field: 'folders' }],
      nextStep: PREPARE_SESSION_PARTLY_FILLED,
    });
  });

  it('reports the image as unverified when the form never resolves it', async () => {
    const { tool } = makeTool(() => null);
    const result = await tool.execute({ image: VERSION });
    expect(result).toMatchObject({
      rejected: [],
      unverified: [{ field: 'image' }],
    });
  });

  it('reports a manual image fallback as unverified, not applied', async () => {
    const { tool } = makeTool(() => ({ manual: 'cr.example.com/x/typo:1' }));
    const result = await tool.execute({ image: 'cr.example.com/x/typo:1' });
    expect(result).toMatchObject({
      applied: {},
      rejected: [],
      unverified: [{ field: 'image' }],
    });
  });

  it('does not poll the form unless an image was requested', async () => {
    const readEnvironment = vi.fn(() => ({ version: VERSION }));
    const { tool } = makeTool(readEnvironment);
    await tool.execute({ sessionName: 'agent-prefill-demo' });
    expect(readEnvironment).not.toHaveBeenCalled();
  });

  it('stops polling at the deadline whatever the timers do', async () => {
    const readEnvironment = vi.fn(() => null);
    const tool = createPrepareSessionTool({
      findFolders: async () => ({ folders: [], truncated: false }),
      allowCustomResourceAllocation: true,
      openLauncher: vi.fn(),
      readEnvironment,
      pollMs: 1,
      timeoutMs: 0,
    });
    const result = await tool.execute({ image: VERSION });
    expect(readEnvironment).not.toHaveBeenCalled();
    expect(result).toMatchObject({ unverified: [{ field: 'image' }] });
  });

  it('leaves the launcher alone when nothing can be filled', async () => {
    const { tool, openLauncher } = makeTool();
    const result = await tool.execute({
      sessionName: '-bad-name',
      folders: 'missing',
    });
    expect(openLauncher).not.toHaveBeenCalled();
    expect(result).toMatchObject({
      path: null,
      webui_url: null,
      applied: {},
      rejected: [{ field: 'sessionName' }, { field: 'folders' }],
      nextStep: PREPARE_SESSION_NOTHING_FILLED,
    });
  });

  it('has its own answer for a call with no fields', async () => {
    const { tool, openLauncher } = makeTool();
    await expect(tool.execute({})).resolves.toMatchObject({
      path: null,
      webui_url: null,
      rejected: [],
      nextStep: PREPARE_SESSION_NO_INPUT,
    });
    expect(openLauncher).not.toHaveBeenCalled();
  });

  it('stops the whole prefill on a batch session without a command', async () => {
    const { tool, openLauncher } = makeTool();
    await expect(
      tool.execute({
        sessionType: 'batch',
        sessionName: 'nightly-job',
        cpu: 4,
      }),
    ).resolves.toMatchObject({
      path: null,
      applied: {},
      rejected: [{ field: 'sessionType' }],
      nextStep: PREPARE_SESSION_NOTHING_FILLED,
    });
    expect(openLauncher).not.toHaveBeenCalled();
  });

  it('rejects every folder name when the lookup came back full', async () => {
    const tool = createPrepareSessionTool({
      findFolders: async () => ({
        folders: [{ vfolderId: 'uuid-data', name: 'data' }],
        truncated: true,
      }),
      allowCustomResourceAllocation: true,
      openLauncher: vi.fn(),
      readEnvironment: () => null,
    });
    await expect(tool.execute({ folders: 'data' })).resolves.toMatchObject({
      path: null,
      applied: {},
      rejected: [
        {
          field: 'folders',
          reason: expect.stringContaining('could not be checked'),
        },
      ],
    });
  });

  it('flags a hand-off link that is too long for a server', async () => {
    const { tool } = makeTool();
    const result = await tool.execute({
      sessionType: 'batch',
      startupCommand: '"/'.repeat(2000),
    });
    expect((result as { webui_url: string }).webui_url.length).toBeGreaterThan(
      WEBUI_URL_SOFT_LIMIT,
    );
    expect(result).toMatchObject({
      warnings: [{ field: 'webui_url' }],
      nextStep: PREPARE_SESSION_LINK_TOO_LONG,
    });
    expect(result).not.toHaveProperty('unverified');
  });

  it('stops, without pulling the tab back, when the page changes during the lookup', async () => {
    const launcherUrl = window.location.href;
    const openLauncher = vi.fn();
    const tool = createPrepareSessionTool({
      findFolders: async () => {
        window.history.replaceState({}, '', '/project/default/data');
        return { folders: [], truncated: false };
      },
      allowCustomResourceAllocation: true,
      openLauncher,
      readEnvironment: () => null,
    });

    await expect(tool.execute({ folders: 'data' })).resolves.toMatchObject({
      error: { code: 'launcher_closed' },
    });
    expect(openLauncher).not.toHaveBeenCalled();
    window.history.replaceState({}, '', launcherUrl);
  });

  it('is not read-only and flags echoed user text as untrusted', () => {
    const { tool } = makeTool();
    expect(tool.name).toBe('bai_prepare_session');
    expect(tool.annotations).toEqual({ untrustedContentHint: true });
    expect(tool.description).toMatch(/never submits/i);
  });

  it('has no path to a submit or mutation', () => {
    expect(toolSource).not.toMatch(
      /useStartSession|startSession|commitMutation|useMutation|performLaunch|validateFields|submit\(/,
    );
  });
});

describe('SessionLauncherWebMCPTool', () => {
  const registerTool =
    vi.fn<
      (tool: WebMCPToolDescriptor, options: { signal: AbortSignal }) => void
    >();

  beforeEach(() => {
    registerTool.mockClear();
    Object.defineProperty(document, 'modelContext', {
      configurable: true,
      get: () => ({ registerTool }),
    });
  });
  afterEach(() => {
    delete (document as { modelContext?: unknown }).modelContext;
  });

  const folderNode = (entityId: string, name: string, permission = 'RW') => ({
    node: {
      entityId,
      accessControl: { permission },
      metadata: { name },
    },
  });

  const renderTool = (openLauncher = vi.fn()) => {
    const environment = createMockEnvironment();
    render(
      <RelayEnvironmentProvider environment={environment}>
        <BAIWebMCPProvider enabled>
          <Suspense fallback={null}>
            <SessionLauncherWebMCPTool
              project={{ id: 'project-1', name: 'default' }}
              openLauncher={openLauncher}
              readEnvironment={() => ({ version: VERSION })}
            />
          </Suspense>
        </BAIWebMCPProvider>
      </RelayEnvironmentProvider>,
    );
    return environment;
  };

  it('looks folders up only when called, and keeps the mountable ones', async () => {
    const openLauncher = vi.fn();
    const environment = renderTool(openLauncher);
    await waitFor(() => expect(registerTool).toHaveBeenCalledTimes(1));
    expect(environment.mock.getAllOperations()).toHaveLength(0);

    const [descriptor] = registerTool.mock.calls[0];
    let variables: Record<string, unknown> = {};
    environment.mock.queueOperationResolver((operation) => {
      variables = operation.request.variables;
      return {
        data: {
          scopedVFoldersV2: {
            edges: [
              folderNode('uuid-data', 'data'),
              folderNode('uuid-local', '.local'),
              folderNode('uuid-none', 'no-mount', 'NONE'),
            ],
          },
        },
      };
    });

    const result = await descriptor.execute({
      folders: 'data,.local,no-mount,elsewhere',
    });
    expect(result).toMatchObject({
      applied: { folders: ['data'] },
      rejected: [
        { field: 'folders', reason: expect.stringContaining('".local"') },
        { field: 'folders', reason: expect.stringContaining('"no-mount"') },
        { field: 'folders', reason: expect.stringContaining('"elsewhere"') },
      ],
    });
    expect(variables.scope).toEqual({
      user: [{ value: 'user-1' }],
      project: [{ value: 'project-1' }],
    });
    expect(JSON.stringify(variables.filter)).toContain(
      '"host":{"in":["local:volume1"]}',
    );
    expect(variables.orderBy).toEqual([{ field: 'NAME', direction: 'ASC' }]);
    const formValues = JSON.parse(
      new URLSearchParams(openLauncher.mock.calls[0][0]).get('formValues')!,
    );
    expect(formValues.vfolderMounts[0].vfolderId).toBe('uuid-data');
  });

  it('does not trust a lookup page that came back full', async () => {
    const openLauncher = vi.fn();
    const environment = renderTool(openLauncher);
    await waitFor(() => expect(registerTool).toHaveBeenCalledTimes(1));

    environment.mock.queueOperationResolver(() => ({
      data: {
        scopedVFoldersV2: {
          edges: Array.from({ length: 100 }, (_, index) =>
            folderNode(`uuid-${index}`, `folder-${index}`),
          ),
        },
      },
    }));

    await expect(
      registerTool.mock.calls[0][0].execute({ folders: 'folder-1' }),
    ).resolves.toMatchObject({
      path: null,
      rejected: [
        {
          field: 'folders',
          reason: expect.stringContaining('could not be checked'),
        },
      ],
    });
    expect(openLauncher).not.toHaveBeenCalled();
  });

  it('refuses invalid input before navigating', async () => {
    const openLauncher = vi.fn();
    renderTool(openLauncher);
    await waitFor(() => expect(registerTool).toHaveBeenCalledTimes(1));
    const [descriptor] = registerTool.mock.calls[0];

    await expect(
      descriptor.execute({ sessionType: 'batch', launch: true }),
    ).resolves.toMatchObject({ error: { code: 'invalid_input' } });
    expect(openLauncher).not.toHaveBeenCalled();
  });
});
