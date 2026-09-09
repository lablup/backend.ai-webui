import type { ComponentDoc } from '@astryxdesign/cli/authoring';

export const docs = {
  type: 'component',
  name: 'BAIAvailablePresetSelect',
  displayName: 'BAI Available Preset Select',
  category: 'Data Input',
  keywords: [
    'preset',
    'deployment preset',
    'resource preset',
    'select',
    'dropdown',
    'picker',
    'relay',
  ],
  usage: {
    description:
      'Picks a deployment revision preset for a model deployment. It is self-fetching — no fragment reference or queryRef is passed in — but it issues its own Relay queries, so it must render under a RelayEnvironmentProvider and inside a Suspense boundary. The option list comes from one of two mutually exclusive paginated sources: the project-wide `deploymentRevisionPresets` connection by default, or the resource-compatible `modelCardAvailablePresets` subset once `modelCardId` is set; only the active one goes to the network, the other stays `store-only`. A third query resolves the labels of the selected ids so the trigger stays correct after the list has paged past them. Options are a flat RANK-ordered list — each row shows the preset name with its description as the secondary line — and the outer value contract is the raw preset UUID, with the labelInValue shape kept internal. Every prop not listed below is passed through to BAIComplexSelect, whose `label` prop is required.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Pass `modelCardId` whenever a model card is already chosen, so the list is narrowed to the presets that card can actually deploy against.',
      },
      {
        guidance: true,
        description:
          'Use `runtimeVariantId` to narrow the list to one runtime variant — options render as a single flat list, so there is no per-variant grouping to lean on.',
      },
      {
        guidance: true,
        description:
          'Set `isDisabled` when the surrounding form knows no preset is available, so the empty popup is never opened.',
      },
      {
        guidance: false,
        description:
          'Pass a Relay global id to `modelCardId` or `runtimeVariantId`; both are converted with `convertToUUID` and expect a raw local id.',
      },
      {
        guidance: false,
        description:
          'Rely on the popup reflecting presets created elsewhere while it is closed — the list query is `store-only` until it opens; call `refetch()` on the ref instead.',
      },
    ],
  },
  props: [
    {
      name: 'value',
      type: 'string | Array<string> | null',
      description:
        'Selected preset id(s) as raw UUIDs. An array when `multiple` is set, a single string otherwise.',
    },
    {
      name: 'onChange',
      type: '(value: string | Array<string> | undefined) => void',
      description:
        'Fired with the new selection — an array of UUIDs in multiple mode, one UUID otherwise. The matching option object is not passed.',
    },
    {
      name: 'runtimeVariantId',
      type: 'string',
      description:
        'Raw UUID of a runtime variant. When set, it is AND-ed with the search filter so only that variant’s presets are listed.',
    },
    {
      name: 'modelCardId',
      type: 'string',
      description:
        'Raw model-card UUID. When set, the options come from `modelCardAvailablePresets` — the presets that card is resource-compatible with (manager 26.4.2 and later) — instead of the project-wide list.',
    },
    {
      name: 'multiple',
      type: 'boolean',
      description:
        'Switches the control to multi-select, which also switches `value` and `onChange` to their array form.',
      default: 'false',
    },
    {
      name: 'isLoading',
      type: 'boolean',
      description:
        'Forces the trigger spinner on. It is ORed with the component’s own pending states (a deferred selection, an unsettled search string, an in-flight `refetch`), so passing `false` does not hide those.',
    },
    {
      name: 'placeholder',
      type: 'string',
      description:
        'Empty-state text on the trigger. Defaults to the translated "Select preset"; passing a value replaces it.',
    },
    {
      name: 'onOpenChange',
      type: '(open: boolean) => void',
      description:
        'Reports popup open/close. The component also consumes it to flip the active list query between `network-only` while open and `store-only` while closed.',
    },
    {
      name: 'ref',
      type: 'React.Ref<BAIAvailablePresetSelectRef>',
      description:
        'Exposes `refetch()`, which bumps the fetch key inside a transition and reloads the list and value queries.',
    },
  ],
  examples: [
    {
      label: 'Preset picker in a deploy modal',
      code: `<BAIAvailablePresetSelect
  label={t('modelStore.Preset')}
  isLabelHidden
  value={effectivePresetId}
  onChange={(value) => setUserSelectedPresetId(value as string | undefined)}
  isDisabled={noAvailablePresets}
/>`,
    },
    {
      label: 'Scoped to one model card',
      code: `<Suspense fallback={fallback}>
  <BAIAvailablePresetSelect
    label={t('modelStore.Preset')}
    modelCardId={toLocalId(modelCard.id)}
    value={presetId}
    onChange={(value) => setPresetId(value as string | undefined)}
  />
</Suspense>`,
    },
  ],
} satisfies ComponentDoc;

export default docs;
