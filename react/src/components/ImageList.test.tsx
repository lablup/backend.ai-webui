/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import '../../__test__/matchMedia.mock.js';
import '../../__test__/resizeObserver.mock.js';
import ImageList, {
  ALL_IMAGE_STATUSES,
  filterByStatusesFor,
} from './ImageList';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NuqsTestingAdapter } from 'nuqs/adapters/testing';
import { Suspense, useState } from 'react';
import { RelayEnvironmentProvider } from 'react-relay';
import { createMockEnvironment, MockPayloadGenerator } from 'relay-test-utils';
import type { RelayMockEnvironment } from 'relay-test-utils/lib/RelayModernMockEnvironment';

/**
 * Contract tests for the explicit project prop (ADR-0001, FR-3415).
 *
 * The image list is scoped by a `ScopeField` argument. With no project it
 * scopes to the whole DOMAIN — the list always loads, there is no "pick a
 * project first" empty state — and a chosen project narrows it. The scope must
 * come from the props the Environments page passes, never from the ambient
 * current project.
 *
 * The project selector lives HERE rather than in the page's card header: it
 * filters what this list shows, which makes it a content-scoped control
 * (`.claude/rules/use-bai-card.md`). The list still never decides the project
 * itself — the value arrives by prop and every change (including clearing the
 * filter) is reported upward.
 *
 * External behavior only: props in → query variables and callbacks out.
 */

/** The superadmin-only row actions read this; flipped per test. */
let mockIsSuperadmin = true;
const mockScanRequest = vi.fn();
const mockMessageSuccess = vi.fn();
const mockMessageError = vi.fn();

vi.mock('react-i18next', async () => {
  const React = await import('react');
  return {
    useTranslation: () => ({
      // `name` is interpolated so the rescan toast can be asserted to carry
      // the canonical; every other key stays bare.
      t: (key: string, options?: Record<string, any>) =>
        options && 'name' in options ? `${key}:${options.name}` : key,
      i18n: { language: 'en', changeLanguage: () => new Promise(() => {}) },
      ready: true,
    }),
    Trans: (props: any) => React.createElement('span', null, props.i18nKey),
    initReactI18next: { type: '3rdParty', init: () => {} },
  };
});

vi.mock('../hooks', async (importOriginal) => {
  const originalModule = await importOriginal<typeof import('../hooks')>();
  return {
    ...originalModule,
    useBackendAIImageMetaData: () => [
      null,
      { tagAlias: (value: string) => value },
    ],
    useSuspendedBackendaiClient: () => ({
      _config: { domainName: 'default' },
      get is_superadmin() {
        return mockIsSuperadmin;
      },
    }),
  };
});

vi.mock('../helper', async (importOriginal) => {
  const originalModule = await importOriginal<typeof import('../helper')>();
  return {
    ...originalModule,
    baiSignedRequestWithPromise: (...args: Array<any>) =>
      mockScanRequest(...args),
  };
});

vi.mock('../hooks/usePainKiller', async (importOriginal) => {
  const originalModule =
    await importOriginal<typeof import('../hooks/usePainKiller')>();
  return {
    ...originalModule,
    usePainKiller: () => ({ relieve: (title: string) => title }),
  };
});

vi.mock('../app-shim', async (importOriginal) => {
  const originalModule = await importOriginal<typeof import('../app-shim')>();
  return {
    ...originalModule,
    App: {
      useApp: () => ({
        message: {
          success: mockMessageSuccess,
          error: mockMessageError,
          info: vi.fn(),
          warning: vi.fn(),
          loading: vi.fn(),
          open: vi.fn(),
          destroy: vi.fn(),
        },
        modal: { confirm: vi.fn() },
      }),
    },
  };
});

// Decoy ambient project: if any ambient read survived, the scope below would
// carry `ambient-project-id`.
vi.mock('../hooks/useCurrentProject', async (importOriginal) => {
  const originalModule =
    await importOriginal<typeof import('../hooks/useCurrentProject')>();
  return {
    ...originalModule,
    useCurrentProjectValue: () => ({
      id: 'ambient-project-id',
      name: 'ambient-project-name',
    }),
  };
});

// Modal children of the list are out of scope here (they have their own
// contract tests) and pull in the BAI client provider, so they are stubbed.
vi.mock('./ManageImageResourceLimitModal', () => ({ default: () => null }));
vi.mock('./ManageAppsModal', () => ({ default: () => null }));
vi.mock('./ImageInstallModal', () => ({ default: () => null }));
vi.mock('./ImportImageModal', () => ({ default: () => null }));
vi.mock('./TableColumnsSettingModal', () => ({ default: () => null }));

