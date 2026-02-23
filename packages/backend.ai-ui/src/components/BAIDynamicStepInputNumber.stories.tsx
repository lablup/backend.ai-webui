import BAIDynamicStepInputNumber from './BAIDynamicStepInputNumber';
import BAIFlex from './BAIFlex';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';

/**
 * BAIDynamicStepInputNumber provides a numeric input with custom step increments.
 *
 * Key features:
 * - Custom step values for arrow up/down navigation
 * - Respects min/max boundaries when stepping
 * - Useful for resource allocation inputs (CPU, memory, GPU)
 *
 * @see BAIDynamicStepInputNumber.tsx for implementation details
 */
const meta: Meta<typeof BAIDynamicStepInputNumber> = {
  title: 'Input/BAIDynamicStepInputNumber',
  component: BAIDynamicStepInputNumber,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
**BAIDynamicStepInputNumber** extends [Ant Design InputNumber](https://ant.design/components/input-number) with dynamic step functionality.

## BAI-Specific Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| \`dynamicSteps\` | \`number[]\` | \`[0, 0.0625, 0.125, 0.25, 0.5, 0.75, 1, 2, 4, 8, 16, 32, 64, 128, 256, 512, 1024, 2048, 4096, 8192, 16384, 32768, 65536]\` | Array of step values for arrow up/down navigation |

## Features
- **Dynamic Stepping**: Use arrow up/down to navigate through custom step values instead of fixed increments
- **Boundary Respect**: Automatically clips to min/max values when stepping
- **Resource Allocation**: Ideal for CPU cores, memory (GiB), GPU counts with non-linear increments

## Usage
\`\`\`tsx
<BAIDynamicStepInputNumber
  value={value}
  onChange={setValue}
  dynamicSteps={[0, 0.5, 1, 2, 4, 8, 16, 32]}
  min={0}
  max={32}
/>
\`\`\`

For all other props, refer to [Ant Design InputNumber](https://ant.design/components/input-number).
        `,
      },
    },
  },
  argTypes: {
    dynamicSteps: {
      control: { type: 'object' },
      description:
        'Array of step values to use when clicking arrow up/down buttons',
      table: {
        type: { summary: 'number[]' },
        defaultValue: {
          summary:
            '[0, 0.0625, 0.125, 0.25, 0.5, 0.75, 1, 2, 4, 8, 16, 32, 64, 128, 256, 512, 1024, 2048, 4096, 8192, 16384, 32768, 65536]',
        },
      },
    },
    value: {
      control: { type: 'number' },
      description: 'Current value',
      table: {
        type: { summary: 'number' },
      },
    },
    onChange: {
      action: 'changed',
      description: 'Callback when value changes',
    },
    min: {
      control: { type: 'number' },
      description: 'Minimum value',
      table: {
        type: { summary: 'number' },
      },
    },
    max: {
      control: { type: 'number' },
      description: 'Maximum value',
      table: {
        type: { summary: 'number' },
      },
    },
    disabled: {
      control: { type: 'boolean' },
      description: 'Whether the input is disabled',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
    placeholder: {
      control: { type: 'text' },
      description: 'Placeholder text',
      table: {
        type: { summary: 'string' },
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof BAIDynamicStepInputNumber>;

// =============================================================================
// Stories
// =============================================================================

/**
 * Basic usage with default dynamic steps.
 * Try clicking arrow up/down buttons to see non-linear stepping.
 */
export const Default: Story = {
  name: 'Basic',
  parameters: {
    docs: {
      description: {
        story:
          'Basic usage demonstrating dynamic stepping. Click arrow up/down buttons to navigate through predefined step values: 0, 0.0625, 0.125, 0.25, 0.5, 0.75, 1, 2, 4, 8, 16, etc.',
      },
    },
  },
  render: () => {
    const [value, setValue] = useState(1);

    return (
      <BAIFlex direction="column" gap="md">
        <BAIDynamicStepInputNumber
          value={value}
          onChange={(newValue) => setValue(newValue)}
          placeholder="Enter value or use arrows"
        />
        <div>Current value: {value}</div>
      </BAIFlex>
    );
  },
};

/**
 * Custom step values for CPU core allocation.
 */
export const CPUCores: Story = {
  name: 'CPUCoreAllocation',
  parameters: {
    docs: {
      description: {
        story:
          'Example for CPU core allocation with custom steps: 0, 0.5, 1, 2, 4, 8, 16, 32. Useful for fractional CPU allocation.',
      },
    },
  },
  render: () => {
    const [value, setValue] = useState(1);

    return (
      <BAIFlex direction="column" gap="md">
        <BAIDynamicStepInputNumber
          value={value}
          onChange={(newValue) => setValue(newValue)}
          dynamicSteps={[0, 0.5, 1, 2, 4, 8, 16, 32]}
          min={0}
          max={32}
          placeholder="CPU cores"
        />
        <div>Selected CPU cores: {value}</div>
      </BAIFlex>
    );
  },
};

/**
 * Custom step values for memory (GiB) allocation.
 */
export const MemoryGiB: Story = {
  name: 'MemoryAllocation',
  parameters: {
    docs: {
      description: {
        story:
          'Example for memory (GiB) allocation with custom steps: 0, 0.5, 1, 2, 4, 8, 16, 32, 64, 128, 256. Ideal for exponential resource scaling.',
      },
    },
  },
  render: () => {
    const [value, setValue] = useState(4);

    return (
      <BAIFlex direction="column" gap="md">
        <BAIDynamicStepInputNumber
          value={value}
          onChange={(newValue) => setValue(newValue)}
          dynamicSteps={[0, 0.5, 1, 2, 4, 8, 16, 32, 64, 128, 256]}
          min={0}
          max={256}
          placeholder="Memory (GiB)"
          addonAfter="GiB"
        />
        <div>Selected memory: {value} GiB</div>
      </BAIFlex>
    );
  },
};

/**
 * Custom step values for GPU count allocation.
 */
export const GPUCount: Story = {
  name: 'GPUAllocation',
  parameters: {
    docs: {
      description: {
        story:
          'Example for GPU count allocation with custom steps: 0, 1, 2, 4, 8. Useful for discrete GPU allocation.',
      },
    },
  },
  render: () => {
    const [value, setValue] = useState(1);

    return (
      <BAIFlex direction="column" gap="md">
        <BAIDynamicStepInputNumber
          value={value}
          onChange={(newValue) => setValue(newValue)}
          dynamicSteps={[0, 1, 2, 4, 8]}
          min={0}
          max={8}
          placeholder="GPU count"
        />
        <div>Selected GPUs: {value}</div>
      </BAIFlex>
    );
  },
};

/**
 * Input with min/max boundaries.
 * Steps will respect boundaries when clicking arrows.
 */
export const WithMinMax: Story = {
  name: 'BoundaryRespect',
  parameters: {
    docs: {
      description: {
        story:
          'Demonstrates how dynamic steps respect min/max boundaries. Try stepping beyond boundaries to see automatic clipping.',
      },
    },
  },
  render: () => {
    const [value, setValue] = useState(4);

    return (
      <BAIFlex direction="column" gap="md">
        <BAIDynamicStepInputNumber
          value={value}
          onChange={(newValue) => setValue(newValue)}
          dynamicSteps={[0, 1, 2, 4, 8, 16, 32, 64]}
          min={2}
          max={32}
          placeholder="Value between 2 and 32"
        />
        <div>Current value: {value} (min: 2, max: 32)</div>
      </BAIFlex>
    );
  },
};

/**
 * Disabled state.
 */
export const Disabled: Story = {
  name: 'DisabledState',
  parameters: {
    docs: {
      description: {
        story: 'Shows the component in a disabled state.',
      },
    },
  },
  render: () => {
    return (
      <BAIDynamicStepInputNumber
        value={8}
        onChange={() => {}}
        disabled
        placeholder="Disabled input"
      />
    );
  },
};

/**
 * Comparison of different step configurations.
 */
export const StepComparison: Story = {
  name: 'StepConfigurations',
  parameters: {
    docs: {
      description: {
        story:
          'Compares different dynamic step configurations side by side. Each has different step values tailored for specific use cases.',
      },
    },
  },
  render: () => {
    const [cpuValue, setCpuValue] = useState(1);
    const [memValue, setMemValue] = useState(4);
    const [gpuValue, setGpuValue] = useState(1);

    return (
      <BAIFlex direction="column" gap="lg">
        <BAIFlex direction="column" gap="sm">
          <strong>CPU Cores (fractional)</strong>
          <BAIDynamicStepInputNumber
            value={cpuValue}
            onChange={(v) => setCpuValue(v)}
            dynamicSteps={[0, 0.5, 1, 2, 4, 8, 16]}
            min={0}
            max={16}
            placeholder="CPU"
          />
          <div>Value: {cpuValue}</div>
        </BAIFlex>

        <BAIFlex direction="column" gap="sm">
          <strong>Memory GiB (exponential)</strong>
          <BAIDynamicStepInputNumber
            value={memValue}
            onChange={(v) => setMemValue(v)}
            dynamicSteps={[0, 1, 2, 4, 8, 16, 32, 64, 128]}
            min={0}
            max={128}
            placeholder="Memory"
            addonAfter="GiB"
          />
          <div>Value: {memValue} GiB</div>
        </BAIFlex>

        <BAIFlex direction="column" gap="sm">
          <strong>GPU Count (discrete)</strong>
          <BAIDynamicStepInputNumber
            value={gpuValue}
            onChange={(v) => setGpuValue(v)}
            dynamicSteps={[0, 1, 2, 4, 8]}
            min={0}
            max={8}
            placeholder="GPU"
          />
          <div>Value: {gpuValue}</div>
        </BAIFlex>
      </BAIFlex>
    );
  },
};
