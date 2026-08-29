/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
/**
 * FR-3760: `document.title` follows the matched route —
 * `Backend.AI · <page> · <project> @ <host>`.
 */
import RouteDocumentTitle, {
  formatDocumentTitle,
  getEndpointHost,
} from './RouteDocumentTitle';
import { act, render } from '@testing-library/react';
import { createMemoryRouter, Outlet, RouterProvider } from 'react-router-dom';
import { describe, expect, it, vi, beforeEach } from 'vitest';

// Deterministic translations: assert on the raw key. Partial mock — the i18n
// bootstrap must stay real for the rest of the module graph.
vi.mock('react-i18next', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-i18next')>();
  return {
    ...actual,
    useTranslation: () => ({ t: (key: string) => key }),
  };
});

let mockClient: unknown = {
  _config: { endpoint: 'https://127.0.0.1:8090' },
};
// `true` reproduces the pre-login state: the real hook suspends until the
// client connects.
let mockClientPending = false;
const mockNeverResolves = new Promise(() => {});
vi.mock('../hooks', () => ({
  useSuspendedBackendaiClient: () => {
    if (mockClientPending) {
      throw mockNeverResolves;
    }
    return mockClient;
  },
}));

let mockProjectName: string | null = 'default';
vi.mock('../hooks/useCurrentProject', () => ({
  useCurrentProjectValue: () => ({ name: mockProjectName, id: 'project-id' }),
}));

let mockIsProjectAgnosticPage = false;
vi.mock('../hooks/useIsProjectAgnosticPage', () => ({
  useIsProjectAgnosticPage: () => mockIsProjectAgnosticPage,
}));

const renderRouterAt = (initialPath: string) => {
  const router = createMemoryRouter(
    [
      {
        path: '/',
        element: (
          <>
            <RouteDocumentTitle />
            <Outlet />
          </>
        ),
        children: [
          {
            path: 'session',
            element: <div />,
            handle: { labelKey: 'webui.menu.Sessions' },
          },
          {
            path: 'session/start',
            element: <div />,
            handle: { labelKey: 'session.launcher.StartNewSession' },
          },
          {
            // Deepest match carries no label — the parent's is used.
            path: 'data',
            handle: { labelKey: 'webui.menu.Data' },
            children: [{ index: true, element: <div /> }],
          },
          // Redirect / 404 shaped route: no label anywhere in the chain.
          { path: 'nowhere', element: <div /> },
        ],
      },
    ],
    { initialEntries: [initialPath] },
  );
  render(<RouterProvider router={router} />);
  return router;
};

describe('formatDocumentTitle', () => {
  it('joins every segment when all are present', () => {
    expect(
      formatDocumentTitle({
        page: 'Sessions',
        project: 'default',
        host: '127.0.0.1:8090',
      }),
    ).toBe('Backend.AI · Sessions · default @ 127.0.0.1:8090');
  });

  it('omits the project segment when there is no project', () => {
    expect(
      formatDocumentTitle({ page: 'Settings', host: '127.0.0.1:8090' }),
    ).toBe('Backend.AI · Settings @ 127.0.0.1:8090');
  });

  it('omits the host when there is no client', () => {
    expect(formatDocumentTitle({ page: 'Sessions', project: 'default' })).toBe(
      'Backend.AI · Sessions · default',
    );
  });

  it('omits the page segment when the route carries no label', () => {
    expect(formatDocumentTitle({ project: 'default', host: 'host:1' })).toBe(
      'Backend.AI · default @ host:1',
    );
  });

  it('falls back to the product name alone', () => {
    expect(formatDocumentTitle({})).toBe('Backend.AI');
    expect(
      formatDocumentTitle({ page: '  ', project: null, host: undefined }),
    ).toBe('Backend.AI');
  });
});

describe('getEndpointHost', () => {
  it.each([
    ['https://127.0.0.1:8090', '127.0.0.1:8090'],
    ['http://127.0.0.1:8090/', '127.0.0.1:8090'],
    ['https://api.backend.ai/v8', 'api.backend.ai'],
    ['127.0.0.1:8090', '127.0.0.1:8090'],
    ['', ''],
    [undefined, ''],
  ])('derives %s -> %s', (endpoint, expected) => {
    expect(getEndpointHost(endpoint)).toBe(expected);
  });
});

describe('RouteDocumentTitle', () => {
  beforeEach(() => {
    document.title = 'Backend.AI';
    mockClient = { _config: { endpoint: 'https://127.0.0.1:8090' } };
    mockClientPending = false;
    mockProjectName = 'default';
    mockIsProjectAgnosticPage = false;
  });

  it('sets the title from the matched route label, project and host', () => {
    renderRouterAt('/session');

    expect(document.title).toBe(
      'Backend.AI · webui.menu.Sessions · default @ 127.0.0.1:8090',
    );
  });

  it('updates the title on navigation', async () => {
    const router = renderRouterAt('/session');

    await act(async () => {
      await router.navigate('/session/start');
    });

    expect(document.title).toBe(
      'Backend.AI · session.launcher.StartNewSession · default @ 127.0.0.1:8090',
    );
  });

  it('uses the deepest labelled ancestor when the leaf has no label', () => {
    renderRouterAt('/data');

    expect(document.title).toBe(
      'Backend.AI · webui.menu.Data · default @ 127.0.0.1:8090',
    );
  });

  it('drops the page segment on a route with no label at all', () => {
    renderRouterAt('/nowhere');

    expect(document.title).toBe('Backend.AI · default @ 127.0.0.1:8090');
  });

  it('omits the project on a project-agnostic page', () => {
    mockIsProjectAgnosticPage = true;
    renderRouterAt('/session');

    expect(document.title).toBe(
      'Backend.AI · webui.menu.Sessions @ 127.0.0.1:8090',
    );
  });

  it('omits the host when the client has no endpoint', () => {
    mockClient = { _config: {} };
    renderRouterAt('/session');

    expect(document.title).toBe('Backend.AI · webui.menu.Sessions · default');
  });

  it('renders the page-only title before the client connects', () => {
    mockClientPending = true;

    renderRouterAt('/session');

    expect(document.title).toBe('Backend.AI · webui.menu.Sessions');
  });
});
