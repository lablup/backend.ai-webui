/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import '../../__test__/matchMedia.mock.js';
import type { DeploymentAddRevisionModalTestQuery } from '../__generated__/DeploymentAddRevisionModalTestQuery.graphql';
import DeploymentAddRevisionModal from './DeploymentAddRevisionModal';
import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
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
 * Contract tests for the explicit project prop contract (ADR-0001, FR-3411).
 *
 * DeploymentAddRevisionModal is derive-from-resource tier: the Add-revision
 * flow always targets the deployment's OWN project (metadata.projectId +
 * projectV2 name), regardless of any ambient header selection. These tests
 * exercise external behavior only: rendered output given fragment data.
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
      _config: { allowCustomResourceAllocation: true },
    }),
    useWebUINavigate: () => vi.fn(),
  };
});

// Decoy ambient project: the modal must never read it. If it did, the
// assertions on the folder picker / resource form / folder-creation project
// below would surface `ambient-project-id`.
vi.mock('../hooks/useCurrentProject', async (importOriginal) => {
  const originalModule =
    await importOriginal<typeof import('../hooks/useCurrentProject')>();
  return {
    ...originalModule,
    useCurrentProjectValue: () => ({
      id: 'ambient-project-id',
      name: 'ambient-project-name',
    }),
  };
});

// Mode is user-persisted; tests pin it per scenario.
let mockMode: 'preset' | 'custom' = 'preset';
vi.mock('../hooks/useBAISetting', async (importOriginal) => {
  const originalModule =
    await importOriginal<typeof import('../hooks/useBAISetting')>();
  return {
    ...originalModule,
    useBAISettingUserState: (key: string) => {
      if (key === 'deploymentRevisionCreationMode') {
        return [mockMode, vi.fn()];
      }
      throw new Error(`Unexpected setting key in test: ${key}`);
    },
  };
});

vi.mock('./FolderExplorerOpener', () => ({
  useFolderExplorerOpener: () => ({
    open: vi.fn(),
    generateFolderPath: (id: string) => `/folder/${id}`,
  }),
}));

// The resource form's own project contract is covered by
// ResourceAllocationFormItems.contract.test.tsx; here a probe surfaces the
// project the modal hands down.
vi.mock('./SessionFormItems/ResourceAllocationFormItems', async () => {
  const React = await import('react');
  return {
    default: (props: any) =>
      React.createElement(
        'div',
        {
          'data-testid': 'mock-resource-allocation-form',
          'data-project-id': props.project?.id ?? '',
          'data-project-name': props.project?.name ?? '',
        },
        'resource-allocation-form',
      ),
    RESOURCE_ALLOCATION_INITIAL_FORM_VALUES: {},
    AUTOMATIC_DEFAULT_SHMEM: '64m',
  };
});

// In-modal folder creation must target the deployment's project as well.
vi.mock('./FolderCreateModalV2', async () => {
  const React = await import('react');
  return {
    default: (props: any) =>
      React.createElement('div', {
        'data-testid': 'mock-folder-create-modal',
        'data-project-id': props.project?.id ?? '',
      }),
  };
});

// Heavy, contract-irrelevant children.
vi.mock('./ImageEnvironmentSelectFormItems', () => ({ default: () => null }));
vi.mock('./RuntimeParameterFormSection', () => ({ default: () => null }));
vi.mock('./EnvVarFormList', () => ({ default: () => null }));
vi.mock('./VFolderTableFormItem', () => ({ default: () => null }));
vi.mock('./DeploymentPresetDetailModal', () => ({ default: () => null }));

// The model-folder picker is the probe for the folder-picker side of the
// contract: it surfaces the `currentProjectId` it was scoped to.
vi.mock('backend.ai-ui', async (importOriginal) => {
  const React = await import('react');
  const originalModule = await importOriginal<typeof import('backend.ai-ui')>();
  return {
    ...originalModule,
    BAIVFolderSelect: (props: any) =>
      React.createElement(
        'button',
        {
          'data-testid': 'mock-vfolder-select',
          'data-current-project-id': props.currentProjectId ?? '',
          disabled: props.disabled,
          type: 'button',
        },
        'select-model-folder',
      ),
    BAIAvailablePresetSelect: () => null,
    BAIRuntimeVariantSelect: () => null,
  };
});

