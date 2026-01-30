import BAIFlex from './BAIFlex';
import BAIIntervalView from './BAIIntervalView';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from 'antd';
import { useRef, useState } from 'react';

/**
 * BAIIntervalView renders content that updates at specified intervals.
 *
 * Key features:
 * - Auto-updates content at specified intervals
 * - Supports custom render function or direct value display
 * - Trigger immediate update with triggerKey
 * - Pauses when tab is hidden (by default)
 *
 * @see BAIIntervalView.tsx for implementation details
 */
const meta: Meta<typeof BAIIntervalView> = {
  title: 'Utility/BAIIntervalView',
  component: BAIIntervalView,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
**BAIIntervalView** is a utility component that automatically updates its content at specified intervals.

## Features
- **Interval updates**: Execute callback at regular intervals and display the result
- **Custom rendering**: Use \`render\` prop for custom display logic
- **Manual trigger**: Update immediately when \`triggerKey\` changes
- **Visibility-aware**: Automatically pauses when tab is hidden to save resources

## Usage
\`\`\`tsx
// Display current time updated every second
<BAIIntervalView
  callback={() => new Date().toLocaleTimeString()}
  delay={1000}
/>

// Custom render function
<BAIIntervalView
  callback={() => Math.random()}
  delay={2000}
  render={(value) => <div>Random: {value.toFixed(3)}</div>}
/>

// Manual trigger with triggerKey
<BAIIntervalView
  callback={fetchData}
  delay={5000}
  triggerKey={refreshKey}
/>
\`\`\`

## Props
| Name | Type | Default | Description |
|------|------|---------|-------------|
| \`callback\` | \`() => T\` | (required) | Function that returns the value to display |
| \`delay\` | \`number \\| null\` | (required) | Update interval in milliseconds, or null to pause |
| \`render\` | \`(data: T) => ReactNode\` | - | Custom render function, if omitted shows value directly |
| \`triggerKey\` | \`string\` | - | Changing this value triggers immediate update |

## When to Use
- Real-time clocks or timers
- Periodic status polling
- Live data displays that need regular updates
- Any content that changes over time and needs automatic refresh
        `,
      },
    },
  },
  argTypes: {
    callback: {
      control: false,
      description: 'Function that returns the value to display',
      table: {
        type: { summary: '() => T' },
      },
    },
    delay: {
      control: { type: 'number', min: 100, max: 10000, step: 100 },
      description: 'Update interval in milliseconds (null to pause)',
      table: {
        type: { summary: 'number | null' },
      },
    },
    render: {
      control: false,
      description: 'Optional custom render function',
      table: {
        type: { summary: '(data: T) => ReactNode' },
      },
    },
    triggerKey: {
      control: { type: 'text' },
      description: 'Changing this value triggers immediate update',
      table: {
        type: { summary: 'string' },
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof BAIIntervalView>;

export const Default: Story = {
  name: 'Basic',
  parameters: {
    docs: {
      description: {
        story: 'Basic usage showing current time updated every second.',
      },
    },
  },
  render: () => (
    <div>
      <div style={{ marginBottom: 8, fontWeight: 500 }}>Current Time:</div>
      <div style={{ fontSize: 24, fontFamily: 'monospace' }}>
        <BAIIntervalView
          callback={() => new Date().toLocaleTimeString()}
          delay={1000}
        />
      </div>
    </div>
  ),
};

export const CustomRender: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Using custom render function to format the output. Shows random number updated every 2 seconds.',
      },
    },
  },
  render: () => (
    <BAIIntervalView
      callback={() => Math.random()}
      delay={2000}
      render={(value) => (
        <div
          style={{
            padding: 16,
            background: '#f5f5f5',
            borderRadius: 4,
            fontFamily: 'monospace',
          }}
        >
          <div>Random Value: {value.toFixed(6)}</div>
          <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>
            Updates every 2 seconds
          </div>
        </div>
      )}
    />
  ),
};

export const ManualTrigger: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Demonstrates triggerKey to force immediate update. Click the button to trigger refresh.',
      },
    },
  },
  render: () => {
    const [triggerKey, setTriggerKey] = useState('initial');
    const countRef = useRef(0);

    return (
      <BAIFlex direction="column" gap="md">
        <Button onClick={() => setTriggerKey(Date.now().toString())}>
          Trigger Update
        </Button>

        <div>
          <div style={{ marginBottom: 8, fontWeight: 500 }}>
            Auto-update every 5s:
          </div>
          <BAIIntervalView
            callback={() => {
              countRef.current += 1;
              return `Updated at ${new Date().toLocaleTimeString()} (count: ${countRef.current})`;
            }}
            delay={5000}
            triggerKey={triggerKey}
            render={(value) => (
              <div
                style={{
                  padding: 12,
                  background: '#f5f5f5',
                  borderRadius: 4,
                  fontFamily: 'monospace',
                }}
              >
                {value}
              </div>
            )}
          />
        </div>
      </BAIFlex>
    );
  },
};

