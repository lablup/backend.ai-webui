import RelayResolver from '../../tests/RelayResolver';
import BAIStorageProxySelect from './BAIStorageProxySelect';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';

// =============================================================================
// Mock Data
// =============================================================================

// The component derives the proxy list from `storage_volume_list.items[].proxy`,
// so mock data is shaped as volumes (a proxy can back multiple volumes).
const sampleVolumes = [
  { proxy: 'local' },
  { proxy: 'ceph-proxy' },
  { proxy: 'pure-proxy' },
];

// Multiple volumes share the same proxy — the component dedupes to distinct
// proxy names (3 unique proxies from 6 volumes here).
const sampleVolumesWithDuplicateProxies = [
  { proxy: 'local' },
  { proxy: 'local' },
  { proxy: 'ceph-proxy' },
  { proxy: 'ceph-proxy' },
  { proxy: 'pure-proxy' },
  { proxy: 'local' },
];

const sampleManyVolumes = Array.from({ length: 15 }, (_, i) => ({
  proxy: `proxy-${i + 1}`,
}));

/**
 * BAIStorageProxySelect is a specialized Select component that fetches storage
 * volumes and derives the distinct storage-proxy names from them using GraphQL.
 *
 * Key features:
 * - Automatic data fetching via GraphQL query
 * - Distinct proxy names are derived from the volume list and deduplicated
 * - Built-in search functionality
 * - Internationalized placeholder text
 *
 * @see BAIStorageProxySelect.tsx for implementation details
 */
