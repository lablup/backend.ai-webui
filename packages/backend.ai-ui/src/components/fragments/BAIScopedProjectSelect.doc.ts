import type { ComponentDoc } from '@astryxdesign/cli/authoring';

export const docs = {
  type: 'component',
  name: 'BAIScopedProjectSelect',
  displayName: 'BAI Scoped Project Select',
  category: 'Data Input',
  keywords: [
    'project',
    'project picker',
    'select',
    'combobox',
    'paginated select',
    'relay',
    'ADR 0012',
    'scopedProjectsV2',
  ],
  usage: {
    description:
      'A project picker over scopedProjectsV2 (ADR 0012), built on BAIComplexSelect. It pages the scoped connection ten rows at a time with limit/offset, ordered by name, and compiles the debounced search text into a name iContains predicate. The value is the project UUID (`entityId`); a second value query resolves the selected UUIDs back to names, because a project chosen on page one is no longer in the loaded options after scrolling. The caller passes `scope`, usually the current domain. Options are fetched when the popup opens; only the value query can suspend, so a lazily mounted instance sits in Suspense. The rest of BAIComplexSelectProps passes through.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Pass { domain: [{ value: id }] } with the id from the host’s useCurrentDomain().',
      },
      {
        guidance: true,
        description:
          'Read the names from the second onChange argument when the caller needs them (a URL, a summary), instead of looking them up again.',
      },
      {
        guidance: false,
        description:
          'Use adminProjectsV2 pickers for a page that reads one domain; scoped fields replace them (ADR 0012).',
      },
    ],
  },
  props: [
    {
      name: 'scope',
      type: 'ProjectScope',
      required: true,
      description:
        'The projects to list, as the scopedProjectsV2 scope input: { domain: [...] }, { user: [...] } or { resourceGroup: [...] }, combined with OR.',
    },
    {
      name: 'value',
      type: 'string | Array<string> | null',
      description: 'Selected project UUID, or UUIDs when multiple is set.',
    },
    {
      name: 'onChange',
      type: '(value: string | Array<string> | undefined, option?: BAILabeledValue | Array<BAILabeledValue>) => void',
      description:
        'Fired with the new UUID(s); the second argument carries the matching name/UUID pair(s).',
    },
    {
      name: 'filter',
      type: 'BAIScopedProjectSelectFilter',
      description:
        'Extra ProjectV2Filter input, combined under AND with the search predicate.',
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
      label: 'Projects of the current domain',
      code: `const { id } = useCurrentDomain();

<BAIScopedProjectSelect
  scope={{ domain: [{ value: id }] }}
  multiple
  label={t('general.Project')}
  isLabelHidden
  onChange={(ids, pairs) => setProjects(ids, pairs)}
/>`,
    },
  ],
} satisfies ComponentDoc;

export default docs;
