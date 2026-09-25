/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import WebMCPGlobalTools, {
  createNavigateTool,
  displayedEmail,
} from './WebMCPGlobalTools';
import { render, waitFor } from '@testing-library/react';
import { BAIWebMCPProvider, type WebMCPToolDescriptor } from 'backend.ai-ui';
import { Suspense } from 'react';
import { RouterProvider, createMemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  navigate: vi.fn(),
  useSuspendedBackendaiClient: vi.fn(() => ({
    email: 'user@example.com',
    _config: { endpoint: 'https://api.example.com' },
  })),
}));

vi.mock('react-i18next', async (importOriginal) => ({
  ...(await importOriginal<typeof import('react-i18next')>()),
  useTranslation: () => ({ t: (key: string) => key }),
}));
vi.mock('../hooks', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../hooks')>()),
  useSuspendedBackendaiClient: mocks.useSuspendedBackendaiClient,
  useWebUINavigate: () => mocks.navigate,
}));
vi.mock('../hooks/backendai', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../hooks/backendai')>()),
  useCurrentUserRole: () => 'user',
}));
vi.mock('../hooks/useCurrentProject', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../hooks/useCurrentProject')>()),
  useCurrentProjectValue: () => ({ id: 'p-1', name: 'default' }),
}));
vi.mock('../hooks/useWebUIMenuItems', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../hooks/useWebUIMenuItems')>()),
  useWebUIMenuItems: () => ({
    generalMenu: [
      { key: 'session', labelText: 'Sessions', to: '/project/default/session' },
      { key: 'data', labelText: 'Data', to: '/project/default/data' },
      { key: 'statistics', labelText: 'Statistics', to: '/x', disabled: true },
      { key: 'pipeline', labelText: 'FastTrack' },
      { key: 'my-plugin', labelText: 'Plugin', to: '/my-plugin' },
    ],
    adminMenu: [],
  }),
}));

const registerTool =
  vi.fn<
    (tool: WebMCPToolDescriptor, options: { signal: AbortSignal }) => void
  >();
const modelContextGetter = vi.fn(() => ({ registerTool }));

const renderShell = (enabled: boolean) => {
  const router = createMemoryRouter(
    [
      {
        path: '/project/:projectName/session',
        handle: {
          scope: 'project',
          menuKey: 'session',
          labelKey: 'webui.menu.Sessions',
        },
        element: (
          <BAIWebMCPProvider enabled={enabled}>
            <Suspense fallback={null}>
              <WebMCPGlobalTools />
            </Suspense>
          </BAIWebMCPProvider>
        ),
      },
    ],
    { initialEntries: ['/project/default/session?type=all'] },
  );
  return render(<RouterProvider router={router} />);
};

const toolNamed = (name: string) =>
  registerTool.mock.calls.map(([tool]) => tool).find((t) => t.name === name)!;

beforeEach(() => {
  vi.clearAllMocks();
  Object.defineProperty(document, 'modelContext', {
    configurable: true,
    get: modelContextGetter,
  });
});

afterEach(() => {
  delete (document as { modelContext?: unknown }).modelContext;
});

describe('WebMCPGlobalTools', () => {
  it('does nothing — not even waiting for the client — when WebMCP is off', () => {
    renderShell(false);

    expect(modelContextGetter).not.toHaveBeenCalled();
    expect(mocks.useSuspendedBackendaiClient).not.toHaveBeenCalled();
    expect(registerTool).not.toHaveBeenCalled();
  });

  it('registers the three app-shell tools once signed in', async () => {
    renderShell(true);

    await waitFor(() => expect(registerTool).toHaveBeenCalledTimes(3));
    expect(registerTool.mock.calls.map(([tool]) => tool.name).sort()).toEqual([
      'bai_get_current_page',
      'bai_navigate',
      'bai_whoami',
    ]);
    expect(toolNamed('bai_whoami').annotations).toEqual({
      readOnlyHint: true,
      untrustedContentHint: true,
    });
    expect(toolNamed('bai_navigate').annotations?.readOnlyHint).toBeUndefined();
  });

  it('answers bai_whoami with the signed-in identity', async () => {
    renderShell(true);
    await waitFor(() => expect(registerTool).toHaveBeenCalledTimes(3));

    await expect(toolNamed('bai_whoami').execute({})).resolves.toEqual({
      email: 'user@example.com',
      role: 'user',
      project: { id: 'p-1', name: 'default' },
      apiEndpoint: 'https://api.example.com',
      webuiVersion: null,
    });
  });

  it('answers bai_get_current_page from the matched route', async () => {
    renderShell(true);
    await waitFor(() => expect(registerTool).toHaveBeenCalledTimes(3));

    await expect(
      toolNamed('bai_get_current_page').execute(undefined),
    ).resolves.toMatchObject({
      path: '/project/default/session?type=all',
      menuKey: 'session',
      title: 'webui.menu.Sessions',
      scope: 'project',
      project: 'default',
      searchParams: { type: 'all' },
    });
  });

  it('offers only accessible route pages in bai_navigate and validates input', async () => {
    renderShell(true);
    await waitFor(() => expect(registerTool).toHaveBeenCalledTimes(3));
    const navigateTool = toolNamed('bai_navigate');

    expect(navigateTool.inputSchema.properties.page).toMatchObject({
      enum: ['session', 'data'],
    });
    await expect(navigateTool.execute({ page: 123 })).resolves.toMatchObject({
      error: { code: 'invalid_input' },
    });
    await expect(
      navigateTool.execute({ page: 'statistics' }),
    ).resolves.toMatchObject({ error: { code: 'invalid_input' } });
    expect(mocks.navigate).not.toHaveBeenCalled();
  });
});

describe('createNavigateTool', () => {
  const navigate = vi.fn();
  const tool = createNavigateTool({
    pages: [{ key: 'data', label: 'Data', to: '/project/default/data' }],
    activeProjectName: 'default',
    navigate,
    settleMs: 0,
  });

  beforeEach(() => navigate.mockClear());

  it('navigates to a menu page and reports where the tab is', async () => {
    const result = await tool.execute({ page: 'data' });
    expect(navigate).toHaveBeenCalledWith('/project/default/data');
    expect(result).toEqual({
      path: `${window.location.pathname}${window.location.search}${window.location.hash}`,
      title: document.title,
    });
  });

  it('navigates to a rebased app path', async () => {
    await tool.execute({ path: '/session?type=batch' });
    expect(navigate).toHaveBeenCalledWith(
      '/project/default/session?type=batch',
    );
  });

  it.each([{}, { page: 'data', path: '/admin/users' }])(
    'requires exactly one of page or path (%j)',
    async (input) => {
      await expect(tool.execute(input)).resolves.toMatchObject({
        error: { code: 'invalid_input' },
      });
      expect(navigate).not.toHaveBeenCalled();
    },
  );

  it('refuses paths outside the app subtrees', async () => {
    await expect(
      tool.execute({ path: '/applauncher?app=jupyter' }),
    ).resolves.toMatchObject({ error: { code: 'path_not_allowed' } });
    expect(navigate).not.toHaveBeenCalled();
  });
});

describe('displayedEmail', () => {
  it('returns the email unchanged when masking is off', () => {
    expect(displayedEmail('admin@lablup.com', false)).toBe('admin@lablup.com');
  });

  it('masks the local part like the header does when masking is on', () => {
    expect(displayedEmail('admin@lablup.com', true)).toBe('ad***@lablup.com');
  });

  it('returns null without an email', () => {
    expect(displayedEmail(undefined, true)).toBeNull();
  });
});
