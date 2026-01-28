import BAIText from './BAIText';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Space, Card } from 'antd';

/**
 * BAIText extends Ant Design's Typography.Text with additional features like monospace font support
 * and CSS-based ellipsis with Safari compatibility for single and multi-line text truncation.
 */
const meta: Meta<typeof BAIText> = {
  title: 'Text/BAIText',
  component: BAIText,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'BAIText is an enhanced text component that extends Ant Design Typography.Text with support for monospace fonts and improved ellipsis handling with Safari compatibility.',
      },
    },
  },
  argTypes: {
    type: {
      description: 'Text type for semantic styling',
      control: { type: 'select' },
      options: ['secondary', 'success', 'warning', 'danger', undefined],
    },
    monospace: {
      description: 'Use monospace font family',
      control: { type: 'boolean' },
    },
    ellipsis: {
      description:
        'Enable CSS-based ellipsis with Safari compatibility. Can be boolean or config object with rows and tooltip properties',
      control: { type: 'boolean' },
    },
    copyable: {
      description: 'Enable copy functionality',
      control: { type: 'boolean' },
    },
    strong: {
      description: 'Bold text',
      control: { type: 'boolean' },
    },
    italic: {
      description: 'Italic text',
      control: { type: 'boolean' },
    },
    underline: {
      description: 'Underlined text',
      control: { type: 'boolean' },
    },
    delete: {
      description: 'Strikethrough text',
      control: { type: 'boolean' },
    },
  },
};

export default meta;

type Story = StoryObj<typeof BAIText>;

export const Default: Story = {
  name: 'Basic',
  args: {
    children: 'This is a basic text component',
  },
  parameters: {
    docs: {
      description: {
        story: 'Basic usage of BAIText with default styling.',
      },
    },
  },
};

export const Types: Story = {
  name: 'SemanticTypes',
  render: () => (
    <Space direction="vertical">
      <BAIText>Default Text</BAIText>
      <BAIText type="secondary">Secondary Text</BAIText>
      <BAIText type="success">Success Text</BAIText>
      <BAIText type="warning">Warning Text</BAIText>
      <BAIText type="danger">Danger Text</BAIText>
    </Space>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Different semantic text types with corresponding colors.',
      },
    },
  },
};

export const Styles: Story = {
  name: 'TextStyles',
  render: () => (
    <Space direction="vertical">
      <BAIText strong>Strong Text</BAIText>
      <BAIText italic>Italic Text</BAIText>
      <BAIText underline>Underlined Text</BAIText>
      <BAIText delete>Deleted Text</BAIText>
      <BAIText strong italic underline>
        Combined Styles
      </BAIText>
    </Space>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Various text styling options and combinations.',
      },
    },
  },
};

export const Monospace: Story = {
  name: 'MonospaceFont',
  render: () => (
    <Space direction="vertical">
      <BAIText>Regular: 1234567890 ABCDEFG</BAIText>
      <BAIText monospace>Monospace: 1234567890 ABCDEFG</BAIText>
      <BAIText monospace type="secondary">
        Monospace Secondary: /path/to/file.txt
      </BAIText>
      <BAIText monospace copyable>
        npm install backend.ai-ui
      </BAIText>
    </Space>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Monospace font styling, useful for code snippets, file paths, and technical content.',
      },
    },
  },
};

export const Copyable: Story = {
  name: 'CopyableText',
  render: () => (
    <Space direction="vertical">
      <BAIText copyable>Click icon to copy this text</BAIText>
      <BAIText copyable={{ text: 'Custom copied text!' }}>
        Copy custom text
      </BAIText>
      <BAIText monospace copyable type="secondary">
        1234567890abcdef
      </BAIText>
      <BAIText
        copyable={{
          icon: [<span key="copy">📋</span>, <span key="copied">✅</span>],
          tooltips: ['Copy to clipboard', 'Copied!'],
        }}
      >
        Text with custom copy icons
      </BAIText>
    </Space>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Text with copy-to-clipboard functionality including custom icons and tooltips.',
      },
    },
  },
};

