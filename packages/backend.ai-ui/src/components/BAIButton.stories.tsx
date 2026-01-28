import BAIButton from './BAIButton';
import BAIFlex from './BAIFlex';
import BAIText from './BAIText';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { action } from 'storybook/internal/actions';

const meta: Meta<typeof BAIButton> = {
  title: 'Button/BAIButton',
  component: BAIButton,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
**BAIButton** extends [Ant Design Button](https://ant.design/components/button).

## BAI-Specific Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| \`action\` | \`() => Promise<void>\` | \`undefined\` | Async operation with automatic loading state via React Transition |

## Key Features
- **Automatic Loading State**: When \`action\` is provided, the button automatically shows loading state during async execution
- **React Transition Integration**: Uses \`useTransition\` for responsive UI updates
- **Double-Click Prevention**: Automatically prevents multiple clicks during execution
- **Composable**: Can combine \`action\` with \`onClick\` for sync + async logic

For all other props, refer to [Ant Design Button](https://ant.design/components/button).
        `,
      },
    },
  },
  argTypes: {
    // BAI-specific props - document fully
    action: {
      control: false,
      description:
        'Async operation with automatic loading state management via React Transition',
      table: {
        type: { summary: '() => Promise<void>' },
        defaultValue: { summary: 'undefined' },
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof BAIButton>;

// Default story: Use args for interactive Controls
export const Default: Story = {
  name: 'Basic',
  args: {
    children: 'Click me',
    type: 'primary',
    action: async () => {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));
      action('action completed')();
    },
  },
};

// Comparison story: Demonstrate BAI-specific action prop
export const WithAction: Story = {
  render: () => {
    const [count, setCount] = useState(0);

    return (
      <BAIFlex direction="column" gap="md" align="start">
        <BAIText>Count: {count}</BAIText>
        <BAIFlex gap="md">
          <BAIButton
            type="primary"
            action={async () => {
              // Simulate async operation (e.g., API call)
              await new Promise((resolve) => setTimeout(resolve, 1500));
              setCount((prev) => prev + 1);
            }}
          >
            Async Action (auto-loading)
          </BAIButton>

          <BAIButton
            type="default"
            onClick={() => {
              setCount((prev) => prev + 1);
            }}
          >
            Sync onClick (no loading)
          </BAIButton>
        </BAIFlex>
      </BAIFlex>
    );
  },
};

// Demonstrate double-click prevention
export const PreventDoubleClick: Story = {
  render: () => {
    const [clickCount, setClickCount] = useState(0);

    return (
      <BAIFlex direction="column" gap="md" align="start">
        <BAIText>
          API calls made: {clickCount} (try clicking multiple times quickly)
        </BAIText>
        <BAIButton
          type="primary"
          action={async () => {
            setClickCount((prev) => prev + 1);
            await new Promise((resolve) => setTimeout(resolve, 3000));
          }}
        >
          Submit (3s delay)
        </BAIButton>
      </BAIFlex>
    );
  },
};

// Demonstrate combining action with onClick
export const CombinedHandlers: Story = {
  render: () => {
    const [logs, setLogs] = useState<string[]>([]);

    const addLog = (message: string) => {
      setLogs((prev) => [
        ...prev,
        `${new Date().toLocaleTimeString()}: ${message}`,
      ]);
    };

    return (
      <BAIFlex direction="column" gap="md" align="start">
        <BAIButton
          type="primary"
          action={async () => {
            addLog('Async action started');
            await new Promise((resolve) => setTimeout(resolve, 2000));
            addLog('Async action completed');
          }}
          onClick={() => {
            addLog('Sync onClick executed');
          }}
        >
          Both action & onClick
        </BAIButton>

        <BAIFlex
          direction="column"
          style={{ maxHeight: 200, overflow: 'auto', fontSize: '12px' }}
        >
          {logs.map((log, i) => (
            <BAIText key={i}>{log}</BAIText>
          ))}
        </BAIFlex>
      </BAIFlex>
    );
  },
};
