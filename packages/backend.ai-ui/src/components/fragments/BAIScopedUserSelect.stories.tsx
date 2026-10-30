import type { UserScope } from '../../__generated__/BAIScopedUserSelectPaginatedQuery.graphql';
import RelayResolver from '../../tests/RelayResolver';
import BAIScopedUserSelect from './BAIScopedUserSelect';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { ComponentProps, useState } from 'react';
import type { MockResolvers } from 'relay-test-utils';

/**
 * `BAIScopedUserSelect` is the reference consumer of `BAIComplexSelect`: Relay
 * offset pagination with scroll-driven `loadNext`, server-side search, and
 * `labelInValue` semantics behind a plain-key (`string`/`string[]`) value.
 *
 * Storybook can't reproduce real scroll-driven pagination against a live
 * backend, so this mocks a single page's worth of users via `RelayResolver`.
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
**BAIScopedUserSelect** — the user picker for admin and project-admin forms (ADR 0012). Built on \`BAIComplexSelect\`, paged through \`scopedUsersV2\`.

- \`scope\` (required): the \`UserScope\` input. Admin pages pass the current domain from \`useCurrentDomain()\`; a project-admin page passes \`{ project: [{ value: projectId }] }\`.
- \`valuePropName\`: \`'email'\` (default) or \`'id'\` — which field is the plain-key value. Only \`'id'\` runs the \`uuid in\` label-resolution query; with emails the key already is the label.
- \`filter\` / \`excludeInactive\`: composed into a \`UserV2Filter\` through the schema's \`AND\` combinator, together with the debounced \`email: { iContains }\` search.
- Needs a manager >= 26.9.0, where \`scopedUsersV2\` exists.

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

type Story = StoryObj<typeof BAIScopedUserSelect>;

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
    scopedUsersV2: connection(mockUsers),
  }),
};

const emptyResolvers: MockResolvers = {
  Query: () => ({ scopedUsersV2: connection([]) }),
};

const domainScope: UserScope = {
  domain: [{ value: '5c3b5a9e-0000-4000-8000-0000000000d0' }],
};

const Sandbox: React.FC<
  Omit<
    ComponentProps<typeof BAIScopedUserSelect>,
    'value' | 'onChange' | 'scope'
  > & {
    scope?: UserScope;
    initialValue?: string | Array<string> | null;
    resolvers?: MockResolvers;
  }
> = ({
  scope = domainScope,
  initialValue = null,
  resolvers = mockResolvers,
  ...args
}) => {
  const [value, setValue] = useState<string | Array<string> | null | undefined>(
    initialValue,
  );
  return (
    <RelayResolver mockResolvers={resolvers}>
      <BAIScopedUserSelect
        {...args}
        scope={scope}
        value={value}
        onChange={(next) => setValue(next ?? null)}
      />
    </RelayResolver>
  );
};

export const DomainScope: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'A domain scope, as admin pages build from `useCurrentDomain()`: the users of that domain.',
      },
    },
  },
  render: (args) => <Sandbox {...args} label="User" defaultOpen />,
};

export const ProjectMembers: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'A project scope, as the project-admin session page passes: the members of that project.',
      },
    },
  },
  render: (args) => (
    <Sandbox
      {...args}
      label="Owner"
      scope={{ project: [{ value: '5c3b5a9e-0000-4000-8000-000000000001' }] }}
      defaultOpen
    />
  ),
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
