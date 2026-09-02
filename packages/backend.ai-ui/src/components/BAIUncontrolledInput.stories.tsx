import BAIFlex from './BAIFlex';
import BAIUncontrolledInput from './BAIUncontrolledInput';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';

/**
 * BAIUncontrolledInput is an intentionally uncontrolled input that commits
 * its value only on Enter or blur — not on every keystroke.
 *
 * Key features:
 * - value/onChange are removed by design (uses defaultValue + onCommit)
 * - Commits value on blur or Enter key press
 * - Shows Enter icon hint when focused
 * - Hides number input spinners
 *
 * @see BAIUncontrolledInput.tsx for implementation details
 */
const meta: Meta<typeof BAIUncontrolledInput> = {
  title: 'Input/BAIUncontrolledInput',
  component: BAIUncontrolledInput,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
**BAIUncontrolledInput** extends [Ant Design Input](https://ant.design/components/input) as an **intentionally uncontrolled** component.

## Purpose
This component exists to keep expensive commit side effects — such as persisting to localStorage — from running on every keystroke. The \`value\`/\`onChange\` props are deliberately removed from its API to steer consumers toward \`onCommit\`, the intended commit path: the new value is delivered only when the user finishes editing. (Per-keystroke handlers inherited from Ant Design Input, such as \`onInput\`/\`onKeyUp\`, still pass through — this is a convention, not an enforced restriction.)

- **Enter key** — commits the value (internally triggers blur)
- **Blur** — clicking/tabbing away commits the value

While focused, an Enter (⏎) icon appears in the suffix as an explicit visual cue that the value is applied on Enter (or blur), so users understand typing alone does not save.

## BAI-Specific Features
- **Uncontrolled by design**: \`value\`/\`onChange\` are excluded from props; uses \`defaultValue\` + \`onCommit\`
- **Commit on blur/Enter**: Triggers \`onCommit\` callback when input loses focus or Enter is pressed
- **Enter icon hint**: Shows ⏎ icon when focused to signal the commit-on-Enter behavior
- **No number spinners**: Hides spinner arrows for number input type
- **Reset on external change**: Changing \`defaultValue\` remounts the input (via \`key\`), discarding uncommitted edits

## Usage
\`\`\`tsx
// Persist a setting only when the user finishes editing
<BAIUncontrolledInput
  defaultValue={storedValue}
  onCommit={(value) => saveToLocalStorage(value)}
/>

// Number input without spinners
<BAIUncontrolledInput
  type="number"
  defaultValue="42"
  onCommit={(value) => updateValue(Number(value))}
/>
\`\`\`

## Props
| Name | Type | Default | Description |
|------|------|---------|-------------|
| \`defaultValue\` | \`string\` | - | Initial value (uncontrolled). Changing it resets the input |
| \`onCommit\` | \`(value: string) => void\` | - | Callback when value is committed (blur or Enter) |

\`value\` and \`onChange\` are intentionally not available. For all other props, refer to [Ant Design Input](https://ant.design/components/input).

## When to Use
- When committing the value has side effects that must not run per keystroke (e.g. localStorage writes, network requests)
- For form fields that should only update on blur/Enter (not on every keystroke)
- When you want to avoid re-renders on every character typed

Use a regular controlled \`Input\` when the UI must react to the value as the user types (live filtering, character counters, inline validation while typing).
        `,
      },
    },
  },
  argTypes: {
    defaultValue: {
      control: { type: 'text' },
      description: 'Initial value for the uncontrolled input',
      table: {
        type: { summary: 'string' },
      },
    },
    onCommit: {
      action: 'committed',
      description: 'Callback when value is committed (on blur or Enter key)',
      table: {
        type: { summary: '(value: string) => void' },
      },
    },
    type: {
      control: { type: 'select' },
      options: ['text', 'number', 'password', 'email', 'url'],
      description: 'Input type',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: 'text' },
      },
    },
    placeholder: {
      control: { type: 'text' },
      description: 'Placeholder text',
      table: {
        type: { summary: 'string' },
      },
    },
    disabled: {
      control: { type: 'boolean' },
      description: 'Whether input is disabled',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof BAIUncontrolledInput>;

export const Default: Story = {
  name: 'Basic',
  parameters: {
    docs: {
      description: {
        story:
          'Basic uncontrolled input. Type text and press Enter or click outside to commit the value.',
      },
    },
  },
  args: {
    defaultValue: 'Edit me and press Enter',
    placeholder: 'Type something...',
  },
};

export const NumberInput: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Number input without spinner arrows. Notice the spinner controls are hidden.',
      },
    },
  },
  args: {
    type: 'number',
    defaultValue: '42',
    placeholder: 'Enter a number',
  },
};

