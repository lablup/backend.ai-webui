import BAIFetchKeyButton from './BAIFetchKeyButton';
import BAIFlex from './BAIFlex';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';

const meta: Meta<typeof BAIFetchKeyButton> = {
  title: 'Components/BAIFetchKeyButton',
  component: BAIFetchKeyButton,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
**BAIFetchKeyButton** extends [Ant Design Button](https://ant.design/components/button) with fetch key management.

A refresh button that manages fetch keys for data refetching with auto-update capabilities.

## BAI-Specific Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| \`value\` | \`string\` | - | Current fetch key value |
| \`loading\` | \`boolean\` | \`false\` | Loading state of the data fetch |
| \`lastLoadTime\` | \`Date\` | \`undefined\` | Timestamp of the last successful load |
| \`showLastLoadTime\` | \`boolean\` | \`false\` | Shows "Last updated: X ago" in tooltip |
| \`autoUpdateDelay\` | \`number \\| null\` | \`null\` | Auto-refresh interval in milliseconds |
| \`onChange\` | \`(fetchKey: string) => void\` | - | Callback fired when fetch key updates |
| \`hidden\` | \`boolean\` | \`false\` | Hides the button completely |
| \`pauseWhenHidden\` | \`boolean\` | \`true\` | Pauses auto-update when button is hidden |

For all other props, refer to [Ant Design Button](https://ant.design/components/button).
        `,
      },
    },
  },
  argTypes: {
    value: {
      control: { type: 'text' },
      description: 'Current fetch key value',
      table: {
        type: { summary: 'string' },
      },
    },
    loading: {
      control: { type: 'boolean' },
      description: 'Loading state of the data fetch',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
    lastLoadTime: {
      control: { type: 'date' },
      description: 'Timestamp of the last successful load',
      table: {
        type: { summary: 'Date' },
        defaultValue: { summary: 'undefined' },
      },
    },
    showLastLoadTime: {
      control: { type: 'boolean' },
      description: 'When true, shows "Last updated: X ago" in tooltip',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
    autoUpdateDelay: {
      control: { type: 'number' },
      description: 'Auto-refresh interval in milliseconds, null to disable',
      table: {
        type: { summary: 'number | null' },
        defaultValue: { summary: 'null' },
      },
    },
    onChange: {
      action: 'onChange',
      description: 'Callback fired when fetch key should be updated',
      table: {
        type: { summary: '(fetchKey: string) => void' },
      },
    },
    hidden: {
      control: { type: 'boolean' },
      description: 'When true, hides the button completely',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
    pauseWhenHidden: {
      control: { type: 'boolean' },
      description: 'When true, pauses auto-update when button is hidden',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'true' },
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof BAIFetchKeyButton>;

export const Default: Story = {
  name: 'Basic Usage',
  args: {
    value: new Date().toISOString(),
    loading: false,
    onChange: (fetchKey) => console.log('Fetch key updated:', fetchKey),
  },
};

export const WithLastLoadTime: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Shows the last update time in a tooltip that updates every 5 seconds.',
      },
    },
  },
  render: () => {
    const [fetchKey, setFetchKey] = useState(new Date().toISOString());
    const [loading, setLoading] = useState(false);

    const handleChange = (newKey: string) => {
      setLoading(true);
      setFetchKey(newKey);
      // Simulate API call
      setTimeout(() => {
        setLoading(false);
      }, 1000);
    };

    return (
      <BAIFlex direction="column" gap="md" align="start">
        <BAIFlex gap="sm" align="center">
          <span style={{ width: 200 }}>Without last load time:</span>
          <BAIFetchKeyButton
            value={fetchKey}
            loading={loading}
            onChange={handleChange}
            showLastLoadTime={false}
          />
        </BAIFlex>
        <BAIFlex gap="sm" align="center">
          <span style={{ width: 200 }}>With last load time:</span>
          <BAIFetchKeyButton
            value={fetchKey}
            loading={loading}
            onChange={handleChange}
            showLastLoadTime={true}
          />
        </BAIFlex>
      </BAIFlex>
    );
  },
};

