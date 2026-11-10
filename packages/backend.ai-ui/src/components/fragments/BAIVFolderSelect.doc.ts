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
      'The virtual-folder picker used by the model-store import modal and the deployment revision forms. It is a BAIComplexSelect wrapper around two Relay queries on scopedVFoldersV2: BAIVFolderSelectPaginatedQuery pages the folders the scope reaches ten rows at a time, newest first, with the typed text debounced into a name search; BAIVFolderSelectValueQuery looks the selected key(s) up by entityId so the trigger stays readable after loadNext has paged past them. Both suspend, so a Suspense boundary is required above the control. With the default valuePropName of "id" the outer value is the VirtualFolderNode global id the call sites store, and with "entityId" it is the folder UUID. Each option shows the folder name as its label and the UUID as its description. The rest of BAIComplexSelectProps passes through, including the required label, isLabelHidden, isDisabled and width; options, value, onChange, searchValue, onSearch and total are owned here.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Wrap it, or the form item holding it, in a Suspense boundary, as both queries suspend on first load.',
      },
      {
        guidance: true,
        description:
          "Pass the narrowest scope the screen needs (ADR 0012): mountableVFolderScope(userId, projectId) for the caller's own folders plus a project's, or { project: [{ value }] } for one project's folders.",
      },
      {
        guidance: true,
        description:
          'Set excludeDeleted on any form that mounts or writes to the folder, so folders in the four DELETE_* states never become selectable.',
      },
      {
        guidance: false,
        description:
          'Assume a prefilled value outside the scope resolves its name; supply fallbackLabels for those, or the trigger shows the UUID.',
      },
    ],
  },
  props: [
    {
      name: 'scope',
      type: 'VFolderScope',
      description:
        'Required. The domains, projects and users whose folders are listed, combined with OR. The manager authorizes every listed scope before the read.',
    },
    {
      name: 'value',
      type: 'string | Array<string> | null',
      description:
        'Selected folder key, or keys when multiple is set. Omit it and the component keeps the selection itself.',
    },
    {
      name: 'onChange',
      type: '(value: string | Array<string> | undefined, option?: BAILabeledValue | Array<BAILabeledValue>) => void',
      description:
        'Fired with the new key, or the array of keys under multiple; the optional second argument carries the picked `{ label, value }` pair(s).',
    },
    {
      name: 'valuePropName',
      type: "'id' | 'entityId'",
      description:
        'Which key the value holds: the VirtualFolderNode global id, or the folder UUID.',
      default: "'id'",
    },
    {
      name: 'filter',
      type: 'VFolderFilter',
      description:
        'ANDed onto both the option query and the value lookup, so a value excluded by the filter falls back to a label instead of a name.',
    },
    {
      name: 'excludeDeleted',
      type: 'boolean',
      description:
        'Excludes the DELETE_PENDING, DELETE_ONGOING, DELETE_ERROR and DELETE_COMPLETE statuses from both queries.',
    },
    {
      name: 'fallbackLabels',
      type: 'Record<string, string>',
      description:
        'Caller-known labels keyed by the outer value, used only when the lookup misses. A resolved name always wins.',
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
        'Caller-side loading flag, combined with the internal pending states (deferred value, debounced search, in-flight refetch).',
    },
    {
      name: 'placeholder',
      type: 'string',
      description: 'Trigger text while nothing is selected.',
      default: "t('comp:BAIVFolderSelect.SelectFolder')",
    },
    {
      name: 'ref',
      type: 'React.Ref<BAIVFolderSelectRef>',
      description:
        'Imperative handle exposing refetch(), which re-reads both queries inside a transition. Call it after creating a folder from the same screen.',
    },
  ],
  examples: [
    {
      label: "Model folder in a deployment's project",
      code: `<BAIVFolderSelect
  label={t('deployment.ModelFolder')}
  isLabelHidden
  scope={mountableVFolderScope(baiClient.user_uuid, deploymentProject?.id)}
  excludeDeleted
  filter={{ usageMode: { equals: 'MODEL' } }}
/>`,
    },
    {
      label: 'Destination folder owned by one project',
      code: `<BAIVFolderSelect
  label={t('importArtifactRevisionToFolderModal.FolderMountForModelStore')}
  isLabelHidden
  excludeDeleted
  isDisabled={!destinationProject?.id}
  scope={{ project: destinationProject?.id ? [{ value: destinationProject.id }] : [] }}
/>`,
    },
  ],
} satisfies ComponentDoc;

export default docs;
