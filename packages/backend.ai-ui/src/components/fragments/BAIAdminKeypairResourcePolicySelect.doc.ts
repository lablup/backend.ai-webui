import type { ComponentDoc } from '@astryxdesign/cli/authoring';

export const docs = {
  type: 'component',
  name: 'BAIAdminKeypairResourcePolicySelect',
  displayName: 'BAI Admin Keypair Resource Policy Select',
  category: 'Data Input',
  keywords: [
    'keypair resource policy',
    'resource policy',
    'policy',
    'select',
    'dropdown',
    'picker',
    'admin',
  ],
  usage: {
    description:
      'Admin-scoped picker for a keypair resource policy, built on BAIComplexSelect and backed by the `adminKeypairResourcePoliciesV2` connection. It runs the page query itself — 10 rows at a time, ordered by NAME, extended by `loadNext` when the popup scrolls to the bottom, and refetched with a debounced `name contains` filter as the user types in the popup search box. The policy `name` is both the key and the display label, so unlike the other admin selects there is no second label-resolution query: the trigger is correct for any value, loaded page or not. The emitted value is that name (`string`, or `string[]` in `multiple` mode). The query runs through `useLazyLoadQuery`, so render it inside a Suspense boundary; `label` is required by BAIComplexSelect, and every prop not listed below is forwarded to it — except `options`, `value`, `onChange`, `searchValue`, `onSearch` and `total`, which this wrapper owns and omits from its props type.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Give it a `label` even where a Form.Item or card header already prints one, and add `isLabelHidden` — the Astryx field takes its accessible name from that prop.',
      },
      {
        guidance: true,
        description:
          'Render it inside a Suspense boundary; the page query suspends on first load.',
      },
      {
        guidance: true,
        description:
          'Set `multiple` where several policies apply at once, for example the keypair-resource-policy picker above the folder permission table.',
      },
      {
        guidance: true,
        description:
          'Signal a rejected selection through the inherited `status` prop rather than hiding the control, so the chosen names stay visible while the user corrects them.',
      },
      {
        guidance: false,
        description:
          'Expect a second `option` argument on `onChange` — the value is the policy name, which is already the label.',
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
        'Controlled selection as the policy name, or an array of names in `multiple` mode. It is read through a deferred value, which is one of the inputs to the internal loading state.',
    },
    {
      name: 'onChange',
      type: '(value: string | Array<string> | undefined) => void',
      description:
        'Fired with the chosen policy name, or the array of names in `multiple` mode. It passes no second option argument.',
    },
    {
      name: 'multiple',
      type: 'boolean',
      description:
        'Switches to multi-selection: `value` and the `onChange` payload become arrays, and the trigger lists the selected names.',
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
        'Trigger text while nothing is selected. Defaults to the BUI-localized "select keypair resource policy" string; a value passed here replaces it.',
    },
    {
      name: 'ref',
      type: 'React.Ref<BAIAdminKeypairResourcePolicySelectRef>',
      description:
        'Imperative handle exposing `refetch()`, which bumps the fetch key inside a transition so the page query reloads without the control unmounting.',
    },
  ],
  examples: [
    {
      label: 'Multi-select above a permission table',
      code: `<BAIAdminKeypairResourcePolicySelect
  label={t('storageHost.permission.KeypairResourcePolicies')}
  isLabelHidden
  multiple
  value={selectedPolicyNames}
  onChange={(value) => setSelectedPolicyNames((value as string[]) ?? [])}
  status={
    selectedPolicyNames.length > MAX_SELECTION ? { type: 'error' } : undefined
  }
  width={320}
/>`,
    },
  ],
} satisfies ComponentDoc;

export default docs;
