import BAIAllowedHostNamesSelect from './BAIAllowedHostNamesSelect';
import { BAIConfigProvider } from './provider';
import { BAIClient } from './provider/BAIClientProvider';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Suspense, type ReactNode, useMemo, useState } from 'react';

const sampleHostNames = [
  'host1.example.com',
  'host2.example.com',
  'host3.example.com',
  'gpu-cluster.example.com',
  'storage-node1.example.com',
];

const sampleManyHosts = Array.from(
  { length: 20 },
  (_, i) => `host${i + 1}.example.com`,
);

const createMockClient = (allowed: string[] = sampleHostNames) => {
  const mockClient = {
    vfolder: {
      list_all_hosts: async () => ({
        allowed,
      }),
    },
  } as unknown as BAIClient;

  return Promise.resolve(mockClient);
};

const mockAnonymousClientFactory = () => ({}) as unknown as BAIClient;

const StoryProvider = ({
  children,
  allowed = sampleHostNames,
}: {
  children: ReactNode;
  allowed?: string[];
}) => {
  const clientPromise = useMemo(() => createMockClient(allowed), [allowed]);
  const [storyQueryClient] = useState(
    () =>
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
      locale={{ lang: 'en' }}
      clientPromise={clientPromise}
      anonymousClientFactory={mockAnonymousClientFactory}
    >
      <QueryClientProvider client={storyQueryClient}>
        <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>
      </QueryClientProvider>
    </BAIConfigProvider>
  );
};

// =============================================================================
// Meta Configuration
// =============================================================================

/**
 * BAIAllowedHostNamesSelect is a multi-select (BAIMultiSelector) of the
 * storage hosts the current user is allowed to use, from the Backend.AI
 * vfolder API.
 *
 * Key features:
 * - Automatic data fetching via useAllowedHostNames hook
 * - Search on by default; the value is a list of host names
 * - Suspense-based loading with TanStack Query
 *
 * @see BAIAllowedHostNamesSelect.tsx for implementation details
 */
const meta: Meta<typeof BAIAllowedHostNamesSelect> = {
  title: 'Select/BAIAllowedHostNamesSelect',
  component: BAIAllowedHostNamesSelect,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
**BAIAllowedHostNamesSelect** is a [BAIMultiSelector](/?path=/docs/select-baimultiselector--docs) that fetches and lists the allowed host names from the Backend.AI vfolder API.

## Features
- Automatic data fetching using \`useAllowedHostNames\` hook
- TanStack Query integration with Suspense
- Several hosts at once: the value is \`string[]\`
- Search on by default (\`hasSearch\`)

## Usage
\`\`\`tsx
<BAIAllowedHostNamesSelect
  placeholder="Select hosts"
  onChange={(values) => setHosts(values)}
/>
\`\`\`

## Props
Every BAIMultiSelector prop except \`options\`, which the component builds from the host list. Common props include:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| placeholder | \`string\` | - | Placeholder text when no value is selected |
| value | \`string[]\` | - | The selected host names |
| onChange | \`(values: string[]) => void\` | - | Callback when selection changes |
| disabled | \`boolean\` | \`false\` | Whether the select is disabled |
| hasClear | \`boolean\` | \`false\` | Show clear button |
| hasSearch | \`boolean\` | \`true\` | The search field in the listbox |
        `,
      },
    },
  },
  argTypes: {
    placeholder: {
      control: { type: 'text' },
      description: 'Placeholder text when no value is selected',
      table: {
        type: { summary: 'string' },
      },
    },
    disabled: {
      control: { type: 'boolean' },
      description: 'Whether the select is disabled',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
    hasClear: {
      control: { type: 'boolean' },
      description: 'Show clear button',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
    hasSearch: {
      control: { type: 'boolean' },
      description: 'The search field in the listbox',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'true' },
      },
    },
    onChange: {
      action: 'changed',
      description: 'Callback with the selected host names',
    },
  },
};
export default meta;
type Story = StoryObj<typeof BAIAllowedHostNamesSelect>;

/**
 * Basic usage of the component with default props.
 */
export const Default: Story = {
  name: 'Basic',
  parameters: {
    docs: {
      description: {
        story:
          'Basic usage showing a multi-select with 5 allowed host names. The component automatically fetches and displays available hosts.',
      },
    },
  },
  args: {
    placeholder: 'Select a host',
  },
  render: (args) => (
    <StoryProvider>
      <BAIAllowedHostNamesSelect {...args} width={300} />
    </StoryProvider>
  ),
};

/**
 * Select with clear button enabled.
 */
export const WithClearButton: Story = {
  name: 'ClearButton',
  parameters: {
    docs: {
      description: {
        story:
          'Select with hasClear enabled, allowing users to clear their selection.',
      },
    },
  },
  args: {
    placeholder: 'Select a host',
    hasClear: true,
  },
  render: (args) => (
    <StoryProvider>
      <BAIAllowedHostNamesSelect {...args} width={300} />
    </StoryProvider>
  ),
};

/**
 * Disabled state of the select.
 */
export const Disabled: Story = {
  name: 'DisabledState',
  parameters: {
    docs: {
      description: {
        story:
          'Shows the component in a disabled state where users cannot interact with it.',
      },
    },
  },
  args: {
    placeholder: 'Select a host',
    disabled: true,
  },
  render: (args) => (
    <StoryProvider>
      <BAIAllowedHostNamesSelect {...args} width={300} />
    </StoryProvider>
  ),
};

/**
 * Several hosts selected at once.
 */
export const MultipleSelection: Story = {
  name: 'MultipleMode',
  parameters: {
    docs: {
      description: {
        story:
          'Users select several hosts at once; the trigger names the selected hosts.',
      },
    },
  },
  args: {
    placeholder: 'Select hosts',
    defaultValue: ['host1.example.com', 'gpu-cluster.example.com'],
    hasClear: true,
  },
  render: (args) => (
    <StoryProvider>
      <BAIAllowedHostNamesSelect {...args} width={400} />
    </StoryProvider>
  ),
};

/**
 * Empty state when no hosts are available.
 */
export const Empty: Story = {
  name: 'EmptyState',
  parameters: {
    docs: {
      description: {
        story:
          'Shows the component when no allowed host names are returned from the API.',
      },
    },
  },
  args: {
    placeholder: 'No hosts available',
  },
  render: (args) => (
    <StoryProvider allowed={[]}>
      <BAIAllowedHostNamesSelect {...args} width={300} />
    </StoryProvider>
  ),
};

/**
 * Select with many host options.
 */
export const ManyHosts: Story = {
  name: 'ManyOptions',
  parameters: {
    docs: {
      description: {
        story:
          'Demonstrates the component with a large number of host options, showing scrollable dropdown behavior.',
      },
    },
  },
  args: {
    placeholder: 'Select from 20 hosts',
    hasClear: true,
  },
  render: (args) => (
    <StoryProvider allowed={sampleManyHosts}>
      <BAIAllowedHostNamesSelect {...args} width={300} />
    </StoryProvider>
  ),
};

/**
 * Select with search functionality.
 */
export const WithSearch: Story = {
  name: 'SearchEnabled',
  parameters: {
    docs: {
      description: {
        story:
          'Search filters hosts by name. The component turns `hasSearch` on by default; pass `hasSearch={false}` to hide it.',
      },
    },
  },
  args: {
    placeholder: 'Search and select a host',
    hasSearch: true,
    hasClear: true,
  },
  render: (args) => (
    <StoryProvider>
      <BAIAllowedHostNamesSelect {...args} width={300} />
    </StoryProvider>
  ),
};