export const PauseResume: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Demonstrates pausing and resuming the interval by setting delay to null.',
      },
    },
  },
  render: () => {
    const [delay, setDelay] = useState<number | null>(1000);

    return (
      <BAIFlex direction="column" gap="md">
        <BAIFlex gap="sm">
          <Button
            onClick={() => setDelay(1000)}
            type={delay === 1000 ? 'primary' : 'default'}
          >
            Start (1s)
          </Button>
          <Button
            onClick={() => setDelay(null)}
            type={delay === null ? 'primary' : 'default'}
          >
            Pause
          </Button>
        </BAIFlex>

        <div>
          <div style={{ marginBottom: 8, fontWeight: 500 }}>
            Status: {delay === null ? '⏸️ Paused' : '▶️ Running'}
          </div>
          <div style={{ fontSize: 20, fontFamily: 'monospace' }}>
            <BAIIntervalView
              callback={() => new Date().toLocaleTimeString()}
              delay={delay}
            />
          </div>
        </div>
      </BAIFlex>
    );
  },
};

export const MultipleCounters: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Multiple interval views with different update frequencies.',
      },
    },
  },
  render: () => (
    <BAIFlex direction="column" gap="md">
      <div>
        <div style={{ marginBottom: 8, fontWeight: 500 }}>Fast (1s):</div>
        <BAIIntervalView
          callback={() => Date.now()}
          delay={1000}
          render={(ms) => <div style={{ fontFamily: 'monospace' }}>{ms}</div>}
        />
      </div>

      <div>
        <div style={{ marginBottom: 8, fontWeight: 500 }}>Medium (2s):</div>
        <BAIIntervalView
          callback={() => new Date().toLocaleTimeString()}
          delay={2000}
          render={(time) => (
            <div style={{ fontFamily: 'monospace' }}>{time}</div>
          )}
        />
      </div>

      <div>
        <div style={{ marginBottom: 8, fontWeight: 500 }}>Slow (5s):</div>
        <BAIIntervalView
          callback={() => new Date().toLocaleDateString()}
          delay={5000}
          render={(date) => (
            <div style={{ fontFamily: 'monospace' }}>{date}</div>
          )}
        />
      </div>
    </BAIFlex>
  ),
};

export const RealWorldExample: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Realistic example: Session uptime counter and status polling.',
      },
    },
  },
  render: () => {
    const startTimeRef = useRef(Date.now());
    const [isRunning, setIsRunning] = useState(true);

    return (
      <BAIFlex direction="column" gap="lg" style={{ width: 400 }}>
        <div>
          <div style={{ marginBottom: 8, fontWeight: 500 }}>Session Uptime</div>
          <div
            style={{
              padding: 16,
              background: '#f5f5f5',
              borderRadius: 4,
              fontFamily: 'monospace',
              fontSize: 24,
            }}
          >
            <BAIIntervalView
              callback={() => {
                const elapsed = Date.now() - startTimeRef.current;
                const seconds = Math.floor(elapsed / 1000);
                const minutes = Math.floor(seconds / 60);
                const hours = Math.floor(minutes / 60);
                return `${hours.toString().padStart(2, '0')}:${(minutes % 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`;
              }}
              delay={isRunning ? 1000 : null}
            />
          </div>
        </div>

        <div>
          <div style={{ marginBottom: 8, fontWeight: 500 }}>
            Resource Usage (refreshes every 3s)
          </div>
          <BAIIntervalView
            callback={() => ({
              cpu: (Math.random() * 100).toFixed(1),
              memory: (Math.random() * 100).toFixed(1),
            })}
            delay={isRunning ? 3000 : null}
            render={(usage) => (
              <div
                style={{
                  padding: 12,
                  background: '#f5f5f5',
                  borderRadius: 4,
                }}
              >
                <div>CPU: {usage.cpu}%</div>
                <div>Memory: {usage.memory}%</div>
              </div>
            )}
          />
        </div>

        <Button onClick={() => setIsRunning(!isRunning)} type="primary" block>
          {isRunning ? 'Pause Monitoring' : 'Resume Monitoring'}
        </Button>
      </BAIFlex>
    );
  },
};
