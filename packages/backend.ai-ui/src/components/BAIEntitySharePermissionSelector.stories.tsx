import BAIEntitySharePermissionSelector, {
  type BAIEntitySharePermissionBit,
  type BAIEntitySharePermissionChoice,
  useEntitySharePermissionLabels,
} from './BAIEntitySharePermissionSelector';
import { VStack } from '@lablup/ui-common/Stack';
import { Text } from '@lablup/ui-common/Text';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';

/**
 * `BAIEntitySharePermissionSelector` picks the permission cap an entity share
 * carries — the `permissions` list of `PermissionBit`s `createEntityShare`
 * takes. Three presets as radio rows, a divider, and a Custom submenu with one
 * checkbox per bit; the value is always the bit list.
 */
const meta: Meta<typeof BAIEntitySharePermissionSelector> = {
  title: 'Select/BAIEntitySharePermissionSelector',
  component: BAIEntitySharePermissionSelector,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
**BAIEntitySharePermissionSelector** is a \`DropdownMenu\` in compound mode inside an Astryx \`Field\`.

- **Presets** (radio rows): Full access → \`CREATE, READ, UPDATE, SOFT_DELETE, HARD_DELETE\`; Read & write → \`READ, UPDATE, SOFT_DELETE\`; Read only → \`READ\`. Picking one commits its set and closes the menu.
- **Custom** (submenu, opens on hover / Right arrow / click): one checkbox per bit, tagged \`C\` / \`R\` / \`U\` / \`Soft-D\` / \`Hard-D\`. Each toggle commits exactly the checked bits and keeps the flyout open; the last checked bit cannot be unchecked, because an empty list means "no ceiling" on the server.
- The trigger reads the preset the bits match, or **Custom** when they match none — the preset is derived from the value, never stored.

The mount permission (\`NONE\` / \`READ_ONLY\` / \`READ_WRITE\`, a vfolder mount policy) is a separate axis with its own selector.
        `,
      },
    },
  },
  argTypes: {
    value: { control: false },
    defaultValue: { control: false },
    onChange: { control: false },
    size: { control: { type: 'select' }, options: ['sm', 'md', 'lg'] },
    variant: { control: { type: 'select' }, options: ['secondary', 'ghost'] },
    isDisabled: { control: { type: 'boolean' } },
    isLabelHidden: { control: { type: 'boolean' } },
  },
  args: {
    label: 'Permission',
    width: 200,
  },
};

export default meta;

type Story = StoryObj<typeof BAIEntitySharePermissionSelector>;

const Controlled: React.FC<
  React.ComponentProps<typeof BAIEntitySharePermissionSelector> & {
    initial?: Array<BAIEntitySharePermissionBit>;
  }
> = ({ initial = ['READ'], ...args }) => {
  const [bits, setBits] = useState<Array<BAIEntitySharePermissionBit>>(initial);
  const [choice, setChoice] = useState<BAIEntitySharePermissionChoice | null>(
    null,
  );
  const { summary } = useEntitySharePermissionLabels();
  return (
    <VStack gap={3} align="start">
      <BAIEntitySharePermissionSelector
        {...args}
        value={bits}
        onChange={(next, nextChoice) => {
          setBits(next);
          setChoice(nextChoice);
        }}
      />
      <Text type="supporting" color="secondary">
        permissions: [{bits.join(', ')}] · summary: {summary(bits)}
        {choice ? ` · last choice: ${choice}` : ''}
      </Text>
    </VStack>
  );
};

export const Default: Story = {
  name: 'Read only (default)',
  parameters: {
    docs: {
      description: {
        story:
          'Starts on the Read only preset. Open the menu and pick a preset, or hover Custom to toggle individual bits.',
      },
    },
  },
  render: (args) => <Controlled {...args} />,
};

export const CustomBits: Story = {
  name: 'Custom bits',
  parameters: {
    docs: {
      description: {
        story:
          'A value that matches no preset reads "Custom" on the trigger, and the Custom row lists the checked codes.',
      },
    },
  },
  render: (args) => <Controlled {...args} initial={['READ', 'UPDATE']} />,
};

export const FullAccess: Story = {
  name: 'Full access',
  render: (args) => (
    <Controlled
      {...args}
      initial={['CREATE', 'READ', 'UPDATE', 'SOFT_DELETE', 'HARD_DELETE']}
    />
  ),
};

export const Uncontrolled: Story = {
  name: 'Uncontrolled with defaultValue',
  parameters: {
    docs: {
      description: {
        story:
          'Without `value` the selector keeps the bits itself and only reports them through `onChange`.',
      },
    },
  },
  args: {
    defaultValue: ['READ', 'UPDATE', 'SOFT_DELETE'],
  },
};

export const Ghost: Story = {
  name: 'Ghost trigger, label hidden',
  parameters: {
    docs: {
      description: {
        story:
          'The toolbar treatment: a borderless trigger with the label kept for assistive technology only, as a table cell would use it.',
      },
    },
  },
  args: {
    variant: 'ghost',
    isLabelHidden: true,
    width: undefined,
  },
  render: (args) => <Controlled {...args} />,
};

export const Disabled: Story = {
  args: {
    isDisabled: true,
  },
  render: (args) => <Controlled {...args} />,
};

export const WithStatus: Story = {
  name: 'With an error status',
  args: {
    status: { type: 'error', message: 'Pick at least Read' },
  },
  render: (args) => <Controlled {...args} />,
};
