import BAITestComponent from './BAITestComponent';
import type { Meta, StoryObj } from '@storybook/react-vite';

/**
 * BAITestComponent is a simple text component for testing workflow validation.
 *
 * Key features:
 * - Customizable message display
 * - Bold text option
 * - Size variants (small, medium, large)
 */
const meta: Meta<typeof BAITestComponent> = {
  title: 'Components/BAITestComponent',
  component: BAITestComponent,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
**BAITestComponent** is a test component for Storybook coverage workflow validation.

## Features
- Customizable message text
- Bold text styling option
- Three size variants: small, medium, large

## Props
| Name | Type | Default | Description |
|------|------|---------|-------------|
| message | \`string\` | \`'Hello from BAITestComponent'\` | Text message to display |
| bold | \`boolean\` | \`false\` | Whether to show text in bold |
| size | \`'small' \\| 'medium' \\| 'large'\` | \`'medium'\` | Size of the text |
        `,
      },
    },
  },
  argTypes: {
    message: {
      control: { type: 'text' },
      description: 'Test message to display',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: "'Hello from BAITestComponent'" },
      },
    },
    bold: {
      control: { type: 'boolean' },
      description: 'Whether to show in bold',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
    size: {
      control: { type: 'select' },
      options: ['small', 'medium', 'large'],
      description: 'Size of the text',
      table: {
        type: { summary: "'small' | 'medium' | 'large'" },
        defaultValue: { summary: "'medium'" },
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof BAITestComponent>;

/**
 * Basic usage with default props.
 */
export const Default: Story = {
  name: 'Basic',
  parameters: {
    docs: {
      description: {
        story: 'Basic usage of BAITestComponent with default props.',
      },
    },
  },
  args: {
    message: 'Hello from BAITestComponent',
  },
};

/**
 * Bold text variant.
 */
export const Bold: Story = {
  name: 'BoldText',
  parameters: {
    docs: {
      description: {
        story: 'Text displayed in bold style.',
      },
    },
  },
  args: {
    message: 'This is bold text',
    bold: true,
  },
};

/**
 * All size variants displayed together.
 */
export const SizeVariants: Story = {
  name: 'AllSizes',
  parameters: {
    docs: {
      description: {
        story:
          'Displays all available size variants: small, medium, and large.',
      },
    },
  },
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <BAITestComponent message="Small size" size="small" />
      <BAITestComponent message="Medium size (default)" size="medium" />
      <BAITestComponent message="Large size" size="large" />
    </div>
  ),
};
