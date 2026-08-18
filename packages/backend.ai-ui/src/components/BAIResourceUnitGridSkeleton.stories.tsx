import BAIResourceUnitGridSkeleton from './BAIResourceUnitGridSkeleton';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta<typeof BAIResourceUnitGridSkeleton> = {
  title: 'Data Display/BAIResourceUnitGridSkeleton',
  component: BAIResourceUnitGridSkeleton,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
**BAIResourceUnitGridSkeleton** is the Suspense fallback for
[BAIResourceUnitGrid](?path=/docs/data-display-bairesourceunitgrid--docs): a
toolbar row, a legend row, and a deliberately low-fidelity lattice stand-in
(two blocks per row) — per-session plates and cells would read as false
detail while loading.

\`\`\`tsx
<Suspense fallback={<BAIResourceUnitGridSkeleton />}>
  <SessionResourceGrid ... />
</Suspense>
\`\`\`
        `,
      },
    },
  },
  argTypes: {
    rows: {
      control: { type: 'number', min: 0 },
      description: 'Lattice stand-in rows (two blocks each).',
      table: {
        type: { summary: 'number' },
        defaultValue: { summary: '3' },
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof BAIResourceUnitGridSkeleton>;

export const Default: Story = {
  args: {},
};

export const MoreRows: Story = {
  args: {
    rows: 5,
  },
  parameters: {
    docs: {
      description: {
        story:
          'Row block widths cycle a fixed 3-row pattern, so extra rows repeat it.',
      },
    },
  },
};
