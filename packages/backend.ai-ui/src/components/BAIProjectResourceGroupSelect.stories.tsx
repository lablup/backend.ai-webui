import BAIProjectResourceGroupSelect from './BAIProjectResourceGroupSelect';
import { BAIConfigProvider } from './provider';
import { BAIClient } from './provider/BAIClientProvider';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import enUS from 'antd/locale/en_US';
import { Suspense, type ReactNode, useRef } from 'react';

// =============================================================================
// Mock Data
// =============================================================================

const sampleScalingGroups = [
  { name: 'default' },
  { name: 'gpu-cluster' },
  { name: 'cpu-only' },
  { name: 'high-memory' },
];

const sampleManyGroups = Array.from({ length: 15 }, (_, i) => ({
  name: `resource-group-${i + 1}`,
}));

const sampleVolumeInfo = {
  allowed: ['host1', 'host2'],
  default: 'host1',
  volume_info: {
    vol1: {
      backend: 'xfs',
      capabilities: ['quota', 'fast-lookup'],
      usage: { percentage: 45.2 },
      sftp_scaling_groups: ['sftp-only'],
    },
  },
};

/**
 * Creates a mock BAIClient that intercepts newSignedRequest + _wrapWithPromise
 * to return mock API responses based on the URL.
 */
const createMockClient = (
  scalingGroups = sampleScalingGroups,
  volumeInfo = sampleVolumeInfo,
) => {
  const mockClient = {
    newSignedRequest: (_method: string, url: string, _body: any) => ({
      url,
    }),
    _wrapWithPromise: (request: { url: string }) => {
      if (request.url.includes('/scaling-groups')) {
        return Promise.resolve({ scaling_groups: scalingGroups });
      }
      if (request.url.includes('/folders/_/hosts')) {
        return Promise.resolve(volumeInfo);
      }
      return Promise.resolve({});
    },
  } as Partial<BAIClient> as BAIClient;

  return Promise.resolve(mockClient);
};

const mockAnonymousClientFactory = () => ({}) as unknown as BAIClient;

/**
 * Wraps stories with BAIConfigProvider including mock BAIClient.
 */
const StoryProvider = ({
  children,
  scalingGroups = sampleScalingGroups,
  volumeInfo = sampleVolumeInfo,
}: {
  children: ReactNode;
  scalingGroups?: Array<{ name: string }>;
  volumeInfo?: typeof sampleVolumeInfo;
}) => {
  const clientPromiseRef = useRef(createMockClient(scalingGroups, volumeInfo));
  const storyQueryClientRef = useRef(
    new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
          gcTime: 0,
          staleTime: 0,
        },
      },
    }),
  );

  return (
    <BAIConfigProvider
      locale={{ lang: 'en', antdLocale: enUS }}
      clientPromise={clientPromiseRef.current}
      anonymousClientFactory={mockAnonymousClientFactory}
    >
      <QueryClientProvider client={storyQueryClientRef.current}>
        <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>
      </QueryClientProvider>
    </BAIConfigProvider>
  );
};

// =============================================================================
// Meta Configuration
// =============================================================================

/**
 * BAIProjectResourceGroupSelect is a specialized Select component that fetches
 * and displays resource groups (scaling groups) for a specific project.
 *
 * Key features:
 * - Automatic data fetching based on project name
 * - Auto-selection of 'default' resource group
 * - SFTP resource group filtering
 * - Custom filter function support
 *
 * @see BAIProjectResourceGroupSelect.tsx for implementation details
 */
