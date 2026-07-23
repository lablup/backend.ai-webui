import BAIFlex from '../components/BAIFlex';
import * as Icons from './index';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Input, theme, Typography } from 'antd';
import React, { useState } from 'react';

const icons = Object.entries(Icons)
  .filter(([name]) => name.startsWith('BAI') && name.endsWith('Icon'))
  .map(([name, IconComponent]) => ({
    name,
    component: React.createElement(IconComponent as React.ComponentType),
  }))
  .sort((a, b) => a.name.localeCompare(b.name));

const IconWrapper: React.FC<{
  icon: React.ReactNode;
  name: string;
}> = ({ icon, name }) => {
  const { token } = theme.useToken();
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        width: 140,
        height: 100,
        padding: 12,
        borderRadius: token.borderRadius,
        backgroundColor: isHovered
          ? token.colorBgTextHover
          : token.colorBgContainer,
        cursor: 'pointer',
        transition: 'background-color 0.2s',
      }}
    >
      <div style={{ fontSize: 28, marginBottom: 8, lineHeight: 1 }}>{icon}</div>
      <Typography.Text
        style={{
          fontSize: 11,
          textAlign: 'center',
          wordBreak: 'break-word',
          color: token.colorTextSecondary,
        }}
      >
        {name.replace('BAI', '').replace('Icon', '')}
      </Typography.Text>
    </div>
  );
};

const IconsOverview: React.FC = () => {
  const [filter, setFilter] = useState('');
  const { token } = theme.useToken();

  const filteredIcons = icons.filter((icon) =>
    icon.name.toLowerCase().includes(filter.toLowerCase()),
  );

  return (
    <BAIFlex direction="column" gap="lg">
      <Input
        placeholder="Search icons..."
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        allowClear
        style={{ maxWidth: 300 }}
      />
      <Typography.Text type="secondary">
        {filteredIcons.length} icon{filteredIcons.length !== 1 ? 's' : ''} found
      </Typography.Text>
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          flexWrap: 'wrap',
          gap: token.marginXS,
        }}
      >
        {filteredIcons.map((icon) => (
          <IconWrapper key={icon.name} icon={icon.component} name={icon.name} />
        ))}
      </div>
    </BAIFlex>
  );
};

const meta: Meta = {
  title: 'Icon/BAIIcons',
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
**Backend.AI Icons** are custom icon components for Backend.AI WebUI.

## Features
- Custom SVG icons wrapped in Ant Design Icon component
- Consistent styling and sizing
- Accessibility support with \`aria-label\` prop
- Optional \`size\` prop for hardware/accelerator icons
- Extends \`CustomIconComponentProps\` from Ant Design

## Usage
\`\`\`tsx
import { BAINvidiaIcon, BAISessionsIcon } from '@backend.ai/backend.ai-ui';

// Basic usage
<BAINvidiaIcon />

// With custom size
<BAISessionsIcon style={{ fontSize: 24 }} />

// With custom color
<BAIDashboardIcon style={{ color: '#1890ff' }} />
\`\`\`

## Common Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| \`aria-label\` | \`string\` | Icon-specific | Accessibility label |
| \`size\` | \`number\` | - | Icon size (available on some icons) |
| \`style\` | \`CSSProperties\` | - | Custom styles |
| \`className\` | \`string\` | - | CSS class name |

All icons extend Ant Design's \`CustomIconComponentProps\` (excluding \`width\`, \`height\`, \`fill\`).
        `,
      },
    },
  },
  argTypes: {},
};

export default meta;
type Story = StoryObj;

export const IconsOverviewStory: Story = {
  name: 'Icons Overview',
  render: () => <IconsOverview />,
};
