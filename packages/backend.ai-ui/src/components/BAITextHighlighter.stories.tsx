import BAIFlex from './BAIFlex';
import BAITextHighlighter from './BAITextHighlighter';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Card, Input } from 'antd';
import React from 'react';

const meta: Meta<typeof BAITextHighlighter> = {
  title: 'Components/BAITextHighlighter',
  component: BAITextHighlighter,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
**BAITextHighlighter** is a text highlighting component that performs case-insensitive keyword matching.

## Features
- Case-insensitive keyword search and highlighting
- Uses theme token (\`colorWarningHover\`) for consistent highlighting
- Handles empty/null children gracefully
- Safely handles special regex characters in keywords
- Custom styling support for highlighted text

## Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| \`children\` | \`string or null\` | - | The text content to search within |
| \`keyword\` | \`string\` | - | The keyword to highlight (case-insensitive) |
| \`style\` | \`React.CSSProperties\` | - | Custom styles for highlighted portions |
        `,
      },
    },
  },
  argTypes: {
    children: {
      control: { type: 'text' },
      description: 'The text content to search within',
      table: {
        type: { summary: 'string | null' },
      },
    },
    keyword: {
      control: { type: 'text' },
      description: 'The keyword to highlight (case-insensitive)',
      table: {
        type: { summary: 'string' },
      },
    },
    style: {
      control: { type: 'object' },
      description: 'Custom styles for highlighted portions',
      table: {
        type: { summary: 'React.CSSProperties' },
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof BAITextHighlighter>;

export const Default: Story = {
  name: 'Basic',
  args: {
    children: 'This is a sample text with some highlighted content.',
    keyword: 'sample',
  },
};

export const CaseInsensitiveMatching: Story = {
  render: () => (
    <BAIFlex direction="column" gap="md">
      <Card size="small" title="Different case variations">
        <BAIFlex direction="column" gap="sm">
          <BAITextHighlighter keyword="backend">
            Backend.AI is a powerful platform
          </BAITextHighlighter>
          <BAITextHighlighter keyword="backend">
            BACKEND.AI provides resource management
          </BAITextHighlighter>
          <BAITextHighlighter keyword="backend">
            The backend infrastructure is robust
          </BAITextHighlighter>
        </BAIFlex>
      </Card>
    </BAIFlex>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Keyword matching is case-insensitive, highlighting all variations regardless of capitalization.',
      },
    },
  },
};

export const MultipleOccurrences: Story = {
  render: () => (
    <BAIFlex direction="column" gap="md">
      <Card size="small" title="Multiple matches in single text">
        <BAITextHighlighter keyword="test">
          This is a test. Testing is important. We need to test everything.
          Tests ensure quality.
        </BAITextHighlighter>
      </Card>
      <Card size="small" title="Long text with multiple matches">
        <BAITextHighlighter keyword="api">
          The Backend.AI API provides a comprehensive set of endpoints. You can
          use the API to manage sessions, access the API documentation, and
          integrate API calls into your application.
        </BAITextHighlighter>
      </Card>
    </BAIFlex>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'All occurrences of the keyword are highlighted within the text.',
      },
    },
  },
};

export const SpecialCharacters: Story = {
  render: () => (
    <BAIFlex direction="column" gap="md">
      <Card size="small" title="Regex special characters are safely escaped">
        <BAIFlex direction="column" gap="sm">
          <BAITextHighlighter keyword="[test]">
            Array notation: items[test] = value
          </BAITextHighlighter>
          <BAITextHighlighter keyword="file.txt">
            Dot in filename: config/file.txt is loaded
          </BAITextHighlighter>
          <BAITextHighlighter keyword="$var">
            Dollar sign: Use $var for variable substitution
          </BAITextHighlighter>
          <BAITextHighlighter keyword="(a+b)">
            Parentheses and plus: Calculate (a+b) * c
          </BAITextHighlighter>
        </BAIFlex>
      </Card>
    </BAIFlex>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Special regex characters ([ ] . $ ( ) + * ? ^ etc.) are automatically escaped, preventing regex errors and ensuring accurate matching.',
      },
    },
  },
};

