import BAIFlex from './BAIFlex';
import BAISchedulingResultBadge, {
  SchedulingResult,
} from './BAISchedulingResultBadge';
import type { Meta, StoryObj } from '@storybook/react-vite';

/**
 * BAISchedulingResultBadge displays scheduling result status using colored badges.
 *
 * Key features:
 * - Color-coded status indicators (green for success, red for failure, orange for stale)
 * - Simple presentational component with no Relay dependency
 * - Extends Ant Design Badge with scheduling-specific styling
 */
const meta: Meta<typeof BAISchedulingResultBadge> = {
  title: 'Badge/BAISchedulingResultBadge',
  component: BAISchedulingResultBadge,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
**BAISchedulingResultBadge** displays scheduling result status with color-coded badges.

## Features
- Color-coded status: SUCCESS (green), FAILURE (red), STALE (orange)
- Lightweight presentational component
- Based on Ant Design Badge

## Props
| Name | Type | Default | Description |
|------|------|---------|-------------|
| result | \`'SUCCESS' \\| 'FAILURE' \\| 'STALE' \\| null\` | - | The scheduling result to display |

## Usage
\`\`\`tsx
<BAISchedulingResultBadge result="SUCCESS" />
<BAISchedulingResultBadge result="FAILURE" />
<BAISchedulingResultBadge result="STALE" />
\`\`\`
        `,
      },
    },
  },
  argTypes: {
    result: {
      control: { type: 'select' },
      options: ['SUCCESS', 'FAILURE', 'STALE', null],
      description: 'The scheduling result status to display',
      table: {
        type: { summary: "'SUCCESS' | 'FAILURE' | 'STALE' | null" },
        defaultValue: { summary: 'undefined' },
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof BAISchedulingResultBadge>;

/**
 * Default state showing a successful scheduling result.
 */
export const Default: Story = {
  name: 'Basic',
  parameters: {
    docs: {
      description: {
        story:
          'Basic usage showing a successful scheduling result with a green badge.',
      },
    },
  },
  args: {
    result: 'SUCCESS',
  },
};

/**
 * Failure state showing a failed scheduling result.
 */
export const Failure: Story = {
  name: 'FailureState',
  parameters: {
    docs: {
      description: {
        story: 'Shows a failed scheduling result with a red badge.',
      },
    },
  },
  args: {
    result: 'FAILURE',
  },
};

/**
 * Stale state showing an outdated scheduling result.
 */
export const Stale: Story = {
  name: 'StaleState',
  parameters: {
    docs: {
      description: {
        story: 'Shows a stale scheduling result with an orange badge.',
      },
    },
  },
  args: {
    result: 'STALE',
  },
};

/**
 * Display all status variants side by side for comparison.
 */
export const AllStatuses: Story = {
  name: 'AllStatuses',
  parameters: {
    docs: {
      description: {
        story:
          'Displays all available scheduling result statuses for comparison.',
      },
    },
  },
  render: () => {
    const statuses: SchedulingResult[] = ['SUCCESS', 'FAILURE', 'STALE'];

    return (
      <BAIFlex direction="column" gap="md">
        {statuses.map((status) => (
          <BAIFlex key={status} gap="sm" align="center">
            <span style={{ width: 80 }}>{status}:</span>
            <BAISchedulingResultBadge result={status} />
          </BAIFlex>
        ))}
        <BAIFlex gap="sm" align="center">
          <span style={{ width: 80 }}>null:</span>
          <BAISchedulingResultBadge result={null} />
        </BAIFlex>
      </BAIFlex>
    );
  },
};
