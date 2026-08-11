import BAIButton from './BAIButton';
import BAICard from './BAICard';
import BAIFlex from './BAIFlex';
import BAIText from './BAIText';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta<typeof BAICard> = {
  title: 'Card/BAICard',
  component: BAICard,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
**BAICard** keeps an Ant Design \`Card\`-shaped prop surface (\`title\`, \`extra\`, \`tabList\`, \`status\`, ...) for call-site compatibility, but renders through Astryx's \`Card\` primitive internally. It provides additional features including:

- **Status-based styling**: Visual indicators for success, error, warning, and default states
- **Integrated action buttons**: Extra buttons with automatic icons based on status
- **Enhanced header layout**: Flexible title and extra content arrangement
- **Tab integration**: Built-in support for tabbed content
- **Consistent design**: Follows Backend.AI design system guidelines

The component accepts all standard Ant Design Card properties while adding Backend.AI-specific enhancements for better user experience and visual consistency across the platform.

## Props

| Name | Type | Default | Description |
|------|------|---------|-------------|
| status | \`'success' \\| 'error' \\| 'warning' \\| 'default'\` | \`'default'\` | Visual status affecting border color and extra button icons |
| extra | \`ReactNode\` | - | Custom content to display in the header area |
| extraButtonTitle | \`string \\| ReactNode\` | - | Title for the extra action button in the header |
| showDivider | \`boolean\` | \`false\` | Show divider between header and body. Auto-enabled with tabs |
| onClickExtraButton | \`() => void\` | - | Callback when extra button is clicked |
        `,
      },
    },
  },
  argTypes: {
    status: {
      control: { type: 'select' },
      options: ['default', 'success', 'warning', 'error'],
      description:
        'Visual status affecting border color and extra button icons',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: 'default' },
      },
    },
    size: {
      control: { type: 'select' },
      options: ['default', 'small'],
      description: 'Card size affecting padding and spacing',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: 'default' },
      },
    },
    title: {
      control: { type: 'text' },
      description: 'Card title displayed in the header',
      table: {
        type: { summary: 'ReactNode' },
      },
    },
    extraButtonTitle: {
      control: { type: 'text' },
      description: 'Title for the extra action button in the header',
      table: {
        type: { summary: 'string | ReactNode' },
      },
    },
    loading: {
      control: { type: 'boolean' },
      description: 'Shows loading spinner overlay',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
    hoverable: {
      control: { type: 'boolean' },
      description: 'Enable hover effects and pointer cursor',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
    bordered: {
      control: { type: 'boolean' },
      description: 'Show card border',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'true' },
      },
    },
    showDivider: {
      control: { type: 'boolean' },
      description:
        'Show divider between header and body. Auto-enabled with tabs',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
    onClickExtraButton: {
      action: 'extraButtonClicked',
      description: 'Callback when extra button is clicked',
      table: {
        type: { summary: '() => void' },
      },
    },
    extra: {
      control: false,
      description: 'Custom content to display in the header area',
      table: {
        type: { summary: 'ReactNode' },
      },
    },
    children: {
      control: false,
      description: 'Card body content',
      table: {
        type: { summary: 'ReactNode' },
      },
    },
    style: {
      control: false,
      description: 'Custom CSS styles for the card',
      table: {
        type: { summary: 'CSSProperties' },
      },
    },
    className: {
      control: { type: 'text' },
      description: 'Custom CSS class name',
      table: {
        type: { summary: 'string' },
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof BAICard>;

const sampleContent = (
  <div>
    {/* antd Typography.Paragraph has no direct Astryx equivalent; BAIText
        wrapped in a block element reproduces the same paragraph layout. */}
    <div>
      <BAIText>
        This is sample content for the BAI Card component. It demonstrates how
        content is displayed within the card body.
      </BAIText>
    </div>
    <BAIFlex gap="xs" align="center">
      <BAIButton type="primary">Primary Action</BAIButton>
      <BAIButton>Secondary Action</BAIButton>
    </BAIFlex>
  </div>
);

export const Default: Story = {
  name: 'Basic',
  parameters: {
    docs: {
      description: {
        story:
          'Basic card with title and content. This is the most common usage pattern.',
      },
    },
  },
  args: {
    title: 'Default Card',
    children: sampleContent,
  },
};

export const WithoutTitle: Story = {
  name: 'NoTitle',
  args: {
    children: sampleContent,
  },
};

export const StatusVariants: Story = {
  name: 'StatusTypes',
  parameters: {
    docs: {
      description: {
        story:
          'Different status variants showing how border colors change based on the status prop. Each status provides different visual feedback to users.',
      },
    },
  },
  render: () => (
    <BAIFlex direction="column" gap="md">
      <BAICard title="Default Status" status="default">
        {sampleContent}
      </BAICard>
      <BAICard title="Success Status" status="success">
        {sampleContent}
      </BAICard>
      <BAICard title="Warning Status" status="warning">
        {sampleContent}
      </BAICard>
      <BAICard title="Error Status" status="error">
        {sampleContent}
      </BAICard>
    </BAIFlex>
  ),
};

export const WithExtra: Story = {
  name: 'ExtraContent',
  args: {
    title: 'Card with Extra',
    extra: <BAIButton type="link">More</BAIButton>,
    children: sampleContent,
  },
};

export const WithExtraButton: Story = {
  name: 'ExtraButton',
  parameters: {
    docs: {
      description: {
        story:
          'Card with an extra action button in the header. The button automatically gets appropriate icons based on the card status.',
      },
    },
  },
  args: {
    title: 'Card with Extra Button',
    extraButtonTitle: 'Action',
    onClickExtraButton: () => console.log('Extra button clicked!'),
    children: sampleContent,
  },
};

export const WithExtraButtonAndStatus: Story = {
  name: 'ExtraButtonWithStatus',
  render: () => (
    <BAIFlex direction="column" gap="md">
      <BAICard
        title="Error with Extra Button"
        status="error"
        extraButtonTitle="Fix Error"
        onClickExtraButton={() => console.log('Fix error clicked!')}
      >
        {sampleContent}
      </BAICard>
      <BAICard
        title="Warning with Extra Button"
        status="warning"
        extraButtonTitle="Review Warning"
        onClickExtraButton={() => console.log('Review warning clicked!')}
      >
        {sampleContent}
      </BAICard>
    </BAIFlex>
  ),
};

export const WithTabs: Story = {
  name: 'TabsIntegration',
  args: {
    title: 'Card with Tabs',
    tabList: [
      { key: 'tab1', label: 'Tab 1' },
      { key: 'tab2', label: 'Tab 2' },
      { key: 'tab3', label: 'Tab 3' },
    ],
    activeTabKey: 'tab1',
    onTabChange: (key: string) => console.log('Tab changed to:', key),
    children: sampleContent,
  },
};

export const SmallSize: Story = {
  name: 'CompactSize',
  args: {
    title: 'Small Card',
    size: 'small',
    children: (
      <div style={{ margin: 0 }}>
        <BAIText>This is a small-sized card with reduced padding.</BAIText>
      </div>
    ),
  },
};

export const Loading: Story = {
  name: 'LoadingState',
  args: {
    title: 'Loading Card',
    loading: true,
    children: sampleContent,
  },
};

export const Hoverable: Story = {
  name: 'InteractiveHover',
  args: {
    title: 'Hoverable Card',
    hoverable: true,
    children: sampleContent,
  },
};

export const Borderless: Story = {
  name: 'NoBorder',
  args: {
    title: 'Borderless Card',
    bordered: false,
    children: sampleContent,
  },
};

export const ComplexExtra: Story = {
  name: 'ComplexExtraContent',
  args: {
    title: 'Card with Complex Extra',
    extra: (
      <BAIFlex gap="xs" align="center">
        <BAIButton size="small">Edit</BAIButton>
        <BAIButton size="small" type="primary">
          Save
        </BAIButton>
      </BAIFlex>
    ),
    children: sampleContent,
  },
};

export const NoDivider: Story = {
  name: 'HeaderNoDivider',
  args: {
    title: 'Card without Header Divider',
    showDivider: false,
    children: sampleContent,
  },
};

export const WithDivider: Story = {
  name: 'HeaderWithDivider',
  args: {
    title: 'Card with Header Divider',
    showDivider: true,
    children: sampleContent,
  },
};

export const CustomStyles: Story = {
  name: 'CustomStyling',
  args: {
    title: 'Custom Styled Card',
    style: {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
    },
    styles: {
      header: {
        color: 'white',
        borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
      },
      body: {
        color: 'white',
      },
    },
    children: (
      <div style={{ margin: 0 }}>
        <BAIText style={{ color: 'white' }}>
          This card has custom gradient background and white text.
        </BAIText>
      </div>
    ),
  },
};