export const CustomStyling: Story = {
  render: () => (
    <BAIFlex direction="column" gap="md">
      <Card size="small" title="Custom highlight color">
        <BAITextHighlighter
          keyword="custom"
          style={{ backgroundColor: '#52c41a' }}
        >
          This text has custom green highlighting for the word custom.
        </BAITextHighlighter>
      </Card>
      <Card size="small" title="Custom styling with other properties">
        <BAITextHighlighter
          keyword="styled"
          style={{
            backgroundColor: '#1890ff',
            color: 'white',
            padding: '2px 4px',
            borderRadius: '4px',
            fontWeight: 'bold',
          }}
        >
          This text has a styled highlight with multiple properties applied.
        </BAITextHighlighter>
      </Card>
      <Card size="small" title="Underlined highlight">
        <BAITextHighlighter
          keyword="important"
          style={{
            backgroundColor: 'transparent',
            borderBottom: '2px solid #f5222d',
            fontWeight: 'bold',
          }}
        >
          This is an important message with underlined highlighting.
        </BAITextHighlighter>
      </Card>
    </BAIFlex>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'The `style` prop allows custom styling for highlighted text, overriding the default theme-based background color.',
      },
    },
  },
};

export const InteractiveSearch: Story = {
  render: () => {
    const [searchKeyword, setSearchKeyword] = React.useState('backend');
    const items = [
      'Backend.AI WebUI',
      'Backend.AI Manager',
      'Backend.AI Agent',
      'Frontend Components',
      'API Documentation',
      'Backend Infrastructure',
    ];

    return (
      <BAIFlex direction="column" gap="lg" style={{ width: '100%' }}>
        <Card title="Search Filter" size="small" style={{ maxWidth: 400 }}>
          <BAIFlex direction="column" gap="sm">
            <Input
              placeholder="Search..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              allowClear
            />
            <BAIFlex direction="column" gap="xs">
              {items.map((item, index) => (
                <div key={index}>
                  <BAITextHighlighter keyword={searchKeyword}>
                    {item}
                  </BAITextHighlighter>
                </div>
              ))}
            </BAIFlex>
          </BAIFlex>
        </Card>

        <Card title="Log Entry Highlighting" size="small">
          <BAIFlex direction="column" gap="xs">
            <BAITextHighlighter
              keyword="error"
              style={{ backgroundColor: '#ff4d4f', color: 'white' }}
            >
              [2024-01-15 10:23:45] ERROR: Connection failed to database
            </BAITextHighlighter>
            <BAITextHighlighter
              keyword="error"
              style={{ backgroundColor: '#ff4d4f', color: 'white' }}
            >
              [2024-01-15 10:24:12] INFO: Retrying connection
            </BAITextHighlighter>
            <BAITextHighlighter
              keyword="error"
              style={{ backgroundColor: '#ff4d4f', color: 'white' }}
            >
              [2024-01-15 10:24:15] ERROR: Max retries exceeded
            </BAITextHighlighter>
          </BAIFlex>
        </Card>

        <Card title="User Search in Table" size="small">
          <BAIFlex direction="column" gap="sm">
            {[
              { name: 'John Smith', email: 'john.smith@example.com' },
              { name: 'Jane Johnson', email: 'jane.johnson@example.com' },
              { name: 'Bob Jones', email: 'bob.jones@example.com' },
            ].map((user, index) => (
              <div key={index}>
                <BAITextHighlighter keyword="john">
                  {user.name}
                </BAITextHighlighter>
                {' - '}
                <BAITextHighlighter keyword="john">
                  {user.email}
                </BAITextHighlighter>
              </div>
            ))}
          </BAIFlex>
        </Card>
      </BAIFlex>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          'Interactive examples showing BAITextHighlighter in real-world scenarios: search filtering, log highlighting, and user search in tables.',
      },
    },
  },
};
