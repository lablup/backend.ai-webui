import type { ComponentDoc } from '@astryxdesign/cli/authoring';

export const docs = {
  type: 'component',
  name: 'BAIBulkEditFormItem',
  displayName: 'BAI Bulk Edit Form Item',
  category: 'Data Input',
  keywords: [
    'bulk edit',
    'form item',
    'field',
    'multi edit',
    'keep as is',
    'partial update',
    'form field',
  ],
  usage: {
    description:
      'The form field used when one dialog edits many records at once. It wraps the form engine’s Form.Item in a three-state control: "keep" (the default) shows a read-only "Keep as is" placeholder and leaves the field unregistered, so its value is undefined and the record is excluded from submission; clicking or focusing the placeholder switches to "edit" and mounts the real control — whatever child you pass — with focus and, for a select, its popup already opened; and "clear", offered through a Clear link when `showClear` is set, registers the field as `null` so the value is actively unset for every record. An "Undo changes" link returns the field to keep. The field is mounted only from the moment the user switches modes, which is what lets a child `initialValue` apply then rather than marking every field as edited at form mount. Remaining props are Form.Item’s, minus `required` and antd-style `rules`, which this component redefines.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Use it for every field of a bulk-edit modal, so an untouched field is genuinely absent from the payload instead of being submitted with a stale value.',
      },
      {
        guidance: true,
        description:
          'Set `showClear` only on fields the backend accepts as null, since clear mode submits `null` rather than omitting the key.',
      },
      {
        guidance: true,
        description:
          'Pass a control that supports focus and, where relevant, `open` — the component forwards a ref into the child and opens it when the row enters edit mode.',
      },
      {
        guidance: true,
        description:
          'Override `keepValueLabel` or `clearValueLabel` when the field-specific wording is clearer than the generic "Keep as is" / "Clear" defaults.',
      },
      {
        guidance: false,
        description:
          'Add a `required` rule — required display is handled internally, and `required` is omitted from the props on purpose.',
      },
      {
        guidance: false,
        description:
          'Give it more than one child; a single element is cloned with the focus ref, and a fragment or list breaks that.',
      },
    ],
  },
  props: [
    {
      name: 'name',
      type: 'NamePath',
      description:
        'Field path in the form. The component reads and writes it directly to switch between undefined (keep), a user value (edit) and null (clear).',
    },
    {
      name: 'label',
      type: 'ReactNode',
      description:
        'Field label, as on Form.Item. A node works, so a label can carry a help-icon tooltip.',
    },
    {
      name: 'showClear',
      type: 'boolean',
      description:
        'Whether the field can be unset. Adds the Clear link in keep mode and enables clear mode, which submits `null`.',
      default: 'false',
    },
    {
      name: 'keepValueLabel',
      type: 'string',
      description:
        'Text of the keep-mode placeholder. Defaults to the translated "Keep as is".',
    },
    {
      name: 'clearValueLabel',
      type: 'string',
      description:
        'Text of the clear-mode placeholder — what the records will read as once cleared. Defaults to the translated "Clear".',
    },
    {
      name: 'children',
      type: 'ReactElement',
      description:
        'The real input, mounted only in edit and clear mode. Exactly one element: it is cloned with a ref so the component can focus and open it.',
    },
    {
      name: 'rules',
      type: 'Array<Omit<RuleObject, "required"> | RuleRender>',
      description:
        'Validation rules for the mounted field. `required` is excluded — an unedited field is legitimately absent, so requiredness is handled by the component.',
    },
    {
      name: 'extra',
      type: 'ReactNode',
      description:
        'Extra content under the field. It is placed on the left of the row the Clear and Undo links occupy, rather than replacing it.',
    },
  ],
  examples: [
    {
      label: 'Bulk-editing a numeric field',
      code: `<BAIBulkEditFormItem label={t('session.Priority')} name="priority">
  <AstryxFormNumberInput
    label={t('session.Priority')}
    min={SESSION_PRIORITY_MIN}
    max={SESSION_PRIORITY_MAX}
    step={1}
    isIntegerOnly
  />
</BAIBulkEditFormItem>`,
    },
    {
      label: 'Optional field that can be unset for every record',
      code: `<BAIBulkEditFormItem
  name="domain_name"
  label={t('resourcePolicy.Domain')}
  showClear
  clearValueLabel={t('resourcePolicy.NoDomain')}
>
  <BAISelect options={domainOptions} />
</BAIBulkEditFormItem>`,
    },
  ],
} satisfies ComponentDoc;

export default docs;
