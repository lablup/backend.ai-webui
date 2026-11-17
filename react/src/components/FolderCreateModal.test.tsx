/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import FolderCreateModal from './FolderCreateModal';
import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RelayEnvironmentProvider } from 'react-relay';
import { createMockEnvironment, MockPayloadGenerator } from 'relay-test-utils';
import type { RelayMockEnvironment } from 'relay-test-utils/lib/RelayModernMockEnvironment';

/**
 * Contract tests for the explicit project prop contract (ADR-0001, FR-3408).
 *
 * These tests exercise external behavior only: props in, rendered output and
 * mutation variables out. They intentionally do not assert which hooks the
 * component calls internally.
 */

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: {
      language: 'en',
      changeLanguage: () => new Promise(() => {}),
    },
    ready: true,
  }),
  initReactI18next: {
    type: '3rdParty',
    init: () => {},
  },
}));

// Super-admins skip the per-project permission query, so the mutation is the
// only operation in most tests; the permission test turns this off.
const clientState = vi.hoisted(() => ({
  isSuperadmin: true,
  skipSharedConfirm: true,
}));

vi.mock('../hooks/useAppConfig', () => ({
  useMyAppConfig: () => [
    clientState.skipSharedConfirm,
    () => Promise.resolve(),
    () => Promise.resolve(),
    'loaded',
  ],
}));

vi.mock('../hooks', async (importOriginal) => {
  const originalModule = await importOriginal<typeof import('../hooks')>();
  return {
    ...originalModule,
    useSuspendedBackendaiClient: () => ({
      is_superadmin: clientState.isSuperadmin,
      user_uuid: 'current-user-uuid',
      _config: {
        domainName: 'default',
      },
      vfolder: {
        list_allowed_types: () => Promise.resolve(['user', 'group']),
      },
    }),
  };
});

vi.mock('../hooks/useAccessibleProjects', () => ({
  useAccessibleProjects: () => ({
    personalProject: { id: 'personal-project-id', name: 'me' },
  }),
}));

vi.mock('../hooks/reactQueryAlias', async (importOriginal) => {
  const originalModule =
    await importOriginal<typeof import('../hooks/reactQueryAlias')>();
  return {
    ...originalModule,
    useTanQuery: () => ({
      data: ['user', 'group'],
      isFetching: false,
    }),
  };
});

vi.mock('../hooks/useBAINotification', async (importOriginal) => {
  const originalModule =
    await importOriginal<typeof import('../hooks/useBAINotification')>();
  return {
    ...originalModule,
    useSetBAINotification: () => ({
      upsertNotification: vi.fn(),
    }),
  };
});

vi.mock('../hooks/useCurrentUserProjectRoles', async (importOriginal) => {
  const originalModule =
    await importOriginal<
      typeof import('../hooks/useCurrentUserProjectRoles')
    >();
  return {
    ...originalModule,
    useEffectiveAdminRole: () => 'superadmin',
  };
});

vi.mock('./StorageSelect', async () => {
  const React = await import('react');
  return {
    default: () =>
      React.createElement('div', { 'data-testid': 'mock-storage-select' }),
  };
});

// The in-modal project selector is mocked to a button that reports a fixed
// choice through the same `onSelectProject` surface the real component uses.
// The contract under test is FolderCreateModal's (selector rendered or not,
// chosen project reaching the mutation) — not the selector's internals.
vi.mock('./ProjectSelectForAdminPage', async () => {
  const React = await import('react');
  return {
    default: (props: any) =>
      React.createElement(
        'button',
        {
          'data-testid': 'mock-project-select',
          type: 'button',
          onClick: () =>
            props.onSelectProject?.({
              label: 'chosen-project-name',
              value: 'chosen-project-id',
              projectId: 'chosen-project-id',
              projectName: 'chosen-project-name',
              projectResourcePolicy: null,
            }),
        },
        'select-project',
      ),
  };
});

// The auto-mount permission check runs on mount and is not under test here.
const folderOperations = (environment: RelayMockEnvironment) =>
  environment.mock
    .getAllOperations()
    .filter(
      (operation) =>
        operation.request.node.params.name !==
        'FolderCreateModalAutoMountPermissionQuery',
    );

const renderModal = (
  project: { id: string; name: string } | null,
  onRequestClose = vi.fn(),
  initialValues?: Record<string, unknown>,
  autoMountScopeType?: 'USER' | 'PROJECT',
) => {
  const environment: RelayMockEnvironment = createMockEnvironment();
  render(
    <RelayEnvironmentProvider environment={environment}>
      <FolderCreateModal
        open
        project={project}
        initialValues={initialValues}
        autoMountScopeType={autoMountScopeType}
        onRequestClose={onRequestClose}
      />
    </RelayEnvironmentProvider>,
  );
  return { environment, onRequestClose };
};

