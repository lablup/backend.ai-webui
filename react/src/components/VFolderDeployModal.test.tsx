/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { VFolderDeployModalQuery } from '../__generated__/VFolderDeployModalQuery.graphql';
import VFolderDeployModal, { VFolderDeployQuery } from './VFolderDeployModal';
import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { App } from 'antd';
import { toGlobalId } from 'backend.ai-ui';
import { Suspense } from 'react';
import { loadQuery, RelayEnvironmentProvider } from 'react-relay';
import { createMockEnvironment, MockPayloadGenerator } from 'relay-test-utils';
import type { RelayMockEnvironment } from 'relay-test-utils/lib/RelayModernMockEnvironment';

/**
 * Contract tests for the explicit project prop contract (ADR-0001, FR-3410).
 *
 * VFolderDeployModal never reads the ambient current project: the deploy
 * target is derived from the folder's own ownership (project-owned folder)
 * or chosen with a required in-modal selector (user-owned folder). These
 * tests exercise external behavior only: rendered output and mutation
 * variables.
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

// Preset detail modal drags in its own fragment; irrelevant to the contract.
vi.mock('./DeploymentPresetDetailModal', () => ({
  default: () => null,
}));

// The in-modal project selector is mocked to a button that reports a fixed
// choice through the same `onSelectProject` surface the real component uses.
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

// Stub the REST-backed pieces from backend.ai-ui: the preset select and the
// resource-group select/hook fetch their own data internally. Two resource
// groups keep the auto-deploy scenario (single preset + single group) off so
// the selection UI is always rendered.
vi.mock('backend.ai-ui', async (importOriginal) => {
  const React = await import('react');
  const originalModule = await importOriginal<typeof import('backend.ai-ui')>();
  return {
    ...originalModule,
    useProjectResourceGroups: (projectName: string) => ({
      resourceGroups: projectName ? [{ name: 'rg-a' }, { name: 'rg-b' }] : [],
    }),
    BAIAvailablePresetSelect: () => null,
    BAIProjectResourceGroupSelect: (props: any) =>
      React.createElement(
        'button',
        {
          'data-testid': 'mock-resource-group-select',
          type: 'button',
          disabled: props.disabled,
          onClick: () => props.onChange?.('rg-a'),
        },
        'select-resource-group',
      ),
  };
});

const PRESET_GLOBAL_ID = btoa('DeploymentRevisionPreset:preset-0000');

const renderModal = (vfolderNode: {
  ownership_type: string;
  group: string | null;
  group_name: string | null;
}) => {
  const environment: RelayMockEnvironment = createMockEnvironment();
  const onClose = vi.fn();
  // Mirrors the opener: the query is started in the click event and the modal
  // receives only the resulting reference (render-as-you-fetch).
  const queryRef = loadQuery<VFolderDeployModalQuery>(
    environment,
    VFolderDeployQuery,
    { vfolderGlobalId: toGlobalId('VirtualFolderNode', 'vf-0000') },
    { fetchPolicy: 'store-and-network' },
  );
  // `loadQuery` hits the mock network before the operation is registered as
  // pending, so `queueOperationResolver` would never see it — resolve the
  // already-started request explicitly instead.
  environment.mock.resolveMostRecentOperation((operation) =>
    MockPayloadGenerator.generate(operation, {
      VirtualFolderNode: () => vfolderNode,
      DeploymentRevisionPreset: () => ({
        id: PRESET_GLOBAL_ID,
        name: 'mock-preset',
      }),
    }),
  );
  render(
    <RelayEnvironmentProvider environment={environment}>
      <App>
        <Suspense fallback={null}>
          <VFolderDeployModal open queryRef={queryRef} onClose={onClose} />
        </Suspense>
      </App>
    </RelayEnvironmentProvider>,
  );
  return { environment, onClose };
};

const submitDeploy = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.click(screen.getByTestId('mock-resource-group-select'));
  await user.click(screen.getByRole('button', { name: 'modelStore.Deploy' }));
};

describe('VFolderDeployModal project derivation contract (ADR-0001)', () => {
  it('derives the target project from a project-owned folder and renders no selector', async () => {
    const user = userEvent.setup();
    const { environment } = renderModal({
      ownership_type: 'group',
      group: 'folder-project-id',
      group_name: 'folder-project-name',
    });

    await waitFor(() => {
      expect(
        screen.getByTestId('mock-resource-group-select'),
      ).toBeInTheDocument();
    });
    // Derived mode: the folder's own project is the target — no selector.
    expect(screen.queryByTestId('mock-project-select')).not.toBeInTheDocument();

    await submitDeploy(user);

    await waitFor(() => {
      const operation = environment.mock.getMostRecentOperation();
      expect(operation.request.node.params.name).toBe(
        'VFolderDeployModalMutation',
      );
    });
    const operation = environment.mock.getMostRecentOperation();
    // The mutation carries exactly the folder's owning project.
    expect(operation.request.variables.input.projectId).toBe(
      'folder-project-id',
    );
    expect(operation.request.variables.vfolderId).toBe('vf-0000');
    expect(operation.request.variables.input.resourceGroup).toBe('rg-a');
  });

  it('renders a required project selector for a user-owned folder and blocks deploy until a project is chosen', async () => {
    renderModal({
      ownership_type: 'user',
      group: null,
      group_name: null,
    });

    // Selector mode: the user must pick the target project in the modal.
    expect(
      await screen.findByTestId('mock-project-select'),
    ).toBeInTheDocument();

    // No project chosen yet → the deploy button stays disabled and the
    // resource-group options are not usable either.
    expect(
      screen.getByRole('button', { name: 'modelStore.Deploy' }),
    ).toBeDisabled();
    expect(screen.getByTestId('mock-resource-group-select')).toBeDisabled();
  });

  it('blocks deploy and explains why when a group folder has unreadable ownership fields', async () => {
    // `ownership_type` says "group" but the group id/name are missing, so no
    // target project can be derived. This must not fall through to the
    // user-owned branch (which would silently offer a free project choice).
    renderModal({
      ownership_type: 'group',
      group: null,
      group_name: null,
    });

    expect(
      await screen.findByText('deployment.FolderOwnershipUnresolved'),
    ).toBeInTheDocument();
    // Neither derived nor selectable → no selector, and deploy stays blocked.
    expect(screen.queryByTestId('mock-project-select')).not.toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'modelStore.Deploy' }),
    ).toBeDisabled();
  });

  it('targets exactly the project chosen in the in-modal selector for a user-owned folder', async () => {
    const user = userEvent.setup();
    const { environment } = renderModal({
      ownership_type: 'user',
      group: null,
      group_name: null,
    });

    await user.click(await screen.findByTestId('mock-project-select'));
    await submitDeploy(user);

    await waitFor(() => {
      const operation = environment.mock.getMostRecentOperation();
      expect(operation.request.node.params.name).toBe(
        'VFolderDeployModalMutation',
      );
    });
    const operation = environment.mock.getMostRecentOperation();
    // The mutation carries exactly the project chosen inside the modal —
    // never an ambient one.
    expect(operation.request.variables.input.projectId).toBe(
      'chosen-project-id',
    );
  });
});
