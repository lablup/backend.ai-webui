import BAIAllowedHostNamesSelect from './BAIAllowedHostNamesSelect';
import { BAIConfigProvider } from './provider';
import { BAIClient } from './provider/BAIClientProvider';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import enUS from 'antd/locale/en_US';
import { Suspense, type ReactNode, useRef } from 'react';

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
  const clientPromiseRef = useRef(createMockClient(allowed));
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
 * BAIAllowedHostNamesSelect is a specialized Select component that displays
 * allowed host names from the Backend.AI vfolder API.
 *
 * Key features:
 * - Automatic data fetching via useAllowedHostNames hook
 * - Built on Ant Design Select with full feature support
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
**BAIAllowedHostNamesSelect** is a specialized Select component that fetches and displays allowed host names from the Backend.AI vfolder API.

## Features
- Automatic data fetching using \`useAllowedHostNames\` hook
- TanStack Query integration with Suspense
- Extends Ant Design Select with full feature support
- Customizable placeholder and selection behavior

## Usage
\`\`\`tsx
<BAIAllowedHostNamesSelect
  placeholder="Select a host"
  onChange={(value) => console.log(value)}
/>
\`\`\`

## Props
This component extends all Ant Design SelectProps. Common props include:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| placeholder | \`string\` | - | Placeholder text when no value is selected |
| onChange | \`(value: string) => void\` | - | Callback when selection changes |
| disabled | \`boolean\` | \`false\` | Whether the select is disabled |
| allowClear | \`boolean\` | \`false\` | Show clear button |
| mode | \`'multiple' \\| 'tags'\` | - | Set mode of Select |
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
    allowClear: {
      control: { type: 'boolean' },
      description: 'Show clear button',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
    mode: {
      control: { type: 'select' },
      options: [undefined, 'multiple', 'tags'],
      description: 'Set mode of Select',
      table: {
        type: { summary: "'multiple' | 'tags'" },
      },
    },
    onChange: {
      action: 'changed',
      description: 'Callback when selection changes',
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
          'Basic usage showing a select with 5 allowed host names. The component automatically fetches and displays available hosts.',
      },
    },
  },
  args: {
    placeholder: 'Select a host',
  },
  render: (args) => (
    <StoryProvider>
      <BAIAllowedHostNamesSelect {...args} style={{ width: 300 }} />
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
          'Select with allowClear enabled, allowing users to clear their selection.',
      },
    },
  },
  args: {
    placeholder: 'Select a host',
    allowClear: true,
  },
  render: (args) => (
    <StoryProvider>
      <BAIAllowedHostNamesSelect {...args} style={{ width: 300 }} />
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
      <BAIAllowedHostNamesSelect {...args} style={{ width: 300 }} />
    </StoryProvider>
  ),
};

/**
 * Multiple selection mode.
 */
export const MultipleSelection: Story = {
  name: 'MultipleMode',
  parameters: {
    docs: {
      description: {
        story:
          'Allows users to select multiple hosts at once. Selected hosts appear as tags.',
      },
    },
  },
  args: {
    placeholder: 'Select hosts',
    mode: 'multiple' as const,
    allowClear: true,
  },
  render: (args) => (
    <StoryProvider>
      <BAIAllowedHostNamesSelect {...args} style={{ width: 400 }} />
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
      <BAIAllowedHostNamesSelect {...args} style={{ width: 300 }} />
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
    showSearch: true,
    allowClear: true,
  },
  render: (args) => (
    <StoryProvider allowed={sampleManyHosts}>
      <BAIAllowedHostNamesSelect
        {...args}
        style={{ width: 300 }}
        getPopupContainer={(triggerNode) =>
          triggerNode.parentElement || document.body
        }
      />
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
          'Enables search functionality to filter hosts by name. Useful when there are many options.',
      },
    },
  },
  args: {
    placeholder: 'Search and select a host',
    showSearch: true,
    allowClear: true,
  },
  render: (args) => (
    <StoryProvider>
      <BAIAllowedHostNamesSelect {...args} style={{ width: 300 }} />
    </StoryProvider>
  ),
};
