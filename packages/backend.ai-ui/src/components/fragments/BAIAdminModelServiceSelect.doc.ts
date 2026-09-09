import type { ComponentDoc } from '@astryxdesign/cli/authoring';

export const docs = {
  type: 'component',
  name: 'BAIAdminModelServiceSelect',
  displayName: 'BAI Admin Model Service Select',
  category: 'Data Input',
  keywords: [
    'model service',
    'deployment',
    'endpoint',
    'select',
    'dropdown',
    'picker',
    'admin',
  ],
  usage: {
    description:
      'Admin-scoped picker for a model service (deployment), built on BAIComplexSelect and backed by the `adminDeployments` connection. It runs the page query itself — 10 rows at a time, extended by `loadNext` when the popup scrolls to the bottom, refetched with a debounced `name contains` filter as the user types — and labels each option with the deployment `metadata.name`, falling back to the UUID when the name is missing. The emitted value is the deployment UUID (`toLocalId` of the node id). A second query resolves the label of the selected value through the single-node `deployment(id:)` field, because `DeploymentFilter` has no id-based filter; it therefore resolves only the FIRST selected key, so in `multiple` mode every further selection shows its raw UUID as the label until that row is loaded into a page again. Both queries use `useLazyLoadQuery`, so render it inside a Suspense boundary; `label` is required by BAIComplexSelect, and every prop not listed below is forwarded to it — except `options`, `value`, `onChange`, `searchValue`, `onSearch` and `total`, which this wrapper owns and omits from its props type.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Give it a `label` even where a Form.Item or card header already prints one, and add `isLabelHidden` — the Astryx field takes its accessible name from that prop.',
      },
      {
        guidance: true,
        description:
          'Render it inside a Suspense boundary; the page query and the single-deployment label query both suspend on first load.',
      },
      {
        guidance: true,
        description:
          'Prefer it in single-selection mode, where the label of the selected deployment always resolves; `multiple` mode can only resolve the first key.',
      },
      {
        guidance: true,
        description:
          'Pass the emitted value straight into inputs that expect a deployment UUID — it is the local id, not a Relay global id.',
      },
      {
        guidance: false,
        description:
          'Expect every chip in `multiple` mode to read as a name: only the first selected key goes through the resolution query, and the rest show the UUID unless the deployment is in a loaded page.',
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
        'Controlled selection as the deployment UUID, or an array of UUIDs in `multiple` mode. It is read through a deferred value so a fresh pick does not immediately re-run the label query.',
    },
    {
      name: 'onChange',
      type: '(value: string | Array<string> | undefined) => void',
      description:
        'Fired with the chosen deployment UUID, or the array of UUIDs in `multiple` mode. It passes no second option argument.',
    },
    {
      name: 'multiple',
      type: 'boolean',
      description:
        'Switches to multi-selection: `value` and the `onChange` payload become arrays. Label resolution stays limited to the first selected key.',
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
        'Trigger text while nothing is selected. Defaults to the BUI-localized "select model service" string; a value passed here replaces it.',
    },
    {
      name: 'ref',
      type: 'React.Ref<BAIAdminModelServiceSelectRef>',
      description:
        'Imperative handle exposing `refetch()`, which bumps the fetch key inside a transition so both queries reload without the control unmounting.',
    },
  ],
  examples: [
    {
      label: 'Deployment scope of a role assignment',
      code: `<Suspense fallback={<BAISkeleton variant="input" />}>
  <BAIAdminModelServiceSelect
    label={t('rbac.ScopeId')}
    isLabelHidden
    value={scopeId}
    onChange={(value) => setScopeId(value as string | undefined)}
  />
</Suspense>`,
    },
  ],
} satisfies ComponentDoc;

export default docs;
