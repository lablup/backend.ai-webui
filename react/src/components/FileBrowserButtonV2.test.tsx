/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import '../../__test__/matchMedia.mock.js';
import '../../__test__/resizeObserver.mock.js';
import type { FileBrowserButtonV2TestQuery } from '../__generated__/FileBrowserButtonV2TestQuery.graphql';
import { ProjectContextOrNull } from '../types/projectContext';
import FileBrowserButtonV2 from './FileBrowserButtonV2';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Suspense } from 'react';
import {
  graphql,
  RelayEnvironmentProvider,
  useLazyLoadQuery,
} from 'react-relay';
import { createMockEnvironment, MockPayloadGenerator } from 'relay-test-utils';
import type { RelayMockEnvironment } from 'relay-test-utils/lib/RelayModernMockEnvironment';

/**
 * Contract tests for the explicit project prop contract (ADR-0001, FR-3412).
 *
 * FileBrowserButtonV2 is button tier: `project` is required; `null` renders
 * the button disabled with the caller-provided `noProjectTooltip`, a
 * non-null project keys the storage-host permission lookup and the created
 * session to exactly that project. These tests exercise external behavior
 * only: rendered output, query variables, and REST call payloads.
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

const { mockBaiClient, mockCreateIfNotExists, mockListHosts } = vi.hoisted(
  () => {
    const mockCreateIfNotExists = vi.fn().mockResolvedValue({
      created: true,
      status: 'PENDING',
      sessionId: 'created-session-id',
    });
    const mockListHosts = vi.fn(() =>
      Promise.resolve({
        allowed: ['local:volume1'],
        default: 'local:volume1',
        volume_info: {
          'local:volume1': {
            backend: 'vfs',
            capabilities: [],
            sftp_scaling_groups: [],
          },
        },
      }),
    );
    const mockBaiClient = {
      _config: {
        accessKey: 'test-access-key',
        domainName: 'default',
      },
      supports: () => false,
      createIfNotExists: mockCreateIfNotExists,
      vfolder: {
        list_hosts: mockListHosts,
      },
    };
    return { mockBaiClient, mockCreateIfNotExists, mockListHosts };
  },
);

vi.mock('../hooks', async (importOriginal) => {
  const originalModule = await importOriginal<typeof import('../hooks')>();
  return {
    ...originalModule,
    useSuspendedBackendaiClient: () => mockBaiClient,
    useCurrentDomainValue: () => 'default',
    useWebUINavigate: () => vi.fn(),
  };
});

vi.mock('../hooks/useRouteScope', async (importOriginal) => {
  const originalModule =
    await importOriginal<typeof import('../hooks/useRouteScope')>();
  return {
    ...originalModule,
    useProjectPath: () => (path: string) => `/${path}`,
  };
});

// Decoy ambient project: the button must never target it. If it did, the
// `group_name` assertion below would surface `ambient-project-name`.
vi.mock('../hooks/useCurrentProject', async (importOriginal) => {
  const originalModule =
    await importOriginal<typeof import('../hooks/useCurrentProject')>();
  return {
    ...originalModule,
    useCurrentProjectValue: () => ({
      id: 'ambient-project-id',
      name: 'ambient-project-name',
    }),
    useCurrentResourceGroupState: () => [null, vi.fn()] as const,
  };
});

vi.mock('../hooks/useBAINotification', async (importOriginal) => {
  const originalModule =
    await importOriginal<typeof import('../hooks/useBAINotification')>();
  return {
    ...originalModule,
    useSetBAINotification: () => ({
      upsertNotification: vi.fn(),
      closeNotification: vi.fn(),
    }),
  };
});

vi.mock('../hooks/useDefaultImagesWithFallback', () => ({
  useDefaultFileBrowserImageWithFallback: () =>
    'cr.backend.ai/stable/filebrowser:21.02@x86_64',
  useDefaultSystemSSHImageWithFallback: () => ({
    systemSSHImage: 'cr.backend.ai/stable/ssh:latest@x86_64',
  }),
  // Fixtures are already fully qualified, which the real hook passes through.
  useResolveImageReference: () => async (imageString?: string) => imageString,
}));

const VFOLDER_GLOBAL_ID = btoa('VFolder:folder-0000');

const TestRenderer: React.FC<{
  project: ProjectContextOrNull;
  noProjectTooltip?: string;
}> = ({ project, noProjectTooltip }) => {
  'use memo';
  const data = useLazyLoadQuery<FileBrowserButtonV2TestQuery>(
    graphql`
      query FileBrowserButtonV2TestQuery($vfolderId: UUID!)
      @relay_test_operation {
        vfolderV2(vfolderId: $vfolderId) {
          ...FileBrowserButtonV2Fragment
        }
      }
    `,
    { vfolderId: '00000000-0000-0000-0000-000000000000' },
  );
  if (!data.vfolderV2) return null;
  return (
    <FileBrowserButtonV2
      vfolderNodeFrgmt={data.vfolderV2}
      project={project}
      noProjectTooltip={noProjectTooltip}
    />
  );
};

const renderButton = (
  project: ProjectContextOrNull,
  noProjectTooltip?: string,
) => {
  const environment: RelayMockEnvironment = createMockEnvironment();
  const resolver = (operation: any) =>
    MockPayloadGenerator.generate(operation, {
      VFolder: () => ({
        id: VFOLDER_GLOBAL_ID,
        host: 'local:volume1',
      }),
      KeyPair: () => ({
        resource_policy: 'default',
      }),
      Domain: () => ({
        allowed_vfolder_hosts: JSON.stringify({
          'local:volume1': ['mount-in-session'],
        }),
      }),
      Group: () => ({
        allowed_vfolder_hosts: '{}',
      }),
      KeyPairResourcePolicy: () => ({
        allowed_vfolder_hosts: '{}',
      }),
    });
  // Operations disappear from the pending list once a queued resolver
  // handles them, so record every operation (name + variables) as it is
  // resolved for later assertions. Each queued resolver serves exactly one
  // operation (and identical references are all dropped together once one
  // resolves), so queue distinct wrappers — enough for the test query, the
  // permission queries, and the post-creation lookup.
  const seenOperations: Array<{ name: string; variables: any }> = [];
  for (let i = 0; i < 10; i++) {
    environment.mock.queueOperationResolver((operation: any) => {
      seenOperations.push({
        name: operation.request.node.params.name,
        variables: operation.request.variables,
      });
      return resolver(operation);
    });
  }
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  render(
    <RelayEnvironmentProvider environment={environment}>
      <QueryClientProvider client={queryClient}>
        <>
          <Suspense fallback={null}>
            <TestRenderer
              project={project}
              noProjectTooltip={noProjectTooltip}
            />
          </Suspense>
        </>
      </QueryClientProvider>
    </RelayEnvironmentProvider>,
  );
  return { environment, seenOperations };
};

describe('FileBrowserButtonV2 project prop contract (ADR-0001, FR-3412)', () => {
  beforeEach(() => {
    mockCreateIfNotExists.mockClear();
    mockListHosts.mockClear();
  });

  it('renders disabled with the caller-provided tooltip when project is null', async () => {
    renderButton(null, 'data.CannotLaunchSessionInAdminMenu');

    const launchButton = await screen.findByRole('button', {
      name: /ExecuteFileBrowser/,
    });
    expect(launchButton).toBeDisabled();

    // The reason is the page-provided tooltip — the component itself never
    // knows why the project is absent.
    // antd `Space.Compact` -> Astryx `ButtonGroup`, which exposes itself as
    // `role="group"` with the group label as its accessible name. The
    // tooltip stays on the GROUP because a disabled button swallows hover.
    fireEvent.mouseEnter(launchButton.closest('[role="group"]')!);
    expect(
      await screen.findByText('data.CannotLaunchSessionInAdminMenu'),
    ).toBeInTheDocument();
  });

  it('creates the FileBrowser session in exactly the passed project and keys the permission lookup to it', async () => {
    const user = userEvent.setup();
    const { seenOperations } = renderButton({
      id: 'passed-project-id',
      name: 'passed-project-name',
    });

    const launchButton = await screen.findByRole('button', {
      name: /ExecuteFileBrowser/,
    });
    await waitFor(() => expect(launchButton).toBeEnabled());

    // The storage-host permission lookup is keyed to the passed project id,
    // never the ambient decoy.
    const permissionOperation = seenOperations.find(
      (op) =>
        op.name ===
        'useMergedAllowedStorageHostPermission_AllowedVFolderHostsQuery',
    );
    expect(permissionOperation?.variables.projectId).toBe('passed-project-id');

    await user.click(launchButton);

    await waitFor(() => expect(mockCreateIfNotExists).toHaveBeenCalled());
    const resources = mockCreateIfNotExists.mock.calls[0][2];
    // The session is created in exactly the passed project.
    expect(resources.group_name).toBe('passed-project-name');
  });
});
