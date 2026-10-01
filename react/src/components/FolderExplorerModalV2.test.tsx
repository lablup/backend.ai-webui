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
import * as _ from 'lodash-es';
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

/**
 * `MockPayloadGenerator` always materializes a node, so a resolver that refuses
 * the folder is expressed by nulling the root field after generation.
 */
const withNullRootFields = (
  operation: any,
  payload: any,
  nullRootFields: Array<string> = [],
  withFieldError = false,
) => {
  if (
    nullRootFields.length === 0 ||
    operation.request.node.params.name !== 'FolderExplorerModalV2Query'
  ) {
    return payload;
  }
  return {
    ...payload,
    data: {
      ...payload.data,
      ...Object.fromEntries(nullRootFields.map((field) => [field, null])),
    },
    // A non-nullable child that resolved to null nulls its parent and
    // reports the error at the child's path (FR-3997).
    ...(withFieldError
      ? {
          errors: nullRootFields.map((field) => ({
            message: `Cannot return null for non-nullable field VFolderAccessControlInfo.permission.`,
            path: [field, 'accessControl', 'permission'],
          })),
        }
      : {}),
  };
};

const ALL_FILE_HOST_PERMISSIONS = [
  'download-file',
  'upload-file',
  'create-vfolder',
  'delete-vfolder',
  'modify-vfolder',
];

