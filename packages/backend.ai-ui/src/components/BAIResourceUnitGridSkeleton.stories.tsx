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
toolbar row, a legend row, and a lattice of plates, sized from the same
layout tokens the real grid reads, so the page doesn't visibly reflow when
the data arrives.

\`\`\`tsx
<Suspense fallback={<BAIResourceUnitGridSkeleton groupCount={8} />}>
  <SessionResourceGrid ... />
</Suspense>
\`\`\`
        `,
      },
    },
  },
  argTypes: {
    groupCount: {
      control: { type: 'number', min: 0 },
      description:
        'Plate count; cycles through the fixed cell-count array by index.',
      table: {
        type: { summary: 'number' },
        defaultValue: { summary: '6' },
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof BAIResourceUnitGridSkeleton>;

export const Default: Story = {
  args: {},
};

export const ManyPlates: Story = {
  args: {
    groupCount: 12,
  },
  parameters: {
    docs: {
      description: {
        story:
          'Once `groupCount` exceeds the fixed cell-count array, it cycles from the start (plates 7–12 repeat the sizes of plates 1–6).',
      },
    },
  },
};