const meta: Meta<typeof BAIProjectResourceGroupSelect> = {
  title: 'Select/BAIProjectResourceGroupSelect',
  component: BAIProjectResourceGroupSelect,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
**BAIProjectResourceGroupSelect** extends [BAISelect](/?path=/docs/components-input-baiselect--docs) to fetch and display resource groups for a project.

## BAI-Specific Props

| Name | Type | Default | Description |
|------|------|---------|-------------|
| \`projectName\` | \`string\` | **required** | Project name to fetch resource groups for |
| \`autoSelectDefault\` | \`boolean\` | \`false\` | Auto-select 'default' or first resource group |
| \`filter\` | \`(name: string) => boolean\` | - | Custom filter function for resource groups |

## Features
- Fetches scaling groups from \`/scaling-groups?group={projectName}\`
- Fetches volume info from \`/folders/_/hosts\`
- Automatically filters out SFTP-only resource groups
- Auto-selection with \`autoSelectDefault\` prop
- Built-in search with text highlighting
- TanStack Query integration with 5-minute cache

## Usage
\`\`\`tsx
<BAIProjectResourceGroupSelect
  projectName="my-project"
  autoSelectDefault
  placeholder="Select resource group"
  onChange={(value) => console.log(value)}
/>
\`\`\`

For all other props, refer to [BAISelect](/?path=/docs/components-input-baiselect--docs).
        `,
      },
    },
  },
  argTypes: {
    projectName: {
      control: { type: 'text' },
      description: 'Project name to fetch resource groups for',
      table: {
        type: { summary: 'string' },
      },
    },
    autoSelectDefault: {
      control: { type: 'boolean' },
      description:
        "Auto-select 'default' resource group or first available option",
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
    filter: {
      control: false,
      description: 'Custom filter function to filter resource groups by name',
      table: {
        type: { summary: '(name: string) => boolean' },
      },
    },
    placeholder: {
      control: { type: 'text' },
      description: 'Placeholder text',
      table: {
        type: { summary: 'string' },
      },
    },
    showSearch: {
      control: { type: 'boolean' },
      description: 'Enable search functionality',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
    onChange: {
      action: 'changed',
      description: 'Callback when selection changes',
    },
  },
};
export default meta;
type Story = StoryObj<typeof BAIProjectResourceGroupSelect>;

/**
 * Basic usage showing 4 resource groups with auto-selection disabled.
 */
export const Default: Story = {
  name: 'Basic',
  parameters: {
    docs: {
      description: {
        story:
          'Basic usage with 4 sample resource groups (default, gpu-cluster, cpu-only, high-memory). SFTP resource groups are automatically filtered out.',
      },
    },
  },
  args: {
    projectName: 'test-project',
    placeholder: 'Select resource group',
  },
  render: (args) => (
    <StoryProvider>
      <BAIProjectResourceGroupSelect {...args} style={{ width: 300 }} />
    </StoryProvider>
  ),
};

/**
 * Auto-selects 'default' resource group on mount.
 */
export const AutoSelectDefault: Story = {
  name: 'AutoSelect',
  parameters: {
    docs: {
      description: {
        story:
          "Automatically selects 'default' resource group when component mounts. If 'default' doesn't exist, selects the first available option.",
      },
    },
  },
  args: {
    projectName: 'test-project',
    autoSelectDefault: true,
    placeholder: 'Select resource group',
  },
  render: (args) => (
    <StoryProvider>
      <BAIProjectResourceGroupSelect {...args} style={{ width: 300 }} />
    </StoryProvider>
  ),
};

/**
 * Shows search functionality with text highlighting.
 */
export const WithSearch: Story = {
  name: 'SearchEnabled',
  parameters: {
    docs: {
      description: {
        story:
          'Enables search functionality to filter resource groups by name. Matching text is highlighted in options.',
      },
    },
  },
  args: {
    projectName: 'test-project',
    placeholder: 'Search resource groups',
    showSearch: true,
  },
  render: (args) => (
    <StoryProvider>
      <BAIProjectResourceGroupSelect {...args} style={{ width: 300 }} />
    </StoryProvider>
  ),
};

/**
 * Empty state when no resource groups are available.
 */
export const Empty: Story = {
  name: 'EmptyState',
  parameters: {
    docs: {
      description: {
        story:
          'Shows the component when no resource groups are returned from the API.',
      },
    },
  },
  args: {
    projectName: 'test-project',
    placeholder: 'No resource groups available',
  },
  render: (args) => (
    <StoryProvider scalingGroups={[]}>
      <BAIProjectResourceGroupSelect {...args} style={{ width: 300 }} />
    </StoryProvider>
  ),
};

/**
 * Auto-select when 'default' doesn't exist - selects first option.
 */
export const AutoSelectWithoutDefault: Story = {
  name: 'AutoSelectFirstOption',
  parameters: {
    docs: {
      description: {
        story:
          "When autoSelectDefault is enabled but 'default' resource group doesn't exist, automatically selects the first available option.",
      },
    },
  },
  args: {
    projectName: 'test-project',
    autoSelectDefault: true,
    placeholder: 'Select resource group',
  },
  render: (args) => (
    <StoryProvider
      scalingGroups={[{ name: 'gpu-cluster' }, { name: 'cpu-only' }]}
    >
      <BAIProjectResourceGroupSelect {...args} style={{ width: 300 }} />
    </StoryProvider>
  ),
};

/**
 * Using custom filter function to show only GPU resource groups.
 */
export const WithCustomFilter: Story = {
  name: 'CustomFilter',
  parameters: {
    docs: {
      description: {
        story:
          'Uses custom filter function to show only resource groups containing "gpu" in their name.',
      },
    },
  },
  args: {
    projectName: 'test-project',
    placeholder: 'Select GPU resource group',
    filter: (name: string) => name.includes('gpu'),
  },
  render: (args) => (
    <StoryProvider>
      <BAIProjectResourceGroupSelect {...args} style={{ width: 300 }} />
    </StoryProvider>
  ),
};

/**
 * Many resource groups with scrollable dropdown.
 */
export const ManyOptions: Story = {
  name: 'ManyResourceGroups',
  parameters: {
    docs: {
      description: {
        story:
          'Demonstrates the component with 15 resource groups, showing scrollable dropdown behavior.',
      },
    },
  },
  args: {
    projectName: 'test-project',
    placeholder: 'Select from 15 resource groups',
    showSearch: true,
  },
  render: (args) => (
    <StoryProvider scalingGroups={sampleManyGroups}>
      <BAIProjectResourceGroupSelect {...args} style={{ width: 300 }} />
    </StoryProvider>
  ),
};