const fillFolderNameAndSubmit = async (
  user: ReturnType<typeof userEvent.setup>,
  name: string,
) => {
  await user.type(screen.getByPlaceholderText('maxLength.64chars'), name);
  await user.click(screen.getByTestId('create-folder-button'));
};

describe('FolderCreateModal project prop contract (ADR-0001)', () => {
  it('renders no project selector and targets exactly the given project when `project` is non-null', async () => {
    const user = userEvent.setup();
    const { environment } = renderModal({
      id: 'fixed-project-id',
      name: 'fixed-project-name',
    });

    // Fixed mode: the modal must not embed its own project selector.
    expect(screen.queryByTestId('mock-project-select')).not.toBeInTheDocument();

    await fillFolderNameAndSubmit(user, 'contract-folder');

    await waitFor(() => {
      expect(folderOperations(environment)).toHaveLength(1);
    });
    const operation = environment.mock.getMostRecentOperation();
    expect(operation.request.node.params.name).toBe(
      'FolderCreateModalProjectMutation',
    );
    // The mutation carries exactly the project passed by the page.
    expect(operation.request.variables.projectId).toBe('fixed-project-id');
    expect(operation.request.variables.input.name).toBe('contract-folder');
  });

  it('disables Create and points to the personal project without CREATE on the project', async () => {
    clientState.isSuperadmin = false;
    try {
      const { environment } = renderModal({
        id: 'fixed-project-id',
        name: 'fixed-project-name',
      });

      await waitFor(() => {
        expect(folderOperations(environment)).toHaveLength(1);
      });
      const operation = environment.mock.getMostRecentOperation();
      expect(operation.request.node.params.name).toBe(
        'FolderCreateModalPermissionQuery',
      );
      expect(operation.request.variables.projectId).toBe('fixed-project-id');
      environment.mock.resolveMostRecentOperation({
        data: { myScopePermissions: { item: { permissions: ['READ'] } } },
      });

      expect(
        await screen.findByText(
          'data.folders.NoPermissionToCreateFolderInProject',
        ),
      ).toBeInTheDocument();
      expect(
        screen.getByText('data.folders.FolderCreationOpenPersonalProject'),
      ).toBeInTheDocument();
      await waitFor(() => {
        expect(screen.getByTestId('create-folder-button')).toBeDisabled();
      });
    } finally {
      clientState.isSuperadmin = true;
    }
  });

  it('shows the visibility notice with the personal project shortcut and holds Create for a confirm in a general project', async () => {
    clientState.skipSharedConfirm = false;
    try {
      const user = userEvent.setup();
      const { environment } = renderModal({
        id: 'fixed-project-id',
        name: 'fixed-project-name',
      });

      expect(
        screen.getByText('data.folders.SharedProjectFolderVisibleToMembers'),
      ).toBeInTheDocument();
      expect(
        screen.getByText('data.folders.FolderCreationOpenPersonalProject'),
      ).toBeInTheDocument();
      await fillFolderNameAndSubmit(user, 'contract-folder');

      // The confirm step stands between Create and the mutation. jsdom does
      // not open a second Modal after mount, so the dialog itself is not read.
      await new Promise((resolve) => setTimeout(resolve, 300));
      expect(folderOperations(environment)).toHaveLength(0);
    } finally {
      clientState.skipSharedConfirm = true;
    }
  });

  it('ignores a caller `initialValues.group` that disagrees with the `project` prop', async () => {
    const user = userEvent.setup();
    const { environment } = renderModal(
      { id: 'fixed-project-id', name: 'fixed-project-name' },
      vi.fn(),
      { group: 'stale-project-id' },
    );

    await fillFolderNameAndSubmit(user, 'contract-folder');

    await waitFor(() => {
      expect(folderOperations(environment)).toHaveLength(1);
    });
    const operation = environment.mock.getMostRecentOperation();
    expect(operation.request.variables.projectId).toBe('fixed-project-id');
    expect(operation.request.variables.projectId).not.toBe('stale-project-id');
  });

  it('closes with the created folder after the mutation resolves (non-null project)', async () => {
    const user = userEvent.setup();
    const { environment, onRequestClose } = renderModal({
      id: 'fixed-project-id',
      name: 'fixed-project-name',
    });

    await fillFolderNameAndSubmit(user, 'contract-folder');
    await waitFor(() => {
      expect(folderOperations(environment)).toHaveLength(1);
    });
    // The payload's vfolder spreads a fragment defined on the abstract
    // `Node` interface; pin the concrete type and give it a decodable
    // global id (the success path calls `toLocalId`, which base64-decodes).
    const VFOLDER_GLOBAL_ID = btoa(
      'VFolder:00000000-0000-0000-0000-000000000001',
    );
    environment.mock.resolveMostRecentOperation((operation) =>
      MockPayloadGenerator.generate(operation, {
        Node: () => ({ __typename: 'VFolder', id: VFOLDER_GLOBAL_ID }),
        VFolder: () => ({ id: VFOLDER_GLOBAL_ID }),
      }),
    );

    await waitFor(() => {
      expect(onRequestClose).toHaveBeenCalledTimes(1);
    });
    expect(onRequestClose.mock.calls[0][0]).toBeTruthy();
  });

  it('renders a required project selector when `project` is null and blocks submit until a project is chosen', async () => {
    const user = userEvent.setup();
    const { environment } = renderModal(null);

    // Null mode: the modal embeds its own project selector.
    expect(screen.getByTestId('mock-project-select')).toBeInTheDocument();

    // Submitting without choosing a project fails the required rule and
    // dispatches no mutation.
    await fillFolderNameAndSubmit(user, 'contract-folder');
    expect(
      await screen.findByText('data.folders.TargetProjectRequired'),
    ).toBeInTheDocument();
    expect(folderOperations(environment)).toHaveLength(0);
  });

  it('targets exactly the project chosen in the in-modal selector when `project` is null', async () => {
    const user = userEvent.setup();
    const { environment } = renderModal(null);

    await user.click(screen.getByTestId('mock-project-select'));
    await fillFolderNameAndSubmit(user, 'contract-folder');

    await waitFor(() => {
      expect(folderOperations(environment)).toHaveLength(1);
    });
    const operation = environment.mock.getMostRecentOperation();
    expect(operation.request.node.params.name).toBe(
      'FolderCreateModalProjectMutation',
    );
    // The mutation carries exactly the project chosen inside the modal.
    expect(operation.request.variables.projectId).toBe('chosen-project-id');
  });
});

