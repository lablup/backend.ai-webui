import {
  BAIDynamicUnitInputNumberWithSlider,
  BAIDynamicUnitInputNumberWithSliderProps,
} from '.';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Form } from 'antd';

const meta: Meta<typeof BAIDynamicUnitInputNumberWithSlider> = {
  title: 'Input/DynamicUnitInputNumberWithSlider',
  component: BAIDynamicUnitInputNumberWithSlider,
  parameters: {
    // Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/react/configure/story-layout
    layout: 'centered',
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

export const WithFormItem: Story = {
  name: 'Controlled by Form.Item',
  render: renderWithFormItem,
  args: {
    value: '1.3g',
  },
};

export const Default: Story = {
  name: 'Uncontrolled',
};

export const WithMin: Story = {
  name: 'With min/max',
  args: {
    min: '100m',
    max: '45g',
  },
};

export const AllowOlnyMiBandGiB: Story = {
  name: 'unit: MiB, GiB',
  args: {
    min: '2g',
    max: '45g',
    units: ['m', 'g'],
  },
};
export const AllowOlnyGiB: Story = {
  name: 'unit: GiB',
  args: {
    min: '0.5g',
    max: '45g',
    units: ['g'],
  },
};

export const GreaterMinThanMax: Story = {
  name: 'Greater min than max',
  args: {
    min: '3g',
    max: '1g',
    units: ['m', 'g'],
  },
};

export const ExtraMarks: Story = {
  name: 'Extra marks',
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
  name: 'Extra marks with greater min than max',
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
