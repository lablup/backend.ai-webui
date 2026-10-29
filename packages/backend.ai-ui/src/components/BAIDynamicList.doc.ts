import type { ComponentDoc } from '@astryxdesign/cli/authoring';

export const docs = {
  type: 'component',
  name: 'BAIDynamicList',
  displayName: 'BAI Dynamic List',
  category: 'Data Input',
  keywords: [
    'dynamic list',
    'form list',
    'repeated rows',
    'add row',
    'remove row',
    'key value',
    'column headers',
  ],
  usage: {
    description:
      'Rows of the same fields with an Add action below them and a Remove action on each row, for lists such as environment variables, labels or ports. It shows the column headers once above the first row and knows nothing about forms: each column’s `render(item, index)` returns the cell, so the caller wraps the control in its own `Form.Item` with its rules and `validateTrigger`, and a failed rule shows its message under that cell. Cells are top-aligned, so a message lengthens only its own row.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Inside a `Form.List`, pass its `fields` as `items`, `field.key` as the item key, and call `add` / `remove(field.name)` from `onAdd` / `onRemove`. Render list-level errors with `Form.ErrorList` after the list.',
      },
      {
        guidance: true,
        description:
          'Give each control an accessible name with the header and the row number, and make placeholders value hints (an example), never the column name: the header already names the column.',
      },
      {
        guidance: false,
        description:
          'Rendering a header row or a remove button inside a cell; the component draws both.',
      },
    ],
  },
  props: [
    {
      name: 'columns',
      type: 'BAIDynamicListColumn<T>[]',
      description:
        'One entry per field: `key`, `header`, optional `width` (a number is an `fr` share, a string a CSS track size) and `render(item, index)`.',
      required: true,
    },
    {
      name: 'items',
      type: 'T[]',
      description: 'The rows.',
      required: true,
    },
    {
      name: 'getItemKey',
      type: '(item: T, index: number) => React.Key',
      description: 'Stable React key of a row.',
      required: true,
    },
    {
      name: 'onAdd',
      type: '() => void',
      description: 'Called by the Add action.',
      required: true,
    },
    {
      name: 'onRemove',
      type: '(item: T, index: number) => void',
      description: 'Called by a row’s Remove action.',
      required: true,
    },
    {
      name: 'addLabel',
      type: 'string',
      description:
        'Text of the Add action, such as "Add environment variables".',
      required: true,
    },
    {
      name: 'disabled',
      type: 'boolean',
      description: 'Disables the Add and Remove actions.',
    },
    {
      name: 'maxItems',
      type: 'number',
      description:
        'Disables the Add action once the list holds this many rows.',
    },
  ],
  examples: [
    {
      label: 'Environment variables in a Form.List',
      code: `<Form.List name="envvars">
  {(fields, { add, remove }, { errors }) => (
    <>
      <BAIDynamicList
        items={fields}
        getItemKey={(field) => field.key}
        onAdd={() => add()}
        onRemove={(field) => remove(field.name)}
        addLabel={t('session.launcher.AddEnvironmentVariable')}
        columns={[
          {
            key: 'variable',
            header: t('session.launcher.EnvironmentVariable'),
            render: (field, index) => (
              <Form.Item
                name={[field.name, 'variable']}
                rules={[{ required: true }]}
                validateTrigger={['onChange', 'onBlur']}
                style={{ marginBottom: 0 }}
              >
                <BAITextInput
                  aria-label={\`\${t('session.launcher.EnvironmentVariable')} \${index + 1}\`}
                  placeholder={t('general.Example', { value: 'MY_VARIABLE' })}
                />
              </Form.Item>
            ),
          },
        ]}
      />
      <Form.ErrorList errors={errors} />
    </>
  )}
</Form.List>`,
    },
  ],
} satisfies ComponentDoc;

export default docs;
