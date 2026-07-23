import BAIBoardItemTitle from './BAIBoardItemTitle';
import { SettingOutlined, ReloadOutlined } from '@ant-design/icons';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button, Space, Tag, Typography } from 'antd';

/**
 * BAIBoardItemTitle is a header component designed for board items, featuring a title, optional tooltip, and extra content area.
 * It provides a consistent sticky header layout with proper spacing and styling.
 */
const meta: Meta<typeof BAIBoardItemTitle> = {
  title: 'Board/BAIBoardItemTitle',
  component: BAIBoardItemTitle,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'BAIBoardItemTitle is a sticky header component designed for board items. It provides a consistent layout with a title, optional tooltip, and extra content area.',
      },
    },
  },
  argTypes: {
    title: {
      description: 'The main title content - can be a string or React node',
      control: { type: 'text' },
    },
    tooltip: {
      description:
        'Optional tooltip content that appears on hover of the question mark icon',
      control: { type: 'text' },
    },
    extra: {
      description:
        'Additional content displayed on the right side of the header',
      control: false,
    },
    style: {
      description: 'Custom CSS styles for the header container',
      control: false,
    },
  },
};

export default meta;

type Story = StoryObj<typeof BAIBoardItemTitle>;

export const Default: Story = {
  name: 'Basic',
  args: {
    title: 'Board Item Title',
  },
  parameters: {
    docs: {
      description: {
        story: 'Basic usage with just a title.',
      },
    },
  },
};

export const WithTooltip: Story = {
  name: 'WithTooltip',
  args: {
    title: 'Resource Usage',
    tooltip:
      'This shows the current resource utilization of your compute sessions.',
  },
  parameters: {
    docs: {
      description: {
        story:
          'Title with a helpful tooltip that appears when hovering over the question mark icon.',
      },
    },
  },
};

export const WithExtra: Story = {
  name: 'WithExtraContent',
  args: {
    title: 'Session Overview',
    extra: (
      <Button type="primary" size="small">
        Refresh
      </Button>
    ),
  },
  parameters: {
    docs: {
      description: {
        story:
          'Title with extra content like buttons or controls in the right side.',
      },
    },
  },
};

export const WithTooltipAndExtra: Story = {
  name: 'Complete',
  args: {
    title: 'Compute Sessions',
    tooltip: 'Active compute sessions in your environment',
    extra: (
      <Space>
        <Tag color="blue">12 Active</Tag>
        <Button type="text" size="small" icon={<ReloadOutlined />} />
        <Button type="text" size="small" icon={<SettingOutlined />} />
      </Space>
    ),
  },
  parameters: {
    docs: {
      description: {
        story:
          'Complete example with title, tooltip, and complex extra content including tags and action buttons.',
      },
    },
  },
};

export const CustomTitle: Story = {
  name: 'CustomTitleNode',
  args: {
    title: (
      <Space>
        <Typography.Title level={5} style={{ margin: 0, color: '#1890ff' }}>
          Custom Styled Title
        </Typography.Title>
        <Tag color="green">NEW</Tag>
      </Space>
    ),
    tooltip: 'This demonstrates using a custom React node as title',
  },
  parameters: {
    docs: {
      description: {
        story: 'Using a custom React node as title instead of a simple string.',
      },
    },
  },
};

export const LongTitle: Story = {
  name: 'LongTitle',
  args: {
    title: 'Very Long Board Item Title That Might Wrap to Multiple Lines',
    tooltip:
      'Long titles will wrap appropriately while maintaining proper alignment',
    extra: <Button size="small">Action</Button>,
  },
  parameters: {
    docs: {
      description: {
        story:
          'Example with a long title that demonstrates text wrapping behavior.',
      },
    },
  },
};

export const CustomStyles: Story = {
  name: 'CustomStyling',
  args: {
    title: 'Styled Header',
    tooltip: 'Custom background and styling',
    extra: (
      <Button type="primary" size="small">
        Custom
      </Button>
    ),
    style: {
      backgroundColor: '#f0f8ff',
      borderRadius: 8,
      padding: 16,
      border: '1px solid #d9d9d9',
    },
  },
  parameters: {
    docs: {
      description: {
        story: 'Example with custom styling applied to the header container.',
      },
    },
  },
};

export const MultipleActions: Story = {
  name: 'MultipleActions',
  args: {
    title: 'Management Dashboard',
    tooltip: 'Comprehensive view of system resources and controls',
    extra: (
      <Space size="small">
        <Button size="small">Export</Button>
        <Button size="small">Filter</Button>
        <Button type="primary" size="small">
          Create New
        </Button>
      </Space>
    ),
  },
  parameters: {
    docs: {
      description: {
        story: 'Header with multiple action buttons in the extra area.',
      },
    },
  },
};
