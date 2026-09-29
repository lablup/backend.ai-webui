import BAIDoubleToken from './BAIDoubleToken';
import BAIFlex from './BAIFlex';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta<typeof BAIDoubleToken> = {
  title: 'Token/BAIDoubleToken',
  component: BAIDoubleToken,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
**BAIDoubleToken** welds Astryx Tokens into one pill for a settled key/value fact
(image tag, location/platform, permission letters). For a live pair use **BAIDoubleBadge**.

\`\`\`tsx
<BAIDoubleToken values={['Python', '3.11']} />
<BAIDoubleToken values={[{ label: 'R', color: 'green' }, { label: 'W', color: 'blue' }]} />
<BAIDoubleToken values={['Python', '3.11']} highlightKeyword="py" />
\`\`\`
        `,
      },
    },
  },
  argTypes: {
    values: {
      control: { type: 'object' },
      description:
        'Segments as strings (all blue) or `{ label, color }` objects with an Astryx Token color',
      table: {
        type: { summary: 'string[] | BAIDoubleTokenValue[]' },
        defaultValue: { summary: '[]' },
      },
    },
    highlightKeyword: {
      control: { type: 'text' },
      description: 'Keyword to highlight within segment labels',
      table: { type: { summary: 'string' } },
    },
  },
};

export default meta;
type Story = StoryObj<typeof BAIDoubleToken>;

export const Default: Story = {
  name: 'Basic',
  args: {
    values: ['python', '3.11'],
  },
};

export const ObjectValues: Story = {
  args: {
    values: [
      { label: 'R', color: 'green' },
      { label: 'W', color: 'blue' },
      { label: 'D', color: 'red' },
    ],
  },
};

export const WithHighlight: Story = {
  args: {
    values: ['tensorflow', '2.12'],
    highlightKeyword: 'tensor',
  },
};

export const Colors: Story = {
  render: () => (
    <BAIFlex direction="column" gap="md" align="start">
      <BAIDoubleToken
        values={[
          { label: 'aws', color: 'orange' },
          { label: 'ap-northeast-2', color: 'orange' },
        ]}
      />
      <BAIDoubleToken
        values={[
          { label: 'Backend', color: 'default' },
          { label: 'cephfs', color: 'blue' },
        ]}
      />
      <BAIDoubleToken
        values={[
          { label: 'Customized', color: 'cyan' },
          { label: 'my-image', color: 'cyan' },
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
