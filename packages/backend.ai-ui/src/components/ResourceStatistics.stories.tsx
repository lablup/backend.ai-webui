import ResourceStatistics from './ResourceStatistics';
import type { Meta, StoryObj } from '@storybook/react-vite';

/**
 * ResourceStatistics displays resource usage statistics (CPU, memory, accelerators).
 *
 * Key features:
 * - Shows CPU and memory statistics
 * - Supports accelerator resources (GPU, TPU, etc.)
 * - Toggleable display modes (used/free)
 * - Progress bar visualization
 * - Theme-aware styling
 *
 * @see ResourceStatistics.tsx for implementation details
 */
const meta: Meta<typeof ResourceStatistics> = {
  title: 'Statistic/ResourceStatistics',
  component: ResourceStatistics,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
**ResourceStatistics** displays resource usage statistics including CPU, memory, and accelerators.

## Features
- **CPU and Memory**: Shows CPU cores and memory usage/free
- **Accelerators**: Displays GPU, TPU, or other accelerator statistics
- **Display modes**: Toggle between 'used' and 'free' resources
- **Progress visualization**: Optional progress bars with steps
- **Precision control**: Configurable decimal precision
- **Empty state**: Shows empty message when no resources are available

## Usage
\`\`\`tsx
<ResourceStatistics
  resourceData={{
    cpu: {
      used: { current: 4, total: 8 },
      free: { current: 4, total: 8 },
      metadata: { title: 'CPU', displayUnit: 'Core' },
    },
    memory: {
      used: { current: 8, total: 16 },
      free: { current: 8, total: 16 },
      metadata: { title: 'Memory', displayUnit: 'GiB' },
    },
    accelerators: [
      {
        key: 'gpu-0',
        used: { current: 1, total: 2 },
        free: { current: 1, total: 2 },
        metadata: { title: 'GPU', displayUnit: 'GPU' },
      },
    ],
  }}
  displayType="used"
  progressMode="normal"
  precision={2}
/>
\`\`\`

## Props
| Name | Type | Default | Description |
|------|------|---------|-------------|
| \`resourceData\` | \`ResourceData\` | (required) | Resource data including CPU, memory, and accelerators |
| \`displayType\` | \`'used' \\| 'free'\` | (required) | Whether to display used or free resources |
| \`progressMode\` | \`BAIStatisticProps['progressMode']\` | \`'hidden'\` | Progress bar display mode |
| \`precision\` | \`number\` | \`2\` | Number of decimal places to show |
| \`progressSteps\` | \`number\` | - | Number of steps in progress bar |

## When to Use
- Dashboard resource monitoring
- Cluster resource overview
- Session resource allocation displays
- Resource quota visualizations
        `,
      },
    },
  },
  argTypes: {
    resourceData: {
      control: false,
      description: 'Resource data including CPU, memory, and accelerators',
      table: {
        type: { summary: 'ResourceData' },
      },
    },
    displayType: {
      control: { type: 'select' },
      options: ['used', 'free'],
      description: 'Whether to display used or free resources',
      table: {
        type: { summary: "'used' | 'free'" },
      },
    },
    progressMode: {
      control: { type: 'select' },
      options: ['hidden', 'normal', 'ghost'],
      description: 'Progress bar display mode',
      table: {
        type: { summary: "'hidden' | 'normal' | 'ghost'" },
        defaultValue: { summary: 'hidden' },
      },
    },
    precision: {
      control: { type: 'number', min: 0, max: 4, step: 1 },
      description: 'Number of decimal places to show',
      table: {
        type: { summary: 'number' },
        defaultValue: { summary: '2' },
      },
    },
    progressSteps: {
      control: { type: 'number', min: 1, max: 20, step: 1 },
      description: 'Number of steps in progress bar',
      table: {
        type: { summary: 'number' },
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof ResourceStatistics>;

export const Default: Story = {
  name: 'Basic',
  parameters: {
    docs: {
      description: {
        story: 'Basic resource statistics showing used resources.',
      },
    },
  },
  args: {
    resourceData: {
      cpu: {
        used: { current: 4, total: 8 },
        free: { current: 4, total: 8 },
        metadata: { title: 'CPU', displayUnit: 'Core' },
      },
      memory: {
        used: { current: 8, total: 16 },
        free: { current: 8, total: 16 },
        metadata: { title: 'Memory', displayUnit: 'GiB' },
      },
      accelerators: [],
    },
    displayType: 'used',
    progressMode: 'hidden',
    precision: 2,
  },
};

export const WithAccelerators: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Resource statistics including GPU and other accelerators.',
      },
    },
  },
  args: {
    resourceData: {
      cpu: {
        used: { current: 12, total: 24 },
        free: { current: 12, total: 24 },
        metadata: { title: 'CPU', displayUnit: 'Core' },
      },
      memory: {
        used: { current: 64, total: 128 },
        free: { current: 64, total: 128 },
        metadata: { title: 'Memory', displayUnit: 'GiB' },
      },
      accelerators: [
        {
          key: 'gpu-0',
          used: { current: 2, total: 4 },
          free: { current: 2, total: 4 },
          metadata: { title: 'NVIDIA GPU', displayUnit: 'GPU' },
        },
        {
          key: 'tpu-0',
          used: { current: 1, total: 2 },
          free: { current: 1, total: 2 },
          metadata: { title: 'TPU', displayUnit: 'TPU' },
        },
      ],
    },
    displayType: 'used',
    progressMode: 'normal',
    precision: 2,
  },
};

