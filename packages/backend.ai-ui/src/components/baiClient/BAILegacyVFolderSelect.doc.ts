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
      'The folder picker for the session launcher mount field, backed by the REST `GET /folders` list instead of the `vfolder_nodes` connection. It exists because the mount gates that list has to apply cannot be expressed as a GraphQL filter: a folder is offered only when its host is one of the `mountableHosts` the caller supplies (those granting `mount-in-session`), when the current project can reach it (a user-owned folder, a folder with no group, or one owned by this project), and when it is not already named in `autoMountedFolderNames`. Which policies merge into `mountableHosts`, and which folders the session auto-mounts, are host-app questions, so both arrive as props rather than being queried here. It is a BAIComplexSelect wrapper whose whole list is loaded at once, so the search box filters the loaded names client-side rather than refetching. The value is `labelInValue`-shaped — `{ value: <dashed vfolder UUID>, label: <folder name> }` — so the name travels with the selection and a caller never needs a second lookup; a stored 32-hex REST id is accepted and normalized, and a missing or stale label is re-resolved from the loaded list. The gates shape the OPTIONS only: a selection the list no longer offers keeps rendering, and the component never rewrites its own value. It suspends on the REST list, so a Suspense boundary is required above it. Reach for BAIVFolderSelect for every other folder field.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Wrap it, or the form item holding it, in a Suspense boundary — the REST folder list suspends on first load.',
      },
      {
        guidance: true,
        description:
          'Pass currentProjectId. Without it every folder owned by any project is dropped, since no group can match — rarely what a scoped form wants.',
      },
      {
        guidance: true,
        description:
          'Reach for BAIVFolderMountConfigInput instead when the field also configures mount paths — it renders this select internally and forwards ownerEmail / mountableHosts / autoMountedFolderNames / filter to it.',
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
      type: 'BAILabeledValue | Array<BAILabeledValue> | null',
      description:
        'The selection, `labelInValue`-shaped and an array iff multiple: `value` is the dashed vfolder UUID and `label` its name. A 32-hex REST id is accepted and normalized, and a missing or stale label is re-resolved from the loaded list, so a selection restored from a URL or a template labels itself. Omit it and the component keeps the selection itself.',
    },
    {
      name: 'defaultValue',
      type: 'BAILabeledValue | Array<BAILabeledValue> | null',
      description: 'Initial selection for the uncontrolled case.',
    },
    {
      name: 'onChange',
      type: '(value: BAIComplexSelectValue) => void',
      description:
        'Fired with the new selection — one labeled value, or the array of them under multiple. It fires only on a user pick; loading the folder list never rewrites the value.',
    },
    {
      name: 'currentProjectId',
      type: 'string',
      description:
        'Project scope. A folder owned by a different project is dropped; user-owned and group-less folders always pass.',
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
      name: 'mountableHosts',
      type: 'Array<string>',
      description:
        "Hosts granting `mount-in-session`. A folder whose host is absent is dropped. Merging the domain / project / keypair `allowed_vfolder_hosts` into this list is the host app's job; an empty array offers nothing, which is the correct empty state for a user with no mountable storage.",
    },
    {
      name: 'autoMountedFolderNames',
      type: 'Array<string>',
      description:
        'Folders the session mounts on its own. They are dropped from the options — picking one would only produce a duplicate mount path — while the caller still uses the names for its own overlap checks.',
      default: '[]',
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
    mountableHosts={mountableHosts}
    autoMountedFolderNames={autoMountedFolderNames}
    filter={(folder) => folder.status === 'ready'}
    value={selectedFolders}
    onChange={(next) =>
      form.setFieldValue('mounts', next ? _.castArray(next) : [])
    }
  />
</Suspense>`,
    },
    {
      label: 'Mount paths too — let BAIVFolderMountConfigInput own the select',
      code: `<BAIVFolderMountConfigInput
  currentProjectId={currentProject.id}
  ownerEmail={ownerEmail}
  mountableHosts={mountableHosts}
  autoMountedFolderNames={autoMountedFolderNames}
  value={mounts}
  onChange={setMounts}
/>`,
    },
  ],
} satisfies ComponentDoc;

export default docs;
