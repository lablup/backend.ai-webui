/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import '../../__test__/matchMedia.mock.js';
import type { EditableVFolderNameV2TestQuery } from '../__generated__/EditableVFolderNameV2TestQuery.graphql';
import type { EffectiveAdminRole } from '../hooks/useCurrentUserProjectRoles';
import { ProjectContextOrNull } from '../types/projectContext';
import EditableVFolderNameV2 from './EditableVFolderNameV2';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { App } from 'antd';
import { Suspense } from 'react';
import {
  graphql,
  RelayEnvironmentProvider,
  useLazyLoadQuery,
} from 'react-relay';
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

// The effective admin role is pinned per test scenario.
let mockEffectiveAdminRole: EffectiveAdminRole = 'none';
vi.mock('../hooks/useCurrentUserProjectRoles', async (importOriginal) => {
  const originalModule =
    await importOriginal<
      typeof import('../hooks/useCurrentUserProjectRoles')
    >();
  return {
    ...originalModule,
    useEffectiveAdminRole: () => mockEffectiveAdminRole,
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
      editable={{ triggerType: ['icon'] }}
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
    <RelayEnvironmentProvider environment={environment}>
      <QueryClientProvider client={queryClient}>
        <App>
          <Suspense fallback={null}>
            <TestRenderer project={project} />
          </Suspense>
        </App>
      </QueryClientProvider>
    </RelayEnvironmentProvider>,
  );
};

const findEditTrigger = async () => {
  await screen.findByText('test-folder');
  // antd Typography renders the rename trigger with the
  // `ant-typography-edit` class when `editable` resolves truthy.
  return document.querySelector('.ant-typography-edit');
};

describe('EditableVFolderNameV2 rename gate (ADR-0001, FR-3413)', () => {
  beforeEach(() => {
    mockEffectiveAdminRole = 'none';
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
    mockEffectiveAdminRole = 'superadmin';
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
