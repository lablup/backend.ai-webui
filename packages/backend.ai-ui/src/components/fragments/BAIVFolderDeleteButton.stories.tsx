import { BAIVFolderDeleteButtonStoriesQuery } from '../../__generated__/BAIVFolderDeleteButtonStoriesQuery.graphql';
import RelayResolver from '../../tests/RelayResolver';
import BAIFlex from '../BAIFlex';
import BAIVFolderDeleteButton from './BAIVFolderDeleteButton';
import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { graphql, useLazyLoadQuery } from 'react-relay';

/**
 * BAIVFolderDeleteButton is a specialized delete button for virtual folders.
 *
 * Key features:
 * - Automatic deletability check based on vfolder permissions
 * - Disabled when no vfolders have 'delete_vfolder' permission
 * - Error-styled appearance when enabled
 * - Disabled appearance when not deletable
 *
 * @see BAIVFolderDeleteButton.tsx for implementation details
 */
const meta: Meta<typeof BAIVFolderDeleteButton> = {
  title: 'Fragments/BAIVFolderDeleteButton',
  component: BAIVFolderDeleteButton,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
**BAIVFolderDeleteButton** is a specialized delete button for virtual folders with automatic deletability checks based on GraphQL fragment data.

## BAI-Specific Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| \`vfolderFrgmt\` | \`BAIVFolderDeleteButtonFragment$key\` | - | GraphQL fragment reference for vfolder data (required) |

## Deletability Logic
The button automatically determines if vfolders are deletable:
- **Deletable**: At least one vfolder has 'delete_vfolder' permission
- **Not Deletable**: No vfolders have 'delete_vfolder' permission

## Visual States
- **Enabled**: Error colors (red icon and background)
- **Disabled**: Disabled colors (gray)

For other props, refer to [Ant Design Button](https://ant.design/components/button).
        `,
      },
    },
  },
  argTypes: {
    vfolderFrgmt: {
      control: false,
      description: 'GraphQL fragment reference for virtual folder data',
      table: {
        type: { summary: 'BAIVFolderDeleteButtonFragment$key' },
      },
    },
    disabled: {
      control: { type: 'boolean' },
      description: 'Disabled state',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
    onClick: {
      action: 'clicked',
      description: 'Click handler',
      table: {
        type: { summary: '() => void' },
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof BAIVFolderDeleteButton>;

// =============================================================================
// Query Resolver Component
// =============================================================================

interface QueryResolverProps {
  disabled?: boolean;
  onClick?: React.MouseEventHandler<HTMLElement>;
}

const QueryResolver = ({ disabled = false, onClick }: QueryResolverProps) => {
  const { vfolder_nodes } =
    useLazyLoadQuery<BAIVFolderDeleteButtonStoriesQuery>(
      graphql`
        query BAIVFolderDeleteButtonStoriesQuery {
          vfolder_nodes(offset: 0, first: 10) {
            edges {
              node {
                ...BAIVFolderDeleteButtonFragment
              }
            }
          }
        }
      `,
      {},
    );

  const vfolders = vfolder_nodes?.edges?.map((edge: any) => edge.node);

  return (
    vfolders &&
    vfolders.length > 0 && (
      <BAIVFolderDeleteButton
        vfolderFrgmt={vfolders}
        disabled={disabled}
        onClick={onClick}
      />
    )
  );
};

// =============================================================================
// Stories
// =============================================================================

/**
 * Deletable vfolders - button is enabled with error styling
 */
export const Default: Story = {
  name: 'Basic',
  args: {},
  parameters: {
    docs: {
      description: {
        story:
          'Virtual folders with delete_vfolder permission. The button appears in error colors (red).',
      },
    },
  },
  render: (args) => (
    <RelayResolver
      mockResolvers={{
        VirtualFolderConnection: () => ({
          edges: [
            {
              node: {
                permissions: [
                  'read_vfolder',
                  'write_vfolder',
                  'delete_vfolder',
                ],
              },
            },
            {
              node: {
                permissions: ['read_vfolder', 'write_vfolder'],
              },
            },
          ],
        }),
      }}
    >
      <QueryResolver {...args} />
    </RelayResolver>
  ),
};

/**
 * No delete permission - button is disabled
 */
export const NotDeletable: Story = {
  name: 'NotDeletable',
  args: {},
  parameters: {
    docs: {
      description: {
        story:
          'No vfolders have delete_vfolder permission. The button is automatically disabled with gray styling.',
      },
    },
  },
  render: (args) => (
    <RelayResolver
      mockResolvers={{
        VirtualFolderConnection: () => ({
          edges: [
            {
              node: {
                permissions: ['read_vfolder', 'write_vfolder'],
              },
            },
            {
              node: {
                permissions: ['read_vfolder'],
              },
            },
          ],
        }),
      }}
    >
      <QueryResolver {...args} />
    </RelayResolver>
  ),
};

/**
 * Mixed permissions - button is enabled if at least one has delete permission
 */
export const MixedPermissions: Story = {
  name: 'MixedPermissions',
  args: {},
  parameters: {
    docs: {
      description: {
        story:
          'Mix of vfolders with and without delete_vfolder permission. The button is enabled because at least one vfolder is deletable.',
      },
    },
  },
  render: (args) => (
    <RelayResolver
      mockResolvers={{
        VirtualFolderConnection: () => ({
          edges: [
            {
              node: {
                permissions: ['read_vfolder'],
              },
            },
            {
              node: {
                permissions: [
                  'read_vfolder',
                  'write_vfolder',
                  'delete_vfolder',
                ],
              },
            },
            {
              node: {
                permissions: ['read_vfolder', 'write_vfolder'],
              },
            },
          ],
        }),
      }}
    >
      <QueryResolver {...args} />
    </RelayResolver>
  ),
};

/**
 * Disabled state
 */
export const Disabled: Story = {
  name: 'DisabledState',
  args: {
    disabled: true,
  },
  parameters: {
    docs: {
      description: {
        story:
          'Button in disabled state via prop, even though vfolders have delete permission.',
      },
    },
  },
  render: (args) => (
    <RelayResolver
      mockResolvers={{
        VirtualFolderConnection: () => ({
          edges: [
            {
              node: {
                permissions: [
                  'read_vfolder',
                  'write_vfolder',
                  'delete_vfolder',
                ],
              },
            },
          ],
        }),
      }}
    >
      <QueryResolver {...args} />
    </RelayResolver>
  ),
};

/**
 * Comparison of all states
 */
export const AllStates: Story = {
  name: 'AllStates',
  parameters: {
    docs: {
      description: {
        story:
          'Comparison of all button states: deletable, not deletable, and disabled.',
      },
    },
  },
  render: () => (
    <BAIFlex direction="column" gap="md">
      <BAIFlex align="center" gap="sm">
        <span style={{ width: 140 }}>Deletable:</span>
        <RelayResolver
          mockResolvers={{
            VirtualFolderConnection: () => ({
              edges: [
                {
                  node: {
                    permissions: [
                      'read_vfolder',
                      'write_vfolder',
                      'delete_vfolder',
                    ],
                  },
                },
              ],
            }),
          }}
        >
          <QueryResolver />
        </RelayResolver>
      </BAIFlex>

      <BAIFlex align="center" gap="sm">
        <span style={{ width: 140 }}>Not Deletable:</span>
        <RelayResolver
          mockResolvers={{
            VirtualFolderConnection: () => ({
              edges: [
                {
                  node: {
                    permissions: ['read_vfolder', 'write_vfolder'],
                  },
                },
              ],
            }),
          }}
        >
          <QueryResolver />
        </RelayResolver>
      </BAIFlex>

      <BAIFlex align="center" gap="sm">
        <span style={{ width: 140 }}>Disabled:</span>
        <RelayResolver
          mockResolvers={{
            VirtualFolderConnection: () => ({
              edges: [
                {
                  node: {
                    permissions: [
                      'read_vfolder',
                      'write_vfolder',
                      'delete_vfolder',
                    ],
                  },
                },
              ],
            }),
          }}
        >
          <QueryResolver disabled />
        </RelayResolver>
      </BAIFlex>
    </BAIFlex>
  ),
};