const meta: Meta<typeof BAIStorageProxySelect> = {
  title: 'Fragments/BAIStorageProxySelect',
  component: BAIStorageProxySelect,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
**BAIStorageProxySelect** extends [BAISelect](/?path=/docs/components-input-baiselect--docs) to fetch storage volumes and present the distinct storage-proxy names.

## Features
- Fetches volumes from GraphQL query \`BAIStorageProxySelectQuery\` and derives distinct proxy names
- Automatically removes duplicate proxy names using \`_.uniq\` + \`_.compact\`
- Built-in search functionality enabled by default
- Internationalized placeholder using \`comp:BAIStorageProxySelect.SelectStorageProxy\`
- Uses the proxy name as both label and value

## GraphQL Query
\`\`\`graphql
query BAIStorageProxySelectQuery($limit: Int!) {
  storage_volume_list(limit: $limit, offset: 0) {
    items {
      proxy
    }
  }
}
\`\`\`

There is no dedicated storage-proxy list field yet, so proxies are derived from the volume list (see the \`TODO(needs-backend)\` in the source).

## Usage
\`\`\`tsx
<BAIStorageProxySelect
  autoSelectOption
  onChange={(value) => console.log(value)}
/>
\`\`\`

For all other props, refer to [BAISelect](/?path=/docs/components-input-baiselect--docs).
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
        defaultValue: {
          summary: 'i18n: comp:BAIStorageProxySelect.SelectStorageProxy',
        },
      },
    },
    autoSelectOption: {
      control: { type: 'boolean' },
      description:
        'Auto-select the first option once options load and no value is set',
      table: {
        type: { summary: 'boolean | ((options) => value)' },
        defaultValue: { summary: 'undefined' },
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
    onChange: {
      action: 'changed',
      description: 'Callback when selection changes',
    },
  },
};

export default meta;
type Story = StoryObj<typeof BAIStorageProxySelect>;

/**
 * Basic usage with 3 sample storage proxies.
 */
export const Default: Story = {
  name: 'Basic',
  parameters: {
    docs: {
      description: {
        story:
          'Basic usage showing 3 storage proxies. Search functionality is enabled by default, and the placeholder is internationalized.',
      },
    },
  },
  args: {},
  render: (args) => (
    <RelayResolver
      mockResolvers={{
        Query: () => ({
          storage_volume_list: { items: sampleVolumes },
        }),
      }}
    >
      <BAIStorageProxySelect {...args} style={{ width: '300px' }} />
    </RelayResolver>
  ),
};

/**
 * Empty state when no storage volumes (and thus no proxies) are available.
 */
export const Empty: Story = {
  name: 'EmptyState',
  parameters: {
    docs: {
      description: {
        story: 'Shows the component when no storage proxies are configured.',
      },
    },
  },
  args: {},
  render: (args) => (
    <RelayResolver
      mockResolvers={{
        Query: () => ({
          storage_volume_list: { items: [] },
        }),
      }}
    >
      <BAIStorageProxySelect {...args} style={{ width: '300px' }} />
    </RelayResolver>
  ),
};

/**
 * Automatic deduplication of proxy names derived from multiple volumes.
 */
export const WithDuplicates: Story = {
  name: 'AutomaticDeduplication',
  parameters: {
    docs: {
      description: {
        story:
          'Demonstrates automatic deduplication when multiple volumes share the same proxy. Only distinct proxy names are shown (3 unique proxies from 6 volumes).',
      },
    },
  },
  args: {},
  render: (args) => (
    <RelayResolver
      mockResolvers={{
        Query: () => ({
          storage_volume_list: { items: sampleVolumesWithDuplicateProxies },
        }),
      }}
    >
      <BAIStorageProxySelect {...args} style={{ width: '300px' }} />
    </RelayResolver>
  ),
};

/**
 * Auto-select the first proxy once options load.
 */
export const AutoSelectFirst: Story = {
  name: 'AutoSelectFirstOption',
  parameters: {
    docs: {
      description: {
        story:
          'With `autoSelectOption`, the first proxy is selected automatically once options load and no value is set — used by the SFTP Resource Group settings modal. This requires a controlled `value`/`onChange` pair (as a real consumer, e.g. an antd `Form.Item`, would provide) — `autoSelectOption` only *calls* `onChange`, it does not maintain the selection itself.',
      },
    },
  },
  args: {
    autoSelectOption: true,
  },
  render: (args) => {
    const [value, setValue] = useState<string>();
    return (
      <RelayResolver
        mockResolvers={{
          Query: () => ({
            storage_volume_list: { items: sampleVolumes },
          }),
        }}
      >
        <BAIStorageProxySelect
          {...args}
          value={value}
          onChange={setValue}
          style={{ width: '300px' }}
        />
      </RelayResolver>
    );
  },
};

/**
 * Multiple selection mode, picking from existing proxy options.
 */
export const MultiSelect: Story = {
  name: 'MultipleSelection',
  parameters: {
    docs: {
      description: {
        story:
          'With `mode="multiple"`, users can select several proxies from the existing options (as opposed to `mode="tags"`, which also allows free text entry).',
      },
    },
  },
  args: {
    mode: 'multiple',
    defaultValue: ['local', 'ceph-proxy'],
  },
  render: (args) => (
    <RelayResolver
      mockResolvers={{
        Query: () => ({
          storage_volume_list: { items: sampleVolumes },
        }),
      }}
    >
      <BAIStorageProxySelect {...args} style={{ width: '300px' }} />
    </RelayResolver>
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
    disabled: true,
  },
  render: (args) => (
    <RelayResolver
      mockResolvers={{
        Query: () => ({
          storage_volume_list: { items: sampleVolumes },
        }),
      }}
    >
      <BAIStorageProxySelect {...args} style={{ width: '300px' }} />
    </RelayResolver>
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
    allowClear: true,
  },
  render: (args) => (
    <RelayResolver
      mockResolvers={{
        Query: () => ({
          storage_volume_list: { items: sampleVolumes },
        }),
      }}
    >
      <BAIStorageProxySelect {...args} style={{ width: '300px' }} />
    </RelayResolver>
  ),
};

/**
 * Select with many storage proxies.
 */
export const ManyProxies: Story = {
  name: 'ManyOptions',
  parameters: {
    docs: {
      description: {
        story:
          'Demonstrates the component with 15 storage proxies, showing a scrollable dropdown with search functionality.',
      },
    },
  },
  args: {
    allowClear: true,
  },
  render: (args) => (
    <RelayResolver
      mockResolvers={{
        Query: () => ({
          storage_volume_list: { items: sampleManyVolumes },
        }),
      }}
    >
      <BAIStorageProxySelect {...args} style={{ width: '300px' }} />
    </RelayResolver>
  ),
};
