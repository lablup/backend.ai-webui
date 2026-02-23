import BAIDynamicUnitInputNumber, {
  BAIDynamicUnitInputNumberProps,
} from './BAIDynamicUnitInputNumber';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Form } from 'antd';

/**
 * BAIDynamicUnitInputNumber is a specialized input for handling memory/storage values with unit conversion.
 *
 * Key features:
 * - Automatic unit conversion between MiB, GiB, TiB, PiB
 * - Dynamic step increments based on current unit
 * - Configurable unit restrictions (e.g., GiB only)
 * - Min/max validation with unit support
 * - Integration with Ant Design Form
 *
 * @see BAIDynamicUnitInputNumber.tsx for implementation details
 */
const meta: Meta<typeof BAIDynamicUnitInputNumber> = {
  title: 'Input/BAIDynamicUnitInputNumber',
  component: BAIDynamicUnitInputNumber,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
**BAIDynamicUnitInputNumber** is a specialized input component for handling memory and storage values with automatic unit conversion.

## Features
- Automatic unit conversion between MiB, GiB, TiB, PiB
- Dynamic step increments that adapt to the current unit
- Configurable min/max values with unit support (e.g., '256m', '45g')
- Unit restriction (allow only specific units)
- Seamless integration with Ant Design Form
- Optional auto-unit switching based on value magnitude

## Props
| Name | Type | Default | Description |
|------|------|---------|-------------|
| \`min\` | \`string\` | \`'0m'\` | Minimum value with unit (e.g., '100m', '2g') |
| \`max\` | \`string\` | \`'300p'\` | Maximum value with unit |
| \`value\` | \`string \\| null \\| undefined\` | - | Current value with unit (controlled) |
| \`units\` | \`string[]\` | \`['m', 'g', 't', 'p']\` | Allowed units (m=MiB, g=GiB, t=TiB, p=PiB) |
| \`dynamicSteps\` | \`number[]\` | \`[1, 2, 4, 8, ...]\` | Step increments for input |
| \`roundStep\` | \`number\` | - | Round input value to nearest step |
| \`disableAutoUnit\` | \`boolean\` | \`false\` | Disable automatic unit switching |
| \`addonPrefix\` | \`ReactNode\` | - | Content before input |
| \`addonSuffix\` | \`ReactNode\` | - | Content after input |
| \`onChange\` | \`(value: string) => void\` | - | Callback when value changes |

For all other props, refer to [Ant Design InputNumber](https://ant.design/components/input-number).

## Unit Abbreviations
- \`m\` - MiB (Mebibyte)
- \`g\` - GiB (Gibibyte)
- \`t\` - TiB (Tebibyte)
- \`p\` - PiB (Pebibyte)
        `,
      },
    },
  },
  argTypes: {
    min: {
      control: false,
      description:
        'Minimum value with unit (e.g., "100m", "2g"). Requires format: number + unit (m/g/t/p)',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: '0m' },
      },
    },
    max: {
      control: false,
      description:
        'Maximum value with unit. Requires format: number + unit (m/g/t/p)',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: '300p' },
      },
    },
    value: {
      control: false,
      description:
        'Current value with unit (controlled). Requires format: number + unit (m/g/t/p)',
      table: {
        type: { summary: 'string | null | undefined' },
      },
    },
    units: {
      control: { type: 'object' },
      description: 'Allowed units array (m=MiB, g=GiB, t=TiB, p=PiB)',
      table: {
        type: { summary: 'string[]' },
        defaultValue: { summary: "['m', 'g', 't', 'p']" },
      },
    },
    dynamicSteps: {
      control: { type: 'object' },
      description: 'Array of step increments for the input',
      table: {
        type: { summary: 'number[]' },
        defaultValue: { summary: '[1, 2, 4, 8, 16, 32, 64, 128, 256, 512]' },
      },
    },
    roundStep: {
      control: { type: 'number' },
      description: 'Round input value to nearest step',
      table: {
        type: { summary: 'number' },
      },
    },
    disableAutoUnit: {
      control: { type: 'boolean' },
      description: 'Disable automatic unit switching based on value magnitude',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
    addonPrefix: {
      control: false,
      description: 'Content to display before the input',
      table: {
        type: { summary: 'ReactNode' },
      },
    },
    addonSuffix: {
      control: false,
      description: 'Content to display after the input',
      table: {
        type: { summary: 'ReactNode' },
      },
    },
    onChange: {
      action: 'changed',
      description: 'Callback fired when value changes',
      table: {
        type: { summary: '(value: string) => void' },
      },
    },
    disabled: {
      control: { type: 'boolean' },
      description: 'Disable the input',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
    size: {
      control: { type: 'select' },
      options: ['small', 'middle', 'large'],
      description: 'Input size',
      table: {
        type: { summary: "'small' | 'middle' | 'large'" },
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof BAIDynamicUnitInputNumber>;
const renderWithFormItem = ({
  value,
  ...args
}: BAIDynamicUnitInputNumberProps) => {
  return (
    <Form
      initialValues={{
        mem: value,
      }}
    >
      <Form.Item name="mem">
        <BAIDynamicUnitInputNumber {...args} />
      </Form.Item>
    </Form>
  );
};

export const Default: Story = {
  name: 'Basic',
  parameters: {
    docs: {
      description: {
        story:
          'Basic uncontrolled usage with default settings. Allows all units (MiB, GiB, TiB, PiB).',
      },
    },
  },
};

export const WithFormItem: Story = {
  name: 'FormIntegration',
  parameters: {
    docs: {
      description: {
        story:
          'Controlled by Ant Design Form.Item. The component syncs with form state automatically.',
      },
    },
  },
  render: renderWithFormItem,
  args: {
    value: '1.3g',
  },
};

export const WithMinMax: Story = {
  name: 'MinMaxRange',
  parameters: {
    docs: {
      description: {
        story:
          'Custom min/max range. Input validates against these boundaries.',
      },
    },
  },
  args: {
    min: '256m',
    max: '45g',
  },
};

export const AllowOnlyMiBandGiB: Story = {
  name: 'MiBGiBUnits',
  parameters: {
    docs: {
      description: {
        story:
          'Restrict units to MiB and GiB only. User can switch between these two units.',
      },
    },
  },
  args: {
    min: '256m',
    max: '45g',
    units: ['m', 'g'],
  },
};

export const AllowOnlyGiB: Story = {
  name: 'GiBOnly',
  parameters: {
    docs: {
      description: {
        story:
          'Restrict to GiB unit only. Useful when fractional GiB values are needed.',
      },
    },
  },
  args: {
    min: '100m',
    max: '45g',
    units: ['g'],
  },
};
