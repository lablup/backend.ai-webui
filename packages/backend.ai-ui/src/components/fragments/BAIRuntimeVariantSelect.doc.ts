import type { ComponentDoc } from '@astryxdesign/cli/authoring';

export const docs = {
  type: 'component',
  name: 'BAIRuntimeVariantSelect',
  displayName: 'BAI Runtime Variant Select',
  category: 'Data Input',
  keywords: [
    'runtime variant',
    'runtime',
    'inference',
    'deployment',
    'select',
    'dropdown',
    'picker',
  ],
  usage: {
    description:
      "Picks one runtime variant for a model deployment. It owns its Relay queries rather than taking a fragment reference — a paginated `runtimeVariants` query (twenty rows per page, ordered by name, extended as the popup is scrolled) plus a `runtimeVariant(id:)` point lookup that resolves the name of the current selection — so the caller spreads nothing and only has to mount it inside a Suspense boundary. It is single-value, and the emitted value is the variant's dash-stripped local UUID as a plain string. Beyond selection it reports resolved variant metadata upward through `onResolvedVariantsChange`, which is how a deployment form learns whether the chosen variant reads the vfolder config files without querying again. Everything not listed below passes through to BAIComplexSelect.",
    bestPractices: [
      {
        guidance: true,
        description:
          'Mount it under a Suspense boundary — it calls useLazyLoadQuery itself and suspends on first load.',
      },
      {
        guidance: true,
        description:
          'Merge each `onResolvedVariantsChange` payload into a map held by the form rather than replacing it, since the callback reports only the variants resolved so far — the current selection and the visible page.',
      },
      {
        guidance: true,
        description:
          'Read `readsVfolderConfigFiles` from that map to decide whether to show runtime-parameter fields, and treat a variant named "custom" as reading them when the flag is missing on managers older than 26.8.0.',
      },
      {
        guidance: true,
        description:
          'Pass the inherited `label` on every instance, adding `isLabelHidden` when the surrounding BAIFormItem already prints one; it is the accessible name Astryx fields require.',
      },
      {
        guidance: false,
        description:
          'Reach for the deprecated `onResolvedNamesChange` in new code — it carries names only, and the richer callback fires alongside it.',
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
        'Selected runtime variant as a dash-stripped local UUID. An uncontrolled `defaultValue` works too, since the wrapper resolves the pair through useControllableValue.',
    },
    {
      name: 'onChange',
      type: '(value: string | undefined) => void',
      description:
        'Fired with the newly selected variant UUID. Never receives a label-in-value object.',
    },
    {
      name: 'onResolvedVariantsChange',
      type: '(variantMap: Record<string, { name: string; readsVfolderConfigFiles: boolean }>) => void',
      description:
        'Reports the variants resolved so far, keyed by UUID, as the point lookup and each loaded page land. It is skipped entirely when neither resolved-metadata callback is given, and when the map would be empty. On managers older than 26.8.0 the `readsVfolderConfigFiles` field is stripped from the response and falls back to whether the variant is named "custom".',
    },
    {
      name: 'onResolvedNamesChange',
      type: '(nameMap: Record<string, string>) => void',
      description:
        'Deprecated name-only form of the same report, still fired alongside `onResolvedVariantsChange` for consumers that have not migrated.',
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
        'Empty-state text on the trigger. Defaults to the translated "Select runtime variant" and is applied before your props are spread, so passing one replaces it.',
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
      type: 'React.Ref<BAIRuntimeVariantSelectRef>',
      description:
        'Exposes `refetch()`, which bumps the fetch key of both the paginated list and the selected-variant lookup inside a transition.',
    },
  ],
  examples: [
    {
      label: 'Deployment form field reporting resolved metadata',
      code: `<BAIFormItem label={t('deployment.RuntimeVariant')} name="runtimeVariantId" required>
  <Suspense fallback={<BAISkeleton active />}>
    <BAIRuntimeVariantSelect
      label={t('deployment.RuntimeVariant')}
      isLabelHidden
      onResolvedVariantsChange={(map) =>
        setRuntimeVariantMap((prev) => ({ ...prev, ...map }))
      }
    />
  </Suspense>
</BAIFormItem>`,
    },
    {
      label: 'Controlled selection',
      code: `<BAIRuntimeVariantSelect
  label={t('deployment.RuntimeVariant')}
  value={runtimeVariantId}
  onChange={setRuntimeVariantId}
/>`,
    },
  ],
} satisfies ComponentDoc;

export default docs;
