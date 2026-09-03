/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import '../../__test__/matchMedia.mock.js';
import '../../__test__/resizeObserver.mock.js';
import ImageList from './ImageList';
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
    }),
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
    <RelayEnvironmentProvider environment={environment}>
      <NuqsTestingAdapter searchParams="">
        <>
          <Suspense fallback={null}>
            <ImageList project={project} onChangeProject={onChangeProject} />
          </Suspense>
        </>
      </NuqsTestingAdapter>
    </RelayEnvironmentProvider>,
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
      <RelayEnvironmentProvider environment={environment}>
        <NuqsTestingAdapter searchParams="">
          <>
            <Suspense fallback={null}>
              <Harness />
            </Suspense>
          </>
        </NuqsTestingAdapter>
      </RelayEnvironmentProvider>,
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
      <RelayEnvironmentProvider environment={environment}>
        <NuqsTestingAdapter searchParams="">
          <Suspense fallback={null}>
            <ImageList project={null} onChangeProject={vi.fn()} />
          </Suspense>
        </NuqsTestingAdapter>
      </RelayEnvironmentProvider>,
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
