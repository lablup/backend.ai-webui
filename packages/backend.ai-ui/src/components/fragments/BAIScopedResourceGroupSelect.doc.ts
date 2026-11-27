import type { ComponentDoc } from '@astryxdesign/cli/authoring';

export const docs = {
  type: 'component',
  name: 'BAIScopedResourceGroupSelect',
  displayName: 'BAI Scoped Resource Group Select',
  category: 'Data Input',
  keywords: [
    'resource group',
    'scaling group',
    'select',
    'combobox',
    'paginated select',
    'relay',
    'ADR 0012',
    'scopedResourceGroups',
  ],
  usage: {
    description:
      'A resource group picker over scopedResourceGroups (ADR 0012), built on BAIComplexSelect. It pages the scoped connection twenty rows at a time with limit/offset, ordered by name, with a debounced name iContains search. A resource group’s name is both its key and its label, so the value is the name and no value query runs; nothing suspends on mount. The caller passes `scope`: the selected projects, or the current domain. The rest of BAIComplexSelectProps passes through.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Scope it to the projects the page shows ({ project: [...] }), and to the current domain only when no project is chosen.',
      },
      {
        guidance: false,
        description:
          'Use it where a session is created; the launcher keeps the resource groups of the current project.',
      },
    ],
  },
  props: [
    {
      name: 'scope',
      type: 'ResourceGroupScope',
      required: true,
      description:
        'The resource groups to list: { project: [...] }, { domain: [...] } or { user: [...] }, combined with OR.',
    },
    {
      name: 'value',
      type: 'string | Array<string> | null',
      description:
        'Selected resource group name, or names when multiple is set.',
    },
    {
      name: 'onChange',
      type: '(value: string | Array<string> | undefined) => void',
      description: 'Fired with the new name(s).',
    },
    {
      name: 'filter',
      type: 'BAIScopedResourceGroupSelectFilter',
      description:
        'Extra ResourceGroupFilter input, combined under AND with the search predicate.',
    },
    {
      name: 'multiple',
      type: 'boolean',
      description: 'Switches to multi-selection.',
      default: 'false',
    },
  ],
  examples: [
    {
      label: 'Resource groups of the selected projects',
      code: `<BAIScopedResourceGroupSelect
  scope={{ project: projectIds.map((value) => ({ value })) }}
  multiple
  label={t('general.ResourceGroup')}
  isLabelHidden
/>`,
    },
  ],
} satisfies ComponentDoc;

export default docs;