const renderModal = ({
  ownershipProjectId,
  ownershipProjectType,
  permissionBits,
  hostPermissions,
  nullResolvers,
  withFieldError,
}: {
  ownershipProjectId: string | null;
  ownershipProjectType?: 'GENERAL' | 'PERSONAL';
  /** `VFolder.permissions` bits; defaults to read, write and delete. */
  permissionBits?: string[];
  hostPermissions?: string[];
  /** Root fields the manager resolves to `null` for this folder. */
  nullResolvers?: Array<'vfolderNode'>;
  /** Report the null as a field error, the way a broken resolver does. */
  withFieldError?: boolean;
}) => {
  const environment: RelayMockEnvironment = createMockEnvironment();
  const resolver = (operation: any) =>
    withNullRootFields(
      operation,
      MockPayloadGenerator.generate(operation, {
        VFolder: () => ({
          id: btoa(`VFolder:${VFOLDER_UUID}`),
          host: 'local:volume1',
          unmanagedPath: null,
          status: 'ready',
          metadata: { name: 'test-folder' },
          permissions: permissionBits ?? ['READ', 'UPDATE', 'SOFT_DELETE'],
          ownership: {
            userId: 'someone-else-uuid',
            projectId: ownershipProjectId,
            project: ownershipProjectId
              ? { basicInfo: { name: 'folder-project-name' } }
              : null,
          },
        }),
        // The owning project's type, read by the ownership banner through the
        // legacy `group_node` (FR-3983).
        GroupNode: () => ({
          id: btoa(`GroupNode:${ownershipProjectId}`),
          type: ownershipProjectType ?? 'GENERAL',
        }),
        KeyPair: () => ({ resource_policy: 'default' }),
        // The storage-host axis. Every content-changing action is the AND of
        // this and the folder-level `UPDATE` bit, so both sides need a knob.
        Domain: () => ({
          allowed_vfolder_hosts: JSON.stringify({
            'local:volume1': hostPermissions ?? ALL_FILE_HOST_PERMISSIONS,
          }),
        }),
        Group: () => ({ allowed_vfolder_hosts: '{}' }),
        KeyPairResourcePolicy: () => ({ allowed_vfolder_hosts: '{}' }),
      }),
      nullResolvers ?? [],
      withFieldError,
    );
  const seenOperations: Array<{ name: string; variables: any }> = [];
  for (let i = 0; i < 16; i++) {
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
  const ui = (open: boolean) => (
    <RelayEnvironmentProvider environment={environment}>
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <>
            <Suspense fallback={null}>
              <FolderExplorerModalV2
                // The opener clears the id as it closes.
                vfolderID={open ? VFOLDER_UUID.replaceAll('-', '') : ''}
                open={open}
                onRequestClose={vi.fn()}
              />
            </Suspense>
          </>
        </MemoryRouter>
      </QueryClientProvider>
    </RelayEnvironmentProvider>
  );
  const { rerender } = render(ui(true));
  return { seenOperations, setOpen: (open: boolean) => rerender(ui(open)) };
};

const findPermissionOperation = (
  seenOperations: Array<{ name: string; variables: any }>,
) =>
  seenOperations.find(
    (op) =>
      op.name ===
      'useMergedAllowedStorageHostPermission_AllowedVFolderHostsQuery',
  );

const findOwnershipProjectOperation = (
  seenOperations: Array<{ name: string; variables: any }>,
) =>
  seenOperations.find(
    (op) => op.name === 'FolderExplorerModalV2OwnershipProjectQuery',
  );

describe('FolderExplorerModalV2 open feedback', () => {
  beforeEach(() => {
    mockIsProjectAgnosticPage = false;
    mockListHosts.mockClear();
  });

  it('paints the dialog before the folder query resolves', () => {
    // No resolver queued: the folder query stays in flight.
    const environment: RelayMockEnvironment = createMockEnvironment();
    render(
      <RelayEnvironmentProvider environment={environment}>
        <QueryClientProvider client={new QueryClient()}>
          <MemoryRouter>
            <Suspense fallback={null}>
              <FolderExplorerModalV2
                vfolderID={VFOLDER_UUID.replaceAll('-', '')}
                open
                onRequestClose={vi.fn()}
              />
            </Suspense>
          </MemoryRouter>
        </QueryClientProvider>
      </RelayEnvironmentProvider>,
    );

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'button.Close' })).toBeEnabled();
    expect(screen.queryByTestId('mock-file-explorer')).not.toBeInTheDocument();
    expect(
      environment.mock
        .getAllOperations()
        .map((operation) => operation.request.node.params.name),
    ).toEqual(['FolderExplorerModalV2Query']);
  });

  it('starts every explorer session with fresh state (FR-4005)', async () => {
    const { setOpen } = renderModal({ ownershipProjectId: null });
    await screen.findByTestId('mock-file-explorer');

    // Leave the default tab; the mocked description is the metadata panel.
    fireEvent.click(screen.getAllByText('auditLog.AuditLog')[0]);
    await waitFor(() =>
      expect(
        screen.queryByTestId('mock-vfolder-description'),
      ).not.toBeInTheDocument(),
    );

    setOpen(false);
    await waitFor(() =>
      expect(
        screen.queryByTestId('mock-file-explorer'),
      ).not.toBeInTheDocument(),
    );

    setOpen(true);
    await screen.findByTestId('mock-file-explorer');
    expect(screen.getByTestId('mock-vfolder-description')).toBeInTheDocument();
  });
});

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
    // ...and the project-type lookup behind it is not issued either.
    expect(findOwnershipProjectOperation(seenOperations)).toBeUndefined();

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
    // The header's session buttons issue their own lookup for the page
    // project, so match the explorer's by its variables, not by order.
    expect(
      seenOperations
        .filter(
          (op) =>
            op.name ===
            'useMergedAllowedStorageHostPermission_AllowedVFolderHostsQuery',
        )
        .map((op) => op.variables.projectId),
    ).toContain('folder-project-id');

    // The banner decided after looking the owning project up by its id.
    expect(
      findOwnershipProjectOperation(seenOperations)?.variables.projectId,
    ).toBe(btoa('GroupNode:folder-project-id'));
  });

  it('on a general route with a folder in a PERSONAL project: hides the ownership-mismatch alert (FR-3983)', async () => {
    const { seenOperations } = renderModal({
      ownershipProjectId: 'folder-project-id',
      ownershipProjectType: 'PERSONAL',
    });

    await screen.findByTestId('mock-file-explorer');
    // The lookup ran and answered PERSONAL...
    await waitFor(() =>
      expect(findOwnershipProjectOperation(seenOperations)).toBeDefined(),
    );

    // ...so neither wording of the cross-project banner is rendered.
    expect(screen.queryByText('data.NotInProject')).not.toBeInTheDocument();
    expect(
      screen.queryByText('data.BelongsToDifferentProject'),
    ).not.toBeInTheDocument();
  });
});