export const SingleLineEllipsis: Story = {
  name: 'SingleLineEllipsis',
  render: () => (
    <Space direction="vertical" style={{ width: '100%' }}>
      <Card size="small" style={{ width: 300 }}>
        <BAIText ellipsis={{ tooltip: true }}>
          This is a very long text that will be truncated with ellipsis when it
          exceeds the container width. Hover to see full content.
        </BAIText>
      </Card>
      <Card size="small" style={{ width: 200 }}>
        <BAIText ellipsis={{ tooltip: true }} monospace>
          /very/long/path/to/some/file/in/system.txt
        </BAIText>
      </Card>
      <Card size="small" style={{ width: 250 }}>
        <BAIText ellipsis={{ tooltip: true }} type="secondary">
          user@example.com with a very long email address that overflows
        </BAIText>
      </Card>
    </Space>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Single-line ellipsis with tooltip on hover when text overflows. Uses CSS-based truncation with Safari compatibility.',
      },
    },
  },
};

export const MultiLineEllipsis: Story = {
  name: 'MultiLineEllipsis',
  render: () => (
    <Space direction="vertical" style={{ width: '100%' }}>
      <Card size="small" style={{ width: 400 }}>
        <BAIText ellipsis={{ rows: 2, tooltip: true }}>
          This is a longer text that spans multiple lines. When it exceeds the
          specified number of rows, it will be truncated with ellipsis. The
          tooltip will show the full content when you hover over the truncated
          text. This demonstrates multi-line ellipsis functionality.
        </BAIText>
      </Card>
      <Card size="small" style={{ width: 300 }}>
        <BAIText ellipsis={{ rows: 3, tooltip: true }} type="secondary">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
          eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad
          minim veniam, quis nostrud exercitation ullamco laboris nisi ut
          aliquip ex ea commodo consequat.
        </BAIText>
      </Card>
    </Space>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Multi-line ellipsis using -webkit-line-clamp for Safari compatibility. Tooltip appears on hover when text is truncated.',
      },
    },
  },
};

export const EllipsisWithCustomTooltip: Story = {
  name: 'CustomTooltip',
  render: () => (
    <Space direction="vertical" style={{ width: '100%' }}>
      <Card size="small" style={{ width: 300 }}>
        <BAIText
          ellipsis={{
            rows: 1,
            tooltip: {
              title: 'Custom tooltip content',
              placement: 'topLeft',
            },
          }}
        >
          Text with custom tooltip configuration and placement
        </BAIText>
      </Card>
      <Card size="small" style={{ width: 250 }}>
        <BAIText
          ellipsis={{
            rows: 2,
            tooltip: {
              title: 'This tooltip has custom styling',
              color: 'blue',
            },
          }}
        >
          Multi-line text with custom colored tooltip when it overflows beyond
          two rows
        </BAIText>
      </Card>
    </Space>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Ellipsis with custom tooltip configuration including placement and styling.',
      },
    },
  },
};

export const EllipsisDisabledTooltip: Story = {
  name: 'NoTooltip (Default)',
  render: () => (
    <Card size="small" style={{ width: 300 }}>
      <BAIText ellipsis={{ rows: 1 }}>
        This text will be truncated but no tooltip will appear on hover even
        when it overflows
      </BAIText>
    </Card>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Ellipsis without tooltip functionality.',
      },
    },
  },
};

export const ExpandableEllipsis: Story = {
  name: 'ExpandableEllipsis',
  render: () => (
    <Space direction="vertical" style={{ width: '100%' }}>
      <Card size="small" style={{ width: 300 }}>
        <BAIText ellipsis={{ rows: 1, expandable: true }}>
          This is a long text that will be truncated with ellipsis. Click
          &quot;Expand&quot; to see the full content and &quot;Collapse&quot; to
          hide it again.
        </BAIText>
      </Card>
      <Card size="small" style={{ width: 400 }}>
        <BAIText ellipsis={{ rows: 2, expandable: true, tooltip: true }}>
          This is a longer text that spans multiple lines. When it exceeds the
          specified number of rows, it will be truncated with ellipsis. You can
          click &quot;Expand&quot; to see the full content. The tooltip will
          also show the full content when you hover over the truncated text.
        </BAIText>
      </Card>
      <Card size="small" style={{ width: 250 }}>
        <BAIText
          ellipsis={{
            rows: 3,
            expandable: true,
            onExpand: (e) => console.log('Expand/Collapse clicked:', e),
          }}
          type="secondary"
        >
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
          eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad
          minim veniam, quis nostrud exercitation ullamco laboris nisi ut
          aliquip ex ea commodo consequat.
        </BAIText>
      </Card>
    </Space>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Expandable ellipsis allows users to toggle between truncated and full text views. Click the "Expand" link to show full content and "Collapse" to hide it. Works with both single and multi-line ellipsis.',
      },
    },
  },
};

