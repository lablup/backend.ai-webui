import type { ComponentDoc } from '@astryxdesign/cli/authoring';

export const docs = {
  type: 'component',
  name: 'BAIProjectSelect',
  displayName: 'BAI Project Select',
  category: 'Data Input',
  keywords: ['project', 'group', 'select', 'dropdown', 'picker', 'scope'],
  usage: {
    description:
      'Picks one or more projects the current user may read. It owns its Relay queries instead of taking a fragment reference — a paginated `group_nodes` query (ten rows per page, newest first, requested with `permission: "read_attribute"`, extended as the popup is scrolled) plus a second `group_nodes` lookup that resolves the names of the already-selected ids — so the caller spreads nothing and only has to mount it inside a Suspense boundary. The outer value is the project\'s raw GraphQL global id as a plain string (an array when `multiple` is set); the local id is used only when building the internal lookup filter, never as the value you receive. Typing in the popup searches server-side on `name`; everything not listed below passes through to BAIComplexSelect.',
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
          'Store and send back the global id it emits — feeding it a bare local id leaves the trigger printing that raw string, because the value lookup matches on the global id.',
      },
      {
        guidance: true,
        description:
          'Apply cross-cutting restrictions through `filter`; it is merged into both the paginated query and the selected-value lookup, so a selection outside the filter stays unresolved rather than silently labelled.',
      },
      {
        guidance: false,
        description:
          'Assume every project in the domain is listed — the queries ask for `read_attribute` permission, so a user without it on a project never sees it.',
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
        'Selected project global id, or an array of them when `multiple` is set. An uncontrolled `defaultValue` works too, since the wrapper resolves the pair through useControllableValue.',
    },
    {
      name: 'onChange',
      type: '(value: string | Array<string> | undefined) => void',
      description:
        'Fired with the new global id, or the array of ids in multiple mode. Never receives a label-in-value object.',
    },
    {
      name: 'filter',
      type: 'string',
      description:
        'Backend filter expression applied to both queries. In the paginated query it is merged with the `name ilike` clause the search box produces; in the value lookup it is combined with the id clause using `&`.',
    },
    {
      name: 'multiple',
      type: 'boolean',
      description:
        'Switches to multi-selection; the value becomes an array and the trigger lists the selected names.',
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
        'Empty-state text on the trigger. Defaults to the translated "Select project" and is applied before your props are spread, so passing one replaces it.',
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
      type: 'React.Ref<BAIProjectSelectRef>',
      description:
        'Exposes `refetch()`, which bumps the fetch key of both the paginated list and the selected-value lookup inside a transition.',
    },
  ],
  examples: [
    {
      label: 'Project field in a form',
      code: `<BAIFormItem label={t('general.Project')} name="projectId" required>
  <Suspense fallback={<BAISkeleton active />}>
    <BAIProjectSelect label={t('general.Project')} isLabelHidden />
  </Suspense>
</BAIFormItem>`,
    },
    {
      label: 'Multiple projects, refetched after a mutation',
      code: `<BAIProjectSelect
  ref={projectSelectRef}
  label={t('general.Projects')}
  multiple
  value={projectIds}
  onChange={(value) => setProjectIds(value as Array<string>)}
/>`,
    },
  ],
} satisfies ComponentDoc;

export default docs;
