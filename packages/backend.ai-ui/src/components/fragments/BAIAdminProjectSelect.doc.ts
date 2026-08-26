import type { ComponentDoc } from '@astryxdesign/cli/authoring';

export const docs = {
  type: 'component',
  name: 'BAIAdminProjectSelect',
  displayName: 'BAI Admin Project Select',
  category: 'Data Input',
  keywords: [
    'project',
    'group',
    'select',
    'dropdown',
    'picker',
    'admin',
    'paginated',
  ],
  usage: {
    description:
      'Admin-scoped picker for a project, built on BAIComplexSelect and backed by the `adminProjectsV2` connection — every project on the installation, not just the ones the current user belongs to. It runs its own Relay queries: a page query (10 rows at a time, ordered by NAME, extended by `loadNext` when the popup scrolls to the bottom, refetched with a debounced `name contains` filter as the user types) and a lookup that resolves the names of the selected ids, which keeps the trigger readable once paging has moved past the chosen row. The emitted value is the project UUID (`toLocalId` of the node id), and — unlike the other admin selects here — `onChange` also receives the matching `{ label, value }` pair as a second argument, so a filter chip can show the project name while the UUID goes into the GraphQL filter. Both queries use `useLazyLoadQuery`, so render it inside a Suspense boundary; `label` is required by BAIComplexSelect, and every prop not listed below is forwarded to it — except `options`, `value`, `onChange`, `searchValue`, `onSearch` and `total`, which this wrapper owns and omits from its props type.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Give it a `label` even where a Form.Item, card header or filter row already prints one, and add `isLabelHidden` — the Astryx field takes its accessible name from that prop.',
      },
      {
        guidance: true,
        description:
          'Render it inside a Suspense boundary; the page query and the selected-name query both suspend on first load.',
      },
      {
        guidance: true,
        description:
          'Read the second `onChange` argument when the UI has to display what was picked — it carries the resolved project name alongside the UUID that goes into the request.',
      },
      {
        guidance: true,
        description:
          'Restrict the list with `filter` when a surface only accepts one project type, for example `{ type: { equals: "MODEL_STORE" } }`.',
      },
      {
        guidance: false,
        description:
          'Assume the trigger always shows a name: until the resolution query answers — and for an id it cannot return — the raw UUID is displayed as the label.',
      },
      {
        guidance: false,
        description:
          'Pass `isLoadingNext`: the component sets it from its own pagination state after spreading your props, so a value supplied here is overwritten.',
      },
    ],
  },
  props: [
    {
      name: 'value',
      type: 'string | Array<string> | null',
      description:
        'Controlled selection as the project UUID, or an array of UUIDs in `multiple` mode. It is read through a deferred value so a fresh pick does not immediately re-run the name query.',
    },
    {
      name: 'onChange',
      type: '(value: string | Array<string> | undefined, option?: BAILabeledValue | Array<BAILabeledValue>) => void',
      description:
        'Fired with the chosen project UUID (an array in `multiple` mode) and, as a second argument, the matching `{ label, value }` pair — an array of pairs in `multiple` mode.',
    },
    {
      name: 'filter',
      type: "{ type?: { equals?: 'GENERAL' | 'MODEL_STORE' } }",
      description:
        'Extra GraphQL filter narrowing the listed projects. It is spread into the page query filter, where a search term adds `name: { contains: … }` on top of it.',
    },
    {
      name: 'multiple',
      type: 'boolean',
      description:
        'Switches to multi-selection: `value`, the `onChange` value and the second `option` argument all become arrays.',
      default: 'false',
    },
    {
      name: 'isLoading',
      type: 'boolean',
      description:
        'External pending state, OR-ed with the internal ones — a deferred value catching up, a search term still debouncing, or a ref-triggered refetch in flight.',
    },
    {
      name: 'onOpenChange',
      type: '(open: boolean) => void',
      description:
        'Reports popup open and close. It is the change trigger of the controllable open state, which also flips the page query fetch policy between `network-only` (open) and `store-only` (closed).',
    },
    {
      name: 'placeholder',
      type: 'string',
      description:
        'Trigger text while nothing is selected. Defaults to the BUI-localized "select project" string; a value passed here replaces it.',
    },
    {
      name: 'ref',
      type: 'React.Ref<BAIAdminProjectSelectRef>',
      description:
        'Imperative handle exposing `refetch()`, which bumps the fetch key inside a transition so both queries reload without the control unmounting.',
    },
  ],
  examples: [
    {
      label: 'Project scope of a quota setting',
      code: `<BAIAdminProjectSelect
  label={t('storageHost.ForProject')}
  isLabelHidden
  value={projectId}
  onChange={(value) => setProjectId(value as string | undefined)}
  width={240}
/>`,
    },
    {
      label: 'Filter input that shows the name and filters by UUID',
      code: `<BAIAdminProjectSelect
  label={t('data.Project')}
  isLabelHidden
  value={null}
  width={200}
  onChange={(value, option) => {
    onAddCondition(
      value as string | undefined,
      _.castArray(option ?? [])[0]?.label,
    );
  }}
/>`,
    },
  ],
} satisfies ComponentDoc;

export default docs;
