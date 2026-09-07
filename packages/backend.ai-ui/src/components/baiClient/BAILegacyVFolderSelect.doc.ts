import type { ComponentDoc } from '@astryxdesign/cli/authoring';

export const docs = {
  type: 'component',
  name: 'BAILegacyVFolderSelect',
  displayName: 'BAI Legacy VFolder Select',
  category: 'Data Input',
  keywords: [
    'vfolder',
    'folder',
    'storage folder',
    'mount',
    'select',
    'combobox',
    'rest',
    'session launcher',
  ],
  usage: {
    description:
      'The folder picker for the session launcher mount field, backed by the REST `GET /folders` list instead of the `vfolder_nodes` connection. It exists because the mount gates that list has to apply cannot be expressed as a GraphQL filter: a folder is offered only when its host appears in the merged `allowed_vfolder_hosts` of the domain, the current project and the caller keypair resource policy with the `mount-in-session` permission, and only when the current project can reach it (a user-owned folder, a folder with no group, or one owned by this project). It is a BAIComplexSelect wrapper whose whole list is loaded at once, so the search box filters the loaded names client-side rather than refetching. The value is the dashed vfolder UUID, so it can go straight into a mutation input or a path picker; a stored 32-hex REST id is accepted and normalized. Two callbacks report what the gates found: `onResolvedNamesChange` maps every mountable key to its name, and `onAutoMountedFoldersChange` names the ready dotfile folders the session mounts on its own. It suspends on both the REST list and the allowed-hosts query, so a Suspense boundary is required above it. Reach for BAIVFolderSelect for every other folder field.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Wrap it, or the form item holding it, in a Suspense boundary — the REST list and the allowed-hosts query both suspend on first load.',
      },
      {
        guidance: true,
        description:
          'Pass currentProjectId. Without it the project half of the host gate is skipped and folders owned by another project are still dropped, which is rarely what a scoped form wants.',
      },
      {
        guidance: true,
        description:
          'Reach for BAIVFolderMountConfigInput instead when the field also configures mount paths — it renders this select internally and forwards ownerEmail / filter / onAutoMountedFoldersChange / onResolvedNamesChange to it.',
      },
      {
        guidance: false,
        description:
          'Use it as a general folder picker: it fetches every folder the user can see, where BAIVFolderSelect pages ten rows at a time.',
      },
      {
        guidance: false,
        description:
          'Expect filter to shrink the selection: it is display-only, and an already-selected folder stays visible even when it filters out.',
      },
    ],
  },
  props: [
    {
      name: 'value',
      type: 'string | Array<string> | null',
      description:
        'Selected folder key, or keys when multiple is set — the dashed vfolder UUID. A 32-hex REST id is accepted and normalized, so a stored legacy key still matches. Omit it and the component keeps the selection itself.',
    },
    {
      name: 'defaultValue',
      type: 'string | Array<string> | null',
      description: 'Initial selection for the uncontrolled case.',
    },
    {
      name: 'onChange',
      type: '(value: string | Array<string> | undefined) => void',
      description:
        'Fired with the new key, or the array of keys under multiple.',
    },
    {
      name: 'currentProjectId',
      type: 'string',
      description:
        'Project scope. Its allowed_vfolder_hosts join the mountable-host gate, and folders owned by another project are dropped. Left unset, the group half of the gate is skipped and only the domain and keypair policies apply.',
    },
    {
      name: 'ownerEmail',
      type: 'string',
      description:
        "Lists the folders of this user instead of the caller's own, sent as the `owner_user_email` query parameter. Admin-only on the server side.",
    },
    {
      name: 'filter',
      type: '(folder: LegacyVFolder) => boolean',
      description:
        "Display-only predicate applied after the mount gates — hiding dotfiles, for example. A folder that is already selected stays visible even when it returns false, mirroring VFolderTable's rowFilter.",
    },
    {
      name: 'onAutoMountedFoldersChange',
      type: '(names: Array<string>) => void',
      description:
        'Called with the names of the mountable folders whose status is ready and whose name starts with a dot — the folders a session mounts automatically.',
    },
    {
      name: 'onResolvedNamesChange',
      type: '(nameMap: Record<string, string>) => void',
      description:
        'Called with a key-to-name map covering every mountable folder in the loaded list, so a caller can label a selection without a second lookup. It also identifies a stale selection: a selected key missing from the map is one the gates no longer offer (`selectedKeys.filter((k) => !(k in nameMap))`).',
    },
    {
      name: 'multiple',
      type: 'boolean',
      description:
        'Switches to multi-selection: value and onChange become arrays and the trigger lists the selected folder names.',
      default: 'false',
    },
    {
      name: 'placeholder',
      type: 'string',
      description:
        'Trigger text while nothing is selected. Applied before the prop spread, so a call site can override the translated default.',
      default: "t('comp:BAILegacyVFolderSelect.SelectFolder')",
    },
  ],
  examples: [
    {
      label: 'Session launcher mount field',
      code: `<Suspense fallback={<Skeleton height={28} width="100%" />}>
  <BAILegacyVFolderSelect
    multiple
    label={t('session.launcher.FolderToMount')}
    isLabelHidden
    currentProjectId={currentProject.id}
    ownerEmail={ownerEmail}
    filter={(folder) => !folder.name.startsWith('.')}
    onAutoMountedFoldersChange={setAutoMountedFolderNames}
    value={selectedKeys}
    onChange={(keys) => form.setFieldValue('mounts', _.castArray(keys ?? []))}
  />
</Suspense>`,
    },
    {
      label: 'Mount paths too — let BAIVFolderMountConfigInput own the select',
      code: `<BAIVFolderMountConfigInput
  currentProjectId={currentProject.id}
  ownerEmail={ownerEmail}
  filter={(folder) => !folder.name.startsWith('.')}
  autoMountedFolderNames={autoMountedFolderNames}
  onAutoMountedFoldersChange={setAutoMountedFolderNames}
  value={mounts}
  onChange={setMounts}
/>`,
    },
  ],
} satisfies ComponentDoc;

export default docs;
