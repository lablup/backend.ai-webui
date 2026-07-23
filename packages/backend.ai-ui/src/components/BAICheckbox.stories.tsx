'use memo';

import BAICheckbox from './BAICheckbox';
import BAIFlex from './BAIFlex';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button, Form } from 'antd';

const meta: Meta<typeof BAICheckbox> = {
  title: 'Input/BAICheckbox',
  component: BAICheckbox,
  parameters: {
    docs: {
      description: {
        component:
          'A Checkbox that renders the surrounding Form.Item error status (antd Checkbox ignores it). Changing an errored checkbox clears the field error.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof BAICheckbox>;

export const Default: Story = {
  args: {
    children: 'Plain checkbox (no form)',
  },
};

const FormErrorExample = () => {
  const [form] = Form.useForm();
  return (
    <Form form={form} component={false}>
      <BAIFlex direction="column" align="start" gap="sm">
        <Form.Item
          name="agree"
          valuePropName="checked"
          initialValue={true}
          style={{ marginBottom: 0 }}
        >
          <BAICheckbox>Toggle me to clear the error</BAICheckbox>
        </Form.Item>
        <Button
          onClick={() => form.setFields([{ name: 'agree', errors: [''] }])}
        >
          Mark field as error
        </Button>
      </BAIFlex>
    </Form>
  );
};

export const FormErrorStatus: Story = {
  render: () => <FormErrorExample />,
};
