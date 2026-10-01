import RelayResolver from '../../tests/RelayResolver';
import {
  locales,
  mockAnonymousClientFactory,
} from '../../tests/storybook-mock-utils';
import type { BAIClient } from '../provider/BAIClientProvider';
import { BAIConfigProvider } from '../provider/BAIConfigProvider';
import BAIAdminUserSelect from './BAIAdminUserSelect';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { ComponentProps, useState } from 'react';
import type { MockResolvers } from 'relay-test-utils';

const clientPromise = Promise.resolve({
  _config: { domainName: 'default' },
} as unknown as BAIClient);

const meta: Meta<typeof BAIAdminUserSelect> = {
  title: 'Fragments/BAIAdminUserSelect',
  component: BAIAdminUserSelect,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
**BAIAdminUserSelect** — the user picker for the admin menu: every user of the signed-in admin's domain. Shares its list, search and value handling with \`BAIUserSelect\`.

- Resolves the domain name to its UUID through \`domainV2\`, then pages \`scopedUsersV2\` with a domain scope.
- Takes no scope prop: a super-admin and a domain admin both get their own domain (the WebUI assumes a single domain).
- Needs a manager >= 26.9.0, where \`scopedUsersV2\` and \`DomainV2.entityId\` exist.
        `,
      },
    },
  },
  decorators: [
    (Story, context) => (
      <BAIConfigProvider
        locale={locales[context.globals.locale] || locales.en}
        clientPromise={clientPromise}
        anonymousClientFactory={mockAnonymousClientFactory}
      >
        <Story />
      </BAIConfigProvider>
    ),
  ],
  argTypes: {
    value: { control: false },
    onChange: { control: false },
    filter: { control: false },
    multiple: { control: { type: 'boolean' } },
    valuePropName: {
      control: { type: 'select' },
      options: ['email', 'id'],
    },
  },
};

export default meta;

type Story = StoryObj<typeof BAIAdminUserSelect>;

const mockUsers = [
  {
    id: 'VXNlclYyOjE=',
    basicInfo: { email: 'admin@example.com', fullName: 'System Administrator' },
  },
  {
    id: 'VXNlclYyOjI=',
    basicInfo: { email: 'alice@example.com', fullName: 'Alice Kim' },
  },
  {
    id: 'VXNlclYyOjM=',
    basicInfo: { email: 'bob@example.com', fullName: 'Bob Lee' },
  },
];

const mockResolvers: MockResolvers = {
  Query: () => ({
    domainV2: { entityId: '5c3b5a9e-0000-4000-8000-0000000000d0' },
    scopedUsersV2: {
      count: mockUsers.length,
      edges: mockUsers.map((node) => ({ node })),
    },
  }),
};

const Sandbox: React.FC<
  Omit<ComponentProps<typeof BAIAdminUserSelect>, 'value' | 'onChange'>
> = (args) => {
  const [value, setValue] = useState<string | Array<string> | null>(null);
  return (
    <RelayResolver mockResolvers={mockResolvers}>
      <BAIAdminUserSelect
        {...args}
        value={value}
        onChange={(next) => setValue(next ?? null)}
      />
    </RelayResolver>
  );
};

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story: "Every user of the signed-in admin's domain.",
      },
    },
  },
  render: (args) => <Sandbox {...args} label="User" defaultOpen />,
};

export const MultipleById: Story = {
  name: 'Multiple, ID-valued',
  parameters: {
    docs: {
      description: {
        story:
          'The assign-role modal shape: several users, keyed by local UUID for `adminBulkAssignRole`.',
      },
    },
  },
  render: (args) => (
    <Sandbox {...args} label="Users" multiple valuePropName="id" />
  ),
};
