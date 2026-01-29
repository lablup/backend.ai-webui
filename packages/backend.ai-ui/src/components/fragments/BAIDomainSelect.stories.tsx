import RelayResolver from '../../tests/RelayResolver';
import BAIDomainSelect from './BAIDomainSelect';
import { Meta, StoryObj } from '@storybook/react-vite';

const sampleActiveDomains = [
  { name: 'default' },
  { name: 'research' },
  { name: 'production' },
];

const sampleAllDomains = [
  { name: 'default' },
  { name: 'research' },
  { name: 'production' },
  { name: 'archived-domain' },
  { name: 'inactive-domain' },
];

/**
 * BAIDomainSelect is a specialized Select component that fetches and displays
 * Backend.AI domains using GraphQL.
 *
 * Key features:
 * - Automatic data fetching via GraphQL query
 * - Filter active/inactive domains
 * - Built-in internationalization
 *
 * @see BAIDomainSelect.tsx for implementation details
 */
const meta: Meta<typeof BAIDomainSelect> = {
  title: 'Fragments/BAIDomainSelect',
  component: BAIDomainSelect,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
**BAIDomainSelect** extends [Ant Design Select](https://ant.design/components/select) to fetch and display Backend.AI domains.

## BAI-Specific Props

| Name | Type | Default | Description |
|------|------|---------|-------------|
| \`activeOnly\` | \`boolean\` | \`true\` | Filter to show only active domains |

## Features
- Fetches domains from GraphQL query \`BAIDomainSelectQuery\`
- Automatically filters active/inactive domains based on \`activeOnly\` prop
- Built-in placeholder with i18n support
- Uses \`fetchPolicy: 'store-and-network'\` for data freshness

## GraphQL Query
\`\`\`graphql
query BAIDomainSelectQuery($is_active: Boolean) {
  domains(is_active: $is_active) {
    name
  }
}
\`\`\`

## Usage
\`\`\`tsx
<BAIDomainSelect
  activeOnly={true}
  placeholder="Select a domain"
  onChange={(value) => console.log(value)}
/>
\`\`\`

For all other props, refer to [Ant Design Select](https://ant.design/components/select).
        `,
      },
    },
  },
  argTypes: {
    activeOnly: {
      control: { type: 'boolean' },
      description: 'Filter to show only active domains',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'true' },
      },
    },
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
    onChange: {
      action: 'changed',
      description: 'Callback when selection changes',
    },
  },
};

export default meta;
type Story = StoryObj<typeof BAIDomainSelect>;

/**
 * Basic usage showing only active domains (default behavior).
 */
export const Default: Story = {
  name: 'Basic',
  parameters: {
    docs: {
      description: {
        story:
          'Basic usage with activeOnly=true (default), showing 3 active domains.',
      },
    },
  },
  render: () => (
    <RelayResolver
      mockResolvers={{
        Query: () => ({
          domains: sampleActiveDomains,
        }),
      }}
    >
      <div style={{ width: '300px' }}>
        <BAIDomainSelect />
      </div>
    </RelayResolver>
  ),
};

/**
 * Shows all domains including inactive ones.
 */
export const AllDomains: Story = {
  name: 'AllDomains',
  parameters: {
    docs: {
      description: {
        story:
          'With activeOnly=false, displays all domains including inactive ones (5 total domains).',
      },
    },
  },
  render: () => (
    <RelayResolver
      mockResolvers={{
        Query: () => ({
          domains: sampleAllDomains,
        }),
      }}
    >
      <div style={{ width: '300px' }}>
        <BAIDomainSelect activeOnly={false} />
      </div>
    </RelayResolver>
  ),
};

/**
 * Empty state when no domains are available.
 */
export const Empty: Story = {
  name: 'EmptyState',
  parameters: {
    docs: {
      description: {
        story: 'Shows the component when no domains are returned from the API.',
      },
    },
  },
  render: () => (
    <RelayResolver
      mockResolvers={{
        Query: () => ({
          domains: [],
        }),
      }}
    >
      <div style={{ width: '300px' }}>
        <BAIDomainSelect />
      </div>
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
  render: () => (
    <RelayResolver
      mockResolvers={{
        Query: () => ({
          domains: sampleActiveDomains,
        }),
      }}
    >
      <div style={{ width: '300px' }}>
        <BAIDomainSelect disabled />
      </div>
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
  render: () => (
    <RelayResolver
      mockResolvers={{
        Query: () => ({
          domains: sampleActiveDomains,
        }),
      }}
    >
      <div style={{ width: '300px' }}>
        <BAIDomainSelect allowClear />
      </div>
    </RelayResolver>
  ),
};

/**
 * Select with custom placeholder text.
 */
export const WithCustomPlaceholder: Story = {
  name: 'CustomPlaceholder',
  parameters: {
    docs: {
      description: {
        story:
          'Demonstrates using a custom placeholder instead of the default.',
      },
    },
  },
  render: () => (
    <RelayResolver
      mockResolvers={{
        Query: () => ({
          domains: sampleActiveDomains,
        }),
      }}
    >
      <div style={{ width: '300px' }}>
        <BAIDomainSelect placeholder="Choose a domain..." />
      </div>
    </RelayResolver>
  ),
};

/**
 * Select with many domain options.
 */
export const ManyDomains: Story = {
  name: 'ManyOptions',
  parameters: {
    docs: {
      description: {
        story:
          'Demonstrates the component with a large number of domains, showing scrollable dropdown behavior.',
      },
    },
  },
  render: () => {
    const manyDomains = Array.from({ length: 15 }, (_, i) => ({
      name: `domain-${i + 1}`,
    }));

    return (
      <RelayResolver
        mockResolvers={{
          Query: () => ({
            domains: manyDomains,
          }),
        }}
      >
        <div style={{ width: '300px' }}>
          <BAIDomainSelect showSearch allowClear />
        </div>
      </RelayResolver>
    );
  },
};
