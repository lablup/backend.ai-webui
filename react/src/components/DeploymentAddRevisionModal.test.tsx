/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import '../../__test__/matchMedia.mock.js';
import type { DeploymentAddRevisionModalTestQuery } from '../__generated__/DeploymentAddRevisionModalTestQuery.graphql';
import DeploymentAddRevisionModal, {
  toImageFullName,
} from './DeploymentAddRevisionModal';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { Suspense } from 'react';
import {
  graphql,
  RelayEnvironmentProvider,
  useLazyLoadQuery,
} from 'react-relay';
import type { OperationDescriptor } from 'relay-runtime';
import { createMockEnvironment, MockPayloadGenerator } from 'relay-test-utils';
import type { MockResolvers } from 'relay-test-utils/lib/RelayMockPayloadGenerator';
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
          disabled: props.isDisabled ?? props.disabled,
          type: 'button',
        },
        'select-model-folder',
      ),
    // Wrapped in a named `Form.Item`, so antd hands it `onChange`; the probe
    // uses that to put a preset id into the Preset form.
    BAIAvailablePresetSelect: (props: any) =>
      React.createElement(
        'button',
        {
          'data-testid': 'mock-preset-select',
          type: 'button',
          onClick: () => props.onChange?.('test-preset-id'),
        },
        'select-preset',
      ),
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

const renderModal = (
  metadata: DeploymentMetadataMock,
  extraResolvers: MockResolvers = {},
) => {
  const environment: RelayMockEnvironment = createMockEnvironment();
  const queryClient = new QueryClient();
  // Every operation the modal issues, in order — the probe for "did the
  // pre-26.4.4 image lookup fire?".
  const executedOperations: Array<string> = [];
  const resolveOperation = (operation: OperationDescriptor) => {
    executedOperations.push(operation.request.node.operation.name);
    return MockPayloadGenerator.generate(operation, {
      ModelDeploymentMetadata: () => metadata,
      // Keep the "Load current revision" path quiet: no current revision.
      ModelDeployment: () => ({ currentRevision: null }),
      DeploymentRevisionPresetConnection: () => ({ count: 1 }),
      ...extraResolvers,
    });
  };
  // A resolver is dropped from the queue once it resolves an operation, and
  // `filter` drops every copy of the same reference — so queue distinct
  // closures to cover the follow-up queries the mode switch triggers.
  for (let i = 0; i < 20; i++) {
    environment.mock.queueOperationResolver((operation) =>
      resolveOperation(operation),
    );
  }
  render(
    <QueryClientProvider client={queryClient}>
      <RelayEnvironmentProvider environment={environment}>
        <>
          <Suspense fallback={null}>
            <TestRenderer />
          </Suspense>
        </>
      </RelayEnvironmentProvider>
    </QueryClientProvider>,
  );
  return { environment, executedOperations };
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

// The preset prefill resolves the image name from the preset's `image` node
// (26.4.4+) and from a secondary `imageV2` lookup on older managers; both
// paths must produce the same string the environment select matches against.
describe('toImageFullName', () => {
  it('appends the architecture so the environment select can exact-match', () => {
    expect(
      toImageFullName({
        canonicalName: 'cr.backend.ai/stable/python:3.9-ubuntu20.04',
        architecture: 'x86_64',
      }),
    ).toBe('cr.backend.ai/stable/python:3.9-ubuntu20.04@x86_64');
  });

  it('falls back to the canonical name when no architecture is known', () => {
    expect(
      toImageFullName({ canonicalName: 'cr.backend.ai/stable/python:3.9' }),
    ).toBe('cr.backend.ai/stable/python:3.9');
  });

  it('resolves to undefined when the preset carries no image', () => {
    expect(toImageFullName(null)).toBeUndefined();
    expect(toImageFullName(undefined)).toBeUndefined();
  });
});

// The Preset → Custom prefill reads the preset's `image` node on 26.4.4+ and
// only falls back to the secondary `imageV2` lookup when the manager is older
// and leaves `image` null. These pin the branch itself, not just the string
// formatting: whether `DeploymentAddRevisionModalImageNameQuery` is issued.
describe('preset → custom image prefill', () => {
  const IMAGE_NAME_QUERY = 'DeploymentAddRevisionModalImageNameQuery';

  const switchToCustomWithPreset = async (extraResolvers: MockResolvers) => {
    const { executedOperations } = renderModal(
      DEPLOYMENT_METADATA,
      extraResolvers,
    );

    // Select a preset so the mode switch has something to carry over...
    fireEvent.click(await screen.findByTestId('mock-preset-select'));
    // ...then toggle Preset → Custom, which runs the prefill.
    fireEvent.click(
      screen.getByRole('radio', { name: 'deployment.CustomMode' }),
    );

    await waitFor(() => {
      expect(executedOperations).toContain(
        'DeploymentAddRevisionModalSelectedPresetQuery',
      );
    });
    return executedOperations;
  };

  it('reads the preset image node without a secondary lookup (26.4.4+)', async () => {
    const executedOperations = await switchToCustomWithPreset({
      DeploymentRevisionPreset: () => ({
        execution: { imageId: 'test-image-id' },
        image: {
          identity: {
            canonicalName: 'cr.backend.ai/stable/python:3.9-ubuntu20.04',
            architecture: 'x86_64',
          },
        },
      }),
    });

    // The whole point of the refactor: no second round trip.
    await waitFor(() => {
      expect(executedOperations).not.toContain(IMAGE_NAME_QUERY);
    });
  });

  it('falls back to the imageV2 lookup when the manager leaves image null (pre-26.4.4)', async () => {
    const executedOperations = await switchToCustomWithPreset({
      DeploymentRevisionPreset: () => ({
        execution: { imageId: 'test-image-id' },
        // @since(26.4.4) field, absent on older managers.
        image: null,
      }),
    });

    await waitFor(() => {
      expect(executedOperations).toContain(IMAGE_NAME_QUERY);
    });
  });
});