export const ExpandableWithOtherFeatures: Story = {
  name: 'ExpandableWithCombinedFeatures',
  render: () => (
    <Space direction="vertical" style={{ width: '100%' }}>
      <Card size="small" style={{ width: 350 }}>
        <BAIText
          ellipsis={{ rows: 1, expandable: true, tooltip: true }}
          copyable
        >
          /home/user/projects/backend.ai-webui/react/src/components/very/long/path/to/file.tsx
        </BAIText>
      </Card>
      <Card size="small" style={{ width: 300 }}>
        <BAIText
          monospace
          ellipsis={{ rows: 2, expandable: true }}
          copyable
          type="secondary"
        >
          1234567890abcdefghijklmnopqrstuvwxyz_very_long_api_key_string_that_needs_expansion
        </BAIText>
      </Card>
      <Card size="small" style={{ width: 400 }}>
        <BAIText
          ellipsis={{ rows: 2, expandable: true, tooltip: true }}
          type="danger"
        >
          Error: Failed to load resource at https://example.com/api/v1/endpoint
          with status 500. Please check your network connection and server
          configuration, then try again.
        </BAIText>
      </Card>
    </Space>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Expandable ellipsis works seamlessly with other BAIText features like copyable, monospace, tooltips, and semantic types.',
      },
    },
  },
};

export const Interactive: Story = {
  name: 'InteractiveText',
  render: () => (
    <Space direction="vertical">
      <BAIText
        editable={{
          onChange: (str) => console.log('Content changed:', str),
        }}
      >
        This is an editable text (click to edit)
      </BAIText>
      <BAIText
        editable={{
          tooltip: 'Click to edit',
          triggerType: ['icon', 'text'],
        }}
      >
        Editable with custom tooltip
      </BAIText>
      <BAIText
        copyable
        editable={{
          onChange: (str) => console.log('Content changed:', str),
        }}
      >
        Both editable and copyable
      </BAIText>
    </Space>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Interactive text with editable functionality.',
      },
    },
  },
};

export const Keyboard: Story = {
  name: 'KeyboardShortcuts',
  render: () => (
    <Space direction="vertical">
      <div>
        <BAIText keyboard>Ctrl</BAIText> + <BAIText keyboard>C</BAIText>
      </div>
      <div>
        <BAIText keyboard>Cmd</BAIText> + <BAIText keyboard>Shift</BAIText> +{' '}
        <BAIText keyboard>P</BAIText>
      </div>
      <div>
        Press <BAIText keyboard>Enter</BAIText> to submit
      </div>
    </Space>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Display keyboard shortcuts with keyboard styling.',
      },
    },
  },
};

export const Code: Story = {
  name: 'CodeBlocks',
  render: () => (
    <Space direction="vertical">
      <BAIText code>const greeting = &quot;Hello World&quot;;</BAIText>
      <BAIText code copyable>
        npm install backend.ai-ui
      </BAIText>
      <BAIText code type="secondary">
        import {'{ BAIText }'} from &apos;backend.ai-ui&apos;;
      </BAIText>
      <div>
        Run <BAIText code>pnpm run dev</BAIText> to start development server
      </div>
    </Space>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Inline code blocks with code styling.',
      },
    },
  },
};

export const Mark: Story = {
  name: 'HighlightedText',
  render: () => (
    <Space direction="vertical">
      <BAIText mark>Highlighted text</BAIText>
      <BAIText mark type="danger">
        Important highlighted warning
      </BAIText>
      <div>
        This is a <BAIText mark>highlighted</BAIText> word in a sentence.
      </div>
    </Space>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Text with highlight/mark styling.',
      },
    },
  },
};

