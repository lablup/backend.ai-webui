import BAIAuditLogStatusTag, { AuditLogStatus } from './BAIAuditLogStatusTag';
import BAIFlex from './BAIFlex';
import type { Meta, StoryObj } from '@storybook/react-vite';

/**
 * BAIAuditLogStatusTag displays an audit log entry's status using a semantic
 * color-coded badge.
 *
 * Key features:
 * - Semantic color system: success (green), error (red), info (blue), outline (unknown)
 * - `RUNNING` adds a processing (ripple) animation
 * - Colors automatically adapt to light/dark theme via Ant Design design tokens
 * - Simple presentational component with no Relay dependency
 */
const meta: Meta<typeof BAIAuditLogStatusTag> = {
  title: 'Badge/BAIAuditLogStatusTag',
  component: BAIAuditLogStatusTag,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
**BAIAuditLogStatusTag** displays an audit log status with a semantic color-coded badge.

## Features
- Semantic color system using Ant Design design tokens (theme-aware)
- SUCCESS → success (green)
- ERROR → error (red)
- RUNNING → info (blue) with a processing ripple
- UNKNOWN → outline-only dot (indeterminate)

## Props
| Name | Type | Default | Description |
|------|------|---------|-------------|
| status | \`AuditLogStatus \\| null\` | - | The audit log status to display |

## Usage
\`\`\`tsx
<BAIAuditLogStatusTag status="SUCCESS" />
<BAIAuditLogStatusTag status="ERROR" />
<BAIAuditLogStatusTag status="RUNNING" />
<BAIAuditLogStatusTag status="UNKNOWN" />
\`\`\`
        `,
      },
    },
  },
  argTypes: {
    status: {
      control: { type: 'select' },
      options: ['SUCCESS', 'ERROR', 'RUNNING', 'UNKNOWN', null],
      description: 'The audit log status to display',
      table: {
        type: {
          summary: "'SUCCESS' | 'ERROR' | 'RUNNING' | 'UNKNOWN' | null",
        },
        defaultValue: { summary: 'undefined' },
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof BAIAuditLogStatusTag>;

/**
 * Default state showing a successful operation.
 */
export const Default: Story = {
  name: 'Basic',
  parameters: {
    docs: {
      description: {
        story:
          'Basic usage showing a successful audit log entry with a green badge.',
      },
    },
  },
  args: {
    status: 'SUCCESS',
  },
};

/**
 * Error state — the operation failed, shown in red.
 */
export const Error: Story = {
  name: 'ErrorState',
  parameters: {
    docs: {
      description: {
        story: 'Shows a failed audit log entry with a red badge.',
      },
    },
  },
  args: {
    status: 'ERROR',
  },
};

/**
 * Running state — the operation is in progress, shown in blue with a ripple.
 */
export const Running: Story = {
  name: 'RunningState',
  parameters: {
    docs: {
      description: {
        story:
          'Shows an in-progress audit log entry with a blue (info) badge and a processing ripple animation.',
      },
    },
  },
  args: {
    status: 'RUNNING',
  },
};

/**
 * Unknown state — indeterminate status, shown as an outline-only dot.
 */
export const Unknown: Story = {
  name: 'UnknownState',
  parameters: {
    docs: {
      description: {
        story:
          'Shows an unknown audit log status as an outline-only dot, indicating an indeterminate state.',
      },
    },
  },
  args: {
    status: 'UNKNOWN',
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
          'Displays all available audit log statuses for comparison. Colors are derived from Ant Design semantic tokens and adapt to the active theme.',
      },
    },
  },
  render: () => {
    const statuses: AuditLogStatus[] = [
      'SUCCESS',
      'ERROR',
      'RUNNING',
      'UNKNOWN',
    ];

    return (
      <BAIFlex direction="column" gap="md">
        {statuses.map((status) => (
          <BAIAuditLogStatusTag key={status} status={status} />
        ))}
        <BAIAuditLogStatusTag status={null} />
      </BAIFlex>
    );
  },
};