// The selector is reduced to two buttons driving the same `onSelectProject`
// surface the real component uses: picking a project, and CLEARING the filter.
// antd reports a cleared single select as `onChange(undefined, undefined)`, so
// the real `ProjectSelect` forwards `undefined` — reproduced faithfully here.
vi.mock('./ProjectSelectForAdminPage', async () => {
  const React = await import('react');
  return {
    default: (props: any) =>
      React.createElement(
        'div',
        null,
        React.createElement(
          'button',
          {
            'data-testid': 'mock-project-select',
            'data-value': props.value ?? '',
            'data-allow-clear': String(!!props.allowClear),
            'data-placeholder': props.placeholder ?? '',
            type: 'button',
            onClick: () =>
              props.onSelectProject?.({
                label: 'project-two',
                value: 'p2',
                projectId: 'p2',
                projectName: 'project-two',
                projectResourcePolicy: null,
              }),
          },
          'select-project',
        ),
        React.createElement(
          'button',
          {
            'data-testid': 'mock-project-clear',
            type: 'button',
            onClick: () => props.onSelectProject?.(undefined),
          },
          'clear-project',
        ),
      ),
  };
});

/** The rescan row action is a react-query mutation, so every tree needs one. */
const withQueryClient = (children: React.ReactNode) => (
  <QueryClientProvider
    client={
      new QueryClient({
        defaultOptions: {
          queries: { retry: false, refetchOnWindowFocus: false },
          mutations: { retry: false },
        },
      })
    }
  >
    {children}
  </QueryClientProvider>
);

const renderList = (
  project: { id: string; name: string } | null,
  onChangeProject = vi.fn(),
  { resolveQuery = false }: { resolveQuery?: boolean } = {},
) => {
  const environment: RelayMockEnvironment = createMockEnvironment();
  if (resolveQuery) {
    environment.mock.queueOperationResolver((operation) =>
      MockPayloadGenerator.generate(operation),
    );
  }
  render(
    withQueryClient(
      <RelayEnvironmentProvider environment={environment}>
        <NuqsTestingAdapter searchParams="">
          <>
            <Suspense fallback={null}>
              <ImageList project={project} onChangeProject={onChangeProject} />
            </Suspense>
          </>
        </NuqsTestingAdapter>
      </RelayEnvironmentProvider>,
    ),
  );
  return { environment, onChangeProject };
};

