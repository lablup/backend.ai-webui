import RelayResolver from '../../tests/RelayResolver';
import BAIScopedUserSelect from './BAIScopedUserSelect';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { ComponentProps, useState } from 'react';
import type { MockResolvers } from 'relay-test-utils';

/**
 * `BAIScopedUserSelect` is the `scopedUsersV2` sibling of
 * `BAIAdminUserV2Select`: the same `BAIComplexSelect` foundation, plain-key
 * value contract and typed `UserV2Filter`, but the rows are the users the
 * `domainId` / `projectId` / `roleId` scopes reach, so a regular user can
 * call it.
 *
 * Storybook can't reproduce real scroll-driven pagination against a live
 * backend, so this mocks a single page's worth of users via `RelayResolver`
 * (same `relay-test-utils` pattern as `BAIAdminUserV2Select.stories.tsx`).
 */
const meta: Meta<typeof BAIScopedUserSelect> = {
  title: 'Fragments/BAIScopedUserSelect',
  component: BAIScopedUserSelect,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
**BAIScopedUserSelect** — user picker over \`scopedUsersV2\` (managers >= 26.9.0). Built on \`BAIComplexSelect\`.

- \`domainId\` / \`projectId\` / \`roleId\`: one id or several each; only the keys a caller names go into the \`UserScope\` input, and the server OR-combines them after authorizing each one.
- \`valuePropName\`: \`'email'\` (default) or \`'id'\` — which field is the plain-key value. Only \`'id'\` runs the \`uuid in\` label-resolution query; with emails the key already is the label.
- \`filter\` / \`excludeInactive\`: composed into a \`UserV2Filter\` through the schema's \`AND\` combinator, together with the debounced \`email: { iContains }\` search.
- Pagination is offset mode (\`limit\`/\`offset\`) — the V2 connections reject a mix with \`first\`/\`after\` at runtime.

See \`BAIAdminUserV2Select.stories.tsx\` for the superadmin-wide sibling and \`BAIComplexSelect.stories.tsx\` for the popup body with static options.
        `,
      },
    },
  },
  argTypes: {
    value: { control: false },
    onChange: { control: false },
    filter: { control: false },
    domainId: { control: false },
    projectId: { control: false },
    roleId: { control: false },
    multiple: { control: { type: 'boolean' } },
    excludeInactive: { control: { type: 'boolean' } },
    valuePropName: {
      control: { type: 'select' },
      options: ['email', 'id'],
    },
  },
};

export default meta;

type Story = StoryObj<typeof BAIScopedUserSelect>;

const PROJECT_ID = '11111111-2222-4333-8444-555555555555';

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
    scopedUsersV2: {
      count: mockUsers.length,
      edges: mockUsers.map((node) => ({ node })),
    },
  }),
};

const emptyResolvers: MockResolvers = {
  Query: () => ({ scopedUsersV2: { count: 0, edges: [] } }),
};

const Sandbox: React.FC<
  Omit<ComponentProps<typeof BAIScopedUserSelect>, 'value' | 'onChange'> & {
    initialValue?: string | Array<string> | null;
    resolvers?: MockResolvers;
  }
> = ({ initialValue = null, resolvers = mockResolvers, ...args }) => {
  const [value, setValue] = useState<string | Array<string> | null | undefined>(
    initialValue,
  );
  return (
    <RelayResolver mockResolvers={resolvers}>
      <BAIScopedUserSelect
        projectId={PROJECT_ID}
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
        story:
          'Single user select scoped to one project, `valuePropName="email"` (default).',
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

export const SeveralScopes: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Two projects and one role named at once: every key present in the props goes into `UserScope`, and the server OR-combines them.',
      },
    },
  },
  render: (args) => (
    <Sandbox
      {...args}
      label="User"
      projectId={[PROJECT_ID, '66666666-7777-4888-8999-aaaaaaaaaaaa']}
      roleId="bbbbbbbb-cccc-4ddd-8eee-ffffffffffff"
    />
  ),
};

export const CustomSelect: Story = {
  name: 'Custom e-mail entry',
  parameters: {
    docs: {
      description: {
        story:
          '`allowCustomSelect` — an e-mail address typed in the search box that no listed user matches is offered as one more option; picking it makes the value that address and `onChange` marks it `isCustom`.',
      },
    },
  },
  render: (args) => (
    <Sandbox {...args} label="User" allowCustomSelect defaultOpen />
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
          '`valuePropName="id"` — the plain-key value is the local user UUID, which is what `setVFolderMountPolicy` and friends take. This is the only mode that runs the `uuid in` label-resolution query.',
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
          'No users in the scope — the popup shows the shared empty-state text.',
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
      status={{ type: 'error', message: 'Please select a user.' }}
    />
  ),
};
