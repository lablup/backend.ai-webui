import { BAILocale } from '../../locale';
import { BAIConfigProvider } from '../provider';
import { BAIClient } from '../provider/BAIClientProvider';
import BAINameActionCell from './BAINameActionCell';
import type { BAINameActionCellAction } from './BAINameActionCell';
import {
  CopyOutlined,
  DeleteOutlined,
  EditOutlined,
  FolderOutlined,
  ShareAltOutlined,
} from '@ant-design/icons';
import type { Meta, StoryObj } from '@storybook/react-vite';
import enUS from 'antd/locale/en_US';
import koKR from 'antd/locale/ko_KR';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';

const mockClient = {} as BAIClient;
const mockClientPromise = Promise.resolve(mockClient);
const mockAnonymousClientFactory = () => mockClient;

const locales = {
  en: { lang: 'en', antdLocale: enUS },
  ko: { lang: 'ko', antdLocale: koKR },
} as const;

const meta: Meta<typeof BAINameActionCell> = {
  title: 'Table/BAINameActionCell',
  component: BAINameActionCell,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
BAINameActionCell is a reusable table cell layout component that combines a title area (icon + text) with responsive action buttons.

## Features

- **Hover actions**: Action buttons appear on hover by default
- **Responsive overflow**: Actions collapse into a "more" menu when the cell is too narrow
- **Navigation support**: Title can be a link via \`to\` prop (React Router)
- **Ellipsis**: Title auto-truncates with tooltip when space is limited
- **Action types**: Supports default and danger action styles
- **Async actions**: Supports \`action\` prop for automatic loading state
        `,
      },
    },
  },
  argTypes: {
    title: {
      control: { type: 'text' },
      description: 'Primary title text displayed in the cell.',
      table: {
        type: { summary: 'string | React.ReactNode' },
        defaultValue: { summary: '-' },
      },
    },
    to: {
      control: { type: 'text' },
      description:
        'Optional React Router path. When set, the title is rendered as a link.',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: 'undefined' },
      },
    },
    actions: {
      control: false,
      description:
        'List of action definitions rendered as buttons or in the overflow menu.',
      table: {
        type: { summary: 'BAINameActionCellAction[]' },
        defaultValue: { summary: '[]' },
      },
    },
    showActions: {
      control: { type: 'inline-radio' },
      description: 'When to show the actions area.',
      table: {
        type: { summary: "'hover' | 'always'" },
        defaultValue: { summary: "'hover'" },
      },
    },
    minVisibleActions: {
      control: { type: 'number' },
      description:
        'Minimum number of actions to keep visible before collapsing into the "more" menu.',
      table: {
        type: { summary: 'number' },
        defaultValue: { summary: '0' },
      },
    },
    copyable: {
      control: { type: 'boolean' },
      description:
        'Show a copy-to-clipboard icon on hover next to the title text.',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
    icon: {
      control: false,
      description: 'Optional icon rendered before the title.',
      table: {
        type: { summary: 'React.ReactNode' },
        defaultValue: { summary: 'undefined' },
      },
    },
  },
  decorators: [
    (Story, context) => {
      const locale = context.globals.locale || 'en';
      const baiLocale: BAILocale =
        locales[locale as keyof typeof locales] || locales.en;

      return (
        <MemoryRouter>
          <BAIConfigProvider
            locale={baiLocale}
            clientPromise={mockClientPromise}
            anonymousClientFactory={mockAnonymousClientFactory}
          >
            <Story />
          </BAIConfigProvider>
        </MemoryRouter>
      );
    },
  ],
};

export default meta;

type Story = StoryObj<typeof BAINameActionCell>;

const sampleActions: BAINameActionCellAction[] = [
  {
    key: 'edit',
    title: 'Edit',
    icon: <EditOutlined />,
    onClick: () => console.log('Edit clicked'),
  },
  {
    key: 'share',
    title: 'Share',
    icon: <ShareAltOutlined />,
    onClick: () => console.log('Share clicked'),
  },
  {
    key: 'copy',
    title: 'Copy',
    icon: <CopyOutlined />,
    onClick: () => console.log('Copy clicked'),
  },
  {
    key: 'delete',
    title: 'Delete',
    icon: <DeleteOutlined />,
    type: 'danger',
    onClick: () => console.log('Delete clicked'),
  },
];

export const Default: Story = {
  name: 'Basic',
  parameters: {
    docs: {
      description: {
        story: 'Default cell with icon, title, and hover action buttons.',
      },
    },
  },
  args: {
    icon: <FolderOutlined />,
    title: 'My Project Folder',
    actions: sampleActions,
  },
};

export const WithNavigation: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Title rendered as a React Router link using the `to` prop.',
      },
    },
  },
  args: {
    icon: <FolderOutlined />,
    title: 'Navigable Folder',
    to: '/folders/123',
    actions: sampleActions.slice(0, 2),
  },
};

export const AlwaysShowActions: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Actions are always visible, not just on hover.',
      },
    },
  },
  args: {
    icon: <FolderOutlined />,
    title: 'Always Visible Actions',
    actions: sampleActions,
    showActions: 'always',
  },
};