describe('ImageList project scope contract (ADR-0001, FR-3415)', () => {
  it('scopes the image query to exactly the project it was given', async () => {
    const { environment } = renderList({
      id: 'chosen-project-id',
      name: 'chosen-project-name',
    });

    await waitFor(() => {
      expect(environment.mock.getAllOperations().length).toBeGreaterThan(0);
    });
    const operation = environment.mock.getMostRecentOperation();
    expect(operation.request.node.params.name).toBe('ImageListQuery');
    expect(operation.request.variables.scopeId).toBe(
      'project:chosen-project-id',
    );
    expect(operation.request.variables.scopeId).not.toContain(
      'ambient-project-id',
    );
  });

  it('offers the project selector inside its own control row, reflecting the given project', async () => {
    renderList(
      { id: 'chosen-project-id', name: 'chosen-project-name' },
      vi.fn(),
      { resolveQuery: true },
    );

    expect(await screen.findByTestId('mock-project-select')).toHaveAttribute(
      'data-value',
      'chosen-project-id',
    );
  });

  it('reports a newly picked project upward instead of scoping itself', async () => {
    const user = userEvent.setup();
    const { onChangeProject } = renderList(
      { id: 'chosen-project-id', name: 'chosen-project-name' },
      vi.fn(),
      { resolveQuery: true },
    );

    await user.click(await screen.findByTestId('mock-project-select'));

    expect(onChangeProject).toHaveBeenCalledWith({
      id: 'p2',
      name: 'project-two',
    });
  });

  it('defaults to the whole domain when no project is selected', async () => {
    const { environment } = renderList(null);

    await waitFor(() => {
      expect(environment.mock.getAllOperations().length).toBeGreaterThan(0);
    });
    const operation = environment.mock.getMostRecentOperation();
    expect(operation.request.node.params.name).toBe('ImageListQuery');
    // `domain:` and not `system:`: the manager computes `system:` from the
    // caller's own project memberships and crashes for an admin with none.
    expect(operation.request.variables.scopeId).toBe('domain:default');
    expect(operation.request.variables.scopeId).not.toContain(
      'ambient-project-id',
    );
  });

  it('renders the list — not an empty state — with no project selected', async () => {
    renderList(null, vi.fn(), { resolveQuery: true });

    // The control row and the table both render; nothing is gated behind a
    // project choice.
    expect(await screen.findByTestId('mock-project-select')).toHaveAttribute(
      'data-value',
      '',
    );
    expect(screen.getByText('environment.InstallImage')).toBeInTheDocument();
    await waitFor(() => {
      // Header row + at least one generated data row.
      expect(screen.getAllByRole('row').length).toBeGreaterThan(1);
    });
  });

  it('offers the project as an optional, clearable filter labelled for the domain-wide view', async () => {
    renderList(null, vi.fn(), { resolveQuery: true });

    const select = await screen.findByTestId('mock-project-select');
    expect(select).toHaveAttribute('data-allow-clear', 'true');
    expect(select).toHaveAttribute(
      'data-placeholder',
      'environment.AllProjects',
    );
  });

  it('reports a cleared filter upward as null so the scope can fall back to the domain', async () => {
    const user = userEvent.setup();
    const { onChangeProject } = renderList(
      { id: 'chosen-project-id', name: 'chosen-project-name' },
      vi.fn(),
      { resolveQuery: true },
    );

    await user.click(await screen.findByTestId('mock-project-clear'));

    expect(onChangeProject).toHaveBeenCalledWith(null);
  });

  it('switches the scope back to the domain when the filter is cleared', async () => {
    const environment: RelayMockEnvironment = createMockEnvironment();
    // A queued resolver is consumed by ONE operation, so queue several and
    // record the scope each fetch actually asked for.
    const observedScopes: string[] = [];
    Array.from({ length: 4 }).forEach(() => {
      environment.mock.queueOperationResolver((operation) => {
        observedScopes.push(String(operation.request.variables.scopeId));
        return MockPayloadGenerator.generate(operation);
      });
    });
    // Stand-in for the page: it owns the value and applies whatever the list
    // reports, exactly as `EnvironmentPage`'s URL state does.
    const Harness = () => {
      const [project, setProject] = useState<{
        id: string;
        name: string;
      } | null>({ id: 'chosen-project-id', name: 'chosen-project-name' });
      return <ImageList project={project} onChangeProject={setProject} />;
    };
    const user = userEvent.setup();
    render(
      withQueryClient(
        <RelayEnvironmentProvider environment={environment}>
          <NuqsTestingAdapter searchParams="">
            <>
              <Suspense fallback={null}>
                <Harness />
              </Suspense>
            </>
          </NuqsTestingAdapter>
        </RelayEnvironmentProvider>,
      ),
    );

    await waitFor(() => {
      expect(observedScopes).toContain('project:chosen-project-id');
    });

    await user.click(await screen.findByTestId('mock-project-clear'));

    await waitFor(() => {
      expect(observedScopes).toContain('domain:default');
    });
  });
});

/**
 * The Status column also carries the private marker (FR-70).
 *
 * A private image can be installed but is hidden from the session launcher's
 * environment picker, so the Environments list is the only place an admin can
 * learn why it is unselectable. The marker is orthogonal to install state:
 * both can show on the same row.
 */
