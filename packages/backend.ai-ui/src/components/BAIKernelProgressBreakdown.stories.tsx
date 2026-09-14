import BAIKernelProgressBreakdown from './BAIKernelProgressBreakdown';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta<typeof BAIKernelProgressBreakdown> = {
  title: 'Feedback/BAIKernelProgressBreakdown',
  component: BAIKernelProgressBreakdown,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
**BAIKernelProgressBreakdown** is the readout behind a session status badge: \`done / total\`, a stacked bar sized \`count / total\` per bucket, and a legend.

It is purely presentational — the caller groups the kernel statuses into buckets and orders them, done bucket first. Zero-count buckets keep their legend row (muted) and draw no bar segment.

| Prop | Type | Description |
|------|------|-------------|
| \`phase\` | \`'creating' \\| 'terminating'\` | Picks the title. |
| \`total\` | \`number\` | Cluster size; denominator of the fraction and every segment. |
| \`done\` | \`number\` | Kernels that reached the phase's target status. |
| \`segments\` | \`{ status, count }[]\` | Buckets in display order. |
        `,
      },
    },
  },
  argTypes: {
    phase: {
      control: { type: 'inline-radio' },
      options: ['creating', 'terminating'],
    },
    total: { control: { type: 'number' } },
    done: { control: { type: 'number' } },
  },
};

export default meta;
type Story = StoryObj<typeof BAIKernelProgressBreakdown>;

export const Default: Story = {
  name: 'Basic',
  parameters: {
    docs: {
      description: {
        story: 'A creating session whose kernels are spread over four buckets.',
      },
    },
  },
  args: {
    phase: 'creating',
    total: 16,
    done: 5,
    segments: [
      { status: 'RUNNING', count: 5 },
      { status: 'CREATING', count: 4 },
      { status: 'PULLING', count: 3 },
      { status: 'PENDING', count: 4 },
    ],
  },
};

export const Terminating: Story = {
  name: 'Terminating, 119 of 120',
  args: {
    phase: 'terminating',
    total: 120,
    done: 119,
    segments: [
      { status: 'TERMINATED', count: 119 },
      { status: 'TERMINATING', count: 1 },
      { status: 'RUNNING', count: 0 },
    ],
  },
};

export const SingleSegment: Story = {
  name: 'Single segment',
  args: {
    phase: 'creating',
    total: 8,
    done: 0,
    segments: [
      { status: 'RUNNING', count: 0 },
      { status: 'PULLING', count: 8 },
    ],
  },
};