export const WithDisabledAction: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Disabled actions show a reason tooltip and cannot be clicked.',
      },
    },
  },
  args: {
    icon: <FolderOutlined />,
    title: 'Has Disabled Action',
    actions: [
      ...sampleActions.slice(0, 2),
      {
        key: 'restore',
        title: 'Restore',
        icon: <CopyOutlined />,
        disabled: true,
        disabledReason: 'Cannot restore pipeline folders',
      },
    ],
  },
};

export const LongTitle: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Long titles are truncated with an ellipsis tooltip.',
      },
    },
  },
  args: {
    icon: <FolderOutlined />,
    title:
      'This is a very long folder name that should be truncated with ellipsis when the column is narrow',
    actions: sampleActions,
  },
  decorators: [
    (Story) => (
      <div style={{ width: 300 }}>
        <Story />
      </div>
    ),
  ],
};

export const ResponsiveOverflow: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Drag the slider to see actions collapse into the overflow menu.',
      },
    },
  },
  render: () => {
    const [width, setWidth] = React.useState(400);
    return (
      <div>
        <div style={{ marginBottom: 16 }}>
          <label>
            Container width: {width}px
            <input
              type="range"
              min={120}
              max={600}
              value={width}
              onChange={(e) => setWidth(Number(e.target.value))}
              style={{ marginLeft: 8, width: 200 }}
            />
          </label>
        </div>
        <div
          style={{
            width,
            border: '1px solid #d9d9d9',
            padding: '8px 12px',
            borderRadius: 4,
          }}
        >
          <BAINameActionCell
            icon={<FolderOutlined />}
            title="Resize to see overflow"
            actions={sampleActions}
            showActions="always"
          />
        </div>
      </div>
    );
  },
};

export const ResponsiveOverflowWithLink: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Responsive overflow combined with a navigable title link.',
      },
    },
  },
  render: () => {
    const [width, setWidth] = React.useState(400);
    return (
      <div>
        <div style={{ marginBottom: 16 }}>
          <label>
            Container width: {width}px
            <input
              type="range"
              min={120}
              max={600}
              value={width}
              onChange={(e) => setWidth(Number(e.target.value))}
              style={{ marginLeft: 8, width: 200 }}
            />
          </label>
        </div>
        <div
          style={{
            width,
            border: '1px solid #d9d9d9',
            padding: '8px 12px',
            borderRadius: 4,
          }}
        >
          <BAINameActionCell
            icon={<FolderOutlined />}
            title="This is a long navigable folder name for ellipsis testing"
            to="/folders/123"
            actions={sampleActions}
            showActions="always"
          />
        </div>
      </div>
    );
  },
};

export const MenuOnlyActions: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Actions with `showInMenu: "always"` are always placed in the dropdown menu.',
      },
    },
  },
  args: {
    icon: <FolderOutlined />,
    title: 'Some actions are menu-only',
    actions: [
      {
        key: 'edit',
        title: 'Edit',
        icon: <EditOutlined />,
        onClick: () => console.log('Edit clicked'),
      },
      {
        key: 'share',
        title: 'Share',
        icon: <ShareAltOutlined />,
        onClick: () => console.log('Share clicked'),
      },
      {
        key: 'copy',
        title: 'Copy',
        icon: <CopyOutlined />,
        showInMenu: 'always',
        onClick: () => console.log('Copy clicked'),
      },
      {
        key: 'delete',
        title: 'Delete',
        icon: <DeleteOutlined />,
        type: 'danger',
        showInMenu: 'always',
        onClick: () => console.log('Delete clicked'),
      },
    ],
    showActions: 'always',
  },
};

export const CopyableName: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'A copy-to-clipboard icon appears on hover next to the title text. Works with plain text, links, and clickable titles.',
      },
    },
  },
  args: {
    icon: <FolderOutlined />,
    title: 'Copyable Folder Name',
    actions: sampleActions.slice(0, 2),
    copyable: true,
  },
};

export const CopyableNameWithLink: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Copyable name combined with a navigable title link. The copy icon appears on hover.',
      },
    },
  },
  args: {
    icon: <FolderOutlined />,
    title: 'Navigable Copyable Folder',
    to: '/folders/123',
    actions: sampleActions.slice(0, 2),
    copyable: true,
  },
};

export const TitleOnly: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Cell without any actions — only icon and title.',
      },
    },
  },
  args: {
    icon: <FolderOutlined />,
    title: 'No actions, title only',
  },
};

export const AsyncAction: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Async action with automatic loading state via the `action` prop.',
      },
    },
  },
  args: {
    icon: <FolderOutlined />,
    title: 'With Async Action',
    actions: [
      {
        key: 'deploy',
        title: 'Deploy (takes 2s)',
        icon: <CopyOutlined />,
        action: () => new Promise((resolve) => setTimeout(resolve, 2000)),
      },
    ],
    showActions: 'always',
  },
};
