import RelayResolver from '../../tests/RelayResolver';
import BAIUserSelectAstryx from './BAIUserSelectAstryx';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { ComponentProps, useState } from 'react';

/**
 * BAIUserSelectAstryx is the ticket-26 reference consumer of
 * `BAIComplexSelect`: Relay OFFSET pagination with scroll-driven `loadNext`,
 * server-side search, and `labelInValue` semantics, all behind the SAME
 * plain-key (`string`/`string[]`) value contract the antd `BAIUserSelect`
 * exposes (frontier rule — the antd wrapper is untouched).
 *
 * Storybook can't reproduce real scroll-driven pagination against a live
 * backend, so this mocks a single page's worth of users via `RelayResolver`
 * (same `relay-test-utils` pattern as `BAIUserNodes.stories.tsx`). The
 * scroll-load behavior itself is proven against a real mock Relay
 * environment in `react/theme-probe/select26.tsx` (ticket 26 measurement
 * harness), not re-derived here.
 */
const meta: Meta<typeof BAIUserSelectAstryx> = {
  title: 'Fragments/BAIUserSelectAstryx',
  component: BAIUserSelectAstryx,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
**BAIUserSelectAstryx** — the Astryx-native successor pattern the other 17 \`*SelectAstryx\` wrappers follow (ticket 27). Built on \`BAIComplexSelect\`.

- \`valuePropName\`: \`'email'\` (default) or \`'id'\` — which field is the plain-key value.
- \`filter\` / \`excludeInactive\`: composed into the Backend.AI query-filter minilang string.
- The selected-key -> label resolution query is **mandatory infrastructure** here (not a nicety, as it was for antd): the trigger reads label text from the value, and a value picked on page 1 falls out of \`options\` once \`loadNext\` pages past it.

See \`BAIComplexSelect.stories.tsx\` for the underlying popup-body component with static options.
        `,
      },
    },
  },
  argTypes: {
    value: { control: false },
    onChange: { control: false },
    multiple: { control: { type: 'boolean' } },
    valuePropName: {
      control: { type: 'select' },
      options: ['email', 'id'],
    },
  },
};

export default meta;

type Story = StoryObj<typeof BAIUserSelectAstryx>;

const mockUsers = [
  {
    id: 'VXNlck5vZGU6MQ==',
    email: 'admin@example.com',
    username: 'admin',
    full_name: 'System Administrator',
    status: 'active',
    role: 'superadmin',
  },
  {
    id: 'VXNlck5vZGU6Mg==',
    email: 'alice@example.com',
    username: 'alice',
    full_name: 'Alice Kim',
    status: 'active',
    role: 'user',
  },
  {
    id: 'VXNlck5vZGU6Mw==',
    email: 'bob@example.com',
    username: 'bob',
    full_name: 'Bob Lee',
    status: 'active',
    role: 'user',
  },
  {
    id: 'VXNlck5vZGU6NA==',
    email: 'carol@example.com',
    username: 'carol',
    full_name: 'Carol Park',
    status: 'active',
    role: 'user',
  },
  {
    id: 'VXNlck5vZGU6NQ==',
    email: 'dave@example.com',
    username: 'dave',
    full_name: 'Dave Choi',
    status: 'inactive',
    role: 'user',
  },
];
const mockEdges = mockUsers.map((node) => ({ node }));

const mockResolvers = {
  Query: () => ({
    user_nodes: { count: mockUsers.length, edges: mockEdges },
  }),
};

const Sandbox: React.FC<
  Omit<ComponentProps<typeof BAIUserSelectAstryx>, 'value' | 'onChange'> & {
    initialValue?: string | Array<string> | null;
  }
> = ({ initialValue = null, ...args }) => {
  const [value, setValue] = useState<string | Array<string> | null | undefined>(
    initialValue,
  );
  return (
    <RelayResolver mockResolvers={mockResolvers}>
      <BAIUserSelectAstryx
        {...args}
        value={value}
        onChange={(next) => setValue(next ?? null)}
      />
    </RelayResolver>
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
          '`excludeInactive` composes `status == "active"` into the query filter.',
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
          '`valuePropName="id"` — the plain-key value is the local (decoded) node id instead of the email.',
      },
    },
  },
  render: (args) => <Sandbox {...args} label="User" valuePropName="id" />,
};
