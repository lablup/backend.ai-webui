// Button.stories.ts|tsx
import DynamicUnitInputNumber, {
  BAIDynamicUnitInputNumberProps,
} from './BAIDynamicUnitInputNumber';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Form } from 'antd';

const meta: Meta<typeof DynamicUnitInputNumber> = {
  title: 'Input/DynamicUnitInputNumber',
  component: DynamicUnitInputNumber,
  parameters: {
    // Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/react/configure/story-layout
    layout: 'centered',
  },
};

export default meta;

type Story = StoryObj<typeof DynamicUnitInputNumber>;

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
        <DynamicUnitInputNumber {...args} />
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
    min: '256m',
    max: '45g',
  },
};

export const AllowOlnyMiBandGiB: Story = {
  name: 'unit: MiB, GiB',
  args: {
    min: '256m',
    max: '45g',
    units: ['m', 'g'],
  },
};
export const AllowOlnyGiB: Story = {
  name: 'unit: GiB',
  args: {
    min: '100m',
    max: '45g',
    units: ['g'],
  },
};
