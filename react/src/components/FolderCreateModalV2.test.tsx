/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import FolderCreateModalV2 from './FolderCreateModalV2';
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

// Most tests target the caller's personal project, which needs no permission
// query or confirm, so the mutation is the only operation.
const clientState = vi.hoisted(() => ({
  isSuperadmin: true,
  personalProjectId: 'fixed-project-id',
}));

vi.mock('../hooks/useAppConfig', () => ({
  useRefetchMyAppConfig: () => () => Promise.resolve(),
  useUpdateMyUserAppConfig: () => () => Promise.resolve(),
}));

vi.mock('../hooks', async (importOriginal) => {
  const originalModule = await importOriginal<typeof import('../hooks')>();
  return {
    ...originalModule,
    useSuspendedBackendaiClient: () => ({
      is_superadmin: clientState.isSuperadmin,
      _config: {
        domainName: 'default',
        enableModelFolders: true,
      },
      vfolder: {
        list_allowed_types: () => Promise.resolve(['user', 'group']),
      },
    }),
  };
});

vi.mock('../hooks/useAccessibleProjects', () => ({
  useAccessibleProjects: () => ({
    personalProject: { id: clientState.personalProjectId, name: 'me' },
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
// The contract under test is FolderCreateModalV2's (selector rendered or not,
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

const renderModal = (
  project: { id: string; name: string } | null,
  onRequestClose = vi.fn(),
  initialValues?: Record<string, unknown>,
  allowAutoMount?: boolean,
) => {
  const environment: RelayMockEnvironment = createMockEnvironment();
  render(
    <RelayEnvironmentProvider environment={environment}>
      <FolderCreateModalV2
        open
        project={project}
        allowAutoMount={allowAutoMount}
        initialValues={initialValues}
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

describe('FolderCreateModalV2 project prop contract (ADR-0001)', () => {
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
      expect(environment.mock.getAllOperations()).toHaveLength(1);
    });
    const operation = environment.mock.getMostRecentOperation();
    expect(operation.request.node.params.name).toBe(
      'FolderCreateModalV2ProjectMutation',
    );
    // The mutation carries exactly the project passed by the page.
    expect(operation.request.variables.projectId).toBe('fixed-project-id');
    expect(operation.request.variables.input.name).toBe('contract-folder');
  });

  it('creates an automount folder as the caller’s own folder', async () => {
    const user = userEvent.setup();
    const { environment } = renderModal(
      { id: 'fixed-project-id', name: 'fixed-project-name' },
      vi.fn(),
      { usage_mode: 'automount' },
      true,
    );

    expect(screen.getByTestId('automount-usage-mode')).toBeInTheDocument();
    await fillFolderNameAndSubmit(user, '.contract-folder');

    await waitFor(() => {
      expect(environment.mock.getAllOperations()).toHaveLength(1);
    });
    const operation = environment.mock.getMostRecentOperation();
    // The manager rejects dot-prefixed project folders.
    expect(operation.request.node.params.name).toBe(
      'FolderCreateModalV2PersonalMutation',
    );
    expect(operation.request.variables.input).toMatchObject({
      name: '.contract-folder',
      usageMode: 'general',
      projectId: null,
    });
  });

  it('does not offer AutoMount unless the page allows it', async () => {
    const user = userEvent.setup();
    const { environment } = renderModal(
      { id: 'fixed-project-id', name: 'fixed-project-name' },
      vi.fn(),
      { usage_mode: 'automount' },
    );

    expect(
      screen.queryByTestId('automount-usage-mode'),
    ).not.toBeInTheDocument();
    await fillFolderNameAndSubmit(user, 'contract-folder');

    await waitFor(() => {
      expect(environment.mock.getAllOperations()).toHaveLength(1);
    });
    expect(
      environment.mock.getMostRecentOperation().request.variables.input,
    ).toMatchObject({ name: 'contract-folder', usageMode: 'GENERAL' });
  });

  it('disables Create and points to the personal project without CREATE on the project', async () => {
    clientState.isSuperadmin = false;
    try {
      const { environment } = renderModal({
        id: 'general-project-id',
        name: 'general-project-name',
      });

      await waitFor(() => {
        expect(environment.mock.getAllOperations()).toHaveLength(1);
      });
      const operation = environment.mock.getMostRecentOperation();
      expect(operation.request.node.params.name).toBe(
        'FolderCreateModalV2PermissionQuery',
      );
      expect(operation.request.variables.projectId).toBe('general-project-id');
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

  it('shows the visibility notice and holds Create for a confirm in a general project', async () => {
    const user = userEvent.setup();
    const { environment } = renderModal({
      id: 'general-project-id',
      name: 'general-project-name',
    });

    expect(
      screen.getByText('data.folders.SharedProjectFolderVisibleToMembers'),
    ).toBeInTheDocument();
    await fillFolderNameAndSubmit(user, 'contract-folder');

    // The confirm step stands between Create and the mutation. jsdom does
    // not open a second Modal after mount, so the dialog itself is not read.
    await new Promise((resolve) => setTimeout(resolve, 300));
    expect(environment.mock.getAllOperations()).toHaveLength(0);
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
      expect(environment.mock.getAllOperations()).toHaveLength(1);
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
      expect(environment.mock.getAllOperations()).toHaveLength(1);
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
    expect(environment.mock.getAllOperations()).toHaveLength(0);
  });

  it('targets exactly the project chosen in the in-modal selector when `project` is null', async () => {
    // The chosen project is the caller's own, so no confirm stands in between.
    clientState.personalProjectId = 'chosen-project-id';
    try {
      const user = userEvent.setup();
      const { environment } = renderModal(null);

      await user.click(screen.getByTestId('mock-project-select'));
      await fillFolderNameAndSubmit(user, 'contract-folder');

      await waitFor(() => {
        expect(environment.mock.getAllOperations()).toHaveLength(1);
      });
      const operation = environment.mock.getMostRecentOperation();
      expect(operation.request.node.params.name).toBe(
        'FolderCreateModalV2ProjectMutation',
      );
      // The mutation carries exactly the project chosen inside the modal.
      expect(operation.request.variables.projectId).toBe('chosen-project-id');
    } finally {
      clientState.personalProjectId = 'fixed-project-id';
    }
  });
});
