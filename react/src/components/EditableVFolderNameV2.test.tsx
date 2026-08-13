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
 * Contract tests for the ownership/role-based rename gate (ADR-0001,
 * FR-3413). Rename is allowed for the folder owner, super admins, or when
 * the page-passed `project` matches the folder's own ownership project —
 * never derived from the ambient current project. External behavior only:
 * the presence/absence of the rename (edit) trigger in the rendered output.
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

// Super-admin status is pinned per test scenario.
let mockIsSuperAdmin = false;
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
      projectAdminIds: [],
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

const renderName = ({
  project,
  ownerUserId,
  ownershipProjectId,
}: {
  project: ProjectContextOrNull;
  ownerUserId: string;
  ownershipProjectId: string | null;
}) => {
  const environment: RelayMockEnvironment = createMockEnvironment();
  environment.mock.queueOperationResolver((operation: any) =>
    MockPayloadGenerator.generate(operation, {
      VFolder: () => ({
        id: btoa('VFolder:folder-0000'),
        status: 'ready',
        metadata: { name: 'test-folder' },
        ownership: {
          userId: ownerUserId,
          projectId: ownershipProjectId,
        },
      }),
    }),
  );
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
  // `button.Edit` (raw key — see the `react-i18next` mock above). It is
  // rendered only when the gate resolves truthy.
  return screen.queryByRole('button', { name: 'button.Edit' });
};

describe('EditableVFolderNameV2 rename gate (ADR-0001, FR-3413)', () => {
  beforeEach(() => {
    mockIsSuperAdmin = false;
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
  });

  it('lets a member rename when the passed project matches the folder ownership project', async () => {
    renderName({
      project: { id: 'folder-project-id', name: 'folder-project' },
      ownerUserId: 'someone-else-uuid',
      ownershipProjectId: 'folder-project-id',
    });
    expect(await findEditTrigger()).toBeInTheDocument();
  });

  it('does NOT allow rename with project null for a non-owner non-superadmin, even though the ambient decoy matches', async () => {
    renderName({
      project: null,
      ownerUserId: 'someone-else-uuid',
      ownershipProjectId: 'folder-project-id',
    });
    expect(await findEditTrigger()).not.toBeInTheDocument();
  });

  it('does NOT allow rename when the passed project differs from the folder ownership project', async () => {
    renderName({
      project: { id: 'passed-other-project-id', name: 'other-project' },
      ownerUserId: 'someone-else-uuid',
      ownershipProjectId: 'folder-project-id',
    });
    expect(await findEditTrigger()).not.toBeInTheDocument();
  });
});
