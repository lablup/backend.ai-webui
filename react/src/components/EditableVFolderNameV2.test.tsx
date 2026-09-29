/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import '../../__test__/matchMedia.mock.js';
import type { EditableVFolderNameV2TestQuery } from '../__generated__/EditableVFolderNameV2TestQuery.graphql';
import { ProjectContextOrNull } from '../types/projectContext';
import EditableVFolderNameV2 from './EditableVFolderNameV2';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { Suspense } from 'react';
import {
  graphql,
  RelayEnvironmentProvider,
  useLazyLoadQuery,
} from 'react-relay';
import { MemoryRouter } from 'react-router-dom';
import { createMockEnvironment, MockPayloadGenerator } from 'relay-test-utils';
import type { RelayMockEnvironment } from 'relay-test-utils/lib/RelayModernMockEnvironment';

/**
 * Contract tests for the rename gate (ADR-0001, FR-3413, FR-3522): the folder
 * owner, super admins, or — for a folder owned by the page-passed `project` —
 * whoever holds VFOLDER/UPDATE on that project scope. Never derived from the
 * ambient current project. Asserts the presence of the rename trigger and
 * which permission lookup (if any) was sent.
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

// Manager feature flags, pinned per scenario.
let mockFeatures = new Set<string>();
vi.mock('../hooks', async (importOriginal) => {
  const originalModule = await importOriginal<typeof import('../hooks')>();
  return {
    ...originalModule,
    useSuspendedBackendaiClient: () => ({
      supports: (feature: string) => mockFeatures.has(feature),
      vfolder: { rename: vi.fn() },
    }),
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

// Super-admin status and project-admin scopes are pinned per test scenario.
let mockIsSuperAdmin = false;
let mockProjectAdminIds: string[] = [];
vi.mock('../hooks/useCurrentUserProjectRoles', async (importOriginal) => {
  const originalModule =
    await importOriginal<
      typeof import('../hooks/useCurrentUserProjectRoles')
    >();
  return {
    ...originalModule,
    useCurrentUserProjectRoles: () => ({
      isSuperAdmin: mockIsSuperAdmin,
      domainAdminDomains: [],
      projectAdminIds: mockProjectAdminIds,
    }),
  };
});

// Decoy ambient project: its id matches the folder's ownership project, so a
// regression back to ambient-derived gating would make the "null project"
// scenarios below editable — and fail.
vi.mock('../hooks/useCurrentProject', async (importOriginal) => {
  const originalModule =
    await importOriginal<typeof import('../hooks/useCurrentProject')>();
  return {
    ...originalModule,
    useCurrentProjectValue: () => ({
      id: 'folder-project-id',
      name: 'ambient-project-name',
    }),
  };
});

vi.mock('./FolderExplorerOpener', () => ({
  useFolderExplorerOpener: () => ({
    open: vi.fn(),
    generateFolderPath: (id: string) => `/folder/${id}`,
  }),
}));

const TestRenderer: React.FC<{ project: ProjectContextOrNull }> = ({
  project,
}) => {
  const data = useLazyLoadQuery<EditableVFolderNameV2TestQuery>(
    graphql`
      query EditableVFolderNameV2TestQuery($vfolderId: UUID!)
      @relay_test_operation {
        vfolderV2(vfolderId: $vfolderId) {
          ...EditableVFolderNameV2Fragment
        }
      }
    `,
    { vfolderId: '00000000-0000-0000-0000-000000000000' },
  );
  if (!data.vfolderV2) return null;
  return (
    <EditableVFolderNameV2
      vfolderNodeFrgmt={data.vfolderV2}
      project={project}
      enableLink={false}
      editable
    />
  );
};

// What the VFOLDER/UPDATE lookup answers: the number of matching role
// assignments of the caller, or a field error.
let mockVFolderUpdateRoleCount: number | 'error' = 0;
let permissionLookups: Array<Record<string, unknown>> = [];

const renderName = ({
  project,
  ownerUserId,
  ownershipProjectId,
}: {
  project: ProjectContextOrNull;
  ownerUserId: string | null;
  ownershipProjectId: string | null;
}) => {
  const environment: RelayMockEnvironment = createMockEnvironment();
  const resolver = (operation: any) => {
    if (
      operation.request.node.params.name === 'useCanUpdateProjectVFolderQuery'
    ) {
      permissionLookups.push(operation.request.variables);
      if (mockVFolderUpdateRoleCount === 'error') {
        return {
          data: { vfolderUpdateRoles: null },
          errors: [{ message: 'boom', path: ['vfolderUpdateRoles'] }],
        } as any;
      }
      return MockPayloadGenerator.generate(operation, {
        RoleAssignmentConnection: () => ({
          count: mockVFolderUpdateRoleCount,
        }),
      });
    }
    return MockPayloadGenerator.generate(operation, {
      VFolder: () => ({
        id: btoa('VFolder:folder-0000'),
        status: 'ready',
        metadata: { name: 'test-folder' },
        ownership: {
          userId: ownerUserId,
          projectId: ownershipProjectId,
        },
      }),
    });
  };
  // A queued resolver answers one operation and is dequeued by identity, so
  // queue two distinct ones: the folder query, then the permission lookup.
  environment.mock.queueOperationResolver((op) => resolver(op));
  environment.mock.queueOperationResolver((op) => resolver(op));
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  render(
    // The name renders as a router `Link` when `enableLink` is on, and the
    // component calls `useWebUINavigate()` unconditionally.
    <MemoryRouter>
      <RelayEnvironmentProvider environment={environment}>
        <QueryClientProvider client={queryClient}>
          <Suspense fallback={null}>
            <TestRenderer project={project} />
          </Suspense>
        </QueryClientProvider>
      </RelayEnvironmentProvider>
    </MemoryRouter>,
  );
};

const findEditTrigger = async () => {
  await screen.findByText('test-folder');
  // The rename trigger is a pencil `IconButton` whose accessible name is
  // `button.Edit` (raw key — see the `react-i18next` mock above).
  return screen.queryByRole('button', { name: 'button.Edit' });
};

const PAGE_PROJECT = { id: 'folder-project-id', name: 'folder-project' };
const renderProjectFolder = () =>
  renderName({
    project: PAGE_PROJECT,
    ownerUserId: null,
    ownershipProjectId: 'folder-project-id',
  });

describe('EditableVFolderNameV2 rename gate (ADR-0001, FR-3413, FR-3522)', () => {
  beforeEach(() => {
    mockIsSuperAdmin = false;
    mockProjectAdminIds = [];
    // A manager whose `myRoles` honours VFOLDER/UPDATE-on-scope filters.
    mockFeatures = new Set(['rbac-filter-wrapper']);
    mockVFolderUpdateRoleCount = 0;
    permissionLookups = [];
  });

  describe('principals, on a manager that answers VFOLDER/UPDATE per scope', () => {
    it('lets a regular user rename their own user-owned folder, without a permission lookup', async () => {
      renderName({
        project: PAGE_PROJECT,
        ownerUserId: 'current-user-uuid',
        ownershipProjectId: null,
      });
      expect(await findEditTrigger()).toBeInTheDocument();
      expect(permissionLookups).toHaveLength(0);
    });

    it('lets the folder owner rename regardless of project context (project null)', async () => {
      renderName({
        project: null,
        ownerUserId: 'current-user-uuid',
        ownershipProjectId: 'folder-project-id',
      });
      expect(await findEditTrigger()).toBeInTheDocument();
    });

    it("lets a super admin rename another user's folder with project null", async () => {
      mockIsSuperAdmin = true;
      renderName({
        project: null,
        ownerUserId: 'someone-else-uuid',
        ownershipProjectId: 'folder-project-id',
      });
      expect(await findEditTrigger()).toBeInTheDocument();
      expect(permissionLookups).toHaveLength(0);
    });

    it('lets a super admin rename a project folder, without a permission lookup', async () => {
      mockIsSuperAdmin = true;
      renderProjectFolder();
      expect(await findEditTrigger()).toBeInTheDocument();
      expect(permissionLookups).toHaveLength(0);
    });

    it('lets a project admin holding VFOLDER/UPDATE on the folder project scope rename it', async () => {
      mockVFolderUpdateRoleCount = 1;
      renderProjectFolder();
      expect(await findEditTrigger()).toBeInTheDocument();
      expect(permissionLookups).toEqual([
        {
          shouldQuery: true,
          permissionFilter: {
            scopeType: { equals: 'PROJECT' },
            scopeId: { equals: 'folder-project-id' },
            entityType: { equals: 'VFOLDER' },
            operation: { equals: 'UPDATE' },
          },
        },
      ]);
    });

    // The original 403: a plain member's role only carries VFOLDER/READ.
    it('does NOT allow rename for a plain project member without VFOLDER/UPDATE', async () => {
      renderProjectFolder();
      expect(await findEditTrigger()).not.toBeInTheDocument();
      expect(permissionLookups).toHaveLength(1);
    });

    // A custom role granting PROJECT_ADMIN_PAGE but not VFOLDER/UPDATE.
    it('does NOT let admin-page scope stand in for a missing VFOLDER/UPDATE', async () => {
      mockProjectAdminIds = ['folder-project-id'];
      renderProjectFolder();
      expect(await findEditTrigger()).not.toBeInTheDocument();
    });

    it('falls back to project-admin scope when the permission lookup errors', async () => {
      mockProjectAdminIds = ['folder-project-id'];
      mockVFolderUpdateRoleCount = 'error';
      renderProjectFolder();
      expect(await findEditTrigger()).toBeInTheDocument();
    });
  });

  describe('explicit project contract', () => {
    it('does NOT allow rename with project null for a non-owner non-superadmin, even though the ambient decoy matches', async () => {
      mockVFolderUpdateRoleCount = 1;
      renderName({
        project: null,
        ownerUserId: 'someone-else-uuid',
        ownershipProjectId: 'folder-project-id',
      });
      expect(await findEditTrigger()).not.toBeInTheDocument();
      expect(permissionLookups).toHaveLength(0);
    });

    it('does NOT allow rename when the passed project differs from the folder ownership project', async () => {
      mockVFolderUpdateRoleCount = 1;
      renderName({
        project: { id: 'passed-other-project-id', name: 'other-project' },
        ownerUserId: 'someone-else-uuid',
        ownershipProjectId: 'folder-project-id',
      });
      expect(await findEditTrigger()).not.toBeInTheDocument();
      expect(permissionLookups).toHaveLength(0);
    });
  });

  describe.each([
    ['older than 26.4.4rc9 (no rbac-filter-wrapper)', []],
    [
      '26.9.0a1+ (rbac-permission-bit: scope/operation filters ignored)',
      ['rbac-filter-wrapper', 'rbac-permission-bit'],
    ],
  ])('fallback on a manager %s', (_label, features) => {
    beforeEach(() => {
      mockFeatures = new Set(features);
      // Would wrongly grant rename if a lookup were sent and trusted.
      mockVFolderUpdateRoleCount = 1;
    });

    it('lets a project admin of the folder project rename, without a permission lookup', async () => {
      mockProjectAdminIds = ['folder-project-id'];
      renderProjectFolder();
      expect(await findEditTrigger()).toBeInTheDocument();
      expect(permissionLookups).toHaveLength(0);
    });

    it('does NOT allow rename for a plain project member', async () => {
      renderProjectFolder();
      expect(await findEditTrigger()).not.toBeInTheDocument();
      expect(permissionLookups).toHaveLength(0);
    });

    it('does NOT allow rename when the admin scope is over a different project', async () => {
      mockProjectAdminIds = ['some-other-project-id'];
      renderProjectFolder();
      expect(await findEditTrigger()).not.toBeInTheDocument();
    });

    it('still lets a regular user rename their own folder', async () => {
      renderName({
        project: PAGE_PROJECT,
        ownerUserId: 'current-user-uuid',
        ownershipProjectId: null,
      });
      expect(await findEditTrigger()).toBeInTheDocument();
    });

    it('still lets a super admin rename a project folder', async () => {
      mockIsSuperAdmin = true;
      renderProjectFolder();
      expect(await findEditTrigger()).toBeInTheDocument();
    });
  });
});
