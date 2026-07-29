/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import '../../__test__/matchMedia.mock.js';
import '../../__test__/resizeObserver.mock.js';
import DeploymentDetailPage from './DeploymentDetailPage';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { App } from 'antd';
import { Suspense } from 'react';
import { RelayEnvironmentProvider } from 'react-relay';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { createMockEnvironment, MockPayloadGenerator } from 'relay-test-utils';
import type { RelayMockEnvironment } from 'relay-test-utils/lib/RelayModernMockEnvironment';

/**
 * Contract tests for the page-decided project context (ADR-0001, FR-3413).
 *
 * DeploymentDetailPage serves three URL spaces; the PAGE decides the project
 * context. On the super-admin URL space (`null`): no project-mismatch alert,
 * no switch-project shortcut, and the Add-revision CTA is NOT suppressed —
 * even when the ambient decoy differs from the deployment's project. On
 * general routes the narrowed ambient keeps today's behavior. External
 * behavior only: rendered output + the props handed to the section cards.
 */

vi.mock('react-i18next', async () => {
  const React = await import('react');
  return {
    useTranslation: () => ({
      t: (key: string) => key,
      i18n: {
        language: 'en',
        changeLanguage: () => new Promise(() => {}),
      },
      ready: true,
    }),
    Trans: (props: any) => React.createElement('span', null, props.i18nKey),
    initReactI18next: {
      type: '3rdParty',
      init: () => {},
    },
  };
});

vi.mock('../hooks', async (importOriginal) => {
  const originalModule = await importOriginal<typeof import('../hooks')>();
  return {
    ...originalModule,
    useSuspendedBackendaiClient: () => ({
      supports: () => false,
      _config: { blockList: [] },
    }),
    useWebUINavigate: () => vi.fn(),
  };
});

vi.mock('../hooks/backendai', async (importOriginal) => {
  const originalModule =
    await importOriginal<typeof import('../hooks/backendai')>();
  return {
    ...originalModule,
    useCurrentUserInfo: () => [{ email: 'me@backend.ai' }, vi.fn()],
  };
});

// Decoy ambient project: differs from the deployment's project, so on the
// admin URL space any leak of ambient-derived mismatch logic would render
// the alert / suppress the CTA — and fail the assertions below.
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

// Route derivation is covered by useIsProjectAgnosticPage.test.tsx; pinned
// per scenario here.
let mockIsProjectAgnosticPage = false;
vi.mock('../hooks/useIsProjectAgnosticPage', async (importOriginal) => {
  const originalModule =
    await importOriginal<typeof import('../hooks/useIsProjectAgnosticPage')>();
  return {
    ...originalModule,
    useIsProjectAgnosticPage: () => mockIsProjectAgnosticPage,
  };
});

vi.mock('../hooks/useRouteScope', async (importOriginal) => {
  const originalModule =
    await importOriginal<typeof import('../hooks/useRouteScope')>();
  return {
    ...originalModule,
    useProjectPath: () => (path: string) => `/${path}`,
    useActiveProjectName: () => 'ambient-project-name',
  };
});

vi.mock('../hooks/useWebUIMenuItems', () => ({
  getPathFromMenuKey: () => '/start',
  useWebUIMenuItems: () => ({ firstAvailableMenuItem: null }),
}));