describe('ImageList private marker (FR-70)', () => {
  const renderWithImages = (
    images: Array<{ id: string; installed: boolean; features?: string }>,
  ) => {
    const environment: RelayMockEnvironment = createMockEnvironment();
    environment.mock.queueOperationResolver((operation) =>
      MockPayloadGenerator.generate(operation, {
        ImageConnection: () => ({
          count: images.length,
          edges: images.map((image) => ({
            node: {
              id: image.id,
              row_id: image.id,
              installed: image.installed,
              labels: image.features
                ? [{ key: 'ai.backend.features', value: image.features }]
                : [],
            },
          })),
        }),
      }),
    );
    render(
      withQueryClient(
        <RelayEnvironmentProvider environment={environment}>
          <NuqsTestingAdapter searchParams="">
            <Suspense fallback={null}>
              <ImageList project={null} onChangeProject={vi.fn()} />
            </Suspense>
          </NuqsTestingAdapter>
        </RelayEnvironmentProvider>,
      ),
    );
  };

  it('marks an image whose `ai.backend.features` label contains `private`', async () => {
    // Uninstalled on purpose: an installed fixture here would still pass if
    // the marker were accidentally gated on install state.
    renderWithImages([
      { id: 'img-private', installed: false, features: 'private' },
    ]);

    expect(await screen.findByText('environment.Private')).toBeInTheDocument();
    expect(screen.queryByText('environment.Installed')).not.toBeInTheDocument();
  });

  it('leaves an image without the label unmarked', async () => {
    renderWithImages([{ id: 'img-public', installed: true }]);

    expect(
      await screen.findByText('environment.Installed'),
    ).toBeInTheDocument();
    expect(screen.queryByText('environment.Private')).not.toBeInTheDocument();
  });

  it('shows the install state and the private marker together', async () => {
    renderWithImages([
      { id: 'img-private', installed: true, features: 'private' },
    ]);

    expect(
      await screen.findByText('environment.Installed'),
    ).toBeInTheDocument();
    expect(screen.getByText('environment.Private')).toBeInTheDocument();
  });

  it('does not match a feature that merely contains the word', async () => {
    renderWithImages([
      { id: 'img-nonprivate', installed: true, features: 'nonprivate' },
    ]);

    // Await the row's own badge first — asserting absence while the list is
    // still suspended would pass without ever rendering the fixture.
    expect(
      await screen.findByText('environment.Installed'),
    ).toBeInTheDocument();
    expect(screen.queryByText('environment.Private')).not.toBeInTheDocument();
  });
});

/**
 * `filter_by_statuses` defaults to `[ALIVE]` server-side and is ANDed with the
 * queryfilter, so a `status` condition matches nothing until the argument
 * widens. Widening on anything else would leak deleted images into a list that
 * did not ask for them, and the field name is also ordinary text a user may
 * search for.
 */
describe('ImageList status filter argument (FR-3911)', () => {
  it('widens to every status when the filter carries a status condition', () => {
    expect(filterByStatusesFor('status == "DELETED"')).toEqual([
      ...ALL_IMAGE_STATUSES,
    ]);
    expect(filterByStatusesFor('status == "DELETED"')).toHaveLength(4);
  });

  it('widens when the status condition is not the first one', () => {
    expect(
      filterByStatusesFor('(name ilike "%a%") & (status != "ALIVE")'),
    ).toEqual([...ALL_IMAGE_STATUSES]);
    expect(
      filterByStatusesFor('project ilike "%stable%" & status == "PURGING"'),
    ).toEqual([...ALL_IMAGE_STATUSES]);
  });

  it('leaves the server default alone when no status condition is present', () => {
    expect(filterByStatusesFor('')).toBeUndefined();
    expect(filterByStatusesFor('is_local == true')).toBeUndefined();
    expect(filterByStatusesFor('name ilike "%ubuntu%"')).toBeUndefined();
  });

  it('does not widen for the word "status" inside a quoted value', () => {
    // A quoted value is opaque: it may contain the field name, an operator, or
    // a conjunction, and none of them are syntax.
    expect(filterByStatusesFor('name ilike "%status%"')).toBeUndefined();
    expect(
      filterByStatusesFor('name ilike "%foo& status bar%"'),
    ).toBeUndefined();
    expect(
      filterByStatusesFor('base_image_name ilike "%(status ==%"'),
    ).toBeUndefined();
  });
});

/**
 * Per-image rescan (FR-3948).
 *
 * `POST /admin/images/rescan` is `superadmin_required` and keyed by the
 * manager's own canonical — `<registry>/<namespace>:<tag>` — with the
 * architecture sent alongside it. `ImageNode.name` is NOT that canonical: it
 * resolves to `row.image`, the namespace.
 */