describe('FolderExplorerModalV2 permission gating (FR-4140)', () => {
  beforeEach(() => {
    mockIsProjectAgnosticPage = false;
    mockListHosts.mockClear();
    fileExplorerProps.length = 0;
  });

  const latestPermissionProps = () => {
    const props = fileExplorerProps.at(-1);
    return {
      download: props.enableDownload,
      upload: props.enableUpload,
      create: props.enableCreate,
      delete: props.enableDelete,
      rename: props.enableRename,
      edit: props.enableEdit,
    };
  };

  it('UPDATE plus every host permission enables every action', async () => {
    renderModal({ ownershipProjectId: null, permissionBits: ['UPDATE'] });

    await screen.findByTestId('mock-file-explorer');

    await waitFor(() =>
      expect(latestPermissionProps()).toEqual({
        download: true,
        upload: true,
        create: true,
        delete: true,
        rename: true,
        edit: true,
      }),
    );
  });

  it('without UPDATE only download stays enabled, SOFT_DELETE included', async () => {
    renderModal({
      ownershipProjectId: null,
      permissionBits: ['READ', 'SOFT_DELETE'],
    });

    await screen.findByTestId('mock-file-explorer');

    await waitFor(() =>
      expect(latestPermissionProps()).toEqual({
        download: true,
        upload: false,
        create: false,
        delete: false,
        rename: false,
        edit: false,
      }),
    );
  });

  it.each([
    ['upload-file', ['upload', 'edit']],
    ['create-vfolder', ['create']],
    ['delete-vfolder', ['delete']],
    ['modify-vfolder', ['rename', 'edit']],
    ['download-file', ['download']],
  ])(
    'a host without %s disables only %j',
    async (missingPermission, disabledActions) => {
      renderModal({
        ownershipProjectId: null,
        permissionBits: ['READ', 'UPDATE'],
        hostPermissions: _.without(
          ALL_FILE_HOST_PERMISSIONS,
          missingPermission,
        ),
      });

      await screen.findByTestId('mock-file-explorer');

      await waitFor(() => {
        const props = latestPermissionProps();
        expect(props).toEqual(
          _.mapValues(
            props,
            (_enabled, action) => !disabledActions.includes(action),
          ),
        );
      });
    },
  );
});

describe('FolderExplorerModalV2 unreadable folder', () => {
  beforeEach(() => {
    mockIsProjectAgnosticPage = false;
    mockListHosts.mockClear();
    fileExplorerProps.length = 0;
  });

  it('shows the hard error when vfolderV2 returns null', async () => {
    renderModal({
      ownershipProjectId: null,
      nullResolvers: ['vfolderNode'],
    });

    expect(
      await screen.findByText('explorer.FolderNotFoundOrNoAccess'),
    ).toBeInTheDocument();
    expect(screen.queryByTestId('mock-file-explorer')).not.toBeInTheDocument();
    expect(screen.queryByText('explorer.Metadata')).not.toBeInTheDocument();
    expect(
      screen.queryByText('explorer.FolderDetailUnavailable'),
    ).not.toBeInTheDocument();
  });

  it('tells a field error apart from an unreadable folder (FR-3997)', async () => {
    renderModal({
      ownershipProjectId: null,
      nullResolvers: ['vfolderNode'],
      withFieldError: true,
    });

    expect(
      await screen.findByText('explorer.FolderDetailUnavailable'),
    ).toBeInTheDocument();
    expect(
      screen.queryByText('explorer.FolderNotFoundOrNoAccess'),
    ).not.toBeInTheDocument();
    expect(screen.queryByTestId('mock-file-explorer')).not.toBeInTheDocument();
  });
});
