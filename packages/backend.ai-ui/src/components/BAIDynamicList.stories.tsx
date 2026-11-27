'use memo';

import { Form } from '../form-engine';
import BAIDynamicList from './BAIDynamicList';
import BAIFlex from './BAIFlex';
import BAITextInput from './BAITextInput';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useEffect, useState } from 'react';

const meta: Meta<typeof BAIDynamicList> = {
  title: 'Input/BAIDynamicList',
  component: BAIDynamicList,
  tags: ['autodocs'],
  parameters: {
    reactDocgen: false,
    docs: {
      description: {
        component:
          'Rows of the same fields with an Add action below them and a Remove action on each row. Column headers show once above the first row. It owns no form state: each column’s `render(item, index)` returns the cell, so inside a `Form.List` the caller wraps each control in its own `Form.Item`, and a failed rule shows its message under that cell.',
      },
    },
  },
  argTypes: {
    columns: { control: false, description: 'One entry per field.' },
    items: { control: false, description: 'The rows.' },
    onRemove: { action: 'remove' },
    addButton: {
      control: false,
      description: 'The Add action: `onClick` and `label`.',
    },
    disabled: { control: 'boolean' },
    maxItems: { control: 'number' },
  },
};

export default meta;
type Story = StoryObj<typeof BAIDynamicList>;

type Row = { key: number; name: string; value: string };

const PlainList = ({
  initial,
  maxItems,
  disabled,
}: {
  initial: Row[];
  maxItems?: number;
  disabled?: boolean;
}) => {
  const [rows, setRows] = useState(initial);
  const update = (key: number, patch: Partial<Row>) =>
    setRows((prev) =>
      prev.map((r) => (r.key === key ? { ...r, ...patch } : r)),
    );
  return (
    <BAIDynamicList<Row>
      items={rows}
      onRemove={(row) =>
        setRows((prev) => prev.filter((r) => r.key !== row.key))
      }
      addButton={{
        onClick: () =>
          setRows((prev) => [
            ...prev,
            { key: Date.now(), name: '', value: '' },
          ]),
        label: 'Add label',
      }}
      maxItems={maxItems}
      disabled={disabled}
      columns={[
        {
          key: 'name',
          header: 'Key',
          render: (row, index) => (
            <BAITextInput
              aria-label={`Key ${index + 1}`}
              placeholder="e.g., team"
              value={row.name}
              disabled={disabled}
              onChange={(name) => update(row.key, { name })}
            />
          ),
        },
        {
          key: 'value',
          header: 'Value',
          render: (row, index) => (
            <BAITextInput
              aria-label={`Value ${index + 1}`}
              placeholder="e.g., frontend"
              value={row.value}
              disabled={disabled}
              onChange={(value) => update(row.key, { value })}
            />
          ),
        },
      ]}
    />
  );
};

export const Basic: Story = {
  render: () => (
    <PlainList
      initial={[
        { key: 1, name: 'team', value: 'frontend' },
        { key: 2, name: 'stage', value: 'dev' },
      ]}
    />
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Two rows held in component state, no form. The headers show once; Add appends a row and each minus button removes its own.',
      },
    },
  },
};

export const Empty: Story = {
  render: () => <PlainList initial={[]} />,
  parameters: {
    docs: {
      description: {
        story:
          'An empty list shows only the Add action; the header row appears with the first row.',
      },
    },
  },
};

