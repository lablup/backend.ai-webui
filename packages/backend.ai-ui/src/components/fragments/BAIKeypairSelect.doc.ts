import type { ComponentDoc } from '@astryxdesign/cli/authoring';

export const docs = {
  type: 'component',
  name: 'BAIKeypairSelect',
  displayName: 'BAI Keypair Select',
  category: 'Data Input',
  keywords: [
    'keypair',
    'access key',
    'credential',
    'select',
    'dropdown',
    'picker',
  ],
  usage: {
    description:
      'Picks one or more keypairs by access key. It runs its own Relay queries rather than taking a fragment reference — a paginated `keypair_list` query (ten rows per page, newest first, extended as the popup is scrolled) plus a second `keypair_list` lookup that resolves the labels of whatever is already selected — so the caller spreads no fragment and only has to mount it inside a Suspense boundary. Its outer value is the plain access key string (an array when `multiple` is set), not a label-in-value object, so a BAIFormItem binding and a mutation payload both receive exactly what the API expects. Typing in the popup searches server-side on `access_key`; everything not listed below passes through to BAIComplexSelect.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Mount it under a Suspense boundary — it calls useLazyLoadQuery itself and suspends on first load.',
      },
      {
        guidance: true,
        description:
          'Pass the inherited `label` on every instance, adding `isLabelHidden` when the surrounding BAIFormItem already prints one; it is the accessible name Astryx fields require.',
      },
      {
        guidance: true,
        description:
          'Narrow the list with `filter`, a backend filter expression merged with the search clause, instead of post-filtering options — only one page is loaded at a time.',
      },
      {
        guidance: true,
        description:
          'Hold a `ref` and call its `refetch()` when a keypair is created or revoked elsewhere on the page, so both queries re-run inside a transition.',
      },
      {
        guidance: false,
        description:
          'Expect the emitted value to carry a label — it is the bare access key, and the label is resolved internally for display only.',
      },
      {
        guidance: false,
        description:
          'Pass `endReached`: the wrapper binds its own paging callback after spreading your props, so anything you pass is replaced.',
      },
    ],
  },
  props: [
    {
      name: 'value',
      type: 'string | Array<string> | null',
      description:
        'Selected access key, or an array of them when `multiple` is set. An uncontrolled `defaultValue` works too, since the wrapper resolves the pair through useControllableValue.',
    },
    {
      name: 'onChange',
      type: '(value: string | Array<string> | undefined) => void',
      description:
        'Fired with the new access key, or the array of keys in multiple mode. Never receives a label-in-value object.',
    },
    {
      name: 'filter',
      type: 'string',
      description:
        'Backend filter expression applied to both queries. It is merged with the `access_key ilike` clause the search box produces, so the two narrow the list together.',
    },
    {
      name: 'multiple',
      type: 'boolean',
      description:
        'Switches to multi-selection; the value becomes an array and the trigger lists the selected labels.',
      default: 'false',
    },
    {
      name: 'isLoading',
      type: 'boolean',
      description:
        'Forces the trigger spinner on. It is OR-ed with the internal pending states — a just-changed selection, an unsettled search, an in-flight refetch — so leaving it unset still shows those.',
    },
    {
      name: 'placeholder',
      type: 'string',
      description:
        'Empty-state text on the trigger. Defaults to the translated "Select keypair" and is applied before your props are spread, so passing one replaces it.',
    },
    {
      name: 'onOpenChange',
      type: '(open: boolean) => void',
      description:
        'Called when the popup opens or closes. The wrapper reads it through useControllableValue, so your handler still fires while the wrapper uses the open state to switch its fetch policy between network-only and store-only.',
    },
    {
      name: 'endReached',
      type: '() => void',
      description:
        'Accepted and inert — the wrapper overrides it with its own `loadNext` so scrolling the popup pages the connection.',
    },
    {
      name: 'ref',
      type: 'React.Ref<BAIKeypairSelectRef>',
      description:
        'Exposes `refetch()`, which bumps the fetch key of both the paginated list and the selected-value lookup inside a transition.',
    },
  ],
  examples: [
    {
      label: 'Scope picker inside a form item',
      code: `<Suspense fallback={fallback}>
  <BAIKeypairSelect
    label={t('rbac.ScopeId')}
    isLabelHidden
    value={scopeId}
    onChange={setScopeId}
  />
</Suspense>`,
    },
    {
      label: 'Multiple keypairs, narrowed by a filter',
      code: `<BAIKeypairSelect
  label={t('credential.AccessKey')}
  multiple
  filter='is_active == true'
  value={accessKeys}
  onChange={(value) => setAccessKeys(value as Array<string>)}
/>`,
    },
  ],
} satisfies ComponentDoc;

export default docs;