export const FreeResources: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Displaying free (available) resources instead of used resources. Free resources are shown in success color.',
      },
    },
  },
  args: {
    resourceData: {
      cpu: {
        used: { current: 6, total: 16 },
        free: { current: 10, total: 16 },
        metadata: { title: 'CPU', displayUnit: 'Core' },
      },
      memory: {
        used: { current: 32, total: 64 },
        free: { current: 32, total: 64 },
        metadata: { title: 'Memory', displayUnit: 'GiB' },
      },
      accelerators: [
        {
          key: 'gpu-0',
          used: { current: 1, total: 8 },
          free: { current: 7, total: 8 },
          metadata: { title: 'GPU', displayUnit: 'GPU' },
        },
      ],
    },
    displayType: 'free',
    progressMode: 'normal',
    precision: 2,
  },
};

export const GhostProgress: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Resource statistics with ghost progress bars showing a subtle background style.',
      },
    },
  },
  args: {
    resourceData: {
      cpu: {
        used: { current: 5, total: 8 },
        free: { current: 3, total: 8 },
        metadata: { title: 'CPU', displayUnit: 'Core' },
      },
      memory: {
        used: { current: 12, total: 16 },
        free: { current: 4, total: 16 },
        metadata: { title: 'Memory', displayUnit: 'GiB' },
      },
      accelerators: [],
    },
    displayType: 'used',
    progressMode: 'ghost',
    progressSteps: 8,
    precision: 2,
  },
};

export const EmptyState: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Empty state when no resources are available. Shows a simple empty message.',
      },
    },
  },
  args: {
    resourceData: {
      cpu: null,
      memory: null,
      accelerators: [],
    },
    displayType: 'used',
    progressMode: 'hidden',
    precision: 2,
  },
};

export const HighUtilization: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Resource statistics showing high resource utilization (near capacity).',
      },
    },
  },
  args: {
    resourceData: {
      cpu: {
        used: { current: 15, total: 16 },
        free: { current: 1, total: 16 },
        metadata: { title: 'CPU', displayUnit: 'Core' },
      },
      memory: {
        used: { current: 60, total: 64 },
        free: { current: 4, total: 64 },
        metadata: { title: 'Memory', displayUnit: 'GiB' },
      },
      accelerators: [
        {
          key: 'gpu-0',
          used: { current: 7, total: 8 },
          free: { current: 1, total: 8 },
          metadata: { title: 'GPU', displayUnit: 'GPU' },
        },
      ],
    },
    displayType: 'used',
    progressMode: 'normal',
    precision: 1,
  },
};

export const FractionalResources: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Resource statistics with fractional values showing precise resource allocation.',
      },
    },
  },
  args: {
    resourceData: {
      cpu: {
        used: { current: 2.5, total: 8 },
        free: { current: 5.5, total: 8 },
        metadata: { title: 'CPU', displayUnit: 'Core' },
      },
      memory: {
        used: { current: 12.75, total: 32 },
        free: { current: 19.25, total: 32 },
        metadata: { title: 'Memory', displayUnit: 'GiB' },
      },
      accelerators: [
        {
          key: 'gpu-0',
          used: { current: 0.5, total: 1 },
          free: { current: 0.5, total: 1 },
          metadata: { title: 'GPU', displayUnit: 'fGPU' },
        },
      ],
    },
    displayType: 'used',
    progressMode: 'normal',
    precision: 2,
  },
};