type DeploymentMetadataMock = {
  resourceGroupName: string;
  projectId: string;
  projectV2: { basicInfo: { name: string } } | null;
};

const TestRenderer: React.FC = () => {
  const data = useLazyLoadQuery<DeploymentAddRevisionModalTestQuery>(
    graphql`
      query DeploymentAddRevisionModalTestQuery($id: ID!)
      @relay_test_operation {
        deployment(id: $id) {
          ...DeploymentAddRevisionModal_deployment
        }
      }
    `,
    { id: 'test-deployment-id' },
  );
  if (!data.deployment) return null;
  return (
    <DeploymentAddRevisionModal
      open
      deploymentFrgmt={data.deployment}
      onRequestClose={vi.fn()}
    />
  );
};

const renderModal = (metadata: DeploymentMetadataMock) => {
  const environment: RelayMockEnvironment = createMockEnvironment();
  environment.mock.queueOperationResolver((operation) =>
    MockPayloadGenerator.generate(operation, {
      ModelDeploymentMetadata: () => metadata,
      // Keep the "Load current revision" path quiet: no current revision.
      ModelDeployment: () => ({ currentRevision: null }),
      DeploymentRevisionPresetConnection: () => ({ count: 1 }),
    }),
  );
  render(
    <RelayEnvironmentProvider environment={environment}>
      <App>
        <Suspense fallback={null}>
          <TestRenderer />
        </Suspense>
      </App>
    </RelayEnvironmentProvider>,
  );
  return { environment };
};

const DEPLOYMENT_METADATA: DeploymentMetadataMock = {
  resourceGroupName: 'deployment-rg',
  projectId: 'deployment-project-id',
  projectV2: { basicInfo: { name: 'deployment-project-name' } },
};

describe('DeploymentAddRevisionModal project derivation contract (ADR-0001)', () => {
  afterEach(() => {
    mockMode = 'preset';
  });

  it("scopes the model-folder picker to the deployment's own project (preset mode)", async () => {
    renderModal(DEPLOYMENT_METADATA);

    const folderSelect = await screen.findByTestId('mock-vfolder-select');
    // The picker follows the deployment's project — never the ambient one.
    expect(folderSelect).toHaveAttribute(
      'data-current-project-id',
      'deployment-project-id',
    );
    expect(folderSelect).toBeEnabled();
    // Project resolved → no defensive warning, submit stays available.
    expect(
      screen.queryByText('deployment.CannotResolveDeploymentProject'),
    ).not.toBeInTheDocument();
  });

  it("feeds the deployment's own project to the resource form and in-modal folder creation (custom mode)", async () => {
    mockMode = 'custom';
    renderModal(DEPLOYMENT_METADATA);

    const resourceForm = await screen.findByTestId(
      'mock-resource-allocation-form',
    );
    expect(resourceForm).toHaveAttribute(
      'data-project-id',
      'deployment-project-id',
    );
    expect(resourceForm).toHaveAttribute(
      'data-project-name',
      'deployment-project-name',
    );
    expect(screen.getByTestId('mock-folder-create-modal')).toHaveAttribute(
      'data-project-id',
      'deployment-project-id',
    );
  });

  it('visibly disables submission instead of falling back to ambient when the project cannot be resolved', async () => {
    mockMode = 'custom';
    renderModal({
      resourceGroupName: 'deployment-rg',
      projectId: 'deployment-project-id',
      // Pre-26.4.3 manager: no projectV2 → the project name is unresolvable.
      projectV2: null,
    });

    // Defensive warning is shown...
    expect(
      await screen.findByText('deployment.CannotResolveDeploymentProject'),
    ).toBeInTheDocument();
    // ...submission is disabled...
    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: 'deployment.AddRevision' }),
      ).toBeDisabled();
    });
    // ...the folder picker is disabled rather than scoped to ambient...
    const folderSelect = screen.getByTestId('mock-vfolder-select');
    expect(folderSelect).toBeDisabled();
    expect(folderSelect).not.toHaveAttribute(
      'data-current-project-id',
      'ambient-project-id',
    );
    // ...and the resource form (non-null project required) is not rendered.
    expect(
      screen.queryByTestId('mock-resource-allocation-form'),
    ).not.toBeInTheDocument();
  });
});
