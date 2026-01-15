import '../../__test__/matchMedia.mock.js';
import * as useResourceLimitAndRemainingModule from '../hooks/useResourceLimitAndRemaining';
import MyResourceWithinResourceGroup from './MyResourceWithinResourceGroup';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import React from 'react';

// Mock all the required hooks and dependencies
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

jest.mock('antd', () => ({
  Segmented: ({ children }: any) => (
    <div data-testid="segmented">{children}</div>
  ),
  Skeleton: () => <div data-testid="skeleton">Loading...</div>,
  Typography: {
    Text: ({ children }: any) => <span>{children}</span>,
  },
  theme: {
    useToken: () => ({ token: {} }),
  },
}));

jest.mock('ahooks', () => ({
  useControllableValue: () => ['free', jest.fn()],
}));

jest.mock('../hooks', () => {
  const isoDate = new Date().toISOString();
  return {
    useFetchKey: () => [isoDate, jest.fn(), isoDate],
  };
});

jest.mock('../hooks/useCurrentProject', () => ({
  useCurrentProjectValue: () => ({ name: 'test-project' }),
  useCurrentResourceGroupValue: () => 'default',
}));

// Helper function to create base mock data structure
const createBaseMockData = () => ({
  keypair_limits: {},
  keypair_using: {},
  keypair_remaining: {},
  scaling_group_remaining: {},
});

const mockDataScenarios = {
  normal: {
    ...createBaseMockData(),
    scaling_groups: {
      default: {
        using: { cpu: '4.0', mem: '8.0 GiB', 'cuda.device': '2' },
        remaining: { cpu: '12.0', mem: '24.0 GiB', 'cuda.device': '6' },
      },
    },
  },
  zero: {
    ...createBaseMockData(),
    scaling_groups: {
      default: {
        using: { cpu: '0.0', mem: '0.0 GiB', 'cuda.device': '0' },
        remaining: { cpu: '16.0', mem: '32.0 GiB', 'cuda.device': '8' },
      },
    },
  },
  high: {
    ...createBaseMockData(),
    scaling_groups: {
      default: {
        using: { cpu: '14.0', mem: '28.0 GiB', 'cuda.device': '7' },
        remaining: { cpu: '2.0', mem: '4.0 GiB', 'cuda.device': '1' },
      },
    },
  },
  infinity: {
    ...createBaseMockData(),
    scaling_groups: {
      default: {
        using: { cpu: '2.0', mem: '4.0 GiB', 'cuda.device': '1' },
        remaining: {
          cpu: 'Infinity',
          mem: 'Infinity',
          'cuda.device': 'Infinity',
        },
      },
    },
  },
  noGpu: {
    ...createBaseMockData(),
    scaling_groups: {
      default: {
        using: { cpu: '8.0', mem: '16.0 GiB' },
        remaining: { cpu: '8.0', mem: '16.0 GiB' },
      },
    },
  },
  undefined: {
    ...createBaseMockData(),
    scaling_groups: {
      default: {
        using: { cpu: undefined, mem: '4.0 GiB' },
        remaining: { cpu: '8.0', mem: undefined },
      },
    },
  },
  zeroGpu: {
    ...createBaseMockData(),
    scaling_groups: {
      default: {
        using: { cpu: '4.0', mem: '8.0 GiB', 'cuda.device': '0' },
        remaining: { cpu: '8.0', mem: '16.0 GiB', 'cuda.device': '0' },
      },
    },
  },
};

jest.mock('../hooks/useResourceLimitAndRemaining', () => ({
  useResourceLimitAndRemaining: jest.fn(() => [
    {
      resourceGroupResourceSize: { cpu: 0, mem: '0 GiB', accelerators: {} },
      resourceLimits: { accelerators: {} },
      resourceLimitsWithoutResourceGroup: { accelerators: {} },
      remaining: { accelerators: {} },
      remainingWithoutResourceGroup: { accelerators: {} },
      currentImageMinM: '0g',
      isRefetching: false,
      checkPresetInfo: mockDataScenarios.normal as any,
    },
    {
      refetch: jest.fn(),
    },
  ]),
}));

