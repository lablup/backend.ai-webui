import type { ComponentDoc } from '@astryxdesign/cli/authoring';

export const docs = {
  type: 'component',
  name: 'BAIAdminImageSelect',
  displayName: 'BAI Admin Image Select',
  category: 'Data Input',
  keywords: [
    'image',
    'container image',
    'select',
    'dropdown',
    'picker',
    'admin',
    'paginated',
  ],
  usage: {
    description:
      'Admin-scoped picker for a container image, built on BAIComplexSelect and backed by `adminImagesV2` — the admin connection, so images hidden from a regular user by permission scoping are still listable here. It runs its own Relay queries: a page query (20 rows at a time, ordered by NAME, extended by `loadNext` when the popup scrolls to the bottom) and a lookup that resolves the labels of the selected ids, which keeps the trigger readable after paging has moved past the chosen row. Each option is labelled `"<canonicalName>@<architecture>"` so images of different CPU architectures stay distinguishable, and the popup search box refetches server-side with a debounced `name contains` filter. The emitted value is the image UUID (`toLocalId` of the node id), ready to hand straight to a mutation input typed `UUID!`. Both queries use `useLazyLoadQuery`, so render it inside a Suspense boundary; `label` is required by BAIComplexSelect, and every prop not listed below is forwarded to it — except `options`, `value`, `onChange`, `searchValue`, `onSearch` and `total`, which this wrapper owns and omits from its props type.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Give it a `label` even where a Form.Item or card header already prints one, and add `isLabelHidden` — the Astryx field takes its accessible name from that prop.',
      },
      {
        guidance: true,
        description:
          'Render it inside a Suspense boundary; the page query and the selected-label query both suspend on first load.',
      },
      {
        guidance: true,
        description:
          'Pass the emitted value straight into `UUID!` mutation inputs — it is already the local UUID, not a Relay global id.',
      },
      {
        guidance: true,
        description:
          'Narrow the list with the structured `filter` (an `ImageV2Filter`); it is spread into the page query filter alongside the search term.',
      },
      {
        guidance: false,
        description:
          'Assume the trigger always shows a name: until the label query resolves — and, for a value that names an image the query cannot return — the raw UUID is displayed as the label.',
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
        'Controlled selection as the image UUID, or an array of UUIDs in `multiple` mode. It is read through a deferred value so a fresh pick does not immediately re-run the label query.',
    },
    {
      name: 'onChange',
      type: '(value: string | Array<string> | undefined) => void',
      description:
        'Fired with the chosen image UUID, or the array of UUIDs in `multiple` mode. It passes no second option argument.',
    },
    {
      name: 'filter',
      type: 'ImageV2Filter',
      description:
        'Extra GraphQL filter narrowing the listed images. It is spread into the page query filter, where a search term adds `name: { contains: … }` on top of it.',
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
        'Trigger text while nothing is selected. Defaults to the BUI-localized "select image" string; a value passed here replaces it.',
    },
    {
      name: 'ref',
      type: 'React.Ref<BAIAdminImageSelectRef>',
      description:
        'Imperative handle exposing `refetch()`, which bumps the fetch key inside a transition so both queries reload without the control unmounting.',
    },
  ],
  examples: [
    {
      label: 'Image field inside a preset form',
      code: `<Suspense fallback={<BAISkeleton variant="input" />}>
  <BAIAdminImageSelect
    label={t('adminDeploymentPreset.Image')}
    isLabelHidden
    value={value}
    onChange={onChange}
  />
</Suspense>`,
    },
  ],
} satisfies ComponentDoc;

export default docs;
