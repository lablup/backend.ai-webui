/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import '../../../__test__/matchMedia.mock.js';
import { Form } from '../../form-engine';
import ResourceAllocationFormItems, {
  RESOURCE_ALLOCATION_INITIAL_FORM_VALUES,
} from './ResourceAllocationFormItems';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import { Suspense } from 'react';
import { RelayEnvironmentProvider } from 'react-relay';
import { createMockEnvironment, MockPayloadGenerator } from 'relay-test-utils';
import type { RelayMockEnvironment } from 'relay-test-utils/lib/RelayModernMockEnvironment';

/**
 * Contract tests for the explicit project prop contract (ADR-0001, FR-3411).
 *
 * ResourceAllocationFormItems is form-fragment tier: it takes a REQUIRED
 * non-null `project` prop and never reads the ambient current project. These
 * tests exercise external behavior only — the query variables of the
 * resource-group query and the parameters of the resource-limit preset check
 * must carry exactly the passed project, never the (deliberately different)
 * mocked ambient one.
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

// The preset check is the REST side of the contract: the hook must call it
// with the PASSED project's name as `group`.
const mockResourcePresetCheck = vi.fn().mockResolvedValue(null);

vi.mock('../../hooks', async (importOriginal) => {
  const originalModule = await importOriginal<typeof import('../../hooks')>();
  return {
    ...originalModule,
    useSuspendedBackendaiClient: () => ({
      // `custom-accelerator-quantum-size` support makes the resource-group
      // query use `store-and-network`, so the operation is observable on the
      // mock environment.
      supports: (feature: string) =>
        feature === 'custom-accelerator-quantum-size',
      _config: { allowCustomResourceAllocation: true },
      resourcePreset: { check: mockResourcePresetCheck },
    }),
  };
});

// Decoy ambient project: if the component (or the resource-limit hook's
// resource-group guard) still read ambient state, the assertions below on
// query variables / check parameters would surface `ambient-project-*`.
// `nonSftpResourceGroups` is empty on purpose — the scaling_group guard must
// be satisfied by the resource groups of the PASSED project instead.
vi.mock('../../hooks/useCurrentProject', () => ({
  useCurrentProjectValue: () => ({
    id: 'ambient-project-id',
    name: 'ambient-project-name',
  }),
  useResourceGroupsForCurrentProject: () => ({
    nonSftpResourceGroups: [],
  }),
}));

vi.mock('../../hooks/hooksUsingRelay', () => ({
  useCurrentKeyPairResourcePolicyLazyLoadQuery: () => [
    {
      keypairResourcePolicy: {
        max_containers_per_session: 4,
        max_concurrent_sessions: 10,
      },
    },
    vi.fn(),
  ],
}));

vi.mock('../../hooks/backendai', async (importOriginal) => {
  const originalModule =
    await importOriginal<typeof import('../../hooks/backendai')>();
  return {
    ...originalModule,
    useResourceSlots: () => [{ cpu: 'count', mem: 'bytes' }, vi.fn()],
    useResourceSlotsDetails: () => ({
      isLoading: false,
      resourceSlotsInRG: {
        cpu: { human_readable_name: 'CPU', display_unit: 'Core' },
        mem: { human_readable_name: 'Memory', display_unit: 'GiB' },
      },
      mergedResourceSlots: {
        cpu: { human_readable_name: 'CPU', display_unit: 'Core' },
        mem: { human_readable_name: 'Memory', display_unit: 'GiB' },
      },
      deviceMetaData: undefined,
      refresh: vi.fn(),
    }),
  };
});

// The resource-group select fetches its own per-project data internally;
// stub it to a probe that surfaces the `projectName` it was scoped to.
vi.mock('backend.ai-ui', async (importOriginal) => {
  const React = await import('react');
  const originalModule = await importOriginal<typeof import('backend.ai-ui')>();
  return {
    ...originalModule,
    BAIProjectResourceGroupSelect: (props: any) =>
      React.createElement(
        'div',
        { 'data-testid': 'mock-resource-group-select' },
        props.projectName,
      ),
  };
});

const PASSED_PROJECT = {
  id: 'passed-project-id',
  name: 'passed-project-name',
};

const renderFormItems = ({
  autoResolve = true,
}: { autoResolve?: boolean } = {}) => {
  const environment: RelayMockEnvironment = createMockEnvironment();
  if (autoResolve) {
    environment.mock.queueOperationResolver((operation) =>
      MockPayloadGenerator.generate(operation, {
        ScalingGroup: () => ({
          name: 'mock-rg',
          is_active: true,
          accelerator_quantum_size: null,
          resource_allocation_limit_for_sessions: null,
        }),
      }),
    );
  }
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  render(
    <RelayEnvironmentProvider environment={environment}>
      <QueryClientProvider client={queryClient}>
        <Suspense fallback={null}>
          <Form
            initialValues={{
              ...RESOURCE_ALLOCATION_INITIAL_FORM_VALUES,
              resourceGroup: 'mock-rg',
            }}
          >
            <ResourceAllocationFormItems project={PASSED_PROJECT} />
          </Form>
        </Suspense>
      </QueryClientProvider>
    </RelayEnvironmentProvider>,
  );
  return { environment };
};

describe('ResourceAllocationFormItems project prop contract (ADR-0001)', () => {
  afterEach(() => {
    mockResourcePresetCheck.mockClear();
  });

  it('scopes the accessible resource-group query to exactly the passed project', async () => {
    // Leave the operation pending so its request is inspectable.
    const { environment } = renderFormItems({ autoResolve: false });

    await waitFor(() => {
      expect(environment.mock.getAllOperations()).not.toHaveLength(0);
    });
    const operation = environment.mock.getMostRecentOperation();
    expect(operation.request.node.params.name).toBe(
      'ResourceAllocationFormItemsQuery',
    );
    // The query carries exactly the passed project's id — never the ambient one.
    expect(operation.request.variables.projectID).toBe('passed-project-id');
  });

  it('scopes the resource-group select and the preset check to the passed project', async () => {
    renderFormItems();

    // The resource-group select is keyed to the passed project's name.
    const select = await screen.findByTestId('mock-resource-group-select');
    expect(select).toHaveTextContent('passed-project-name');
    expect(select).not.toHaveTextContent('ambient-project-name');

    // The resource-limit preset check runs against the passed project, and
    // its scaling_group guard is satisfied by the passed project's resource
    // groups (the mocked ambient project has none).
    await waitFor(() => {
      expect(mockResourcePresetCheck).toHaveBeenCalled();
    });
    expect(mockResourcePresetCheck).toHaveBeenCalledWith(
      expect.objectContaining({
        group: 'passed-project-name',
        scaling_group: 'mock-rg',
      }),
    );
    expect(mockResourcePresetCheck).not.toHaveBeenCalledWith(
      expect.objectContaining({ group: 'ambient-project-name' }),
    );
  });
});
