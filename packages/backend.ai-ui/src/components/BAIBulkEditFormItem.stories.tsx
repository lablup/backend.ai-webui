import BAIBulkEditFormItem from './BAIBulkEditFormItem';
import BAIFlex from './BAIFlex';
import BAISelect from './BAISelect';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Form, Input, InputNumber, Select, Button } from 'antd';
import { useState } from 'react';

/**
 * BAIBulkEditFormItem is a custom Form.Item component for bulk editing scenarios.
 *
 * Key features:
 * - **Keep as is**: Maintains current values without changes (default)
 * - **Edit**: Allows modification of the field value
 * - **Clear**: Unsets the value for all items (only for optional fields)
 * - **Undo changes**: Reverts to "Keep as is" state
 *
 * @see BAIBulkEditFormItem.tsx for implementation details
 */
const meta: Meta<typeof BAIBulkEditFormItem> = {
  title: 'Components/BAIBulkEditFormItem',
  component: BAIBulkEditFormItem,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
**BAIBulkEditFormItem** is a specialized Form.Item wrapper for bulk editing operations.

## Features
- Keep as is mode (default): Shows placeholder, value = undefined (excluded from submission)
- Edit mode: Allows user to modify the field value
- Clear mode: Sets field to null (only available for optional fields)
- Undo changes: Reverts to "Keep as is" state

## Usage
\`\`\`tsx
<Form>
  <BAIBulkEditFormItem name="domain_name" label="Domain" showClear>
    <BAISelect options={domainOptions} />
  </BAIBulkEditFormItem>
  <BAIBulkEditFormItem name="status" label="Status">
    <BAISelect options={statusOptions} />
  </BAIBulkEditFormItem>
</Form>
\`\`\`

## Props
| Name | Type | Default | Description |
|------|------|---------|-------------|
| showClear | \`boolean\` | \`false\` | Whether field can be cleared (shows Clear link) |
| keepValueLabel | \`string\` | \`'Keep as is'\` (i18n) | Label displayed in keep mode placeholder |
| clearValueLabel | \`string\` | \`'Clear'\` (i18n) | Label displayed in clear mode placeholder |
| children | \`ReactElement\` | - | Input component to render |
| ...formItemProps | \`FormItemProps\` | - | All Ant Design Form.Item props |

## Form Values
| Mode | Form Value | Behavior on Submit |
|------|------------|-------------------|
| Keep as is | \`undefined\` | Excluded from submission |
| Edit | User input | Included in submission |
| Clear | \`null\` | Explicitly clears the field |
        `,
      },
    },
  },
  argTypes: {
    showClear: {
      control: { type: 'boolean' },
      description: 'Whether this field can be cleared (shows Clear link)',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
    keepValueLabel: {
      control: { type: 'text' },
      description:
        'Label displayed in the keep mode placeholder. Defaults to i18n "Keep as is".',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: '"Keep as is"' },
      },
    },
    clearValueLabel: {
      control: { type: 'text' },
      description:
        'Label displayed in the clear mode placeholder. Defaults to i18n "Clear".',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: '"Clear"' },
      },
    },
    label: {
      control: { type: 'text' },
      description: 'Label text for the form item',
      table: {
        type: { summary: 'ReactNode' },
      },
    },
    name: {
      control: false,
      description: 'Field name in form data',
      table: {
        type: { summary: 'NamePath' },
      },
    },
    children: {
      control: false,
      description: 'Input component to render (typically Select, Input, etc.)',
    },
  },
  decorators: [
    (Story) => (
      <Form
        style={{
          maxWidth: 600,
          padding: 24,
          border: '1px solid #d9d9d9',
          borderRadius: 8,
        }}
      >
        <Story />
      </Form>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof BAIBulkEditFormItem>;

/**
 * Basic usage with a required field.
 * No Clear link is shown since the field is not optional.
 */
export const Default: Story = {
  name: 'Basic',
  parameters: {
    docs: {
      description: {
        story:
          'Basic usage with a required text input field. The field starts in "Keep as is" mode. Click the placeholder to switch to edit mode.',
      },
    },
  },
  args: {
    name: 'nickname',
    label: 'Nickname',
    children: <Input placeholder="Enter nickname" />,
  },
};

/**
 * Optional field that can be cleared.
 * Shows the Clear link in "Keep as is" mode.
 */
export const OptionalField: Story = {
  name: 'OptionalField',
  parameters: {
    docs: {
      description: {
        story:
          'Optional field that can be cleared. The Clear link appears in "Keep as is" mode to allow unsetting the value.',
      },
    },
  },
  args: {
    name: 'domain_name',
    label: 'Domain',
    showClear: true,
    children: (
      <BAISelect
        placeholder="Select domain"
        options={[
          { value: 'default', label: 'Default' },
          { value: 'custom', label: 'Custom' },
          { value: 'test', label: 'Test' },
        ]}
      />
    ),
  },
};

/**
 * Select input with options.
 */
export const WithSelect: Story = {
  name: 'WithSelect',
  parameters: {
    docs: {
      description: {
        story:
          'Using BAIBulkEditFormItem with a Select component for choosing from predefined options.',
      },
    },
  },
  args: {
    name: 'status',
    label: 'User Status',
    children: (
      <Select
        placeholder="Select status"
        options={[
          { value: 'active', label: 'Active' },
          { value: 'inactive', label: 'Inactive' },
          { value: 'deleted', label: 'Deleted' },
        ]}
      />
    ),
  },
};

/**
 * Number input field.
 */
export const WithInputNumber: Story = {
  name: 'WithInputNumber',
  parameters: {
    docs: {
      description: {
        story: 'Using BAIBulkEditFormItem with InputNumber for numeric values.',
      },
    },
  },
  args: {
    name: 'container_uid',
    label: 'Container UID',
    showClear: true,
    children: <InputNumber placeholder="Enter UID" style={{ width: '100%' }} />,
  },
};

/**
 * Custom clearValueLabel example.
 * Shows how to customize the label displayed when field is cleared.
 */
export const WithCustomClearLabel: Story = {
  name: 'WithCustomClearLabel',
  parameters: {
    docs: {
      description: {
        story:
          'Example with custom clearValueLabel. When clearing this field, "No domain selected" will be displayed instead of default "Clear".',
      },
    },
  },
  args: {
    name: 'domain',
    label: 'Domain',
    showClear: true,
    clearValueLabel: 'No domain selected',
    children: (
      <BAISelect
        placeholder="Select domain"
        options={[
          { value: 'default', label: 'Default' },
          { value: 'custom', label: 'Custom' },
        ]}
      />
    ),
  },
};

/**
 * Custom keepValueLabel example.
 * Shows how to customize the label displayed in keep mode.
 */
export const WithCustomKeepLabel: Story = {
  name: 'WithCustomKeepLabel',
  parameters: {
    docs: {
      description: {
        story:
          'Example with custom keepValueLabel. The keep mode placeholder will display "No changes to this field" instead of default "Keep as is".',
      },
    },
  },
  args: {
    name: 'status',
    label: 'Status',
    keepValueLabel: 'No changes to this field',
    children: (
      <BAISelect
        placeholder="Select status"
        options={[
          { value: 'active', label: 'Active' },
          { value: 'inactive', label: 'Inactive' },
        ]}
      />
    ),
  },
};

/**
 * Multiple fields in a form demonstrating different configurations.
 */
export const MultipleFields: Story = {
  name: 'MultipleFields',
  parameters: {
    docs: {
      description: {
        story:
          'Example showing multiple BAIBulkEditFormItem fields in a single form with different configurations.',
      },
    },
  },
  render: () => (
    <>
      <BAIBulkEditFormItem name="domain" label="Domain" showClear>
        <BAISelect
          placeholder="Select domain"
          options={[
            { value: 'default', label: 'Default' },
            { value: 'custom', label: 'Custom' },
          ]}
        />
      </BAIBulkEditFormItem>
      <BAIBulkEditFormItem name="status" label="Status">
        <Select
          placeholder="Select status"
          options={[
            { value: 'active', label: 'Active' },
            { value: 'inactive', label: 'Inactive' },
          ]}
        />
      </BAIBulkEditFormItem>
      <BAIBulkEditFormItem name="notes" label="Notes" showClear>
        <Input.TextArea rows={3} placeholder="Add notes" />
      </BAIBulkEditFormItem>
    </>
  ),
};

/**
 * Interactive example showing form values.
 */
export const WithFormValues: Story = {
  name: 'WithFormValues',
  parameters: {
    docs: {
      description: {
        story:
          'Interactive example that shows the current form values. Try switching between Keep as is, Edit, and Clear modes to see how values change.',
      },
    },
  },
  decorators: [
    (Story) => {
      const [form] = Form.useForm();
      const [values, setValues] = useState<Record<string, unknown>>({});

      return (
        <Form
          form={form}
          style={{
            maxWidth: 600,
            padding: 24,
            border: '1px solid #d9d9d9',
            borderRadius: 8,
          }}
          onValuesChange={(_, allValues) => setValues(allValues)}
        >
          <Story />
          <BAIFlex direction="column" gap="sm" style={{ marginTop: 16 }}>
            <Button
              type="primary"
              onClick={() => {
                const formValues = form.getFieldsValue();
                setValues(formValues);
              }}
            >
              Get Form Values
            </Button>
            <pre
              style={{
                background: '#f5f5f5',
                padding: 12,
                borderRadius: 4,
                fontSize: 12,
              }}
            >
              {JSON.stringify(values, null, 2)}
            </pre>
          </BAIFlex>
        </Form>
      );
    },
  ],
  render: () => (
    <>
      <BAIBulkEditFormItem name="domain" label="Domain" showClear>
        <BAISelect
          placeholder="Select domain"
          options={[
            { value: 'default', label: 'Default' },
            { value: 'custom', label: 'Custom' },
          ]}
        />
      </BAIBulkEditFormItem>
      <BAIBulkEditFormItem name="status" label="Status">
        <Select
          placeholder="Select status"
          options={[
            { value: 'active', label: 'Active' },
            { value: 'inactive', label: 'Inactive' },
          ]}
        />
      </BAIBulkEditFormItem>
    </>
  ),
};
