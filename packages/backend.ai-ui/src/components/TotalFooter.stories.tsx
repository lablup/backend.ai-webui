import TotalFooter from './TotalFooter';
import type { Meta, StoryObj } from '@storybook/react-vite';

/**
 * TotalFooter displays total item count with optional loading indicator.
 *
 * Key features:
 * - Shows total count with i18n support
 * - Loading indicator during data fetch
 * - Theme-aware styling
 *
 * @see TotalFooter.tsx for implementation details
 */
const meta: Meta<typeof TotalFooter> = {
  title: 'Statistic/TotalFooter',
  component: TotalFooter,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
**TotalFooter** displays the total item count with an optional loading indicator.

## Features
- **Total count display**: Shows total items with internationalized text
- **Loading state**: Shows loading spinner when data is being fetched
- **Theme-aware**: Uses theme tokens for consistent styling

## Usage
\`\`\`tsx
<TotalFooter total={42} />
<TotalFooter loading total={42} />
\`\`\`

## Props
| Name | Type | Default | Description |
|------|------|---------|-------------|
| \`total\` | \`number\` | - | Total number of items to display |
| \`loading\` | \`boolean\` | \`false\` | Show loading indicator |

## When to Use
- Table footers showing total row count
- List footers displaying total item count
- Pagination components showing total results
        `,
      },
    },
  },
  argTypes: {
    total: {
      control: { type: 'number', min: 0, max: 10000, step: 1 },
      description: 'Total number of items to display',
      table: {
        type: { summary: 'number' },
      },
    },
    loading: {
      control: { type: 'boolean' },
      description: 'Show loading indicator',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof TotalFooter>;

export const Default: Story = {
  name: 'Basic',
  parameters: {
    docs: {
      description: {
        story: 'Basic usage showing total item count.',
      },
    },
  },
  args: {
    total: 42,
  },
};

export const Loading: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Loading state with spinner. Useful when data is being fetched or updated.',
      },
    },
  },
  args: {
    loading: true,
    total: 42,
  },
};
