import BAIFlex from './BAIFlex';
import BAIListAlert from './BAIListAlert';
import type { Meta, StoryObj } from '@storybook/react-vite';
import * as _ from 'lodash-es';

const meta: Meta<typeof BAIListAlert> = {
  title: 'Alert/BAIListAlert',
  component: BAIListAlert,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
**BAIListAlert** extends **BAIAlert** (and therefore [Ant Design Alert](https://ant.design/components/alert)).

It renders a standardized \`ul\` list inside the alert description — used to
summarize a list of items (e.g. selected resources) inside a modal. The list
scrolls vertically once it exceeds \`maxHeight\`, so the modal never grows
unbounded. Item count indication belongs in the consumer-provided \`title\`
prop (i18n \`count\` interpolation).

## BAI-Specific Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| \`items\` | \`Array<{ key?: React.Key; content: ReactNode }>\` | — | List entries rendered as \`li\` elements. \`key\` falls back to the array index |
| \`maxHeight\` | \`CSSProperties['maxHeight']\` | \`165\` | Maximum height of the list before it scrolls vertically |

For all other props, refer to **BAIAlert** and [Ant Design Alert](https://ant.design/components/alert).
        `,
      },
    },
  },
  argTypes: {
    items: {
      control: false,
      description:
        'List entries rendered as li elements; key falls back to the array index',
      table: {
        type: { summary: 'Array<{ key?: React.Key; content: ReactNode }>' },
      },
    },
    maxHeight: {
      control: { type: 'number' },
      description: 'Maximum height of the list before it scrolls vertically',
      table: {
        type: { summary: "CSSProperties['maxHeight']" },
        defaultValue: { summary: '165' },
      },
    },
    // Hide Ant Design props used in args
    type: { table: { disable: true } },
    title: { table: { disable: true } },
    showIcon: { table: { disable: true } },
  },
};

export default meta;
type Story = StoryObj<typeof BAIListAlert>;

// Default story: Use args for interactive Controls
export const Default: Story = {
  name: 'Basic',
  args: {
    type: 'info',
    title: 'The following projects will be updated',
    showIcon: true,
    items: [
      { key: 'a', content: 'project-alpha' },
      { key: 'b', content: 'project-beta' },
      { key: 'c', content: 'project-gamma' },
    ],
  },
  parameters: {
    docs: {
      description: {
        story: 'Basic list summary inside an info alert.',
      },
    },
  },
};

export const LongListWithScroll: Story = {
  args: {
    type: 'warning',
    title: 'The following 30 users will be updated',
    showIcon: true,
    items: _.map(_.range(30), (i) => ({
      key: i,
      content: `user-${i + 1}@example.com`,
    })),
  },
  parameters: {
    docs: {
      description: {
        story:
          'A long list is capped at the default maxHeight (165px) and scrolls vertically, keeping the surrounding modal compact.',
      },
    },
  },
};

export const CustomMaxHeight: Story = {
  args: {
    type: 'warning',
    title: 'Custom maxHeight of 80px',
    showIcon: true,
    maxHeight: 80,
    items: _.map(_.range(10), (i) => ({
      key: i,
      content: `item-${i + 1}`,
    })),
  },
  parameters: {
    docs: {
      description: {
        story: 'The scroll cap can be adjusted via the maxHeight prop.',
      },
    },
  },
};

export const AlertTypes: Story = {
  render: () => (
    <BAIFlex direction="column" gap="md" align="stretch">
      <BAIListAlert
        type="warning"
        showIcon
        title="Warning: these users will be updated"
        items={[
          { key: 1, content: 'admin@example.com' },
          { key: 2, content: 'user@example.com' },
        ]}
      />
      <BAIListAlert
        type="info"
        showIcon
        ghostInfoBg={false}
        title="Info: these projects will be updated"
        items={[
          { key: 1, content: 'project-alpha' },
          { key: 2, content: 'project-beta' },
        ]}
      />
    </BAIFlex>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Side-by-side comparison of warning and info (ghostInfoBg disabled) variants, matching the modal call sites.',
      },
    },
  },
};

export const TitleWithCount: Story = {
  args: {
    type: 'info',
    showIcon: true,
    ghostInfoBg: false,
    title: '3 folders are excluded because they cannot be deleted',
    items: [
      { key: 'f1', content: 'shared-folder' },
      { key: 'f2', content: 'model-store' },
      { key: 'f3', content: 'pipeline-data' },
    ],
  },
  parameters: {
    docs: {
      description: {
        story:
          'Item count indication stays in the consumer-provided title (i18n count interpolation) — the component does not render counts itself.',
      },
    },
  },
};
