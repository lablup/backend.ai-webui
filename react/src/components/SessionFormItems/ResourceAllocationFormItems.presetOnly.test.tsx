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
import { act, render, screen, waitFor } from '@testing-library/react';
import { Suspense } from 'react';
import { RelayEnvironmentProvider } from 'react-relay';
import { createMockEnvironment, MockPayloadGenerator } from 'relay-test-utils';

// Where the "image does not support this accelerator type" error lands. In
// preset-only mode the accelerator-type item is hidden, so for values that
// are not a preset's the error must surface on the visible Resource Presets
// item instead (#10710); the other states must raise no type error at all.

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

const makeImage = (supported_accelerators: string[]): Image => ({
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
  supported_accelerators,
});
// Runs on ROCm or TPU, never on CUDA: two supported types, so no auto switch.
const rocmOrTpuImage = makeImage(['rocm', 'tpu']);
// Runs on no accelerator type the group has: R3 zeroes the accelerator.
const cpuOnlyImage = makeImage([]);

const PRESET_ID = 'preset-cuda';

const renderRestored = ({
  label,
  image,
  enableResourcePresets = true,
}: {
  label: string | null;
  image: Image;
  enableResourcePresets?: boolean;
}) => {
  const environment = createMockEnvironment();
  environment.mock.queueOperationResolver((operation) =>
    MockPayloadGenerator.generate(operation, {
      ScalingGroup: () => ({
        name: 'mock-rg',
        is_active: true,
        accelerator_quantum_size: null,
        resource_allocation_limit_for_sessions: null,
      }),
      ResourcePreset: () => ({
        id: PRESET_ID,
        name: 'cuda-preset',
        scaling_group_name: null,
        resource_slots: '{"cpu":"1","mem":"1g","cuda.device":"1"}',
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
              allocationPreset: label,
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
              enableResourcePresets={enableResourcePresets}
              keepRestoredAllocation
            />
          </Form>
        </Suspense>
      </QueryClientProvider>
    </RelayEnvironmentProvider>,
  );
};

const ERROR_KEY = 'session.launcher.AcceleratorTypeNotSupportedByImage';

// The validators run from the data effect after mount; give every trigger
// (and the MessageChannel-batched watcher) time to land before counting.
const settle = () =>
  act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 300));
  });

const itemOf = (element: HTMLElement) =>
  element.closest('[data-uic-field-item]')?.getAttribute('data-uic-field-item');

const expectOneErrorOn = async (item: string) => {
  await screen.findByText(ERROR_KEY);
  await settle();
  await waitFor(() => {
    const errors = screen.getAllByText(ERROR_KEY);
    expect(errors).toHaveLength(1);
    expect(itemOf(errors[0])).toBe(item);
  });
};

const expectNoTypeError = async () => {
  await screen.findByTestId('mock-resource-group-select');
  await settle();
  expect(screen.queryAllByText(ERROR_KEY)).toHaveLength(0);
};

describe('where an accelerator type the image does not support is reported', () => {
  describe('preset-only mode', () => {
    beforeEach(() => {
      allowCustomResourceAllocation = false;
    });

    it('a restored custom allocation: once, on the visible Resource Presets item', async () => {
      renderRestored({ label: 'custom', image: rocmOrTpuImage });
      await expectOneErrorOn('allocationPreset');
    });

    it("a preset's own values: no type error (the preset validator owns them)", async () => {
      renderRestored({ label: PRESET_ID, image: rocmOrTpuImage });
      await expectNoTypeError();
    });

    it('an empty label: no type error (`required` covers the empty pick)', async () => {
      renderRestored({ label: null, image: rocmOrTpuImage });
      await expectNoTypeError();
    });

    it('an image that runs on no group type: no type error (the accelerator is zeroed instead)', async () => {
      renderRestored({ label: 'custom', image: cpuOnlyImage });
      await expectNoTypeError();
    });

    it('without a preset item: on the (hidden) accelerator item that holds the type select, as before', async () => {
      renderRestored({
        label: 'custom',
        image: rocmOrTpuImage,
        enableResourcePresets: false,
      });
      await expectOneErrorOn('resource_accelerator');
    });
  });

  it('free mode: once, on the accelerator item that holds the type select', async () => {
    allowCustomResourceAllocation = true;
    renderRestored({ label: 'custom', image: rocmOrTpuImage });
    await expectOneErrorOn('resource_accelerator');
  });
});
