import {
  BAIDynamicUnitInputNumberWithSlider,
  BAIDynamicUnitInputNumberWithSliderProps,
} from '.';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Form } from 'antd';

/**
 * BAIDynamicUnitInputNumberWithSlider combines a dynamic unit input with a synchronized slider.
 *
 * Key features:
 * - Synchronized input and slider controls for unit-based values (MiB, GiB, etc.)
 * - Automatic unit conversion between input and slider
 * - Visual warning indicators when approaching limits
 * - Custom marks on slider for important values
 * - Handles edge cases like min > max gracefully
 *
 * @see BAIDynamicUnitInputNumberWithSlider.tsx for implementation details
 */
const meta: Meta<typeof BAIDynamicUnitInputNumberWithSlider> = {
  title: 'Input/BAIDynamicUnitInputNumberWithSlider',
  component: BAIDynamicUnitInputNumberWithSlider,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
**BAIDynamicUnitInputNumberWithSlider** extends [BAIDynamicUnitInputNumber](/?path=/docs/input-dynamicunitinputnumber) with an integrated slider control.

## Features
- Synchronized input number and slider controls
- Automatic unit conversion (MiB, GiB, TiB, PiB)
- Visual feedback with slider marks at min/max values
- Warning state with color-coded slider track
- Custom marks for important values (e.g., resource quotas)
- Handles invalid states (min > max) gracefully by disabling slider
- Supports hiding slider while maintaining input functionality

## Props
| Name | Type | Default | Description |
|------|------|---------|-------------|
| \`min\` | \`string\` | \`'0m'\` | Minimum value with unit (e.g., '100m', '2g') |
| \`max\` | \`string\` | \`'32g'\` | Maximum value with unit |
| \`value\` | \`string \\| null \\| undefined\` | \`'0g'\` | Current value with unit |
| \`units\` | \`string[]\` | \`['m', 'g']\` | Allowed units (m=MiB, g=GiB, t=TiB, p=PiB) |
| \`step\` | \`number\` | \`0.05\` | Slider step size in GiB |
| \`roundStep\` | \`number\` | - | Round input value to nearest step |
| \`warn\` | \`string\` | - | Warning threshold value (changes slider color) |
| \`extraMarks\` | \`SliderMarks\` | - | Additional marks on slider |
| \`hideSlider\` | \`boolean\` | \`false\` | Hide slider (keeps input only) |
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
        defaultValue: { summary: '32g' },
      },
    },
    value: {
      control: false,
      description:
        'Current value with unit (controlled). Requires format: number + unit (m/g/t/p)',
      table: {
        type: { summary: 'string | null | undefined' },
        defaultValue: { summary: '0g' },
      },
    },
    units: {
      control: { type: 'object' },
      description: 'Allowed units array (m=MiB, g=GiB, t=TiB, p=PiB)',
      table: {
        type: { summary: 'string[]' },
        defaultValue: { summary: "['m', 'g']" },
      },
    },
    step: {
      control: { type: 'number' },
      description: 'Slider step size in GiB',
      table: {
        type: { summary: 'number' },
        defaultValue: { summary: '0.05' },
      },
    },
    roundStep: {
      control: { type: 'number' },
      description: 'Round input value to nearest step',
      table: {
        type: { summary: 'number' },
      },
    },
    warn: {
      control: false,
      description:
        'Warning threshold value with unit. Slider track turns warning color when value exceeds this. Requires format: number + unit (m/g/t/p)',
      table: {
        type: { summary: 'string' },
      },
    },
    extraMarks: {
      control: false,
      description:
        'Additional slider marks (SliderMarks object mapping number positions to mark configs)',
      table: {
        type: { summary: 'SliderMarks' },
      },
    },
    hideSlider: {
      control: { type: 'boolean' },
      description: 'Hide slider component (keeps input only)',
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
      description: 'Disable both input and slider',
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

type Story = StoryObj<typeof BAIDynamicUnitInputNumberWithSlider>;

const renderWithFormItem = ({
  value,
  ...args
}: BAIDynamicUnitInputNumberWithSliderProps) => {
  return (
    <Form
      initialValues={{
        mem: value,
      }}
    >
      <Form.Item name="mem">
        <BAIDynamicUnitInputNumberWithSlider {...args} />
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
          'Basic uncontrolled usage with default settings (0m to 32g range).',
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

export const WithMin: Story = {
  name: 'MinMaxRange',
  parameters: {
    docs: {
      description: {
        story:
          'Custom min/max range. Slider shows marks at min and max positions.',
      },
    },
  },
  args: {
    min: '100m',
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
    min: '2g',
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
    min: '0.5g',
    max: '45g',
    units: ['g'],
  },
};

export const GreaterMinThanMax: Story = {
  name: 'InvalidRange',
  parameters: {
    docs: {
      description: {
        story:
          'Edge case handling when min > max. Slider is disabled and marks are hidden to prevent confusion.',
      },
    },
  },
  args: {
    min: '3g',
    max: '1g',
    units: ['m', 'g'],
  },
};

export const ExtraMarks: Story = {
  name: 'CustomMarks',
  parameters: {
    docs: {
      description: {
        story:
          'Add custom marks to highlight important values (e.g., recommended settings, quotas).',
      },
    },
  },
  args: {
    min: '0g',
    max: '1g',
    units: ['m', 'g'],
    extraMarks: {
      0.5: {
        style: {
          color: 'red',
        },
        label: '0.5g',
      },
    },
  },
};

export const ExtraMarksWithGreaterMinThanMax: Story = {
  name: 'CustomMarksInvalidRange',
  parameters: {
    docs: {
      description: {
        story:
          'Custom marks are filtered out when min > max to maintain consistent invalid state.',
      },
    },
  },
  args: {
    min: '3g',
    max: '1g',
    units: ['m', 'g'],
    extraMarks: {
      0.5: {
        style: {
          color: 'red',
        },
        label: '0.5g',
      },
    },
  },
};
