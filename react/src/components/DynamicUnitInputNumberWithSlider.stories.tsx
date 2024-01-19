// Button.stories.ts|tsx
import DynamicUnitInputNumberWithSlider, {
  DynamicUnitInputNumberWithSliderProps,
} from './DynamicUnitInputNumberWithSlider';
import type { Meta, StoryObj } from '@storybook/react';
import { Form } from 'antd';

const meta: Meta<typeof DynamicUnitInputNumberWithSlider> = {
  title: 'Input/DynamicUnitInputNumberWithSlider',
  component: DynamicUnitInputNumberWithSlider,
  parameters: {
    // Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/react/configure/story-layout
    layout: 'centered',
  },
};

export default meta;

type Story = StoryObj<typeof DynamicUnitInputNumberWithSlider>;

const renderWithFormItem = ({
  value,
  ...args
}: DynamicUnitInputNumberWithSliderProps) => {
  return (
    <Form
      initialValues={{
        mem: value,
      }}
    >
      <Form.Item name="mem">
        <DynamicUnitInputNumberWithSlider {...args} />
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
    units: ['m', 'g'],
  },
};
