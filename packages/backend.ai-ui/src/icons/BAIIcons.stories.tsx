import BAIFlex from '../components/BAIFlex';
import BAIText from '../components/BAIText';
import { theme } from '../theme-shim';
import * as Icons from './index';
import { TextInput } from '@astryxdesign/core/TextInput';
import type { Meta, StoryObj } from '@storybook/react-vite';
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
      <BAIText
        style={{
          fontSize: 11,
          textAlign: 'center',
          wordBreak: 'break-word',
          color: token.colorTextSecondary,
        }}
      >
        {name.replace('BAI', '').replace('Icon', '')}
      </BAIText>
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
      <TextInput
        label="Search icons"
        isLabelHidden
        placeholder="Search icons..."
        value={filter}
        onChange={setFilter}
        hasClear
        style={{ maxWidth: 300 }}
      />
      <BAIText type="secondary">
        {filteredIcons.length} icon{filteredIcons.length !== 1 ? 's' : ''} found
      </BAIText>
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
- Custom SVG icons wrapped in a first-party icon shim (\`iconShim\`) that mirrors the API \`@ant-design/icons\`' \`Icon\` used to provide, with zero antd imports
- Consistent styling and sizing
- Accessibility support with \`aria-label\` prop
- Optional \`size\` prop for hardware/accelerator icons
- Extends \`CustomIconComponentProps\` declared locally in \`iconShim\` (type-compatible with Ant Design's former shape, so existing \`Omit<CustomIconComponentProps, ...>\` call sites compile unchanged)

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

All icons extend the locally-declared \`CustomIconComponentProps\` (excluding \`width\`, \`height\`, \`fill\`) from \`icons/iconShim.tsx\`.
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
