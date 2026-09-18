import BAIDoubleBadge from './BAIDoubleBadge';
import BAIFlex from './BAIFlex';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta<typeof BAIDoubleBadge> = {
  title: 'Badge/BAIDoubleBadge',
  component: BAIDoubleBadge,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
**BAIDoubleBadge** welds Astryx Badges into one pill for a live pair the system
changes on its own (status + detail, label + ticker). For a settled pair use **BAIDoubleToken**.

\`\`\`tsx
<BAIDoubleBadge values={[{ label: 'ALIVE', variant: 'success' }, { label: '26.4.0', variant: 'success' }]} />
<BAIDoubleBadge values={['Elapsed time', '00:12:31']} />
\`\`\`
        `,
      },
    },
  },
  argTypes: {
    values: {
      control: { type: 'object' },
      description:
        'Segments as strings (all neutral) or `{ label, variant }` objects with an Astryx Badge variant',
      table: {
        type: { summary: 'string[] | BAIDoubleBadgeValue[]' },
        defaultValue: { summary: '[]' },
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof BAIDoubleBadge>;

export const Default: Story = {
  name: 'Basic',
  args: {
    values: ['Elapsed time', '00:12:31'],
  },
};

export const Statuses: Story = {
  render: () => (
    <BAIFlex direction="column" gap="md" align="start">
      <BAIDoubleBadge
        values={[
          { label: 'ALIVE', variant: 'success' },
          { label: '26.4.0', variant: 'success' },
        ]}
      />
      <BAIDoubleBadge
        values={[
          { label: 'RESTARTING', variant: 'warning' },
          { label: '26.4.0', variant: 'warning' },
        ]}
      />
      <BAIDoubleBadge
        values={[
          { label: 'ERROR', variant: 'error' },
          { label: 'creation-failed', variant: 'error' },
        ]}
      />
    </BAIFlex>
  ),
};

export const Empty: Story = {
  args: {
    values: [],
  },
};
