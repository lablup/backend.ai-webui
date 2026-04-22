/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import ReplicaStatusTag from './ReplicaStatusTag';
import type { Meta, StoryObj } from '@storybook/react-vite';

/**
 * ReplicaStatusTag displays the health/lifecycle state of a deployment replica
 * using the BAI design system semantic colors and an optional tooltip.
 *
 * Health states: HEALTHY, UNHEALTHY, DEGRADED, NOT_CHECKED
 * Lifecycle states: PROVISIONING, TERMINATING, TERMINATED
 */
const meta: Meta<typeof ReplicaStatusTag> = {
  title: 'Components/ReplicaStatusTag',
  component: ReplicaStatusTag,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    reactDocgen: false,
    docs: {
      description: {
        component: `
**ReplicaStatusTag** visualises the current state of a deployment replica.

## Status → color mapping

| Status         | Color       | Processing | Notes                                      |
|----------------|-------------|------------|--------------------------------------------|
| HEALTHY        | success     | no         | Replica is healthy and serving traffic.    |
| UNHEALTHY      | error       | no         | Replica confirmed unhealthy.               |
| DEGRADED       | warning     | no         | Health checker cannot reach replica.       |
| NOT_CHECKED    | (outline)   | no         | Within initial delay period.               |
| PROVISIONING   | info        | yes        | Replica is being provisioned.              |
| TERMINATING    | warning     | yes        | Replica is being terminated.               |
| TERMINATED     | default     | no         | Replica has been terminated.               |

When \`showTooltip\` is \`true\` (default), a tooltip explaining the state is
rendered on hover. Set \`showTooltip={false}\` to render just the badge.
        `,
      },
    },
  },
  argTypes: {
    status: {
      control: { type: 'select' },
      options: [
        'HEALTHY',
        'UNHEALTHY',
        'DEGRADED',
        'NOT_CHECKED',
        'PROVISIONING',
        'TERMINATING',
        'TERMINATED',
      ],
      description: 'Replica health or lifecycle state.',
    },
    showTooltip: {
      control: { type: 'boolean' },
      description:
        'Whether to wrap the badge in a tooltip explaining the state.',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'true' },
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof ReplicaStatusTag>;

/**
 * HEALTHY — success (green) dot with tooltip.
 */
export const Healthy: Story = {
  name: 'Basic',
  args: {
    status: 'HEALTHY',
  },
  parameters: {
    docs: {
      description: {
        story:
          'Healthy replica: success (green) dot with an explanatory tooltip on hover.',
      },
    },
  },
};

/**
 * UNHEALTHY — error (red) dot.
 */
export const Unhealthy: Story = {
  args: {
    status: 'UNHEALTHY',
  },
  parameters: {
    docs: {
      description: {
        story:
          'Unhealthy replica after consecutive health check failures. Excluded from the Active Pool.',
      },
    },
  },
};

/**
 * DEGRADED — warning (orange) dot.
 */
export const Degraded: Story = {
  args: {
    status: 'DEGRADED',
  },
  parameters: {
    docs: {
      description: {
        story:
          'Degraded replica. The health checker cannot reach this replica and it is temporarily excluded from the Active Pool.',
      },
    },
  },
};

/**
 * NOT_CHECKED — outline-only dot indicating an unknown/indeterminate state.
 */
export const NotChecked: Story = {
  args: {
    status: 'NOT_CHECKED',
  },
  parameters: {
    docs: {
      description: {
        story:
          'Replica within the initial delay period, awaiting the first health check. Renders as an outline-only dot to indicate an indeterminate state.',
      },
    },
  },
};

/**
 * PROVISIONING — info (blue) dot with processing animation.
 */
export const Provisioning: Story = {
  args: {
    status: 'PROVISIONING',
  },
  parameters: {
    docs: {
      description: {
        story:
          'Replica is being provisioned. Uses info (blue) color with a ripple animation to signal an in-progress transition.',
      },
    },
  },
};

/**
 * TERMINATING — warning (orange) dot with processing animation.
 */
export const Terminating: Story = {
  args: {
    status: 'TERMINATING',
  },
  parameters: {
    docs: {
      description: {
        story:
          'Replica is being terminated. Uses warning color with a ripple animation.',
      },
    },
  },
};

/**
 * TERMINATED — default (grey) dot.
 */
export const Terminated: Story = {
  args: {
    status: 'TERMINATED',
  },
  parameters: {
    docs: {
      description: {
        story:
          'Replica has been terminated. Rendered with the neutral default (grey) color.',
      },
    },
  },
};

/**
 * Same HEALTHY badge but with the tooltip disabled.
 */
export const WithoutTooltip: Story = {
  args: {
    status: 'HEALTHY',
    showTooltip: false,
  },
  parameters: {
    docs: {
      description: {
        story:
          'Renders the badge without the explanatory tooltip. Useful in dense tables where the status column header already describes the state.',
      },
    },
  },
};