describe('ImageList rescan row action (FR-3948)', () => {
  const IMAGE = {
    id: 'img-rescan',
    row_id: 'img-rescan',
    registry: 'cr.backend.ai',
    namespace: 'stable/python',
    name: 'stable/python',
    tag: '3.9-ubuntu20.04',
    architecture: 'x86_64',
    installed: false,
    labels: [],
  };
  const CANONICAL = 'cr.backend.ai/stable/python:3.9-ubuntu20.04';

  const scanOk = () => ({
    item: {
      id: 'img-rescan',
      name: 'stable/python',
      registry: 'cr.backend.ai',
      project: 'stable',
      tag: '3.9-ubuntu20.04',
      architecture: 'x86_64',
    },
    errors: [],
  });

  const renderOneImage = () => {
    const environment: RelayMockEnvironment = createMockEnvironment();
    // A queued resolver is consumed by ONE operation, so queue several and
    // count how many list fetches actually ran.
    let fetchCount = 0;
    Array.from({ length: 4 }).forEach(() => {
      environment.mock.queueOperationResolver((operation) => {
        fetchCount += 1;
        return MockPayloadGenerator.generate(operation, {
          ImageConnection: () => ({ count: 1, edges: [{ node: IMAGE }] }),
        });
      });
    });
    render(
      withQueryClient(
        <RelayEnvironmentProvider environment={environment}>
          <NuqsTestingAdapter searchParams="">
            <Suspense fallback={null}>
              <ImageList project={null} onChangeProject={vi.fn()} />
            </Suspense>
          </NuqsTestingAdapter>
        </RelayEnvironmentProvider>,
      ),
    );
    return { getFetchCount: () => fetchCount };
  };

  const rescanButton = () =>
    screen.findByRole('button', { name: 'environment.RescanImage' });

  beforeEach(() => {
    mockIsSuperadmin = true;
    mockScanRequest.mockReset();
    mockMessageSuccess.mockReset();
    mockMessageError.mockReset();
  });

  it('posts the row canonical and architecture, toasts and refetches the list', async () => {
    const user = userEvent.setup();
    mockScanRequest.mockResolvedValue(scanOk());
    const { getFetchCount } = renderOneImage();

    await user.click(await rescanButton());

    await waitFor(() => expect(mockScanRequest).toHaveBeenCalledTimes(1));
    expect(mockScanRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'POST',
        url: '/admin/images/rescan',
        body: { canonical: CANONICAL, architecture: 'x86_64' },
      }),
    );
    await waitFor(() =>
      expect(mockMessageSuccess).toHaveBeenCalledWith(
        `environment.RescanImageSuccess:${CANONICAL}`,
      ),
    );
    // The fetch key is bumped on success, so the list re-runs its query.
    await waitFor(() => expect(getFetchCount()).toBeGreaterThan(1));
    expect(mockMessageError).not.toHaveBeenCalled();
  });

  it('reads a bodiless 500 as a scan that failed on the server', async () => {
    const user = userEvent.setup();
    mockScanRequest.mockRejectedValue({
      statusCode: 500,
      // `client.ts` reads a bodiless response as `resp.blob()`, so `response`
      // is an empty Blob rather than null.
      response: new Blob([]),
      title: 'internal server error',
    });
    renderOneImage();

    await user.click(await rescanButton());

    await waitFor(() =>
      expect(mockMessageError).toHaveBeenCalledWith(
        'environment.ImportImageScanFailedOnServer',
      ),
    );
    expect(mockMessageSuccess).not.toHaveBeenCalled();
  });

  it('reports a 404 as the row having gone, not as a manager limitation', async () => {
    const user = userEvent.setup();
    mockScanRequest.mockRejectedValue({
      statusCode: 404,
      error_code: 'image_read_not-found',
    });
    renderOneImage();

    await user.click(await rescanButton());

    await waitFor(() =>
      expect(mockMessageError).toHaveBeenCalledWith(
        'environment.RescanImageNotFound',
      ),
    );
  });

  it('reports a 403 as a refused rescan, not as a refused registration', async () => {
    const user = userEvent.setup();
    mockScanRequest.mockRejectedValue({ statusCode: 403 });
    renderOneImage();

    await user.click(await rescanButton());

    await waitFor(() =>
      expect(mockMessageError).toHaveBeenCalledWith(
        'environment.RescanImageRequiresSuperadmin',
      ),
    );
    // The row action registers nothing, so the import copy must not leak here.
    expect(mockMessageError).not.toHaveBeenCalledWith(
      'environment.ImportImageRequiresSuperadmin',
    );
  });

  it('hides the action from a non-superadmin', async () => {
    mockIsSuperadmin = false;
    renderOneImage();

    // Await a sibling row action first — asserting absence while the list is
    // still suspended would pass without ever rendering the row.
    expect(
      await screen.findByRole('button', { name: 'environment.ManageApps' }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'environment.RescanImage' }),
    ).not.toBeInTheDocument();
  });
});
