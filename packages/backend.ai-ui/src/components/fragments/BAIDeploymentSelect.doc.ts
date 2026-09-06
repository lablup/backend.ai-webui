import type { ComponentDoc } from '@astryxdesign/cli/authoring';

export const docs = {
  type: 'component',
  name: 'BAIDeploymentSelect',
  displayName: 'BAI Deployment Select',
  category: 'Data Input',
  keywords: [
    'deployment',
    'model service',
    'select',
    'dropdown',
    'picker',
    'admin',
    'relay',
  ],
  usage: {
    description:
      'Picks a model deployment from the admin-scoped `adminDeployments` connection. It is self-fetching — no fragment reference or queryRef is passed in — but it issues its own Relay queries, so it must render under a RelayEnvironmentProvider and inside a Suspense boundary. A paginated list query loads 10 deployments per page, extended when the popup is scrolled to the bottom, and filters on `name` with the debounced search text; a second query resolves the label of the selected deployment through a single-item `deployment(id:)` lookup. Because that lookup takes one id, only the first selected key resolves to a real name in multiple mode — the rest fall back to printing their own key, a backend limitation the batch endpoint does not yet cover. The value is the deployment’s raw GraphQL id, used unchanged as both the option value and the lookup key. Every prop not listed below is passed through to BAIComplexSelect, whose `label` prop is required.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Prefer single-select here; multiple mode works, but only the first selection shows a resolved name in the trigger.',
      },
      {
        guidance: true,
        description:
          'Always pass `label`, since BAIComplexSelect requires an accessible name; add `isLabelHidden` when an enclosing BAIFormItem already prints it.',
      },
      {
        guidance: true,
        description:
          'Hand the emitted id straight back as `value` — it is the same id the `deployment(id:)` lookup expects, with no `toLocalId` conversion.',
      },
      {
        guidance: false,
        description:
          'Rely on the list refreshing while the popup is closed — the list query is `store-only` until it opens; call `refetch()` on the ref instead.',
      },
    ],
  },
  props: [
    {
      name: 'value',
      type: 'string | Array<string> | null',
      description:
        'Selected deployment id(s), as raw GraphQL ids. An array when `multiple` is set, a single string otherwise.',
    },
    {
      name: 'onChange',
      type: '(value: string | Array<string> | undefined) => void',
      description:
        'Fired with the new selection — an array of ids in multiple mode, one id otherwise. No matching option object is passed.',
    },
    {
      name: 'multiple',
      type: 'boolean',
      description:
        'Switches the control to multi-select. The value query still resolves only the first selected id, so the other trigger labels show their raw ids.',
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
        'Empty-state text on the trigger. Defaults to the translated "Select deployment"; passing a value replaces it.',
    },
    {
      name: 'onOpenChange',
      type: '(open: boolean) => void',
      description:
        'Reports popup open/close. The component also consumes it to flip the list query between `network-only` while open and `store-only` while closed.',
    },
    {
      name: 'ref',
      type: 'React.Ref<BAIDeploymentSelectRef>',
      description:
        'Exposes `refetch()`, which bumps the fetch key inside a transition and reloads both the list query and the value query.',
    },
  ],
  examples: [
    {
      label: 'Deployment picker inside a form item',
      code: `<Suspense fallback={fallback}>
  <BAIDeploymentSelect
    label={t('rbac.ScopeId')}
    isLabelHidden
    value={deploymentId}
    onChange={(value) => setDeploymentId(value as string | undefined)}
  />
</Suspense>`,
    },
  ],
} satisfies ComponentDoc;

export default docs;