export const AutoUpdate: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Automatically refreshes data at specified intervals. The button shows a counter that increments with each auto-refresh.',
      },
    },
  },
  render: () => {
    const [fetchKey, setFetchKey] = useState(new Date().toISOString());
    const [loading, setLoading] = useState(false);
    const [counter, setCounter] = useState(0);

    const handleChange = (newKey: string) => {
      setLoading(true);
      setFetchKey(newKey);
      setCounter((prev) => prev + 1);
      // Simulate API call
      setTimeout(() => {
        setLoading(false);
      }, 800);
    };

    return (
      <BAIFlex direction="column" gap="md" align="start">
        <BAIFlex gap="sm" align="center">
          <span style={{ width: 200 }}>Auto-update (5s):</span>
          <BAIFetchKeyButton
            value={fetchKey}
            loading={loading}
            onChange={handleChange}
            autoUpdateDelay={5000}
            showLastLoadTime={true}
          />
          <span>Refresh count: {counter}</span>
        </BAIFlex>
        <BAIFlex gap="sm" align="center">
          <span style={{ width: 200 }}>Manual only:</span>
          <BAIFetchKeyButton
            value={fetchKey}
            loading={loading}
            onChange={handleChange}
            showLastLoadTime={true}
          />
        </BAIFlex>
      </BAIFlex>
    );
  },
};

export const LoadingState: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Demonstrates the loading state with a minimum display time to avoid flickering.',
      },
    },
  },
  render: () => {
    const [fetchKey, setFetchKey] = useState(new Date().toISOString());
    const [loading, setLoading] = useState(false);

    const handleChange = (newKey: string) => {
      setLoading(true);
      setFetchKey(newKey);
      // Simulate fast API call (loading will still show for at least 700ms)
      setTimeout(() => {
        setLoading(false);
      }, 100);
    };

    return (
      <BAIFlex direction="column" gap="md" align="start">
        <BAIFlex gap="sm" align="center">
          <span style={{ width: 200 }}>Click to see loading:</span>
          <BAIFetchKeyButton
            value={fetchKey}
            loading={loading}
            onChange={handleChange}
            showLastLoadTime={true}
          />
        </BAIFlex>
        <div style={{ fontSize: '12px', color: '#666' }}>
          Loading state persists for at least 700ms to prevent flickering
        </div>
      </BAIFlex>
    );
  },
};

export const HiddenState: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Shows how the button can be conditionally hidden while pausing auto-updates.',
      },
    },
  },
  render: () => {
    const [fetchKey, setFetchKey] = useState(new Date().toISOString());
    const [loading, setLoading] = useState(false);
    const [isHidden, setIsHidden] = useState(false);

    const handleChange = (newKey: string) => {
      setLoading(true);
      setFetchKey(newKey);
      setTimeout(() => {
        setLoading(false);
      }, 800);
    };

    return (
      <BAIFlex direction="column" gap="md" align="start">
        <BAIFlex gap="sm" align="center">
          <label>
            <input
              type="checkbox"
              checked={isHidden}
              onChange={(e) => setIsHidden(e.target.checked)}
            />
            {' Hide button'}
          </label>
        </BAIFlex>
        <BAIFlex gap="sm" align="center">
          <span style={{ width: 200 }}>Button visibility:</span>
          <BAIFetchKeyButton
            value={fetchKey}
            loading={loading}
            onChange={handleChange}
            hidden={isHidden}
            autoUpdateDelay={3000}
            showLastLoadTime={true}
          />
        </BAIFlex>
      </BAIFlex>
    );
  },
};

export const ButtonSizes: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Available button sizes using the Ant Design size prop.',
      },
    },
  },
  render: () => {
    const [fetchKey, setFetchKey] = useState(new Date().toISOString());
    const [loading, setLoading] = useState(false);

    const handleChange = (newKey: string) => {
      setLoading(true);
      setFetchKey(newKey);
      setTimeout(() => {
        setLoading(false);
      }, 800);
    };

    return (
      <BAIFlex direction="column" gap="md" align="start">
        <BAIFlex gap="sm" align="center">
          <span style={{ width: 100 }}>Large:</span>
          <BAIFetchKeyButton
            value={fetchKey}
            loading={loading}
            onChange={handleChange}
            size="large"
            showLastLoadTime={true}
          />
        </BAIFlex>
        <BAIFlex gap="sm" align="center">
          <span style={{ width: 100 }}>Middle:</span>
          <BAIFetchKeyButton
            value={fetchKey}
            loading={loading}
            onChange={handleChange}
            size="middle"
            showLastLoadTime={true}
          />
        </BAIFlex>
        <BAIFlex gap="sm" align="center">
          <span style={{ width: 100 }}>Small:</span>
          <BAIFetchKeyButton
            value={fetchKey}
            loading={loading}
            onChange={handleChange}
            size="small"
            showLastLoadTime={true}
          />
        </BAIFlex>
      </BAIFlex>
    );
  },
};
