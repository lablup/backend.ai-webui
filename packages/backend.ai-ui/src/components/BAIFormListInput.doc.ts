import type { ComponentDoc } from '@astryxdesign/cli/authoring';

export const docs = {
  type: 'component',
  name: 'BAIFormListInput',
  displayName: 'BAI Form List Input',
  category: 'Data Input',
  keywords: [
    'form list',
    'list input',
    'repeated rows',
    'add row',
    'dynamic fields',
    'key value',
    'column labels',
  ],
  usage: {
    description:
      'A `Form.List` rendered through Astryx `ListInput`, for forms where an Add action appends rows of the same fields (environment variables, labels, ports). `ListInput` shows the column headers once above the first row, keeps the repeated labels as the inputs’ accessible names with the row position, labels every row when the fields stack on a narrow screen, and owns the Add and Remove actions. `Form.List` stays the data source: each cell renders a `noStyle` `Form.Item` named `[row, column.key]` with the column’s `formItemProps`, so rules, dependencies and submit values are unchanged. A failed cell rule paints the control’s border (ui-common controls read the item status) and shows its message in a tooltip on the control instead of under the cell, so a row never changes height; the control’s own handlers still run after the form’s. List-level rule errors render below the list.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Make placeholders value hints (an example, or what applies when the field is left empty), never the column name: the header already names the column.',
      },
      {
        guidance: true,
        description:
          'Pass `itemName` as a lowercase singular noun from i18n: it fills the built-in "Add {itemName}" action and the empty-state text.',
      },
      {
        guidance: false,
        description:
          'Rendering a custom header row or remove button next to it; the component owns both.',
      },
    ],
  },
  props: [
    {
      name: 'name',
      type: 'NamePath',
      description: 'The `Form.List` name the rows are stored under.',
      required: true,
    },
    {
      name: 'label',
      type: 'string',
      description:
        'Names the whole list; it is the accessible name of the collection. Set `isLabelHidden` when an enclosing form item already shows it.',
      required: true,
    },
    {
      name: 'itemName',
      type: 'string',
      description:
        'Singular noun for one row, used in "Add {itemName}", the empty state and announcements.',
    },
    {
      name: 'columns',
      type: 'BAIFormListInputColumn[]',
      description:
        'One entry per field: `key` (the row field), `header`, optional `width`, optional `formItemProps(field)` for the cell `Form.Item`, and `renderInput({ field, fields, label })`, which returns the control and should pass `label` as its accessible name.',
      required: true,
    },
    {
      name: 'createValue',
      type: '() => StoreValue',
      description: 'Initial value of a row added with the Add action.',
    },
    {
      name: 'rules',
      type: 'Rule[]',
      description:
        'List-level `Form.List` rules; their errors render below the list.',
    },
  ],
  examples: [
    {
      label: 'Environment variables',
      code: `<BAIFormListInput
  name="environ"
  label={t('adminDeploymentPreset.EnvironmentVariables')}
  isLabelHidden
  itemName={t('session.launcher.EnvironmentVariableItemName')}
  columns={[
    {
      key: 'variable',
      header: t('session.launcher.EnvironmentVariable'),
      formItemProps: () => ({ rules: [{ required: true }] }),
      renderInput: ({ label }) => (
        <BAITextInput aria-label={label} placeholder="e.g., MY_VARIABLE" />
      ),
    },
    {
      key: 'value',
      header: t('session.launcher.EnvironmentVariableValue'),
      renderInput: ({ label }) => <BAITextInput aria-label={label} />,
    },
  ]}
/>`,
    },
  ],
} satisfies ComponentDoc;

export default docs;
