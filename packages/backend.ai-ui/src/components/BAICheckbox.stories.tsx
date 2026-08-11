'use memo';

import { Form } from '../form-engine';
import BAIButton from './BAIButton';
import BAICheckbox from './BAICheckbox';
import BAIFlex from './BAIFlex';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta<typeof BAICheckbox> = {
  title: 'Input/BAICheckbox',
  component: BAICheckbox,
  parameters: {
    docs: {
      description: {
        component:
          "A Checkbox that renders the surrounding Form.Item error status (antd Checkbox ignores it). Painting only — clearing the field error is the caller's job, typically from `onChange`.",
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
          {/* BAICheckbox only paints the error status; the caller decides
              when to clear it — here, on any change. */}
          <BAICheckbox
            onChange={() => form.setFields([{ name: 'agree', errors: [] }])}
          >
            Toggle me to clear the error
          </BAICheckbox>
        </Form.Item>
        <BAIButton
          onClick={() => form.setFields([{ name: 'agree', errors: [''] }])}
        >
          Mark field as error
        </BAIButton>
      </BAIFlex>
    </Form>
  );
};

export const FormErrorStatus: Story = {
  render: () => <FormErrorExample />,
};