export const CommitBehavior: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Demonstrates commit-on-blur behavior. Edit the input and see the committed value update when you blur or press Enter.',
      },
    },
  },
  render: () => {
    const [committedValue, setCommittedValue] = useState('');

    return (
      <BAIFlex direction="column" gap="md" style={{ width: 300 }}>
        <div>
          <div style={{ marginBottom: 8, fontWeight: 500 }}>
            Edit and press Enter or blur:
          </div>
          <BAIUncontrolledInput
            defaultValue="Edit this text"
            onCommit={(value) => setCommittedValue(value)}
            placeholder="Type and commit..."
          />
        </div>
        <div>
          <div style={{ marginBottom: 8, fontWeight: 500 }}>
            Committed Value:
          </div>
          <div
            style={{
              padding: 8,
              background: '#f5f5f5',
              borderRadius: 4,
              fontFamily: 'monospace',
            }}
          >
            {committedValue || '(not committed yet)'}
          </div>
        </div>
      </BAIFlex>
    );
  },
};

export const EnterIconHint: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Focus on the input to see the Enter icon hint appear in the suffix.',
      },
    },
  },
  render: () => (
    <BAIFlex direction="column" gap="md" style={{ width: 300 }}>
      <div>
        <div style={{ marginBottom: 8 }}>Focus to see Enter icon:</div>
        <BAIUncontrolledInput
          defaultValue="Focus me"
          placeholder="Click to focus..."
        />
      </div>
      <div style={{ fontSize: 12, color: '#666' }}>
        💡 The ⏎ icon appears when focused to indicate you can press Enter to
        commit.
      </div>
    </BAIFlex>
  ),
};

export const WithValidation: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Example with validation on commit.',
      },
    },
  },
  render: () => {
    const [error, setError] = useState('');

    return (
      <BAIFlex direction="column" gap="md" style={{ width: 300 }}>
        <div>
          <div style={{ marginBottom: 8, fontWeight: 500 }}>
            Enter a number between 1-100:
          </div>
          <BAIUncontrolledInput
            type="number"
            defaultValue="50"
            status={error ? 'error' : undefined}
            onCommit={(value) => {
              const num = Number(value);
              if (isNaN(num) || num < 1 || num > 100) {
                setError('Must be between 1 and 100');
              } else {
                setError('');
              }
            }}
          />
          {error && (
            <div style={{ color: '#ff4d4f', marginTop: 4 }}>{error}</div>
          )}
        </div>
      </BAIFlex>
    );
  },
};

export const DifferentStates: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Input in different states (normal, disabled, error, warning).',
      },
    },
  },
  render: () => (
    <BAIFlex direction="column" gap="md" style={{ width: 300 }}>
      <div>
        <div style={{ marginBottom: 8 }}>Normal:</div>
        <BAIUncontrolledInput defaultValue="Normal input" />
      </div>
      <div>
        <div style={{ marginBottom: 8 }}>Disabled:</div>
        <BAIUncontrolledInput defaultValue="Disabled input" disabled />
      </div>
      <div>
        <div style={{ marginBottom: 8 }}>Error:</div>
        <BAIUncontrolledInput defaultValue="Error state" status="error" />
      </div>
      <div>
        <div style={{ marginBottom: 8 }}>Warning:</div>
        <BAIUncontrolledInput defaultValue="Warning state" status="warning" />
      </div>
    </BAIFlex>
  ),
};

export const RealWorldExample: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Realistic examples showing typical use cases in Backend.AI WebUI.',
      },
    },
  },
  render: () => {
    const [sessionName, setSessionName] = useState('my-jupyter-session');
    const [cpuLimit, setCpuLimit] = useState('4');
    const [memoryGB, setMemoryGB] = useState('16');

    return (
      <BAIFlex direction="column" gap="lg" style={{ width: 400 }}>
        <div>
          <div style={{ marginBottom: 8, fontWeight: 500 }}>
            Session Configuration
          </div>
          <BAIFlex direction="column" gap="sm">
            <div>
              <div style={{ marginBottom: 4, fontSize: 12 }}>Session Name:</div>
              <BAIUncontrolledInput
                defaultValue={sessionName}
                onCommit={(value) => setSessionName(value)}
                placeholder="Enter session name"
              />
            </div>
            <div>
              <div style={{ marginBottom: 4, fontSize: 12 }}>CPU Cores:</div>
              <BAIUncontrolledInput
                type="number"
                defaultValue={cpuLimit}
                onCommit={(value) => setCpuLimit(value)}
                placeholder="Number of cores"
              />
            </div>
            <div>
              <div style={{ marginBottom: 4, fontSize: 12 }}>Memory (GB):</div>
              <BAIUncontrolledInput
                type="number"
                defaultValue={memoryGB}
                onCommit={(value) => setMemoryGB(value)}
                placeholder="Memory in GB"
              />
            </div>
          </BAIFlex>
        </div>

        <div>
          <div style={{ marginBottom: 8, fontWeight: 500 }}>
            Current Configuration
          </div>
          <div
            style={{
              padding: 12,
              background: '#f5f5f5',
              borderRadius: 4,
              fontFamily: 'monospace',
              fontSize: 12,
            }}
          >
            <div>Session: {sessionName}</div>
            <div>CPU: {cpuLimit} cores</div>
            <div>Memory: {memoryGB} GB</div>
          </div>
        </div>
      </BAIFlex>
    );
  },
};
