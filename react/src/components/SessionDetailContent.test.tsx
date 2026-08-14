/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import '../../__test__/matchMedia.mock.js';
import '../../__test__/resizeObserver.mock.js';
import { ProjectContextOrNull } from '../types/projectContext';
import SessionDetailContent from './SessionDetailContent';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { Suspense } from 'react';
import { RelayEnvironmentProvider } from 'react-relay';
import { MemoryRouter } from 'react-router-dom';
import { createMockEnvironment, MockPayloadGenerator } from 'relay-test-utils';
import type { RelayMockEnvironment } from 'relay-test-utils/lib/RelayModernMockEnvironment';

/**
 * Contract tests for the explicit project prop contract (ADR-0001, FR-3413).
 *
 * SessionDetailContent is alert tier: `project` is required; with `null`
 * (super-admin pages) the component renders WITHOUT throwing and the
 * `session.NotInProject` comparison is suppressed; with a non-null project
 * the alert renders exactly when the session belongs to a different project.
 * These tests exercise external behavior only: rendered output given props.
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
      _config: {},
    }),
    useWebUINavigate: () => vi.fn(),
  };
});

vi.mock('../hooks/backendai', async (importOriginal) => {
  const originalModule =
    await importOriginal<typeof import('../hooks/backendai')>();
  return {
    ...originalModule,
    useCurrentUserInfo: () => [{ uuid: 'session-user-uuid' }, vi.fn()],
    useCurrentUserRole: () => 'user',
    useResourceSlotsDetails: () => ({ mergedResourceSlots: {} }),
  };
});

// Decoy ambient project: the component must never read it. Its id matches the
// session's project, so if the component compared against the ambient value
// the mismatch alert below would NOT render — surfacing the regression.
vi.mock('../hooks/useCurrentProject', async (importOriginal) => {
  const originalModule =
    await importOriginal<typeof import('../hooks/useCurrentProject')>();
  return {
    ...originalModule,
    useCurrentProjectValue: () => ({
      id: 'session-project-id',
      name: 'ambient-project-name',
    }),
  };
});

// Presentational children with their own hooks/queries are stubbed — this
// test covers only the alert-tier contract of SessionDetailContent itself.
const { stubComponent } = vi.hoisted(() => ({
  stubComponent: (testId: string) => async () => {
    const React = await import('react');
    return {
      default: () => React.createElement('div', { 'data-testid': testId }),
    };
  },
}));
vi.mock(
  './ComputeSessionNodeItems/EditableSessionName',
  stubComponent('mock-editable-session-name'),
);
vi.mock(
  './ComputeSessionNodeItems/SessionActionButtons',
  stubComponent('mock-session-action-buttons'),
);
vi.mock(
  './ComputeSessionNodeItems/SessionStatusTag',
  stubComponent('mock-session-status-tag'),
);
vi.mock(
  './ComputeSessionNodeItems/SessionReservation',
  stubComponent('mock-session-reservation'),
);
vi.mock(
  './ComputeSessionNodeItems/SessionStatusDetailModal',
  stubComponent('mock-session-status-detail-modal'),
);
vi.mock(
  './ComputeSessionNodeItems/SessionIdleChecks',
  stubComponent('mock-session-idle-checks'),
);
vi.mock(
  './ComputeSessionNodeItems/ConnectedKernelList',
  stubComponent('mock-connected-kernel-list'),
);
vi.mock('./ImageNodeSimpleTag', stubComponent('mock-image-node-simple-tag'));
vi.mock('./MountedVFolderLinks', stubComponent('mock-mounted-vfolder-links'));
vi.mock('./SessionUsageMonitor', stubComponent('mock-session-usage-monitor'));
vi.mock(
  './SessionSchedulingHistoryModal',
  stubComponent('mock-session-scheduling-history-modal'),
);

const renderSessionDetail = (project: ProjectContextOrNull) => {
  const environment: RelayMockEnvironment = createMockEnvironment();
  environment.mock.queueOperationResolver((operation: any) =>
    MockPayloadGenerator.generate(operation, {
      ComputeSessionNode: () => ({
        id: btoa('ComputeSessionNode:session-0000'),
        row_id: 'session-row-id',
        name: 'test-session',
        project_id: 'session-project-id',
        user_id: 'session-user-uuid',
        status: 'RUNNING',
        created_at: '2026-07-29T00:00:00Z',
        requested_slots: '{}',
        occupied_slots: '{}',
        idle_checks: '{}',
        type: 'interactive',
        startup_command: null,
        kernel_nodes: { edges: [] },
        dependees: { edges: [], count: 0 },
        dependents: { edges: [], count: 0 },
      }),
    }),
  );
  render(
    <RelayEnvironmentProvider environment={environment}>
      <MemoryRouter>
        <>
          <Suspense fallback={null}>
            <SessionDetailContent id="session-row-id" project={project} />
          </Suspense>
        </>
      </MemoryRouter>
    </RelayEnvironmentProvider>,
  );
};

describe('SessionDetailContent project prop contract (ADR-0001, FR-3413)', () => {
  it('renders without throwing and without the mismatch alert when project is null', async () => {
    renderSessionDetail(null);

    // Renders session content instead of throwing "Project ID is required".
    expect(await screen.findByText('session-row-id')).toBeInTheDocument();
    expect(screen.queryByText('session.NotInProject')).not.toBeInTheDocument();
  });

  it('renders the mismatch alert when the passed project differs from the session project', async () => {
    renderSessionDetail({
      id: 'passed-other-project-id',
      name: 'passed-other-project',
    });

    expect(await screen.findByText('session.NotInProject')).toBeInTheDocument();
  });

  it('renders no mismatch alert when the passed project matches the session project', async () => {
    renderSessionDetail({
      id: 'session-project-id',
      name: 'session-project',
    });

    expect(await screen.findByText('session-row-id')).toBeInTheDocument();
    expect(screen.queryByText('session.NotInProject')).not.toBeInTheDocument();
  });
});
