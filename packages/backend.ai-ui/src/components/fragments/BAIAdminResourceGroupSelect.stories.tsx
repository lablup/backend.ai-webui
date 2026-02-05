import { BAIAdminResourceGroupSelectStoriesQuery } from '../../__generated__/BAIAdminResourceGroupSelectStoriesQuery.graphql';
import RelayResolver from '../../tests/RelayResolver';
import BAIAdminResourceGroupSelect from './BAIAdminResourceGroupSelect';
import { Meta, StoryObj } from '@storybook/react-vite';
import { graphql, useLazyLoadQuery } from 'react-relay';

/**
 * BAIAdminResourceGroupSelect is a specialized select component for choosing admin resource groups.
 *
 * Key features:
 * - GraphQL integration with pagination support
 * - Search/filter functionality for resource groups
 * - Displays total count in footer
 * - Skeleton loading state
 *
 * @see BAIAdminResourceGroupSelect.tsx for implementation details
 */
const meta: Meta<typeof BAIAdminResourceGroupSelect> = {
  title: 'Fragments/BAIAdminResourceGroupSelect',
  component: BAIAdminResourceGroupSelect,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
**BAIAdminResourceGroupSelect** is a Relay fragment component that provides a select dropdown for admin resource groups.

## Features
- GraphQL-powered data fetching with pagination
- Search and filter resource groups by name
- Displays total count in footer
- Skeleton loading for better UX
- Extends [BAISelect](/?path=/docs/components-baiselect--docs)

## BAI-Specific Features
| Feature | Description |
|---------|-------------|
| GraphQL Integration | Uses Relay pagination fragment to fetch resource groups |
| Search/Filter | Filters resource groups by name as you type |
| Pagination | Automatically loads more items when scrolling |
| Total Footer | Shows total count of resource groups |
| Skeleton Loading | Displays skeleton when data is loading |

## Props
| Name | Type | Description |
|------|------|-------------|
| \`queryRef\` | \`BAIAdminResourceGroupSelect_resourceGroupsFragment$key\` | Relay fragment reference for resource groups query |
| \`loading\` | \`boolean\` | Shows loading state |
| \`placeholder\` | \`string\` | Placeholder text for the select |
| \`disabled\` | \`boolean\` | Disables the select |

For all other props, refer to [BAISelect](/?path=/docs/components-baiselect--docs).
        `,
      },
    },
  },
  argTypes: {
    queryRef: {
      control: false,
      description:
        'Relay fragment reference for resource groups query (contains pagination data)',
      table: {
        type: {
          summary: 'BAIAdminResourceGroupSelect_resourceGroupsFragment$key',
        },
      },
    },
    loading: {
      control: { type: 'boolean' },
      description: 'Shows loading state in the select',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
    placeholder: {
      control: { type: 'text' },
      description: 'Placeholder text for the select',
      table: {
        type: { summary: 'string' },
      },
    },
    disabled: {
      control: { type: 'boolean' },
      description: 'Disables the select',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof BAIAdminResourceGroupSelect>;

// Wrapper component to fetch fragment data
const BAIAdminResourceGroupSelectWithQuery = (
  props: Omit<
    React.ComponentProps<typeof BAIAdminResourceGroupSelect>,
    'queryRef'
  >,
) => {
  const queryRef = useLazyLoadQuery<BAIAdminResourceGroupSelectStoriesQuery>(
    graphql`
      query BAIAdminResourceGroupSelectStoriesQuery {
        ...BAIAdminResourceGroupSelect_resourceGroupsFragment
      }
    `,
    {},
  );

  return <BAIAdminResourceGroupSelect queryRef={queryRef} {...props} />;
};

export const Default: Story = {
  name: 'Default (3 items)',
  parameters: {
    docs: {
      description: {
        story:
          'Basic usage with 3 resource groups. Shows search functionality and total count in footer.',
      },
    },
  },
  args: {},
  render: (args) => (
    <RelayResolver
      mockResolvers={{
        ResourceGroupConnection: () => ({
          count: 3,
          edges: [
            { node: { id: 'rg-1', name: 'default' } },
            { node: { id: 'rg-2', name: 'gpu-cluster' } },
            { node: { id: 'rg-3', name: 'cpu-only' } },
          ],
        }),
      }}
    >
      <div style={{ width: '300px' }}>
        <BAIAdminResourceGroupSelectWithQuery {...args} />
      </div>
    </RelayResolver>
  ),
};

export const Empty: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Empty state when no resource groups are available. Shows appropriate empty message.',
      },
    },
  },
  args: {},
  render: (args) => (
    <RelayResolver
      mockResolvers={{
        ResourceGroupConnection: () => ({
          count: 0,
          edges: [],
        }),
      }}
    >
      <div style={{ width: '300px' }}>
        <BAIAdminResourceGroupSelectWithQuery {...args} />
      </div>
    </RelayResolver>
  ),
};

export const WithCustomPlaceholder: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Example with custom placeholder text. Demonstrates how to override the default placeholder.',
      },
    },
  },
  args: {
    placeholder: 'Choose a resource group...',
  },
  render: (args) => (
    <RelayResolver
      mockResolvers={{
        ResourceGroupConnection: () => ({
          count: 5,
          edges: [
            { node: { id: 'rg-1', name: 'development' } },
            { node: { id: 'rg-2', name: 'production' } },
            { node: { id: 'rg-3', name: 'staging' } },
            { node: { id: 'rg-4', name: 'testing' } },
            { node: { id: 'rg-5', name: 'demo' } },
          ],
        }),
      }}
    >
      <div style={{ width: '300px' }}>
        <BAIAdminResourceGroupSelectWithQuery {...args} />
      </div>
    </RelayResolver>
  ),
};

export const Disabled: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Disabled state of the select. Users cannot interact with the component when disabled.',
      },
    },
  },
  args: {
    disabled: true,
  },
  render: (args) => (
    <RelayResolver
      mockResolvers={{
        ResourceGroupConnection: () => ({
          count: 3,
          edges: [
            { node: { id: 'rg-1', name: 'default' } },
            { node: { id: 'rg-2', name: 'gpu-cluster' } },
            { node: { id: 'rg-3', name: 'cpu-only' } },
          ],
        }),
      }}
    >
      <div style={{ width: '300px' }}>
        <BAIAdminResourceGroupSelectWithQuery {...args} />
      </div>
    </RelayResolver>
  ),
};
