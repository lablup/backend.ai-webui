import type { ComponentDoc } from '@astryxdesign/cli/authoring';

// No `type: 'component'` stamp: CLI 0.5.0's stamped component schema requires
// a top-level `props` array and has no multi-component variant, so a stamped
// `components` doc fails validation. Unstamped docs are shape-sniffed and the
// multi form is accepted.
export const docs = {
  name: 'BAISelect',
  displayName: 'BAI Select',
  category: 'Data Input',
  keywords: ['select', 'dropdown', 'combobox', 'picker', 'selector', 'listbox'],
  usage: {
    description:
      'The single select of webui and backend.ai-ui for a list the client already holds: ui-common Selector under the BAI name (ADR 0042). Its props are SelectorProps (run `ui-common component Selector` for the full list), with value / onChange typed as the clearable branch (`string | null`) so one interface covers both, plus two BAI additions: ghost and autoSelectOption. The wrapper sets the project defaults only — search on, the translated search placeholder, and an accessible name from the placeholder when neither aria-label nor the enclosing Form.Item label names it. A multi-value list uses BAIMultiSelector.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Give options as data with a string label — the label is the search key and the trigger text — and draw rich rows with renderOption (and renderValue when the trigger shows the row too), looking the extra data up by option value.',
      },
      {
        guidance: true,
        description:
          'Keep option values strings. When a form stores a number, convert on the Form.Item with getValueProps / getValueFromEvent so what the form submits does not change.',
      },
      {
        guidance: true,
        description:
          'Reach for BAIComplexSelect instead when the list is server-paginated or needs server-side search; Selector filters only the options it already holds.',
      },
      {
        guidance: false,
        description:
          'Use BAISelect for several values — BAIMultiSelector is the multi-value select.',
      },
    ],
  },
  components: [
    {
      name: 'BAISelect',
      displayName: 'BAI Select',
      description:
        'The select control. Every prop not listed here is ui-common Selector’s and reaches it unchanged.',
      props: [
        {
          name: 'options',
          type: 'SelectorOptionType[]',
          description:
            'Options, `{ type: "section", title, options }` sections and `{ type: "divider" }` entries, as ui-common Selector takes them.',
          required: true,
        },
        {
          name: 'value',
          type: 'string | null',
          description:
            'The selected value. `null` and `""` both mean nothing is selected.',
        },
        {
          name: 'defaultValue',
          type: 'string | null',
          description: 'The starting value when `value` is not set.',
        },
        {
          name: 'onChange',
          type: '(value: string | null) => void',
          description:
            'Called with the chosen value, or `null` when the clear button empties it.',
        },
        {
          name: 'hasSearch',
          type: 'boolean',
          default: 'true',
          description:
            'Type-to-filter in the open panel. On by default here (Selector’s own default is off); pass `false` for short fixed lists.',
        },
        {
          name: 'searchPlaceholder',
          type: 'string',
          description:
            'Placeholder of the search field. Defaults to the translated `general.Search`.',
        },
        {
          name: 'hasClear',
          type: 'boolean',
          description:
            'Shows a clear button while a value is selected. A `""` value counts as nothing selected, so no button shows for it.',
        },
        {
          name: 'aria-label',
          type: 'string',
          description:
            'Accessible name. Without one (or with a blank one) the enclosing Form.Item label names the control; outside a labelled Form.Item the placeholder does, then the translated `general.Select`.',
        },
        {
          name: 'placeholder',
          type: 'string',
          description:
            'Shown while nothing is selected, and the accessible-name fallback.',
        },
        {
          name: 'controlClassName',
          type: 'string',
          description:
            'Class names for the control box, next to BAISelect’s own `bai-select` class.',
        },
        {
          name: 'ghost',
          type: 'boolean',
          description:
            'BAI addition: the on-dark treatment for the select that sits on the header’s brand-accent band (BAISelect.css). A host whose band does not flip with the scheme sets `--bai-select-ghost-on-band`.',
        },
        {
          name: 'autoSelectOption',
          type: 'boolean',
          description:
            'BAI addition: while no value is set, selects the first option (sections included, dividers skipped) and reports it through onChange, so the enclosing Form.Item or the parent state receives it. Needs a controlled value — the `value` prop or an enclosing Form.Item; an uncontrolled select ignores it.',
        },
      ],
    },
  ],
  examples: [
    {
      label: 'Single select in a form',
      code: `<BAIFormItem name="status" label={t('credential.Status')}>
  <BAISelect
    hasSearch={false}
    placeholder={t('credential.SelectStatus')}
    options={[
      { value: 'active', label: t('general.Active') },
      { value: 'inactive', label: t('general.Inactive') },
    ]}
  />
</BAIFormItem>`,
    },
    {
      label: 'Rich rows with sections',
      code: `const rows = new Map(projects.map((p) => [p.id, <ProjectRow project={p} />]));
const renderRow = (option: SelectorOptionData) =>
  rows.get(option.value) ?? option.label;

<BAISelect
  aria-label={t('general.Project')}
  width="100%"
  hasClear
  options={[
    { type: 'section', title: t('general.General'), options: generalOptions },
    { type: 'section', title: t('data.ModelStore'), options: modelStoreOptions },
  ]}
  renderOption={renderRow}
  renderValue={renderRow}
  value={projectId}
  onChange={setProjectId}
/>`,
    },
  ],
} satisfies ComponentDoc;

export default docs;
