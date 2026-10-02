import RelayResolver from '../../tests/RelayResolver';
import BAIAdminUserV2Select from './BAIAdminUserV2Select';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { ComponentProps, useState } from 'react';
import type { MockResolvers } from 'relay-test-utils';

/**
 * `BAIAdminUserV2Select` is the `adminUsersV2` sibling of `BAIUserSelect`:
 * the same `BAIComplexSelect` foundation and the same plain-key value
 * contract, but a typed `UserV2Filter` object instead of the query-filter
 * minilang string.
 *
 * Storybook can't reproduce real scroll-driven pagination against a live
 * backend, so this mocks a single page's worth of users via `RelayResolver`
 * (same `relay-test-utils` pattern as `BAIUserSelect.stories.tsx`).
 */
const meta: Meta<typeof BAIAdminUserV2Select> = {
  title: 'Fragments/BAIAdminUserV2Select',
  component: BAIAdminUserV2Select,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
**BAIAdminUserV2Select** — superadmin-only user picker over \`adminUsersV2\` (managers >= 26.2.0). Built on \`BAIComplexSelect\`.

- \`valuePropName\`: \`'email'\` (default) or \`'id'\` — which field is the plain-key value. Only \`'id'\` runs the \`uuid in\` label-resolution query; with emails the key already is the label.
- \`filter\` / \`excludeInactive\`: composed into a \`UserV2Filter\` through the schema's \`AND\` combinator, together with the debounced \`email: { iContains }\` search.
- Pagination is offset mode (\`limit\`/\`offset\`) — the V2 connections reject a mix with \`first\`/\`after\` at runtime.

See \`BAIComplexSelect.stories.tsx\` for the underlying popup-body component with static options.
        `,
      },
    },
  },
  argTypes: {
    value: { control: false },
    onChange: { control: false },
    filter: { control: false },
    multiple: { control: { type: 'boolean' } },
    excludeInactive: { control: { type: 'boolean' } },
    valuePropName: {
      control: { type: 'select' },
      options: ['email', 'id'],
    },
  },
};

export default meta;

type Story = StoryObj<typeof BAIAdminUserV2Select>;

const mockUsers = [
  {
    id: 'VXNlclYyOjE=',
    basicInfo: {
      username: 'admin',
      email: 'admin@example.com',
      fullName: 'System Administrator',
    },
  },
  {
    id: 'VXNlclYyOjI=',
    basicInfo: {
      username: 'alice',
      email: 'alice@example.com',
      fullName: 'Alice Kim',
    },
  },
  {
    id: 'VXNlclYyOjM=',
    basicInfo: {
      username: 'bob',
      email: 'bob@example.com',
      fullName: 'Bob Lee',
    },
  },
  {
    id: 'VXNlclYyOjQ=',
    basicInfo: {
      username: 'carol',
      email: 'carol@example.com',
      fullName: 'Carol Park',
    },
  },
];

const mockResolvers: MockResolvers = {
  Query: () => ({
    adminUsersV2: {
      count: mockUsers.length,
      edges: mockUsers.map((node) => ({ node })),
    },
  }),
};

const emptyResolvers: MockResolvers = {
  Query: () => ({ adminUsersV2: { count: 0, edges: [] } }),
};

const Sandbox: React.FC<
  Omit<ComponentProps<typeof BAIAdminUserV2Select>, 'value' | 'onChange'> & {
    initialValue?: string | Array<string> | null;
    resolvers?: MockResolvers;
  }
> = ({ initialValue = null, resolvers = mockResolvers, ...args }) => {
  const [value, setValue] = useState<string | Array<string> | null | undefined>(
    initialValue,
  );
  return (
    <RelayResolver mockResolvers={resolvers}>
      <BAIAdminUserV2Select
        {...args}
        value={value}
        onChange={(next) => setValue(next ?? null)}
      />
    </RelayResolver>
  );
};

export const Basic: Story = {
  name: 'Single Select',
  parameters: {
    docs: {
      description: {
        story: 'Single user select, `valuePropName="email"` (default).',
      },
    },
  },
  render: (args) => <Sandbox {...args} label="User" />,
};

export const Multiple: Story = {
  name: 'Multiple Select',
  parameters: {
    docs: {
      description: {
        story:
          'Multi-selection: the value is an array of keys and the trigger lists the selected emails.',
      },
    },
  },
  render: (args) => (
    <Sandbox
      {...args}
      label="Users"
      multiple
      initialValue={['admin@example.com']}
    />
  ),
};

export const ExcludeInactive: Story = {
  name: 'Exclude Inactive Users',
  parameters: {
    docs: {
      description: {
        story:
          '`excludeInactive` composes `status: { equals: ACTIVE }` into the `UserV2Filter`.',
      },
    },
  },
  render: (args) => <Sandbox {...args} label="User" excludeInactive />,
};

export const IdValued: Story = {
  name: 'ID-valued',
  parameters: {
    docs: {
      description: {
        story:
          '`valuePropName="id"` — the plain-key value is the local user UUID, which is what `adminBulkAssignRole` and friends take. This is the only mode that runs the `uuid in` label-resolution query.',
      },
    },
  },
  render: (args) => <Sandbox {...args} label="User" valuePropName="id" />,
};

export const Loading: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Caller-side `isLoading`, which spins the trigger the same way the internal debounce and refetch pending states do.',
      },
    },
  },
  render: (args) => <Sandbox {...args} label="User" isLoading isDisabled />,
};

export const Empty: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'No users match the query — the popup shows the shared empty-state text.',
      },
    },
  },
  render: (args) => (
    <Sandbox {...args} label="User" resolvers={emptyResolvers} defaultOpen />
  ),
};

export const Error: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'The error status a form item sets when its `required` rule fails.',
      },
    },
  },
  render: (args) => (
    <Sandbox
      {...args}
      label="User"
      status={{ type: 'error', message: 'Please select users.' }}
    />
  ),
};
