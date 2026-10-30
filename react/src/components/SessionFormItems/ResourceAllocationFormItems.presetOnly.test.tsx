/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import '../../../__test__/matchMedia.mock.js';
import { Form } from '../../form-engine';
import type { Image } from '../ImageEnvironmentSelectFormItems';
import ResourceAllocationFormItems, {
  RESOURCE_ALLOCATION_INITIAL_FORM_VALUES,
} from './ResourceAllocationFormItems';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import { Suspense } from 'react';
import { RelayEnvironmentProvider } from 'react-relay';
import { createMockEnvironment, MockPayloadGenerator } from 'relay-test-utils';

// In preset-only mode the accelerator-type item is hidden, so the D3 error
// (the image supports several accelerator types, none of them the current
// one) must surface on the visible Resource Presets item instead (#10710).

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
    initReactI18next: { type: '3rdParty', init: () => {} },
  };
});

let allowCustomResourceAllocation = false;
vi.mock('../../hooks', async (importOriginal) => {
  const originalModule = await importOriginal<typeof import('../../hooks')>();
  return {
    ...originalModule,
    useSuspendedBackendaiClient: () => ({
      _config: { allowCustomResourceAllocation },
      resourcePreset: { check: vi.fn().mockResolvedValue(null) },
    }),
  };
});

vi.mock('../../hooks/useCurrentProject', () => ({
  useCurrentProjectValue: () => ({ id: 'project-id', name: 'project-name' }),
  useResourceGroupsForCurrentProject: () => ({ nonSftpResourceGroups: [] }),
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

const SLOTS = {
  cpu: { human_readable_name: 'CPU', display_unit: 'Core' },
  mem: { human_readable_name: 'Memory', display_unit: 'GiB' },
  'cuda.device': { human_readable_name: 'CUDA GPU', display_unit: 'GPU' },
  'rocm.device': { human_readable_name: 'ROCm GPU', display_unit: 'GPU' },
  'tpu.device': { human_readable_name: 'TPU', display_unit: 'TPU' },
};
vi.mock('../../hooks/backendai', async (importOriginal) => {
  const originalModule =
    await importOriginal<typeof import('../../hooks/backendai')>();
  return {
    ...originalModule,
    useResourceSlots: () => [
      {
        cpu: 'count',
        mem: 'bytes',
        'cuda.device': 'count',
        'rocm.device': 'count',
        'tpu.device': 'count',
      },
      vi.fn(),
    ],
    useResourceSlotsDetails: () => ({
      isLoading: false,
      resourceSlotsInRG: SLOTS,
      mergedResourceSlots: SLOTS,
      deviceMetaData: undefined,
      refresh: vi.fn(),
    }),
  };
});

// The preset select's own Relay query is not under test; the Form.Item that
// wraps it (and renders the validator's error) is.
vi.mock('../ResourcePresetSelect', async (importOriginal) => {
  const React = await import('react');
  const originalModule =
    await importOriginal<typeof import('../ResourcePresetSelect')>();
  return {
    ...originalModule,
    default: (props: any) =>
      React.createElement(
        'div',
        { 'data-testid': 'mock-preset-select' },
        String(props.value),
      ),
  };
});

vi.mock('backend.ai-ui', async (importOriginal) => {
  const React = await import('react');
  const originalModule = await importOriginal<typeof import('backend.ai-ui')>();
  return {
    ...originalModule,
    BAIProjectResourceGroupSelect: () =>
      React.createElement('div', {
        'data-testid': 'mock-resource-group-select',
      }),
    useProjectResourceGroups: () => ({ resourceGroups: [{ name: 'mock-rg' }] }),
  };
});

// Runs on ROCm or TPU, never on CUDA: two supported types, so no auto switch.
const image: Image = {
  id: 'image-1',
  namespace: 'image',
  digest: 'digest',
  architecture: 'x86_64',
  humanized_name: 'Image',
  installed: true,
  labels: [],
  registry: 'registry',
  tag: 'tag',
  resource_limits: [
    { key: 'cpu', min: '1', max: null },
    { key: 'mem', min: '1g', max: null },
  ],
  base_image_name: undefined,
  tags: undefined,
  version: undefined,
  supported_accelerators: ['rocm', 'tpu'],
};

const renderRestoredCustom = () => {
  const environment = createMockEnvironment();
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
              allocationPreset: 'custom',
              environments: { image },
              resource: {
                cpu: 1,
                mem: '1g',
                shmem: '0g',
                accelerator: 1,
                acceleratorType: 'cuda.device',
              },
            }}
          >
            <ResourceAllocationFormItems
              project={{ id: 'project-id', name: 'project-name' }}
              enableResourcePresets
              keepRestoredAllocation
            />
          </Form>
        </Suspense>
      </QueryClientProvider>
    </RelayEnvironmentProvider>,
  );
};

const ERROR_KEY = 'session.launcher.AcceleratorTypeNotSupportedByImage';

describe('ResourceAllocationFormItems: unsupported accelerator type of a restored custom allocation', () => {
  it('preset-only: the error shows once, on the visible Resource Presets item', async () => {
    allowCustomResourceAllocation = false;
    renderRestoredCustom();
    const errors = await screen.findAllByText(ERROR_KEY);
    expect(errors).toHaveLength(1);
    // Resource Presets is the visible item; the type item sits in a hidden card.
    const presetItem = screen
      .getByText('resourcePreset.ResourcePresets')
      .closest('[data-uic-field-item="allocationPreset"]');
    expect(presetItem).not.toBeNull();
    expect(presetItem).toContainElement(errors[0]);
  });

  it('free mode: the error shows on the accelerator-type item, not on Resource Presets', async () => {
    allowCustomResourceAllocation = true;
    renderRestoredCustom();
    const errors = await screen.findAllByText(ERROR_KEY);
    expect(errors).toHaveLength(1);
    const presetItem = screen
      .getByText('resourcePreset.ResourcePresets')
      .closest('[data-uic-field-item="allocationPreset"]');
    await waitFor(() => {
      expect(presetItem).not.toContainElement(errors[0]);
    });
  });
});
