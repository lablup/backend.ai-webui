import BAIFlex from './BAIFlex';
import BooleanTag from './BooleanTag';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta<typeof BooleanTag> = {
  title: 'Components/BooleanTag',
  component: BooleanTag,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
**BooleanTag** renders a colored tag representing a boolean value with customizable labels and fallback content.

- **True values**: Displays a green tag
- **False values**: Displays a semi-transparent default tag
- **Non-boolean values**: Renders customizable fallback content

## Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| \`value\` | \`boolean \\| null \\| undefined\` | - | The boolean value to display |
| \`trueLabel\` | \`string\` | \`'True'\` | Label shown when value is true |
| \`falseLabel\` | \`string\` | \`'False'\` | Label shown when value is false |
| \`fallback\` | \`React.ReactNode\` | \`'-'\` | Content rendered when value is not a boolean |
        `,
      },
    },
  },
  argTypes: {
    value: {
      control: { type: 'radio' },
      options: [true, false, null],
      description: 'The boolean value to display',
      table: {
        type: { summary: 'boolean | null | undefined' },
      },
    },
    trueLabel: {
      control: { type: 'text' },
      description: 'Label shown when value is true',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: "'True'" },
      },
    },
    falseLabel: {
      control: { type: 'text' },
      description: 'Label shown when value is false',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: "'False'" },
      },
    },
    fallback: {
      control: { type: 'text' },
      description: 'Content rendered when value is not a boolean',
      table: {
        type: { summary: 'React.ReactNode' },
        defaultValue: { summary: "'-'" },
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof BooleanTag>;

export const Default: Story = {
  name: 'Basic Usage',
  args: {
    value: true,
    trueLabel: 'True',
    falseLabel: 'False',
    fallback: '-',
  },
};

export const ValueStates: Story = {
  name: 'All Value States',
  parameters: {
    docs: {
      description: {
        story:
          'Shows how the component renders different value types: true, false, null, and undefined.',
      },
    },
  },
  render: () => (
    <BAIFlex direction="column" gap="md" align="start">
      <BAIFlex gap="sm" align="center">
        <span style={{ width: 120 }}>True:</span>
        <BooleanTag value={true} />
      </BAIFlex>
      <BAIFlex gap="sm" align="center">
        <span style={{ width: 120 }}>False:</span>
        <BooleanTag value={false} />
      </BAIFlex>
      <BAIFlex gap="sm" align="center">
        <span style={{ width: 120 }}>Null:</span>
        <BooleanTag value={null} />
      </BAIFlex>
      <BAIFlex gap="sm" align="center">
        <span style={{ width: 120 }}>Undefined:</span>
        <BooleanTag value={undefined} />
      </BAIFlex>
    </BAIFlex>
  ),
};

export const CustomLabels: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Demonstrates customizable labels for true/false states using trueLabel and falseLabel props.',
      },
    },
  },
  render: () => (
    <BAIFlex direction="column" gap="md" align="start">
      <BAIFlex gap="sm" align="center">
        <span style={{ width: 150 }}>Default:</span>
        <BooleanTag value={true} />
        <BooleanTag value={false} />
      </BAIFlex>
      <BAIFlex gap="sm" align="center">
        <span style={{ width: 150 }}>Yes/No:</span>
        <BooleanTag value={true} trueLabel="Yes" falseLabel="No" />
        <BooleanTag value={false} trueLabel="Yes" falseLabel="No" />
      </BAIFlex>
      <BAIFlex gap="sm" align="center">
        <span style={{ width: 150 }}>Enabled/Disabled:</span>
        <BooleanTag value={true} trueLabel="Enabled" falseLabel="Disabled" />
        <BooleanTag value={false} trueLabel="Enabled" falseLabel="Disabled" />
      </BAIFlex>
    </BAIFlex>
  ),
};

export const CustomFallback: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Shows different fallback options for non-boolean values using the fallback prop.',
      },
    },
  },
  render: () => (
    <BAIFlex direction="column" gap="md" align="start">
      <BAIFlex gap="sm" align="center">
        <span style={{ width: 150 }}>Default (-):</span>
        <BooleanTag value={null} />
      </BAIFlex>
      <BAIFlex gap="sm" align="center">
        <span style={{ width: 150 }}>Custom text:</span>
        <BooleanTag value={null} fallback="N/A" />
      </BAIFlex>
      <BAIFlex gap="sm" align="center">
        <span style={{ width: 150 }}>Custom element:</span>
        <BooleanTag
          value={undefined}
          fallback={
            <span style={{ color: 'gray', fontStyle: 'italic' }}>Unknown</span>
          }
        />
      </BAIFlex>
    </BAIFlex>
  ),
};
