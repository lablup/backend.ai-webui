import type { ComponentDoc } from '@astryxdesign/cli/authoring';

export const docs = {
  type: 'component',
  name: 'BAIProjectVfolderSelect',
  displayName: 'BAI Project Vfolder Select',
  category: 'Data Input',
  keywords: [
    'vfolder',
    'virtual folder',
    'folder',
    'storage',
    'select',
    'dropdown',
    'picker',
  ],
  usage: {
    description:
      "Picks one virtual folder belonging to a given project. It owns its Relay queries rather than taking a fragment reference — a paginated `projectVfolders` query scoped by `projectId` (ten rows per page, newest first, extended as the popup is scrolled) plus a `vfolderV2(vfolderId:)` point lookup that resolves the name of the current selection — so the caller spreads nothing and only has to mount it inside a Suspense boundary and supply `projectId`. It is single-value: the emitted value is the folder's dashed local UUID as a plain string, the form that `vfolderV2` and the deploy mutations take, and each option row shows that UUID as its secondary description line. Everything not listed below passes through to BAIComplexSelect.",
    bestPractices: [
      {
        guidance: true,
        description:
          'Mount it under a Suspense boundary — it calls useLazyLoadQuery itself and suspends on first load.',
      },
      {
        guidance: true,
        description:
          'Remount it with a `key` derived from `projectId`, or clear the value alongside it, so a folder from the previous project cannot survive a project change.',
      },
      {
        guidance: true,
        description:
          'Set `excludeDeleted` on pickers that feed a mutation, so folders in any of the four delete states never become a selectable target.',
      },
      {
        guidance: true,
        description:
          'Pass the inherited `label` on every instance, adding `isLabelHidden` when the surrounding BAIFormItem already prints one; it is the accessible name Astryx fields require.',
      },
      {
        guidance: false,
        description:
          'Nest AND/OR combinators inside `filter` for the fields the search box and `excludeDeleted` already use — the three are combined with AND, and `VFolderFilter` allows each field only once per level.',
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
      name: 'projectId',
      type: 'string',
      description:
        'Project whose folders are listed. Accepts a global id or a UUID; it is normalized before the query runs.',
      required: true,
    },
    {
      name: 'value',
      type: 'string | null',
      description:
        'Selected folder as a dashed local UUID. An uncontrolled `defaultValue` works too, since the wrapper resolves the pair through useControllableValue.',
    },
    {
      name: 'onChange',
      type: '(value: string | undefined) => void',
      description:
        'Fired with the newly selected folder UUID. Never receives a label-in-value object.',
    },
    {
      name: 'filter',
      type: 'BAIProjectVfolderSelectFilter | null',
      description:
        'Extra `VFolderFilter` for the paginated query. It is combined with the search clause and the `excludeDeleted` clause under an `AND`, and applies to the option list only — the selected folder is resolved by a point lookup that ignores it.',
    },
    {
      name: 'excludeDeleted',
      type: 'boolean',
      description:
        'Hides folders whose status is DELETE_PENDING, DELETE_ONGOING, DELETE_ERROR or DELETE_COMPLETE.',
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
        'Empty-state text on the trigger. Defaults to the translated "Select folder" and is applied before your props are spread, so passing one replaces it.',
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
      type: 'React.Ref<BAIProjectVfolderSelectRef>',
      description:
        'Exposes `refetch()`, which bumps the fetch key of both the paginated list and the selected-folder lookup inside a transition.',
    },
  ],
  examples: [
    {
      label: 'Model folder field in a form',
      code: `<BAIFormItem label={t('session.launcher.ModelStorageToMount')} name="vfolderId" required>
  <Suspense fallback={<BAISkeleton active />}>
    <BAIProjectVfolderSelect
      label={t('session.launcher.ModelStorageToMount')}
      isLabelHidden
      projectId={currentProject.id}
      excludeDeleted
    />
  </Suspense>
</BAIFormItem>`,
    },
    {
      label: 'Controlled, restricted to model folders',
      code: `<BAIProjectVfolderSelect
  key={currentProject.id}
  label={t('data.Folder')}
  projectId={currentProject.id}
  filter={{ usageMode: { equals: 'MODEL' } }}
  value={vfolderId}
  onChange={setVfolderId}
/>`,
    },
  ],
} satisfies ComponentDoc;

export default docs;