jest.mock('backend.ai-ui', () => ({
  useResourceSlotsDetails: () => ({
    isLoading: false,
    resourceSlotsInRG: {
      cpu: { human_readable_name: 'CPU', display_unit: 'Core' },
      mem: { human_readable_name: 'Memory', display_unit: 'GiB' },
      'cuda.device': { human_readable_name: 'CUDA GPU', display_unit: 'GPU' },
    },
  }),
  convertToNumber: (value: any) => parseFloat(value) || 0,
  processMemoryValue: (value: any) => {
    if (!value || value === 'Infinity' || value === Infinity) return value;
    return (
      parseFloat(value.replace ? value.replace(/[^0-9.]/g, '') : value) || 0
    );
  },
  BAIFlex: ({ children }: any) => <div data-testid="bai-flex">{children}</div>,
  BAIBoardItemTitle: ({ title, extra }: any) => (
    <div data-testid="board-title">
      <div>{title}</div>
      <div data-testid="board-extra">{extra}</div>
    </div>
  ),
  ResourceStatistics: ({ resourceData }: any) => (
    <div data-testid="resource-statistics">
      {resourceData.cpu && (
        <div data-testid="cpu-data">
          CPU: {resourceData.cpu.used.current}/{resourceData.cpu.free.current}
        </div>
      )}
      {resourceData.memory && (
        <div data-testid="memory-data">
          Memory: {resourceData.memory.used.current}/
          {resourceData.memory.free.current}
        </div>
      )}
      {resourceData.accelerators?.map((acc: any, idx: number) => (
        <div key={idx} data-testid="gpu-data">
          GPU: {acc.used.current}/{acc.free.current}
        </div>
      ))}
    </div>
  ),
  BAIFetchKeyButton: () => <button data-testid="refresh-btn">Refresh</button>,
}));

jest.mock('./SharedResourceGroupSelectForCurrentProject', () => {
  const MockedComponent = () => (
    <div data-testid="resource-group-select">Select</div>
  );
  MockedComponent.displayName = 'SharedResourceGroupSelectForCurrentProject';
  return MockedComponent;
});

// Helper function to create mock return value
const createMockReturnValue = (checkPresetInfo: any) =>
  [
    {
      resourceGroupResourceSize: { cpu: 0, mem: '0 GiB', accelerators: {} },
      resourceLimits: { accelerators: {} },
      resourceLimitsWithoutResourceGroup: { accelerators: {} },
      remaining: { accelerators: {} },
      remainingWithoutResourceGroup: { accelerators: {} },
      currentImageMinM: '0g',
      isRefetching: false,
      checkPresetInfo,
    },
    {
      refetch: jest.fn(),
    },
  ] as const;

// Test wrapper component
const TestWrapper = ({
  children,
  queryClient,
}: {
  children: React.ReactNode;
  queryClient?: QueryClient;
}) => {
  const client =
    queryClient ||
    new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
};
TestWrapper.displayName = 'TestWrapper';

