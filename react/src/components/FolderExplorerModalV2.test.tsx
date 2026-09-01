/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import '../../__test__/matchMedia.mock.js';
import '../../__test__/resizeObserver.mock.js';
import FolderExplorerModalV2 from './FolderExplorerModalV2';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { Suspense } from 'react';
import { RelayEnvironmentProvider } from 'react-relay';
import { MemoryRouter } from 'react-router-dom';
import { createMockEnvironment, MockPayloadGenerator } from 'relay-test-utils';
import type { RelayMockEnvironment } from 'relay-test-utils/lib/RelayModernMockEnvironment';

/**
 * Contract tests for the globally-mounted folder explorer (ADR-0001,
 * FR-3413). The modal is the sanctioned route-consulting exception: on
 * project-agnostic routes it feeds `project={null}` (+ tooltip) to the
 * header's FileBrowser/SFTP buttons and suppresses the ownership-mismatch
 * alert; permission calculation follows the folder's OWN ownership project
 * when the folder is project-owned. External behavior only: rendered output
 * and query variables (with an ambient decoy that must never leak through).
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

// Captured per render so the gating tests can assert what the (stubbed)
// file explorer was told to enable.
const { fileExplorerProps } = vi.hoisted(() => ({
  fileExplorerProps: [] as any[],
}));

const { mockBaiClient, mockListHosts } = vi.hoisted(() => {
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
    vfolder: {
      list_hosts: mockListHosts,
    },
  };
  return { mockBaiClient, mockListHosts };
});

vi.mock('../hooks', async (importOriginal) => {
  const originalModule = await importOriginal<typeof import('../hooks')>();
  return {
    ...originalModule,
    useSuspendedBackendaiClient: () => mockBaiClient,
    useCurrentDomainValue: () => 'default',
    useWebUINavigate: () => vi.fn(),
  };
});

// Decoy ambient project: on project-agnostic routes nothing rendered by the modal
// may key off it — the permission-query and button assertions below would
// surface `ambient-project-id` if it leaked through.
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

// Route derivation is covered by useIsProjectAgnosticPage.test.tsx; here it
// is pinned per scenario (the sanctioned location mock for route-derived
// pieces).
let mockIsProjectAgnosticPage = false;
vi.mock('../hooks/useIsProjectAgnosticPage', async (importOriginal) => {
  const originalModule =
    await importOriginal<typeof import('../hooks/useIsProjectAgnosticPage')>();
  return {
    ...originalModule,
    useIsProjectAgnosticPage: () => mockIsProjectAgnosticPage,
  };
});

// Rename gating inside the header has its own contract test
// (EditableVFolderNameV2.test.tsx); pin a role so no roles query is issued.
vi.mock('../hooks/useCurrentUserProjectRoles', async (importOriginal) => {
  const originalModule =
    await importOriginal<
      typeof import('../hooks/useCurrentUserProjectRoles')
    >();
  return {
    ...originalModule,
    useEffectiveAdminRole: () => 'superadmin' as const,
  };
});

vi.mock('../hooks/backendai', async (importOriginal) => {
  const originalModule =
    await importOriginal<typeof import('../hooks/backendai')>();
  return {
    ...originalModule,
    useCurrentUserInfo: () => [{ uuid: 'current-user-uuid' }, vi.fn()],
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

vi.mock('../hooks/useRouteScope', async (importOriginal) => {
  const originalModule =
    await importOriginal<typeof import('../hooks/useRouteScope')>();
  return {
    ...originalModule,
    useProjectPath: () => (path: string) => `/${path}`,
  };
});

vi.mock('../hooks/useDefaultImagesWithFallback', () => ({
  useDefaultFileBrowserImageWithFallback: () =>
    'cr.backend.ai/stable/filebrowser:21.02@x86_64',
  useDefaultSystemSSHImageWithFallback: () => ({
    systemSSHImage: 'cr.backend.ai/stable/ssh:latest@x86_64',
  }),
  // Passthrough is correct: fixtures are already fully qualified. It must be
  // stubbed even so — `useStartSession` imports this too, and under
  // `isolate: false` the shared factory hangs an unrelated suite if omitted.
  useResolveImageReference: () => async (imageString?: string) => imageString,
}));

vi.mock('./FolderExplorerOpener', () => ({
  useFolderExplorerOpener: () => ({
    open: vi.fn(),
    generateFolderPath: (id: string) => `/folder/${id}`,
  }),
}));

vi.mock('./FileUploadManager', async (importOriginal) => {
  const originalModule =
    await importOriginal<typeof import('./FileUploadManager')>();
  return {
    ...originalModule,
    useFileUploadManager: () => ({
      uploadStatus: null,
      uploadFiles: vi.fn(),
    }),
  };
});

// The file table itself is out of contract scope — stub it.
vi.mock('backend.ai-ui', async (importOriginal) => {
  const React = await import('react');
  const originalModule = await importOriginal<typeof import('backend.ai-ui')>();
  const MockFileExplorer = React.forwardRef(function MockFileExplorer(
    props: any,
  ) {
    fileExplorerProps.push(props);
    return React.createElement('div', { 'data-testid': 'mock-file-explorer' });
  });
  return {
    ...originalModule,
    BAIFileExplorer: MockFileExplorer,
  };
});

vi.mock('./VFolderNodeDescriptionV2', async () => {
  const React = await import('react');
  return {
    default: () =>
      React.createElement('div', { 'data-testid': 'mock-vfolder-description' }),
  };
});

const VFOLDER_UUID = '11111111-2222-3333-4444-555555555555';

const renderModal = ({
  ownershipProjectId,
  legacyPermissions,
}: {
  ownershipProjectId: string | null;
  legacyPermissions?: string[];
}) => {
  const environment: RelayMockEnvironment = createMockEnvironment();
  const resolver = (operation: any) =>
    MockPayloadGenerator.generate(operation, {
      // The legacy per-user RBAC list the FR-3800 gating reads.
      VirtualFolderNode: () => ({
        permissions: legacyPermissions ?? [
          'read_content',
          'write_content',
          'delete_content',
        ],
      }),
      VFolder: () => ({
        id: btoa(`VFolder:${VFOLDER_UUID}`),
        host: 'local:volume1',
        unmanagedPath: null,
        status: 'ready',
        metadata: { name: 'test-folder' },
        ownership: {
          userId: 'someone-else-uuid',
          projectId: ownershipProjectId,
          project: ownershipProjectId
            ? { basicInfo: { name: 'folder-project-name' } }
            : null,
        },
      }),
      KeyPair: () => ({ resource_policy: 'default' }),
      Domain: () => ({
        allowed_vfolder_hosts: JSON.stringify({
          'local:volume1': ['download-file', 'upload-file'],
        }),
      }),
      Group: () => ({ allowed_vfolder_hosts: '{}' }),
      KeyPairResourcePolicy: () => ({ allowed_vfolder_hosts: '{}' }),
    });
  const seenOperations: Array<{ name: string; variables: any }> = [];
  for (let i = 0; i < 12; i++) {
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
        <MemoryRouter>
          <>
            <Suspense fallback={null}>
              <FolderExplorerModalV2
                vfolderID={VFOLDER_UUID.replaceAll('-', '')}
                open
                onRequestClose={vi.fn()}
              />
            </Suspense>
          </>
        </MemoryRouter>
      </QueryClientProvider>
    </RelayEnvironmentProvider>,
  );
  return { seenOperations };
};

const findPermissionOperation = (
  seenOperations: Array<{ name: string; variables: any }>,
) =>
  seenOperations.find(
    (op) =>
      op.name ===
      'useMergedAllowedStorageHostPermission_AllowedVFolderHostsQuery',
  );

describe('FolderExplorerModalV2 project context (ADR-0001, FR-3413)', () => {
  beforeEach(() => {
    mockIsProjectAgnosticPage = false;
    mockListHosts.mockClear();
  });

  it('on a project-agnostic route: buttons disabled with the admin-menu tooltip, no mismatch alert, permission keyed to the folder ownership project', async () => {
    mockIsProjectAgnosticPage = true;
    const { seenOperations } = renderModal({
      ownershipProjectId: 'folder-project-id',
    });

    // FileBrowser / SFTP render their `project === null` disabled branch.
    const fileBrowserButton = await screen.findByRole('button', {
      name: 'File Browser',
    });
    expect(fileBrowserButton).toBeDisabled();
    const sftpButton = screen.getByRole('button', { name: 'SSH / SFTP' });
    expect(sftpButton).toBeDisabled();

    // The page-provided reason surfaces on hover.
    // antd `Space.Compact` -> Astryx `ButtonGroup` (`role="group"`). The
    // tooltip stays on the GROUP because a disabled button swallows hover.
    fireEvent.mouseEnter(fileBrowserButton.closest('[role="group"]')!);
    // Both launch buttons carry the same page-provided reason, so the text
    // appears twice — one tooltip per ButtonGroup.
    expect(
      (await screen.findAllByText('data.CannotLaunchSessionInAdminMenu'))
        .length,
    ).toBeGreaterThan(0);

    // Ownership-mismatch alert is suppressed even though the ambient decoy
    // differs from the folder's project.
    expect(screen.queryByText('data.NotInProject')).not.toBeInTheDocument();
    expect(
      screen.queryByText('data.BelongsToDifferentProject'),
    ).not.toBeInTheDocument();

    // Permission calculation follows the folder's OWN project — never the
    // ambient decoy.
    const permissionOperation = findPermissionOperation(seenOperations);
    expect(permissionOperation?.variables.projectId).toBe('folder-project-id');
    expect(permissionOperation?.variables.skipProjectScope).toBe(false);
  });

  it('on a project-agnostic route with a user-owned folder: skips the group-scope permission lookup instead of falling back to the ambient project', async () => {
    mockIsProjectAgnosticPage = true;
    const { seenOperations } = renderModal({ ownershipProjectId: null });

    await screen.findByTestId('mock-file-explorer');

    const permissionOperation = findPermissionOperation(seenOperations);
    expect(permissionOperation?.variables.skipProjectScope).toBe(true);
    expect(permissionOperation?.variables.projectId).not.toBe(
      'ambient-project-id',
    );
  });

  it('on a general route: keeps the ownership-mismatch alert and keys permissions to the folder ownership project', async () => {
    const { seenOperations } = renderModal({
      ownershipProjectId: 'folder-project-id',
    });

    // The folder belongs to a different project than the (page-level,
    // narrowed-ambient) current project — the alert stays, as today.
    expect(await screen.findByText('data.NotInProject')).toBeInTheDocument();

    // Permission calculation now follows the folder's own project (FR-3413
    // acceptance criterion) instead of the header selection.
    const permissionOperation = findPermissionOperation(seenOperations);
    expect(permissionOperation?.variables.projectId).toBe('folder-project-id');
  });
});

describe('FolderExplorerModalV2 share-permission gating (FR-3800)', () => {
  beforeEach(() => {
    mockIsProjectAgnosticPage = false;
    mockListHosts.mockClear();
    fileExplorerProps.length = 0;
  });

  it('a read-only share (no write_content / delete_content) disables write, delete, upload and edit', async () => {
    renderModal({
      ownershipProjectId: null,
      legacyPermissions: ['read_content'],
    });

    await screen.findByTestId('mock-file-explorer');

    await waitFor(() => {
      const props = fileExplorerProps.at(-1);
      expect(props.enableWrite).toBe(false);
      expect(props.enableDelete).toBe(false);
      // The host `upload-file` capability IS present in the fixture, so these
      // prove the folder-level write gate participates in the AND.
      expect(props.enableUpload).toBe(false);
      expect(props.enableEdit).toBe(false);
    });
  });

  it('write_content / delete_content in the legacy permission set enable the corresponding actions', async () => {
    renderModal({
      ownershipProjectId: null,
      legacyPermissions: ['read_content', 'write_content', 'delete_content'],
    });

    await screen.findByTestId('mock-file-explorer');

    // Positive control: guards against the gating collapsing to always-false.
    await waitFor(() => {
      const props = fileExplorerProps.at(-1);
      expect(props.enableWrite).toBe(true);
      expect(props.enableDelete).toBe(true);
      expect(props.enableUpload).toBe(true);
      expect(props.enableEdit).toBe(true);
    });
  });
});
