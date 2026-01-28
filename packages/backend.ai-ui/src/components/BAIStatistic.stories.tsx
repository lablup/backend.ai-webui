import BAIFlex from './BAIFlex';
import BAIStatistic from './BAIStatistic';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta<typeof BAIStatistic> = {
  title: 'Statistic/BAIStatistic',
  component: BAIStatistic,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
**BAIStatistic** is a statistic display component for showing numerical metrics with optional progress bars.

## Features
- Displays current/total statistics with customizable units
- Supports infinity values with custom display text
- Multiple progress bar modes (normal, ghost, hidden)
- Configurable precision for decimal numbers
- Automatic percentage calculation for progress
- Tooltip support for progress bars

## Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| \`title\` | \`ReactNode\` | - | Statistic title |
| \`current\` | \`number\` | - | Current value |
| \`total\` | \`number\` | - | Total value (for percentage calculation) |
| \`unit\` | \`string\` | \`''\` | Unit label (e.g., 'GB', 'sessions') |
| \`precision\` | \`number\` | \`2\` | Decimal precision |
| \`infinityDisplay\` | \`string\` | \`'∞'\` | Text to display for infinity values |
| \`progressMode\` | \`'ghost' \\| 'hidden' \\| 'normal'\` | \`'hidden'\` | Progress bar display mode |
| \`progressSteps\` | \`number\` | \`20\` | Number of steps in progress bar |
| \`style\` | \`CSSProperties\` | - | Custom styles (color affects value and progress) |

This is a BAI-specific component (not extending Ant Design).
        `,
      },
    },
  },
  argTypes: {
    title: {
      control: { type: 'text' },
      description: 'Statistic title',
      table: {
        type: { summary: 'ReactNode' },
      },
    },
    current: {
      control: { type: 'number' },
      description: 'Current value',
      table: {
        type: { summary: 'number' },
      },
    },
    total: {
      control: { type: 'number' },
      description: 'Total value (for percentage calculation)',
      table: {
        type: { summary: 'number' },
      },
    },
    unit: {
      control: { type: 'text' },
      description: 'Unit label',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: "''" },
      },
    },
    precision: {
      control: { type: 'number' },
      description: 'Decimal precision',
      table: {
        type: { summary: 'number' },
        defaultValue: { summary: '2' },
      },
    },
    infinityDisplay: {
      control: { type: 'text' },
      description: 'Text to display for infinity values',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: "'∞'" },
      },
    },
    progressMode: {
      control: { type: 'select' },
      options: ['hidden', 'normal', 'ghost'],
      description: 'Progress bar display mode',
      table: {
        type: { summary: "'ghost' | 'hidden' | 'normal'" },
        defaultValue: { summary: "'hidden'" },
      },
    },
    progressSteps: {
      control: { type: 'number' },
      description: 'Number of steps in progress bar',
      table: {
        type: { summary: 'number' },
        defaultValue: { summary: '20' },
      },
    },
    style: {
      control: false,
      description: 'Custom styles',
      table: {
        type: { summary: 'CSSProperties' },
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof BAIStatistic>;

export const Default: Story = {
  args: {
    title: 'CPU Usage',
    current: 45.5,
    total: 100,
    unit: 'cores',
    progressMode: 'normal',
  },
};

export const ProgressModes: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'BAIStatistic supports three progress modes: `normal` (with tooltip), `ghost` (placeholder), and `hidden` (no progress bar).',
      },
    },
  },
  render: () => (
    <BAIFlex gap="xl" wrap="wrap">
      <BAIStatistic
        title="Normal Mode"
        current={75}
        total={100}
        unit="GB"
        progressMode="normal"
      />
      <BAIStatistic
        title="Ghost Mode"
        current={75}
        total={100}
        unit="GB"
        progressMode="ghost"
      />
      <BAIStatistic
        title="Hidden Mode"
        current={75}
        total={100}
        unit="GB"
        progressMode="hidden"
      />
    </BAIFlex>
  ),
};

export const InfinityValue: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'When `current` is `Infinity`, displays custom text (default: "∞" or "Unlimited"). Use `infinityDisplay` to customize.',
      },
    },
  },
  render: () => (
    <BAIFlex gap="xl" wrap="wrap">
      <BAIStatistic title="Memory Limit" current={Infinity} unit="GB" />
      <BAIStatistic
        title="Storage Quota"
        current={Infinity}
        unit="TB"
        infinityDisplay="No Limit"
      />
    </BAIFlex>
  ),
};

export const Precision: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Control decimal precision using the `precision` prop. Trailing zeros are automatically removed.',
      },
    },
  },
  render: () => (
    <BAIFlex gap="xl" wrap="wrap">
      <BAIStatistic
        title="Default Precision (2)"
        current={12.3456}
        unit="GB"
        precision={2}
        progressMode="normal"
        total={100}
      />
      <BAIStatistic
        title="High Precision (4)"
        current={12.3456}
        unit="GB"
        precision={4}
        progressMode="normal"
        total={100}
      />
      <BAIStatistic
        title="No Decimal (0)"
        current={12.3456}
        unit="GB"
        precision={0}
        progressMode="normal"
        total={100}
      />
    </BAIFlex>
  ),
};

export const CustomStyling: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Use `style` prop to customize appearance. The `color` property affects both the value text and progress bar.',
      },
    },
  },
  render: () => (
    <BAIFlex gap="xl" wrap="wrap">
      <BAIStatistic
        title="Success State"
        current={25}
        total={100}
        unit="sessions"
        progressMode="normal"
        style={{ color: '#52c41a' }}
      />
      <BAIStatistic
        title="Warning State"
        current={75}
        total={100}
        unit="sessions"
        progressMode="normal"
        style={{ color: '#faad14' }}
      />
      <BAIStatistic
        title="Danger State"
        current={95}
        total={100}
        unit="sessions"
        progressMode="normal"
        style={{ color: '#ff4d4f' }}
      />
    </BAIFlex>
  ),
};

export const ProgressSteps: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Customize the number of progress bar steps using `progressSteps` prop.',
      },
    },
  },
  render: () => (
    <BAIFlex gap="xl" wrap="wrap">
      <BAIStatistic
        title="5 Steps"
        current={60}
        total={100}
        unit="%"
        progressMode="normal"
        progressSteps={5}
      />
      <BAIStatistic
        title="10 Steps"
        current={60}
        total={100}
        unit="%"
        progressMode="normal"
        progressSteps={10}
      />
      <BAIStatistic
        title="20 Steps (Default)"
        current={60}
        total={100}
        unit="%"
        progressMode="normal"
        progressSteps={20}
      />
    </BAIFlex>
  ),
};

export const RealWorldExamples: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Real-world usage examples showing different metric types commonly found in Backend.AI.',
      },
    },
  },
  render: () => (
    <BAIFlex gap="xl" wrap="wrap">
      <BAIStatistic
        title="Active Sessions"
        current={8}
        total={50}
        unit="sessions"
        progressMode="normal"
      />
      <BAIStatistic
        title="GPU Memory"
        current={15.75}
        total={32}
        unit="GB"
        progressMode="normal"
        style={{ color: '#1890ff' }}
      />
      <BAIStatistic
        title="Storage Used"
        current={256.8}
        total={1000}
        unit="GB"
        progressMode="normal"
        precision={1}
      />
      <BAIStatistic
        title="CPU Cores"
        current={Infinity}
        unit="cores"
        progressMode="hidden"
      />
    </BAIFlex>
  ),
};
