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
      'The folder picker for the session launcher mount field, backed by the REST `GET /folders` list instead of the `vfolder_nodes` connection. It exists because the mount gates that list has to apply cannot be expressed as a GraphQL filter: a folder is offered only when its host appears in the merged `allowed_vfolder_hosts` of the domain, the current project and the keypair resource policy with the `mount-in-session` permission, and only when the current project can reach it (a user-owned folder, a folder with no group, or one owned by this project). It is a BAIComplexSelect wrapper whose whole list is loaded at once, so the search box filters the loaded names client-side rather than refetching. The value is the REST `id` — a 32-hex string with no dashes, not a UUID and not a Relay global id — so run it through `convertToUUID` before handing it to anything typed as a UUID. Three callbacks report what the gates found: `onResolvedNamesChange` maps every loaded key to its name, `onInvalidSelection` names the selected keys that are not mountable, and `onAutoMountedFoldersChange` names the ready dotfile folders the session mounts on its own. Each fires only when its own payload changes by content. It suspends on both the REST list and the allowed-hosts query, so a Suspense boundary is required above it. Reach for BAIVFolderSelect for every other folder field.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Wrap it, or the form item holding it, in a Suspense boundary — the REST list and the two Relay queries all suspend on first load.',
      },
      {
        guidance: true,
        description:
          'Pass currentProjectId. Without it the project half of the host gate is skipped and folders owned by another project are still dropped, which is rarely what a scoped form wants.',
      },
      {
        guidance: true,
        description:
          'Run the emitted key through convertToUUID before sending it anywhere that expects a UUID; the REST id has no dashes.',
      },
      {
        guidance: true,
        description:
          'Feed onAutoMountedFoldersChange into the same list you hand BAIVFolderMountConfigInput as autoMountedFolderNames, so an alias colliding with an auto-mounted folder is flagged.',
      },
      {
        guidance: true,
        description:
          'Act on onInvalidSelection when a prefilled selection may predate a host or project change — the component keeps showing such a key, it does not silently drop it.',
      },
      {
        guidance: false,
        description:
          'Use it as a general folder picker: it fetches every folder the user can see on each project change, where BAIVFolderSelect pages ten rows at a time.',
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
        'Selected folder key, or keys when multiple is set. The key is the REST `id` (32 hex characters, no dashes). Omit it and the component keeps the selection itself.',
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
      name: 'keypairResourcePolicyName',
      type: 'string',
      description:
        "Keypair resource policy whose allowed_vfolder_hosts gate the list. Resolved from the connected client's access key when omitted, so a caller normally leaves it unset.",
    },
    {
      name: 'filter',
      type: '(folder: LegacyVFolder) => boolean',
      description:
        "Display-only predicate applied after the mount gates — hiding dotfiles, for example. A folder that is already selected stays visible even when it returns false, mirroring VFolderTable's rowFilter.",
    },
    {
      name: 'onInvalidSelection',
      type: '(invalidKeys: Array<string>, validFolders: Array<LegacyVFolder>) => void',
      description:
        'Called with the selected keys that are not in the mountable set, plus the folders of the keys that are. Fires when either list changes by content, not on every render.',
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
        'Called with a key-to-name map covering every mountable folder in the loaded list, so a caller can label a selection without a second lookup.',
    },
    {
      name: 'multiple',
      type: 'boolean',
      description:
        'Switches to multi-selection: value and onChange become arrays and the trigger lists the selected folder names.',
      default: 'false',
    },
    {
      name: 'ref',
      type: 'React.Ref<BAILegacyVFolderSelectRef>',
      description:
        'Imperative handle exposing refetch(), which updates the shared fetch key of the REST list and both Relay queries inside a transition. Call it after creating a folder from the same screen.',
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
    onInvalidSelection={(invalidKeys) => {
      form.setFieldValue('mounts', _.difference(selectedKeys, invalidKeys));
    }}
    value={selectedKeys}
    onChange={(keys) => form.setFieldValue('mounts', _.castArray(keys ?? []))}
  />
</Suspense>`,
    },
    {
      label: 'Converting the emitted key for a UUID input',
      code: `const vfolderUuids = _.map(selectedKeys, convertToUUID);`,
    },
  ],
} satisfies ComponentDoc;

export default docs;