export const Disabled: Story = {
  name: 'DisabledState',
  render: () => (
    <Space direction="vertical">
      <BAIText disabled>Disabled text</BAIText>
      <BAIText disabled type="secondary">
        Disabled secondary text
      </BAIText>
      <BAIText disabled copyable>
        Disabled with copyable (copyable still works)
      </BAIText>
    </Space>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Text in disabled state with reduced opacity.',
      },
    },
  },
};

export const RealWorldExamples: Story = {
  name: 'RealWorldUsage',
  render: () => (
    <Space direction="vertical" style={{ width: '100%' }} size="large">
      <Card title="File Path" size="small" style={{ width: 400 }}>
        <BAIText monospace ellipsis={{ tooltip: true }} copyable>
          /home/user/projects/backend.ai-webui/react/src/components/AgentStats.tsx
        </BAIText>
      </Card>

      <Card title="API Key" size="small" style={{ width: 450 }}>
        <BAIText monospace type="secondary" copyable>
          1234567890abcdefghijklmnopqrstuvwxyz
        </BAIText>
        <br />
        <BAIText type="secondary">Access Token with Ellipsis: </BAIText>
        <BAIText code copyable ellipsis={{ tooltip: true }}>
          1234567890abcdefghijklmnopqrstuvwxyz_very_long_token_string
        </BAIText>
      </Card>

      <Card title="Error Message" size="small" style={{ width: 450 }}>
        <BAIText type="danger" ellipsis={{ rows: 2, tooltip: true }}>
          Failed to load resource: net::ERR_CONNECTION_REFUSED at
          https://example.com/api/v1/endpoint. Please check your network
          connection and try again.
        </BAIText>
      </Card>

      <Card title="User Email" size="small" style={{ width: 300 }}>
        <BAIText ellipsis={{ tooltip: true }} copyable>
          user.with.very.long.name@company.example.com
        </BAIText>
      </Card>

      <Card title="Description" size="small" style={{ width: 350 }}>
        <BAIText type="secondary" ellipsis={{ rows: 3, tooltip: true }}>
          This is a sample description that might be quite long and needs to be
          truncated to maintain a clean UI. The full content will be available
          in a tooltip when users hover over the truncated text. This provides a
          good balance between information density and usability.
        </BAIText>
      </Card>

      <Card title="Command & Keyboard" size="small" style={{ width: 200 }}>
        <BAIText type="secondary">To copy the command: </BAIText>
        <BAIText keyboard>Ctrl</BAIText>
        <BAIText type="secondary"> + </BAIText>
        <BAIText keyboard>C</BAIText>
        <br />
        <BAIText code copyable>
          git clone repository.git
        </BAIText>
        <br />
        <BAIText type="secondary">Quick Open: </BAIText>
        <BAIText keyboard copyable ellipsis>
          Ctrl+Shift+P+Alt+Meta+Super
        </BAIText>
      </Card>

      <Card title="Status Update" size="small" style={{ width: 400 }}>
        <BAIText strong mark type="warning">
          Action Required:
        </BAIText>
        <br />
        <BAIText>Your subscription expires in 3 days.</BAIText>
      </Card>

      <Card title="Version Info" size="small" style={{ width: 400 }}>
        <BAIText delete type="secondary">
          Old version: 1.0.0
        </BAIText>
        <br />
        <BAIText strong type="success">
          Current version: 2.0.0
        </BAIText>
      </Card>

      <Card title="Deprecation Notice" size="small" style={{ width: 450 }}>
        <BAIText type="warning" strong>
          ⚠️ Deprecated:
        </BAIText>{' '}
        <BAIText code delete>
          oldFunction()
        </BAIText>
        <BAIText type="secondary"> → Use </BAIText>
        <BAIText code type="success">
          newFunction()
        </BAIText>
        <BAIText type="secondary"> instead</BAIText>
      </Card>

      <Card title="Combined Styles" size="small" style={{ width: 400 }}>
        <BAIText
          type="danger"
          monospace
          strong
          italic
          underline
          ellipsis={{ expandable: true, rows: 1, tooltip: true }}
          copyable
          delete
        >
          Monospace strong italic underlined text with ellipsis and copy for
          very long expandable content that is also marked as deleted
        </BAIText>
      </Card>
    </Space>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Real-world usage examples demonstrating various combinations of features in practical scenarios like file paths, API keys, error messages, commands, version info, and complex text styling.',
      },
    },
  },
};
