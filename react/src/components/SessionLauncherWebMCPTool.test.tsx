/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import SessionLauncherWebMCPTool, {
  createPrepareSessionTool,
  LAUNCHER_REVIEW_STEP,
  PREPARE_SESSION_NEXT_STEP,
} from './SessionLauncherWebMCPTool';
import toolSource from './SessionLauncherWebMCPTool.tsx?raw';
import { render, waitFor } from '@testing-library/react';
import { BAIWebMCPProvider, type WebMCPToolDescriptor } from 'backend.ai-ui';
import { Suspense } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  folders: [
    {
      id: '0123456789abcdef0123456789abcdef',
      name: 'data',
      status: 'ready',
      host: 'local:volume1',
      ownership_type: 'user',
      group: null,
    },
    {
      id: 'fedcba9876543210fedcba9876543210',
      name: '.local',
      status: 'ready',
      host: 'local:volume1',
      ownership_type: 'user',
      group: null,
    },
    {
      id: '11111111111111111111111111111111',
      name: 'elsewhere',
      status: 'ready',
      host: 'other:volume',
      ownership_type: 'user',
      group: null,
    },
  ],
}));

vi.mock('../hooks', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../hooks')>()),
  useSuspendedBackendaiClient: () => ({
    _config: { allowCustomResourceAllocation: true },
  }),
}));
vi.mock('../hooks/useMountableStorageHosts', () => ({
  useMountableStorageHosts: () => ['local:volume1'],
}));
vi.mock('backend.ai-ui', async (importOriginal) => ({
  ...(await importOriginal<typeof import('backend.ai-ui')>()),
  useSuspendedLegacyVFolders: () => ({ folders: mocks.folders }),
}));

const VERSION = 'cr.backend.ai/stable/python:3.9-ubuntu20.04@x86_64';

const makeTool = (
  readEnvironment: (id: string) => { version?: string } | null = () => ({
    version: VERSION,
  }),
) => {
  const openLauncher = vi.fn<(search: string) => void>();
  const tool = createPrepareSessionTool({
    folders: [{ vfolderId: 'uuid-data', name: 'data' }],
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
    expect(search.get('agentPrefill')).toMatch(/^\w{8}$/);
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

  const renderTool = (openLauncher = vi.fn()) =>
    render(
      <BAIWebMCPProvider enabled>
        <Suspense fallback={null}>
          <SessionLauncherWebMCPTool
            project={{ id: 'project-1', name: 'default' }}
            openLauncher={openLauncher}
            readEnvironment={() => ({ version: VERSION })}
          />
        </Suspense>
      </BAIWebMCPProvider>,
    );

  it('offers only the mountable, selectable folders the launcher lists', async () => {
    const openLauncher = vi.fn();
    renderTool(openLauncher);
    await waitFor(() => expect(registerTool).toHaveBeenCalledTimes(1));
    const [descriptor] = registerTool.mock.calls[0];

    const result = await descriptor.execute({
      folders: 'data,.local,elsewhere',
    });
    expect(result).toMatchObject({
      applied: { folders: ['data'] },
      rejected: [
        { field: 'folders', reason: expect.stringContaining('".local"') },
        { field: 'folders', reason: expect.stringContaining('"elsewhere"') },
      ],
    });
    const formValues = JSON.parse(
      new URLSearchParams(openLauncher.mock.calls[0][0]).get('formValues')!,
    );
    expect(formValues.vfolderMounts[0].vfolderId).toBe(
      '01234567-89ab-cdef-0123-456789abcdef',
    );
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
