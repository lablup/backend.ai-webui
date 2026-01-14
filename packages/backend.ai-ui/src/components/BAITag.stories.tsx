import BAIFlex from './BAIFlex';
import BAITag from './BAITag';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Tag } from 'antd';

const meta: Meta<typeof BAITag> = {
  title: 'Components/BAITag',
  component: BAITag,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
**BAITag** extends [Ant Design Tag](https://ant.design/components/tag) with Backend.AI-specific styling.

## BAI-Specific Styling
| Token | Level | Value | Description |
|-------|-------|-------|-------------|
| \`borderRadiusSM\` | Global | \`11px\` | Rounded borders for softer appearance |
| \`defaultBg\` | Component | \`transparent\` | Transparent background for default tag |
| \`defaultColor\` | Component | \`#999999\` | Muted text color for better readability |
| \`padding\` | Inline Style | \`token.paddingSM\` | Consistent horizontal padding using design tokens |

> **Note:** Status color variants (success, processing, error, warning) use Ant Design's default preset colors.

This component has no additional props beyond Ant Design Tag. The styling differences are applied automatically via ConfigProvider theme customization.

For all props, refer to [Ant Design Tag](https://ant.design/components/tag).
        `,
      },
    },
  },
  argTypes: {},
};

export default meta;
type Story = StoryObj<typeof BAITag>;

export const Default: Story = {
  args: {
    children: 'Default Tag',
  },
};

export const BAIvsAntDesign: Story = {
  name: 'BAITag vs Ant Design Tag',
  parameters: {
    docs: {
      description: {
        story:
          'Comparison between BAITag and standard Ant Design Tag. BAITag features rounded borders (11px), transparent backgrounds, and custom padding for a softer, more modern appearance.',
      },
    },
  },
  render: () => (
    <BAIFlex direction="column" gap="lg">
      <BAIFlex direction="column" gap="sm">
        <strong>BAITag (Backend.AI Styled)</strong>
        <BAIFlex gap="sm" wrap="wrap">
          <BAITag>Default</BAITag>
          <BAITag color="success">Success</BAITag>
          <BAITag color="processing">Processing</BAITag>
          <BAITag color="error">Error</BAITag>
          <BAITag color="warning">Warning</BAITag>
        </BAIFlex>
      </BAIFlex>
      <BAIFlex direction="column" gap="sm">
        <strong>Ant Design Tag (Original)</strong>
        <BAIFlex gap="sm" wrap="wrap">
          <Tag>Default</Tag>
          <Tag color="success">Success</Tag>
          <Tag color="processing">Processing</Tag>
          <Tag color="error">Error</Tag>
          <Tag color="warning">Warning</Tag>
        </BAIFlex>
      </BAIFlex>
    </BAIFlex>
  ),
};
