import type { ComponentDoc } from '@astryxdesign/cli/authoring';

export const docs = {
  type: 'component',
  name: 'BAIProjectResourcePolicySelect',
  displayName: 'BAI Project Resource Policy Select',
  category: 'Data Input',
  keywords: [
    'resource policy',
    'project policy',
    'quota',
    'select',
    'dropdown',
    'combobox',
    'relay',
  ],
  usage: {
    description:
      'The project resource policy picker for project creation and settings forms. BAIProjectResourcePolicySelectQuery fetches every project_resource_policies row in one request, sorts them alphabetically by name, and turns each into an option whose label and value are both the policy name — so the selected value is the name the project mutation expects, not an id. The query is a useLazyLoadQuery call, so the control suspends on first render; put the Suspense boundary around the enclosing form item rather than the select, or the form loses its value/onChange binding. Everything else is BAISelect: value, onChange, placeholder, allowClear, disabled and the rest of BAISelectProps pass straight through, with options removed from the props type because the component always supplies it.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Wrap the surrounding form item in Suspense, not the select itself, so the form item keeps injecting value and onChange.',
      },
      {
        guidance: true,
        description:
          'Let a Form.Item or BAIFormItem own the value, since the emitted policy name is exactly what the project mutation field takes.',
      },
      {
        guidance: true,
        description:
          'Add a placeholder — the component supplies none, so an empty field would otherwise render blank.',
      },
      {
        guidance: false,
        description:
          'Expect keypair or user resource policies here; this control lists project policies only.',
      },
      {
        guidance: false,
        description:
          'Sort or re-order the options at the call site — they arrive already sorted by policy name.',
      },
    ],
  },
  props: [
    {
      name: 'showSearch',
      type: 'boolean',
      description:
        'Whether the in-popup search box is shown. Enabled by the component and applied before the prop spread, so a call site can turn it off.',
      default: 'true',
    },
  ],
  examples: [
    {
      label: 'Resource policy field in the project settings form',
      code: `<Suspense fallback={<BAISkeleton variant="input" />}>
  <Form.Item
    label={t('comp:BAIProjectSettingModal.ProjectResourcePolicy')}
    name="resource_policy"
  >
    <BAIProjectResourcePolicySelect />
  </Form.Item>
</Suspense>`,
    },
    {
      label: 'Standalone, with a placeholder and clear button',
      code: `<BAIProjectResourcePolicySelect
  allowClear
  style={{ width: 300 }}
  placeholder={t('resourcePolicy.SelectPolicy')}
  value={policyName}
  onChange={setPolicyName}
/>`,
    },
  ],
} satisfies ComponentDoc;

export default docs;
