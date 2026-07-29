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
import { App } from 'antd';
import { NuqsTestingAdapter } from 'nuqs/adapters/testing';
import { Suspense } from 'react';
import { RelayEnvironmentProvider } from 'react-relay';
import { createMockEnvironment, MockPayloadGenerator } from 'relay-test-utils';
import type { RelayMockEnvironment } from 'relay-test-utils/lib/RelayModernMockEnvironment';

/**
 * Contract tests for the explicit project prop (ADR-0001, FR-3415).
 *
 * The image list is scoped by a `ScopeField` argument; the scope must come
 * from the project the Environments page selected, never from the ambient
 * current project.
 *
 * The project selector lives HERE rather than in the page's card header: it
 * filters what this list shows, which makes it a content-scoped control
 * (`.claude/rules/use-bai-card.md`). The list still never decides the project
 * itself — the value arrives by prop and every change is reported upward.
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

// The selector is reduced to a button reporting a fixed choice through the
// same `onSelectProject` surface the real component uses.
vi.mock('./ProjectSelectForAdminPage', async () => {
  const React = await import('react');
  return {
    default: (props: any) =>
      React.createElement(
        'button',
        {
          'data-testid': 'mock-project-select',
          'data-value': props.value ?? '',
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
        <App>
          <Suspense fallback={null}>
            <ImageList project={project} onChangeProject={onChangeProject} />
          </Suspense>
        </App>
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

  it('shows the selector with an empty state — and runs no scoped query — until a project is picked', async () => {
    const { environment } = renderList(null);

    expect(
      await screen.findByText('environment.SelectProjectToListImages'),
    ).toBeInTheDocument();
    expect(screen.getByTestId('mock-project-select')).toHaveAttribute(
      'data-value',
      '',
    );
    expect(environment.mock.getAllOperations()).toHaveLength(0);
  });
});