describe('MyResourceWithinResourceGroup', () => {
  let queryClient: QueryClient;

  const mockHook = jest.spyOn(
    useResourceLimitAndRemainingModule,
    'useResourceLimitAndRemaining',
  );

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
    mockHook.mockReset();
  });

  it('should render basic components', () => {
    render(
      <TestWrapper queryClient={queryClient}>
        <MyResourceWithinResourceGroup />
      </TestWrapper>,
    );

    expect(screen.getByTestId('board-title')).toBeInTheDocument();
    expect(screen.getByTestId('resource-group-select')).toBeInTheDocument();
    expect(screen.getByTestId('refresh-btn')).toBeInTheDocument();
  });

  describe('Resource Usage Scenarios', () => {
    it('should display normal resource usage correctly', () => {
      mockHook.mockReturnValue(
        createMockReturnValue(mockDataScenarios.normal as any),
      );

      render(
        <TestWrapper queryClient={queryClient}>
          <MyResourceWithinResourceGroup />
        </TestWrapper>,
      );

      expect(screen.getByTestId('resource-statistics')).toBeInTheDocument();
      expect(screen.getByTestId('cpu-data')).toHaveTextContent('CPU: 4/12');
      expect(screen.getByTestId('memory-data')).toHaveTextContent(
        'Memory: 8/24',
      );
      expect(screen.getByTestId('gpu-data')).toHaveTextContent('GPU: 2/6');
    });

    it('should display zero usage correctly', () => {
      mockHook.mockReturnValue(
        createMockReturnValue(mockDataScenarios.zero as any),
      );

      render(
        <TestWrapper queryClient={queryClient}>
          <MyResourceWithinResourceGroup />
        </TestWrapper>,
      );

      expect(screen.getByTestId('cpu-data')).toHaveTextContent('CPU: 0/16');
      expect(screen.getByTestId('memory-data')).toHaveTextContent(
        'Memory: 0/32',
      );
      expect(screen.getByTestId('gpu-data')).toHaveTextContent('GPU: 0/8');
    });

    it('should display high usage correctly', () => {
      mockHook.mockReturnValue(
        createMockReturnValue(mockDataScenarios.high as any),
      );

      render(
        <TestWrapper queryClient={queryClient}>
          <MyResourceWithinResourceGroup />
        </TestWrapper>,
      );

      expect(screen.getByTestId('cpu-data')).toHaveTextContent('CPU: 14/2');
      expect(screen.getByTestId('memory-data')).toHaveTextContent(
        'Memory: 28/4',
      );
      expect(screen.getByTestId('gpu-data')).toHaveTextContent('GPU: 7/1');
    });

    it('should handle Infinity values correctly', () => {
      mockHook.mockReturnValue(
        createMockReturnValue(mockDataScenarios.infinity as any),
      );

      render(
        <TestWrapper queryClient={queryClient}>
          <MyResourceWithinResourceGroup />
        </TestWrapper>,
      );

      expect(screen.getByTestId('cpu-data')).toHaveTextContent('CPU: 2');
      expect(screen.getByTestId('memory-data')).toHaveTextContent('Memory: 4');
      expect(screen.getByTestId('gpu-data')).toHaveTextContent('GPU: 1');
    });

    it('should handle no GPU scenario correctly', () => {
      mockHook.mockReturnValue(
        createMockReturnValue(mockDataScenarios.noGpu as any),
      );

      render(
        <TestWrapper queryClient={queryClient}>
          <MyResourceWithinResourceGroup />
        </TestWrapper>,
      );

      expect(screen.getByTestId('cpu-data')).toHaveTextContent('CPU: 8/8');
      expect(screen.getByTestId('memory-data')).toHaveTextContent(
        'Memory: 16/16',
      );
      expect(screen.queryByTestId('gpu-data')).not.toBeInTheDocument();
    });

    it('should handle undefined values gracefully', () => {
      mockHook.mockReturnValue(
        createMockReturnValue(mockDataScenarios.undefined as any),
      );

      render(
        <TestWrapper queryClient={queryClient}>
          <MyResourceWithinResourceGroup />
        </TestWrapper>,
      );

      expect(screen.getByTestId('resource-statistics')).toBeInTheDocument();
      // Memory data shows partial content due to undefined 'remaining' value
      expect(screen.getByTestId('memory-data')).toHaveTextContent('Memory: 4/');
      // CPU data shows partial content due to undefined 'using' value
      expect(screen.queryByTestId('cpu-data')).not.toBeInTheDocument();
      expect(screen.queryByTestId('gpu-data')).not.toBeInTheDocument();
    });

    it('should handle zero GPU usage and remaining correctly', () => {
      mockHook.mockReturnValue(
        createMockReturnValue(mockDataScenarios.zeroGpu as any),
      );

      render(
        <TestWrapper queryClient={queryClient}>
          <MyResourceWithinResourceGroup />
        </TestWrapper>,
      );

      expect(screen.getByTestId('cpu-data')).toHaveTextContent('CPU: 4/8');
      expect(screen.getByTestId('memory-data')).toHaveTextContent(
        'Memory: 8/16',
      );
      expect(screen.getByTestId('gpu-data')).toHaveTextContent('GPU: 0/0');
    });
  });
});
