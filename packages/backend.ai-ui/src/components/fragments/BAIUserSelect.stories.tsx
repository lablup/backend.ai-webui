import RelayResolver from '../../tests/RelayResolver';
import {
  BAIClientContext,
  type BAIClient,
} from '../provider/BAIClientProvider';
import BAIUserSelect from './BAIUserSelect';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { ComponentProps, useMemo, useState } from 'react';
import type { MockResolvers } from 'relay-test-utils';

/**
 * `BAIUserSelect` is the reference consumer of `BAIComplexSelect`: Relay
 * offset pagination with scroll-driven `loadNext`, server-side search, and
 * `labelInValue` semantics behind a plain-key (`string`/`string[]`) value.
 *
 * Storybook can't reproduce real scroll-driven pagination against a live
 * backend, so this mocks a single page's worth of users via `RelayResolver`
 * and a mock client that reports a V2 manager.
 */
const meta: Meta<typeof BAIUserSelect> = {
  title: 'Fragments/BAIUserSelect',
  component: BAIUserSelect,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
**BAIUserSelect** — the user picker the admin and project-admin forms share. Built on \`BAIComplexSelect\`.

- \`scope\`: \`{ type: 'admin' }\` (\`adminUsersV2\`), \`{ type: 'domain', domainName }\` (\`domainUsersV2\`) or \`{ type: 'project', projectId }\` (\`projectUsersV2\`). Omitted, it lists every user the caller may administer: all users for a super-admin, the caller's own domain otherwise.
- \`valuePropName\`: \`'email'\` (default) or \`'id'\` — which field is the plain-key value. Only \`'id'\` runs the \`uuid in\` label-resolution query; with emails the key already is the label.
- \`filter\` / \`excludeInactive\`: composed into a \`UserV2Filter\` through the schema's \`AND\` combinator, together with the debounced \`email: { iContains }\` search.
- Managers below 26.2.0 fall back to the legacy \`user_nodes\` connection (\`user-v2-query\` client flag).

See \`BAIComplexSelect.stories.tsx\` for the underlying popup-body component with static options.
        `,
      },
    },
  },
  argTypes: {
    value: { control: false },
    onChange: { control: false },
    filter: { control: false },
    scope: { control: false },
    multiple: { control: { type: 'boolean' } },
    excludeInactive: { control: { type: 'boolean' } },
    valuePropName: {
      control: { type: 'select' },
      options: ['email', 'id'],
    },
  },
};

export default meta;

type Story = StoryObj<typeof BAIUserSelect>;

const mockUsers = [
  {
    id: 'VXNlclYyOjE=',
    basicInfo: {
      email: 'admin@example.com',
      fullName: 'System Administrator',
    },
  },
  {
    id: 'VXNlclYyOjI=',
    basicInfo: { email: 'alice@example.com', fullName: 'Alice Kim' },
  },
  {
    id: 'VXNlclYyOjM=',
    basicInfo: { email: 'bob@example.com', fullName: 'Bob Lee' },
  },
  {
    id: 'VXNlclYyOjQ=',
    basicInfo: { email: 'carol@example.com', fullName: 'Carol Park' },
  },
];

const connection = (users: typeof mockUsers) => ({
  count: users.length,
  edges: users.map((node) => ({ node })),
});

const mockResolvers: MockResolvers = {
  Query: () => ({
    adminUsersV2: connection(mockUsers),
    domainUsersV2: connection(mockUsers),
    projectUsersV2: connection(mockUsers.slice(1, 3)),
  }),
};

const emptyResolvers: MockResolvers = {
  Query: () => ({ adminUsersV2: connection([]) }),
};

const mockClient = {
  supports: () => true,
  is_superadmin: true,
  _config: { domainName: 'default' },
} as Partial<BAIClient> as BAIClient;

const Sandbox: React.FC<
  Omit<ComponentProps<typeof BAIUserSelect>, 'value' | 'onChange'> & {
    initialValue?: string | Array<string> | null;
    resolvers?: MockResolvers;
  }
> = ({ initialValue = null, resolvers = mockResolvers, ...args }) => {
  const [value, setValue] = useState<string | Array<string> | null | undefined>(
    initialValue,
  );
  const clientPromise = useMemo(() => Promise.resolve(mockClient), []);
  return (
    <BAIClientContext.Provider value={clientPromise}>
      <RelayResolver mockResolvers={resolvers}>
        <BAIUserSelect
          {...args}
          value={value}
          onChange={(next) => setValue(next ?? null)}
        />
      </RelayResolver>
    </BAIClientContext.Provider>
  );
};

export const Default: Story = {
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

export const ProjectScoped: Story = {
  name: 'Project Scope',
  parameters: {
    docs: {
      description: {
        story:
          '`scope={{ type: "project", projectId }}` reads `projectUsersV2`, the members of one project — what a project admin may list.',
      },
    },
  },
  render: (args) => (
    <Sandbox
      {...args}
      label="Owner"
      scope={{
        type: 'project',
        projectId: '5c3b5a9e-0000-4000-8000-000000000001',
      }}
      defaultOpen
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