// Section cards/modals are stubbed probes — their internals have their own
// tests; this test asserts what the PAGE decides and hands down.
vi.mock('../components/DeploymentBasicInfoCard', async () => {
  const React = await import('react');
  return {
    default: () =>
      React.createElement('div', { 'data-testid': 'mock-basic-info-card' }),
  };
});
vi.mock('../components/DeploymentRevisionCard', async () => {
  const React = await import('react');
  return {
    default: (props: any) =>
      React.createElement('div', {
        'data-testid': 'mock-revision-card',
        'data-add-revision-disabled': String(props.isAddRevisionDisabled),
      }),
  };
});
vi.mock('../components/DeploymentReplicasCard', async () => {
  const React = await import('react');
  return {
    default: (props: any) =>
      React.createElement('div', {
        'data-testid': 'mock-replicas-card',
        'data-project-id': props.project?.id ?? '',
      }),
  };
});
vi.mock('../components/DeploymentAutoScalingCard', async () => {
  const React = await import('react');
  return {
    default: () =>
      React.createElement('div', { 'data-testid': 'mock-auto-scaling-card' }),
  };
});
vi.mock('../components/DeploymentAccessTokensCard', async () => {
  const React = await import('react');
  return {
    default: () =>
      React.createElement('div', { 'data-testid': 'mock-access-tokens-card' }),
  };
});
vi.mock('../components/DeploymentAddRevisionModal', async () => {
  const React = await import('react');
  return {
    default: () =>
      React.createElement('div', { 'data-testid': 'mock-add-revision-modal' }),
  };
});
vi.mock('../components/DeploymentRevisionDetailDrawer', async () => {
  const React = await import('react');
  return {
    default: () =>
      React.createElement('div', { 'data-testid': 'mock-revision-drawer' }),
  };
});
vi.mock('../components/SwitchToProjectButton', async () => {
  const React = await import('react');
  return {
    default: () =>
      React.createElement('div', {
        'data-testid': 'mock-switch-to-project-button',
      }),
  };
});

const renderPage = () => {
  const environment: RelayMockEnvironment = createMockEnvironment();
  environment.mock.queueOperationResolver((operation: any) =>
    MockPayloadGenerator.generate(operation, {
      ModelDeployment: () => ({
        id: btoa('ModelDeployment:deployment-0000'),
        metadata: {
          name: 'test-deployment',
          status: 'READY',
          projectId: 'deployment-project-id',
        },
        networkAccess: {
          openToPublic: true,
          endpointUrl: 'https://endpoint.example',
        },
        replicaState: { desiredReplicaCount: 1 },
        runningReplicas: { count: 1 },
        accessTokens: { count: 1 },
        currentRevision: { id: 'revision-1' },
        deployingRevision: { id: 'revision-1' },
        creator: { basicInfo: { email: 'me@backend.ai' } },
      }),
    }),
  );
  render(
    <RelayEnvironmentProvider environment={environment}>
      <MemoryRouter initialEntries={['/deployments/deployment-0000']}>
        <App>
          <Suspense fallback={null}>
            <Routes>
              <Route
                path="/deployments/:deploymentId"
                element={<DeploymentDetailPage />}
              />
            </Routes>
          </Suspense>
        </App>
      </MemoryRouter>
    </RelayEnvironmentProvider>,
  );
};

describe('DeploymentDetailPage project context (ADR-0001, FR-3413)', () => {
  beforeEach(() => {
    mockIsProjectAgnosticPage = false;
  });

  it('admin URL space (null): no mismatch alert, no switch-project shortcut, Add-revision CTA not suppressed', async () => {
    mockIsProjectAgnosticPage = true;
    renderPage();

    expect(await screen.findByText('test-deployment')).toBeInTheDocument();
    // The deployment belongs to a different project than the ambient decoy,
    // but on the admin URL space there is no project context to mismatch.
    expect(
      screen.queryByText('deployment.NotInProject'),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByTestId('mock-switch-to-project-button'),
    ).not.toBeInTheDocument();
    expect(screen.getByTestId('mock-revision-card')).toHaveAttribute(
      'data-add-revision-disabled',
      'false',
    );
    // The replica drawer gets `null` too — no mismatch alert inside it.
    expect(screen.getByTestId('mock-replicas-card')).toHaveAttribute(
      'data-project-id',
      '',
    );
  });

  it('general URL space (narrowed ambient): mismatch alert + switch shortcut + suppressed CTA, exactly as today', async () => {
    renderPage();

    expect(
      await screen.findByText('deployment.NotInProject'),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId('mock-switch-to-project-button'),
    ).toBeInTheDocument();
    expect(screen.getByTestId('mock-revision-card')).toHaveAttribute(
      'data-add-revision-disabled',
      'true',
    );
    expect(screen.getByTestId('mock-replicas-card')).toHaveAttribute(
      'data-project-id',
      'ambient-project-id',
    );
  });
});