const EnvVarForm = ({ validateOnMount }: { validateOnMount?: boolean }) => {
  const [form] = Form.useForm();
  useEffect(() => {
    if (validateOnMount) form.validateFields().catch(() => {});
  }, [form, validateOnMount]);
  return (
    <Form
      form={form}
      layout="vertical"
      initialValues={{
        envvars: validateOnMount
          ? [
              { variable: 'MY_VAR', value: '1' },
              { variable: 'MY_VAR', value: '2' },
              { variable: '', value: '' },
            ]
          : [{ variable: 'MY_VAR', value: '1' }],
      }}
    >
      <Form.List name="envvars">
        {(fields, { add, remove }, { errors }) => (
          <>
            <BAIDynamicList
              items={fields}
              onRemove={(field) => remove(field.name)}
              addButton={{
                onClick: () => add(),
                label: 'Add environment variables',
              }}
              columns={[
                {
                  key: 'variable',
                  header: 'Variable',
                  render: ({ key: _key, name, ...rest }, index) => (
                    <Form.Item
                      {...rest}
                      name={[name, 'variable']}
                      style={{ marginBottom: 0 }}
                      validateTrigger={['onChange', 'onBlur']}
                      rules={[
                        { required: true, message: 'Enter variable name' },
                        ({ getFieldValue }) => ({
                          validator(_rule, value) {
                            const names = (getFieldValue('envvars') ?? []).map(
                              (row: { variable?: string } | undefined) =>
                                row?.variable,
                            );
                            return value &&
                              names.filter((n: string) => n === value).length >
                                1
                              ? Promise.reject(
                                  'A variable name that already exists.',
                                )
                              : Promise.resolve();
                          },
                        }),
                      ]}
                    >
                      <BAITextInput
                        aria-label={`Variable ${index + 1}`}
                        placeholder="e.g., MY_VARIABLE"
                      />
                    </Form.Item>
                  ),
                },
                {
                  key: 'value',
                  header: 'Value',
                  render: ({ key: _key, name, ...rest }, index) => (
                    <Form.Item
                      {...rest}
                      name={[name, 'value']}
                      style={{ marginBottom: 0 }}
                      validateTrigger={['onChange', 'onBlur']}
                      rules={[
                        { required: true, message: 'Please enter a value.' },
                      ]}
                    >
                      <BAITextInput aria-label={`Value ${index + 1}`} />
                    </Form.Item>
                  ),
                },
              ]}
            />
            <Form.ErrorList errors={errors} />
          </>
        )}
      </Form.List>
    </Form>
  );
};

export const InFormList: Story = {
  render: () => <EnvVarForm />,
  parameters: {
    docs: {
      description: {
        story:
          'Inside a `Form.List`: each cell is the caller’s `Form.Item` with its own rules, validating on change and on blur. Leave a field empty or repeat a name to see the message under that cell.',
      },
    },
  },
};

export const ValidationErrors: Story = {
  render: () => <EnvVarForm validateOnMount />,
  parameters: {
    docs: {
      description: {
        story:
          'Two rows share a name and the third is empty. Each message sits under its own cell, so only those rows grow and the minus button stays on the input line.',
      },
    },
  },
};

export const ColumnWidths: Story = {
  render: () => {
    const [rows, setRows] = useState([{ key: 1 }]);
    return (
      <BAIDynamicList<{ key: number }>
        items={rows}
        onRemove={(row) =>
          setRows((prev) => prev.filter((r) => r.key !== row.key))
        }
        addButton={{
          onClick: () => setRows((prev) => [...prev, { key: Date.now() }]),
          label: 'Add Pre-Start Action',
        }}
        columns={[
          {
            key: 'action',
            header: 'Action',
            render: (_row, index) => (
              <BAITextInput
                aria-label={`Action ${index + 1}`}
                placeholder="e.g., wait_for_file"
              />
            ),
          },
          {
            key: 'args',
            header: 'Args (JSON)',
            width: 2,
            render: (_row, index) => (
              <BAITextInput
                aria-label={`Args (JSON) ${index + 1}`}
                placeholder="e.g., {}"
              />
            ),
          },
        ]}
      />
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          'A numeric `width` is a share of the free width: here Args (JSON) takes twice the width of Action. A string is used as a CSS track size.',
      },
    },
  },
};

export const MaxItemsAndDisabled: Story = {
  render: () => (
    <BAIFlex direction="column" align="stretch" gap="lg">
      <PlainList
        initial={[
          { key: 1, name: 'team', value: 'frontend' },
          { key: 2, name: 'stage', value: 'dev' },
        ]}
        maxItems={2}
      />
      <PlainList
        initial={[{ key: 1, name: 'team', value: 'frontend' }]}
        disabled
      />
    </BAIFlex>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Top: `maxItems={2}` disables Add once two rows exist. Bottom: `disabled` turns off Add and every Remove.',
      },
    },
  },
};