describe('FolderCreateModal auto-mount', () => {
  const VFOLDER_UUID = '00000000-0000-0000-0000-000000000001';
  const VFOLDER_GLOBAL_ID = btoa(`VFolder:${VFOLDER_UUID}`);

  const findOperation = (environment: RelayMockEnvironment, name: string) =>
    environment.mock
      .getAllOperations()
      .find((op) => op.request.node.params.name === name);

  const createWithAutoMount = async (
    project: { id: string; name: string },
    autoMountScopeType?: 'USER' | 'PROJECT',
  ) => {
    const user = userEvent.setup();
    const { environment } = renderModal(
      project,
      vi.fn(),
      undefined,
      autoMountScopeType,
    );

    await waitFor(() =>
      expect(
        findOperation(environment, 'FolderCreateModalAutoMountPermissionQuery'),
      ).toBeDefined(),
    );
    environment.mock.resolve(
      findOperation(environment, 'FolderCreateModalAutoMountPermissionQuery')!,
      { data: { myScopePermissions: { item: { permissions: ['CREATE'] } } } },
    );

    const autoMountSwitch = screen.getByRole('switch', {
      name: 'autoMount.AutoMountSettings',
    });
    await waitFor(() =>
      expect(autoMountSwitch).not.toHaveAttribute('aria-disabled', 'true'),
    );
    await user.click(autoMountSwitch);
    await user.type(
      await screen.findByRole('textbox', {
        name: 'autoMount.MountDestination',
      }),
      '/home/work/data',
    );
    await fillFolderNameAndSubmit(user, 'auto-mount-folder');

    await waitFor(() =>
      expect(
        findOperation(environment, 'FolderCreateModalProjectMutation'),
      ).toBeDefined(),
    );
    const createOperation = findOperation(
      environment,
      'FolderCreateModalProjectMutation',
    )!;
    environment.mock.resolve(
      createOperation,
      MockPayloadGenerator.generate(createOperation, {
        Node: () => ({ __typename: 'VFolder', id: VFOLDER_GLOBAL_ID }),
        VFolder: () => ({ id: VFOLDER_GLOBAL_ID, entityId: VFOLDER_UUID }),
      }),
    );

    await waitFor(() =>
      expect(
        findOperation(environment, 'FolderCreateModalAutoMountMutation'),
      ).toBeDefined(),
    );
    return findOperation(environment, 'FolderCreateModalAutoMountMutation')!
      .request.variables.input;
  };

  it('auto-mounts on the user scope when the caller passes USER', async () => {
    const input = await createWithAutoMount(
      { id: 'personal-project-id', name: 'me' },
      'USER',
    );
    expect(input).toMatchObject({
      scope: { scopeType: 'USER', scopeId: 'current-user-uuid' },
      vfolderId: VFOLDER_UUID,
      mountDestination: '/home/work/data',
      subpath: '.',
      mountPermission: 'READ_WRITE',
    });
  });

  it('auto-mounts on the project scope by default', async () => {
    const input = await createWithAutoMount({
      id: 'fixed-project-id',
      name: 'fixed-project-name',
    });
    expect(input).toMatchObject({
      scope: { scopeType: 'PROJECT', scopeId: 'fixed-project-id' },
      vfolderId: VFOLDER_UUID,
      mountDestination: '/home/work/data',
    });
  });
});
