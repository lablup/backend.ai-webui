import { SemanticColor } from '../helper';
import BAIBadge from './BAIBadge';
import BAIFlex from './BAIFlex';
import type { Meta, StoryObj } from '@storybook/react-vite';

/**
 * BAIBadge displays a semantic color-coded dot badge with optional text.
 *
 * Key features:
 * - Two visual modes: filled dot (with color) and outline-only dot (without color)
 * - Semantic color system: success (green), info (blue), warning (orange), error (red), default (grey)
 * - Colors automatically adapt to light/dark theme via Ant Design design tokens
 * - Extends Ant Design Badge with semantic color support
 */
const meta: Meta<typeof BAIBadge> = {
  title: 'Badge/BAIBadge',
  component: BAIBadge,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
**BAIBadge** displays a dot badge with semantic colors and optional text.

## Features
- **Two visual modes** depending on the \`color\` prop:
  - **\`color\` provided** → Filled dot with the corresponding semantic color
  - **\`color\` omitted (\`undefined\`)** → Outline-only dot (border only, no fill). Use this when the value is unknown or undetermined.
- Semantic color system using Ant Design design tokens (theme-aware)
  - \`success\` → green, \`info\` → blue, \`warning\` → orange, \`error\` → red, \`default\` → grey

## Props
| Name | Type | Default | Description |
|------|------|---------|-------------|
| color | \`SemanticColor\` | \`undefined\` | Semantic color for the badge dot. When omitted, renders an outline-only dot to indicate an unknown or undetermined state. |
| text | \`ReactNode\` | \`undefined\` | Text to display next to the badge |
| processing | \`boolean\` | \`false\` | When true, shows a ripple animation on the dot to indicate an in-progress state. |

## Usage
\`\`\`tsx
{/* Filled dot with semantic color */}
<BAIBadge color="success" text="RUNNING" />
<BAIBadge color="error" text="CANCELLED" />

{/* Outline-only dot for unknown/undetermined values */}
<BAIBadge text="1 GiB" />

{/* Processing animation */}
<BAIBadge processing text="PREPARING" />
<BAIBadge processing color="success" text="RUNNING" />
\`\`\`
        `,
      },
    },
  },
  argTypes: {
    color: {
      control: { type: 'select' },
      options: [undefined, 'success', 'info', 'warning', 'error', 'default'],
      description:
        'Semantic color for the badge dot. When undefined, renders an outline-only dot to indicate an unknown or undetermined state.',
      table: {
        type: {
          summary:
            "'success' | 'info' | 'warning' | 'error' | 'default' | undefined",
        },
        defaultValue: { summary: 'undefined' },
      },
    },
    text: {
      control: { type: 'text' },
      description: 'Text to display next to the badge',
    },
    processing: {
      control: { type: 'boolean' },
      description:
        'When true, shows a ripple animation on the dot to indicate an in-progress state.',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof BAIBadge>;

/**
 * Outline-only dot for unknown or undetermined values.
 */
export const Default: Story = {
  name: 'Basic',
  parameters: {
    docs: {
      description: {
        story:
          'When `color` is omitted, the badge renders an outline-only dot (border without fill). Use this to indicate that the value is unknown or undetermined.',
      },
    },
  },
  args: {
    text: '1 GiB',
  },
};

/**
 * Success state — green dot badge.
 */
export const Success: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Shows a success badge with a green dot.',
      },
    },
  },
  args: {
    color: 'success',
    text: 'RUNNING',
  },
};

/**
 * Info state — blue dot badge.
 */
export const Info: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Shows an info badge with a blue dot.',
      },
    },
  },
  args: {
    color: 'info',
    text: 'PREPARING',
  },
};

/**
 * Warning state — orange dot badge.
 */
export const Warning: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Shows a warning badge with an orange dot.',
      },
    },
  },
  args: {
    color: 'warning',
    text: 'NEED_RETRY',
  },
};

/**
 * Error state — red dot badge.
 */
export const Error: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Shows an error badge with a red dot.',
      },
    },
  },
  args: {
    color: 'error',
    text: 'CANCELLED',
  },
};

/**
 * Default semantic color — grey dot badge.
 */
export const DefaultColor: Story = {
  name: 'DefaultColor',
  parameters: {
    docs: {
      description: {
        story:
          'Shows a badge with the default semantic color (grey), indicating a neutral or inactive state.',
      },
    },
  },
  args: {
    color: 'default',
    text: 'TERMINATED',
  },
};

/**
 * Processing state — ripple animation on the dot.
 */
export const Processing: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'When `processing` is true, the dot shows a ripple animation to indicate an in-progress state. Can be combined with `color` to show a colored processing dot.',
      },
    },
  },
  args: {
    processing: true,
    text: 'PREPARING',
  },
};

/**
 * Processing with a semantic color.
 */
export const ProcessingWithColor: Story = {
  name: 'ProcessingWithColor',
  parameters: {
    docs: {
      description: {
        story:
          'Processing animation combined with a semantic color. The ripple uses the specified color.',
      },
    },
  },
  args: {
    processing: true,
    color: 'success',
    text: 'RUNNING',
  },
};

/**
 * Display all semantic color variants side by side for comparison.
 */
export const AllColors: Story = {
  name: 'AllColors',
  parameters: {
    docs: {
      description: {
        story:
          'Displays all available semantic colors for comparison. Colors adapt to the active theme.',
      },
    },
  },
  render: () => {
    const variants: { color?: SemanticColor; text: string }[] = [
      { color: 'success', text: 'success' },
      { color: 'info', text: 'info' },
      { color: 'warning', text: 'warning' },
      { color: 'error', text: 'error' },
      { color: 'default', text: 'default' },
      { text: 'undefined' },
    ];

    return (
      <BAIFlex direction="column" gap="md">
        {variants.map(({ color, text }) => (
          <BAIBadge key={text} color={color} text={text} />
        ))}
      </BAIFlex>
    );
  },
};
