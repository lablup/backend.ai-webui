import type { ComponentDoc } from '@astryxdesign/cli/authoring';

export const docs = {
  type: 'component',
  name: 'BAIVFolderSelect',
  displayName: 'BAI VFolder Select',
  category: 'Data Input',
  keywords: [
    'vfolder',
    'folder',
    'storage folder',
    'mount',
    'select',
    'combobox',
    'paginated select',
    'relay',
  ],
  usage: {
    description:
      'The virtual-folder picker used by the session launcher mount field, the model-store import modals and the RBAC scope forms. It is a BAIComplexSelect wrapper around two Relay queries: BAIVFolderSelectPaginatedQuery pages vfolder_nodes ten rows at a time, newest first, scoped to a project and gated on requiredPermission, with the typed text debounced into a name search; BAIVFolderSelectValueQuery re-resolves the selected key(s) into folder names so the trigger stays readable after loadNext has paged past them. Both suspend, so a Suspense boundary is required above the control. The key semantics matter at the call site: with the default valuePropName of "id" the outer value is the raw Relay global id (what mount_ids stores), and with "row_id" it is the folder UUID; the local UUID is only ever used for display and for building the resolution filter. Each option shows the folder name as its label and that id text as its description. The rest of BAIComplexSelectProps passes through, including the required label, isLabelHidden, isDisabled and width; options, value, onChange, searchValue, onSearch and total are owned here.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Wrap it, or the form item holding it, in a Suspense boundary — both queries suspend on first load.',
      },
      {
        guidance: true,
        description:
          'Pass currentProjectId so the query is scoped to one project; without it the list spans every scope the user can read.',
      },
      {
        guidance: true,
        description:
          'Set excludeDeleted on any form that mounts or writes to the folder, so folders in the four DELETE_* states never become selectable.',
      },
      {
        guidance: true,
        description:
          'Raise requiredPermission to mount_rw or write_content when the folder will be written to, rather than filtering the result afterwards.',
      },
      {
        guidance: true,
        description:
          'Use onResolvedNamesChange when the caller needs folder names for something else, such as deriving default mount paths — it fires each time the value query resolves, and only while something is selected.',
      },
      {
        guidance: false,
        description:
          'Render the trigger label as a link to the folder: BAIComplexSelect prints value.label as plain text, so there is no click-through affordance here.',
      },
      {
        guidance: false,
        description:
          'Assume a prefilled value outside the current scope resolves its name; supply fallbackLabels for those, or the trigger shows the local UUID.',
      },
    ],
  },
  props: [
    {
      name: 'value',
      type: 'string | Array<string> | null',
      description:
        'Selected folder key, or keys when multiple is set. The key is the Relay global id by default, or the folder UUID when valuePropName is "row_id". Omit it and the component keeps the selection itself.',
    },
    {
      name: 'onChange',
      type: '(value: string | Array<string> | undefined) => void',
      description:
        'Fired with the new key, or the array of keys under multiple. It carries no second option argument.',
    },
    {
      name: 'valuePropName',
      type: "'id' | 'row_id'",
      description:
        'Which folder field becomes the outer key. With "id" the key is the raw global id and is converted to a local UUID only for the resolution filter and the option description.',
      default: "'id'",
    },
    {
      name: 'currentProjectId',
      type: 'string',
      description:
        'Project scope for both queries, sent as a project scope id. Left unset, neither query is scoped and folders from every readable scope are listed.',
    },
    {
      name: 'filter',
      type: 'string',
      description:
        'Extra Backend.AI query-filter expression, merged into both the paginated option query and the value-resolution query, so a value excluded by the filter falls back to a label instead of a name.',
    },
    {
      name: 'excludeDeleted',
      type: 'boolean',
      description:
        'Adds predicates excluding the DELETE_PENDING, DELETE_ONGOING, DELETE_ERROR and DELETE_COMPLETE statuses to that same merged filter.',
    },
    {
      name: 'requiredPermission',
      type: 'BAIVFolderPermission',
      description:
        'Lists only folders granting this permission to the current user. One value only, since the API argument is a single scalar. It narrows the option list alone — the value query stays on read_attribute so an externally set value still resolves its name.',
      default: "'read_attribute'",
    },
    {
      name: 'onResolvedNamesChange',
      type: '(nameMap: Record<string, string>) => void',
      description:
        'Called with a key-to-name map each time the value query resolves. It does not fire while nothing is selected, because that query is skipped.',
    },
    {
      name: 'fallbackLabels',
      type: 'Record<string, string>',
      description:
        'Caller-known labels keyed by the outer value, used only when resolution misses — a prefilled folder outside the current scope or filter. A resolved name always wins, and without an entry the trigger shows the local UUID rather than the base64 global id.',
    },
    {
      name: 'multiple',
      type: 'boolean',
      description:
        'Switches to multi-selection: value and onChange become arrays and the trigger lists the selected folder names.',
      default: 'false',
    },
    {
      name: 'isLoading',
      type: 'boolean',
      description:
        'Caller-side loading flag, combined with the internal pending states (deferred value, debounced search, in-flight refetch) that already spin the trigger.',
    },
    {
      name: 'placeholder',
      type: 'string',
      description:
        'Trigger text while nothing is selected. Applied before the prop spread, so a call site can override the translated default.',
      default: "t('comp:BAIVFolderSelect.SelectFolder')",
    },
    {
      name: 'ref',
      type: 'React.Ref<BAIVFolderSelectRef>',
      description:
        'Imperative handle exposing refetch(), which updates the shared fetch key of the paginated and value queries inside a transition. Call it after creating a folder from the same screen.',
    },
  ],
  examples: [
    {
      label: 'Multi-folder mount field in the session launcher',
      code: `<BAIVFolderSelect
  ref={vFolderSelectRef}
  label={t('session.launcher.FolderToMount')}
  isLabelHidden
  multiple
  currentProjectId={currentProjectId}
  filter={filter}
  onResolvedNamesChange={handleResolvedNamesChange}
  onChange={(value) => {
    form.setFieldValue('mount_ids', _.castArray(value ?? []));
  }}
/>`,
    },
    {
      label: 'Destination folder restricted to one project',
      code: `<BAIVFolderSelect
  label={t('importArtifactRevisionToFolderModal.FolderMountForModelStore')}
  isLabelHidden
  excludeDeleted
  isDisabled={!destinationProject?.id}
  filter={mergeFilterValues([
    'ownership_type == "group"',
    \`group == "\${destinationProject?.id ?? ''}"\`,
  ])}
/>`,
    },
  ],
} satisfies ComponentDoc;

export default docs;
