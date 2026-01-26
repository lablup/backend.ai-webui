import BulkEditFormItem from './BulkEditFormItem';
import { Form, Input, Select } from 'antd';
import type { Meta, StoryObj } from '@storybook/react';
import { BAISelect } from 'backend.ai-ui';
import React from 'react';

/**
 * BulkEditFormItem is a custom Form.Item component for bulk editing scenarios.
 * 
 * Key features:
 * - **Keep as is**: Maintains current values without changes (default)
 * - **Clear**: Unsets the value for all items (only for optional fields)
 * - **Undo changes**: Reverts to "Keep as is" state
 */
const meta: Meta<typeof BulkEditFormItem> = {
  title: 'Components/BulkEditFormItem',
  component: BulkEditFormItem,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
**BulkEditFormItem** is a specialized Form.Item wrapper for bulk editing operations.

## Features
- Keep as is mode (default): Disabled input, no changes sent
- Edit mode: Allows user to modify the field value
- Clear mode: Sets field to null (only available for optional fields)
- Undo changes: Reverts to "Keep as is" state

## Usage
\`\`\`tsx
<Form>
  <BulkEditFormItem name="domain_name" label="Domain" optional>
    <BAISelect options={domainOptions} />
  </BulkEditFormItem>
  <BulkEditFormItem name="status" label="Status">
    <BAISelect options={statusOptions} />
  </BulkEditFormItem>
</Form>
\`\`\`

## Props
| Name | Type | Default | Description |
|------|------|---------|-------------|
| optional | \`boolean\` | \`false\` | Whether field can be cleared |
| children | \`ReactElement\` | - | Input component to render |
| ...formItemProps | \`FormItemProps\` | - | All Ant Design Form.Item props |
        `,
      },
    },
  },
  argTypes: {
    optional: {
      control: { type: 'boolean' },
      description: 'Whether this field can be cleared (shows Clear button)',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
    label: {
      control: { type: 'text' },
      description: 'Label text for the form item',
      table: {
        type: { summary: 'string' },
      },
    },
    name: {
      control: false,
      description: 'Field name in form data',
      table: {
        type: { summary: 'string | string[]' },
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
type Story = StoryObj<typeof BulkEditFormItem>;

/**
 * Basic usage with a required field.
 * No Clear button is shown since the field is not optional.
 */
export const Default: Story = {
  name: 'Basic',
  parameters: {
    docs: {
      description: {
        story: 'Basic usage with a required text input field. The field starts in "Keep as is" mode.',
      },
    },
  },
  args: {
    name: 'username',
    label: 'Username',
    children: <Input placeholder="Enter username" />,
  },
};

/**
 * Optional field that can be cleared.
 * Shows the Clear button in "Keep as is" mode.
 */
export const OptionalField: Story = {
  name: 'OptionalField',
  parameters: {
    docs: {
      description: {
        story: 'Optional field that can be cleared. The Clear button appears in "Keep as is" mode to allow unsetting the value.',
      },
    },
  },
  args: {
    name: 'domain_name',
    label: 'Domain',
    optional: true,
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
        story: 'Using BulkEditFormItem with a Select component for choosing from predefined options.',
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
 * Multiple fields in a form demonstrating different configurations.
 */
export const MultipleFields: Story = {
  name: 'MultipleFields',
  parameters: {
    docs: {
      description: {
        story: 'Example showing multiple BulkEditFormItem fields in a single form with different configurations.',
      },
    },
  },
  render: () => (
    <>
      <BulkEditFormItem name="domain" label="Domain" optional>
        <BAISelect
          placeholder="Select domain"
          options={[
            { value: 'default', label: 'Default' },
            { value: 'custom', label: 'Custom' },
          ]}
        />
      </BulkEditFormItem>
      <BulkEditFormItem name="status" label="Status">
        <Select
          placeholder="Select status"
          options={[
            { value: 'active', label: 'Active' },
            { value: 'inactive', label: 'Inactive' },
          ]}
        />
      </BulkEditFormItem>
      <BulkEditFormItem name="notes" label="Notes" optional>
        <Input.TextArea rows={3} placeholder="Add notes" />
      </BulkEditFormItem>
    </>
  ),
};

/**
 * Shows how the field appears in edit mode with user interaction.
 */
export const InEditMode: Story = {
  name: 'InEditMode',
  parameters: {
    docs: {
      description: {
        story: 'Demonstrates the field in edit mode. Click "Edit" to enable editing, then "Undo changes" to revert.',
      },
    },
  },
  args: {
    name: 'email',
    label: 'Email',
    children: <Input type="email" placeholder="user@example.com" />,
  },
};
