import type { ComponentDoc } from '@astryxdesign/cli/authoring';

export const docs = {
  type: 'component',
  name: 'BAIAdminContainerRegistrySelect',
  displayName: 'BAI Admin Container Registry Select',
  category: 'Data Input',
  keywords: [
    'container registry',
    'registry',
    'select',
    'dropdown',
    'picker',
    'admin',
    'paginated',
  ],
  usage: {
    description:
      'Admin-scoped picker for a container registry, built on BAIComplexSelect. It owns its data: a `container_registry_nodes` page query (10 rows at a time, ordered by registry_name, extended by `loadNext` when the popup scrolls to the bottom) plus a second query that resolves the labels of the currently selected keys — that second query is what keeps the trigger readable once paging has scrolled the chosen row out of `options`. Options are labelled `"<registry_name> - <project>"`, or the registry name alone when the node carries no project, and typing in the popup search box refetches server-side with a debounced `registry_name ilike` filter. The emitted value is a plain key (`string`, or `string[]` in `multiple` mode): the Relay global `id` by default, or `row_id` when `valuePropName="row_id"`. Both queries run through `useLazyLoadQuery`, so it must sit inside a Suspense boundary; `label` is required by BAIComplexSelect, and every prop not listed below is forwarded to it — except `options`, `value`, `onChange`, `searchValue`, `onSearch` and `total`, which this wrapper owns and omits from its props type.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Give it a `label` even where a surrounding Form.Item or card header already prints one, and add `isLabelHidden` — the Astryx field takes its accessible name from that prop.',
      },
      {
        guidance: true,
        description:
          'Render it inside a Suspense boundary; both the page query and the selected-label query suspend on first load.',
      },
      {
        guidance: true,
        description:
          'Set `valuePropName="row_id"` when the chosen value feeds an API that expects the registry row id — in the default `id` mode the value stays the Relay global id verbatim, and only the filter the component builds is normalized to a local id.',
      },
      {
        guidance: true,
        description:
          'Narrow the selectable registries with `filter`; the expression is merged with the search term rather than replacing it, so search keeps working inside the narrowed set.',
      },
      {
        guidance: false,
        description:
          'Expect a second `option` argument on `onChange` — this wrapper emits the plain key only, unlike BAIAdminProjectSelect.',
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
        'Controlled selection as a plain key — a single key, or an array in `multiple` mode. It is read through a deferred value, so a fresh pick does not immediately re-run the label-resolution query.',
    },
    {
      name: 'onChange',
      type: '(value: string | Array<string> | undefined) => void',
      description:
        'Fired with the new plain key, or the array of keys in `multiple` mode. It passes no second option argument.',
    },
    {
      name: 'filter',
      type: 'string',
      description:
        'Extra GraphQL filter expression applied to both the page query and the selected-label query, merged with the search term using `&`.',
    },
    {
      name: 'valuePropName',
      type: "'id' | 'row_id'",
      description:
        'Which node field becomes the option value and the emitted key. `id` is the Relay global id; `row_id` is the registry row id.',
      default: "'id'",
    },
    {
      name: 'multiple',
      type: 'boolean',
      description:
        'Switches to multi-selection: `value` and the `onChange` payload become arrays, and the trigger lists the selected labels.',
      default: 'false',
    },
    {
      name: 'isLoading',
      type: 'boolean',
      description:
        'External pending state, OR-ed with the internal ones — a deferred value catching up, a search term still debouncing, or a ref-triggered refetch in flight.',
    },
    {
      name: 'open',
      type: 'boolean',
      description:
        'Controlled popup open state. It also drives the page query fetch policy: `network-only` while open, `store-only` while closed.',
    },
    {
      name: 'defaultOpen',
      type: 'boolean',
      description:
        'Initial popup open state for the uncontrolled case, paired with `onOpenChange`.',
    },
    {
      name: 'onOpenChange',
      type: '(open: boolean) => void',
      description:
        'Reports popup open and close. It is the change trigger of the controllable `open` state, so supply it whenever you supply `open`.',
    },
    {
      name: 'placeholder',
      type: 'string',
      description:
        'Trigger text while nothing is selected. Defaults to the BUI-localized "select container registry" string; a value passed here replaces it.',
    },
    {
      name: 'ref',
      type: 'React.Ref<BAIAdminContainerRegistrySelectRef>',
      description:
        'Imperative handle exposing `refetch()`, which bumps the fetch key inside a transition so both queries reload without the control unmounting.',
    },
  ],
  examples: [
    {
      label: 'Scope picker that stores the registry row id',
      code: `<Suspense fallback={<BAISkeleton variant="input" />}>
  <BAIAdminContainerRegistrySelect
    label={t('rbac.ScopeId')}
    isLabelHidden
    valuePropName="row_id"
    value={scopeId}
    onChange={(value) => setScopeId(value as string | undefined)}
  />
</Suspense>`,
    },
  ],
} satisfies ComponentDoc;

export default docs;
