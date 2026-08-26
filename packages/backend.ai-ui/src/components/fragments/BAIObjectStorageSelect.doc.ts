import type { ComponentDoc } from '@astryxdesign/cli/authoring';

export const docs = {
  type: 'component',
  name: 'BAIObjectStorageSelect',
  displayName: 'BAI Object Storage Select',
  category: 'Data Input',
  keywords: [
    'object storage',
    'storage',
    'bucket',
    's3',
    'select',
    'dropdown',
    'picker',
  ],
  usage: {
    description:
      "Picks a single object storage. It owns its Relay queries rather than taking a fragment reference — a paginated `objectStorages` connection query that supplies the option rows, plus an `objectStorage(id:)` point lookup that resolves the name of the current selection — so the caller spreads nothing and only has to mount it inside a Suspense boundary. Because that point lookup resolves one id at a time, the component is single-select only: `multiple` is omitted from its props. The outer value is the storage's raw GraphQL id as a plain string, and until the lookup lands the trigger prints that id rather than the name. Everything not listed below passes through to BAIComplexSelect.",
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
          'Pass a `fetchKey` that changes when storages are added or removed elsewhere, since this wrapper exposes no imperative refetch handle.',
      },
      {
        guidance: false,
        description:
          'Turn the popup search box on: the paginated query takes no filter argument, so typing only toggles the loading state and never narrows the list.',
      },
      {
        guidance: false,
        description:
          'Expect a full list on open — the connection is paged one row at a time, so the popup fills as it is scrolled.',
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
      type: 'string | null',
      description:
        'Selected object storage id. An uncontrolled `defaultValue` works too, since the wrapper resolves the pair through useControllableValue.',
    },
    {
      name: 'onChange',
      type: '(value: string | undefined) => void',
      description:
        'Fired with the newly selected id. Never receives a label-in-value object.',
    },
    {
      name: 'fetchKey',
      type: 'string',
      description:
        'Relay fetch key handed to both queries. Change it to force a reload; the component never bumps it on its own.',
    },
    {
      name: 'isLoading',
      type: 'boolean',
      description:
        'Forces the trigger spinner on. It is OR-ed with the internal pending states — a just-changed selection and an unsettled search box — so leaving it unset still shows those.',
    },
    {
      name: 'placeholder',
      type: 'string',
      description:
        'Empty-state text on the trigger. Defaults to the untranslated "Select Storage" and is applied before your props are spread, so passing one replaces it.',
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
  ],
  examples: [
    {
      label: 'Storage field in a form',
      code: `<BAIFormItem label={t('storage.ObjectStorage')} name="objectStorageId" required>
  <Suspense fallback={<BAISkeleton active />}>
    <BAIObjectStorageSelect
      label={t('storage.ObjectStorage')}
      isLabelHidden
      fetchKey={fetchKey}
    />
  </Suspense>
</BAIFormItem>`,
    },
    {
      label: 'Controlled selection',
      code: `<BAIObjectStorageSelect
  label={t('storage.ObjectStorage')}
  value={objectStorageId}
  onChange={setObjectStorageId}
/>`,
    },
  ],
} satisfies ComponentDoc;

export default docs;
