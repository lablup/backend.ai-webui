import BAIFlex from './BAIFlex';
import BAISchedulingResultBadge, {
  SchedulingResult,
} from './BAISchedulingResultBadge';
import type { Meta, StoryObj } from '@storybook/react-vite';

/**
 * BAISchedulingResultBadge displays scheduling result status using semantic color-coded badges.
 *
 * Key features:
 * - Semantic color system: success (green), warning (orange), error (red), default (grey)
 * - Colors automatically adapt to light/dark theme via Ant Design design tokens
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
**BAISchedulingResultBadge** displays scheduling result status with semantic color-coded badges.

## Features
- Semantic color system using Ant Design design tokens (theme-aware)
- SUCCESS → success (green)
- FAILURE / EXPIRED / GIVE_UP → error (red)
- NEED_RETRY → warning (orange)
- STALE / SKIPPED → default (grey)

## Props
| Name | Type | Default | Description |
|------|------|---------|-------------|
| result | \`SchedulingResult \\| null\` | - | The scheduling result to display |

## Usage
\`\`\`tsx
<BAISchedulingResultBadge result="SUCCESS" />
<BAISchedulingResultBadge result="NEED_RETRY" />
<BAISchedulingResultBadge result="SKIPPED" />
\`\`\`
        `,
      },
    },
  },
  argTypes: {
    result: {
      control: { type: 'select' },
      options: [
        'SUCCESS',
        'FAILURE',
        'STALE',
        'NEED_RETRY',
        'EXPIRED',
        'GIVE_UP',
        'SKIPPED',
        null,
      ],
      description: 'The scheduling result status to display',
      table: {
        type: {
          summary:
            "'SUCCESS' | 'FAILURE' | 'STALE' | 'NEED_RETRY' | 'EXPIRED' | 'GIVE_UP' | 'SKIPPED' | null",
        },
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
 * Stale state — outdated result with no action taken, shown in grey.
 */
export const Stale: Story = {
  name: 'StaleState',
  parameters: {
    docs: {
      description: {
        story:
          'Shows a stale scheduling result with a grey badge (default semantic color), indicating an inactive or outdated state.',
      },
    },
  },
  args: {
    result: 'STALE',
  },
};

/**
 * NeedRetry state — scheduling will be retried, shown in orange.
 */
export const NeedRetry: Story = {
  name: 'NeedRetryState',
  parameters: {
    docs: {
      description: {
        story:
          'Shows a need-retry result with a warning (orange) badge, indicating the scheduling attempt will be retried.',
      },
    },
  },
  args: {
    result: 'NEED_RETRY',
  },
};

/**
 * Expired state — scheduling timed out, shown in red.
 */
export const Expired: Story = {
  name: 'ExpiredState',
  parameters: {
    docs: {
      description: {
        story: 'Shows an expired scheduling result with a red badge.',
      },
    },
  },
  args: {
    result: 'EXPIRED',
  },
};

/**
 * GiveUp state — scheduling was abandoned after exhausting retries, shown in red.
 */
export const GiveUp: Story = {
  name: 'GiveUpState',
  parameters: {
    docs: {
      description: {
        story:
          'Shows a give-up scheduling result with a red badge, indicating all retry attempts were exhausted.',
      },
    },
  },
  args: {
    result: 'GIVE_UP',
  },
};

/**
 * Skipped state — scheduling was skipped without processing, shown in grey.
 */
export const Skipped: Story = {
  name: 'SkippedState',
  parameters: {
    docs: {
      description: {
        story:
          'Shows a skipped scheduling result with a grey badge (default semantic color), indicating no processing occurred.',
      },
    },
  },
  args: {
    result: 'SKIPPED',
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
          'Displays all available scheduling result statuses for comparison. Colors are derived from Ant Design semantic tokens and adapt to the active theme.',
      },
    },
  },
  render: () => {
    const statuses: SchedulingResult[] = [
      'SUCCESS',
      'FAILURE',
      'STALE',
      'NEED_RETRY',
      'EXPIRED',
      'GIVE_UP',
      'SKIPPED',
    ];

    return (
      <BAIFlex direction="column" gap="md">
        {statuses.map((status) => (
          <BAISchedulingResultBadge key={status} result={status} />
        ))}
        <BAISchedulingResultBadge result={null} />
      </BAIFlex>
    );
  },
};
