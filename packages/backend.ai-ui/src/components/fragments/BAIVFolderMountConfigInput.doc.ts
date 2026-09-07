import type { ComponentDoc } from '@astryxdesign/cli/authoring';

export const docs = {
  type: 'component',
  name: 'BAIVFolderMountConfigInput',
  displayName: 'BAI VFolder Mount Config Input',
  category: 'Data Input',
  keywords: [
    'vfolder',
    'folder',
    'mount',
    'mount path',
    'alias',
    'subpath',
    'form control',
  ],
  usage: {
    description:
      "Form control for choosing vfolders and configuring how each one is mounted. It loads the folder list itself, so no queryRef is needed and a Suspense boundary is required above it, and gives every selected folder a row with an alias input and a `BAIVFolderPathPicker` for its subpath, so the mounted subfolder is browsed rather than typed. The picker reads the REST `GET /folders` list rather than the `vfolder_nodes` connection, because the mount gates it applies cannot be expressed as a GraphQL filter: the host must be one of the `mountableHosts` the caller supplies (those granting `mount-in-session`), the folder must be reachable from `currentProjectId`, and a name in `autoMountedFolderNames` is dropped from the options because the session mounts it regardless. `filter` hides rows on top of that, display-only, and an already-selected folder stays visible. An entry the gated list does not offer is pruned from the value with a warning toast. The value is a `VFolderMountConfigValue[]` where `vfolderId` is the vfolder UUID and `mountDestination` is the raw alias exactly as typed: empty resolves to `${aliasBasePath}${name}`, a relative segment resolves under `aliasBasePath`, and an absolute path is used as-is. The module owns the whole mount-value vocabulary so a consumer never restates it: `DEFAULT_ALIAS_BASE_PATH`, `inputToMountDestination` / `mountDestinationToInput` (the two directions of the alias rule), `resolveVFolderMounts` (every entry's name, resolved path, default-alias flag and subpath in one pass), `toMountCreationConfig` (the manager `creation_config` mount fields), `getVFolderMountConfigStatuses` / `isVFolderMountConfigValid` (per-entry validity), and `useVFolderMountConfigFormRule` (a ready `Form.Item` `rules` entry with BUI-translated messages). The inline per-row errors are advisory only; the form rule is what makes `form.validateFields()` reject.",
    bestPractices: [
      {
        guidance: true,
        description:
          'Put a Suspense boundary above it — it suspends on the REST folder list on first load.',
      },
      {
        guidance: true,
        description:
          'Wrap it in one named `Form.Item` whose `rules` carry `useVFolderMountConfigFormRule({ aliasBasePath, autoMountedFolderNames })` — the same options you gave the component — so `form.validateFields()` rejects invalid mounts with the already-translated message.',
      },
      {
        guidance: true,
        description:
          'Build the mount payload with `toMountCreationConfig` (or `resolveVFolderMounts` for display) rather than resolving `mountDestination` by hand — the emitted value is the raw alias, not the resolved container path.',
      },
      {
        guidance: true,
        description:
          'Pass `autoMountedFolderNames` wherever dotfile folders are mounted automatically; their default paths join the overlap check and are listed read-only under the rows.',
      },
      {
        guidance: true,
        description:
          'Scope the picker with `currentProjectId`, `ownerEmail`, `mountableHosts` and `filter` so users cannot select folders the session will not be able to mount.',
      },
      {
        guidance: false,
        description:
          'Prune a stored selection yourself before passing it in — the component drops entries the gated folder list does not offer and warns the user, so a launcher can hand it a template value untouched.',
      },
      {
        guidance: false,
        description:
          'Rewrite `mountDestination` between keystrokes to normalize it; the raw alias is stored verbatim precisely so the input never transforms text mid-edit.',
      },
      {
        guidance: false,
        description:
          'Expect a typed subpath: the row browses the folder through a directory picker, so `subpath` only ever holds a path that exists — the absolute / `..` validation stays for programmatically supplied values.',
      },
      {
        guidance: false,
        description:
          'Leave `name` unset on an entry you construct yourself — an empty alias resolves to `${aliasBasePath}${name}`, so a nameless entry mounts under its raw id. The select fills it in for entries the user picks.',
      },
    ],
  },
  props: [
    {
      name: 'value',
      type: 'VFolderMountConfigValue[]',
      description:
        'Controlled list of mount configurations. Each entry carries `vfolderId` (the folder UUID), the backfilled `name`, the raw `mountDestination` alias, and the picked `subpath` (an empty string means the folder root).',
    },
    {
      name: 'defaultValue',
      type: 'VFolderMountConfigValue[]',
      description:
        'Initial list for the uncontrolled case. Defaults to an empty list, so the control starts with the select and no rows.',
    },
    {
      name: 'onChange',
      type: '(value: VFolderMountConfigValue[]) => void',
      description:
        'Fired with the whole next list on selection change, alias edit, subpath pick and row removal.',
    },
    {
      name: 'currentProjectId',
      type: 'string',
      description:
        'Project scope forwarded to the folder select, limiting which vfolders can be picked.',
    },
    {
      name: 'ownerEmail',
      type: 'string',
      description:
        "Lists the folders of this user instead of the caller's own, for a launch on someone else's behalf. Forwarded to the folder select.",
    },
    {
      name: 'filter',
      type: '(folder: LegacyVFolder) => boolean',
      description:
        'Display-only folder filter, applied after the select’s mount gates. An already-selected folder stays visible even when it filters out.',
    },
    {
      name: 'mountableHosts',
      type: 'string[]',
      description:
        "Hosts granting `mount-in-session`, forwarded to the folder select as its host gate. Merging the domain / project / keypair `allowed_vfolder_hosts` into this list is the host app's job.",
    },
    {
      name: 'disabled',
      type: 'boolean',
      description:
        'Disables the select, the alias input and the subpath picker on every row, and the remove button, while keeping the rows readable.',
    },
    {
      name: 'aliasBasePath',
      type: 'string',
      description:
        'Base path prepended to an empty or relative alias when resolving the mount destination. An alias starting with `/` ignores it.',
      default: "'/home/work/'",
    },
    {
      name: 'autoMountedFolderNames',
      type: 'string[]',
      description:
        "Names of folders mounted automatically. They are dropped from the select's options, their default mount paths join the overlap check (so a colliding user alias is flagged with its own `overlappingWithAutoMount` kind and message), and the names are listed as read-only chips below the rows.",
    },
  ],
  examples: [
    {
      label: 'Inside a form, gated on validity',
      code: `<Form.Item
  name="vfolderMounts"
  label={t('session.launcher.MountedFolders')}
  rules={[useVFolderMountConfigFormRule({ autoMountedFolderNames })]}
>
  <BAIVFolderMountConfigInput
    currentProjectId={currentProject.id}
    mountableHosts={mountableHosts}
    autoMountedFolderNames={autoMountedFolderNames}
  />
</Form.Item>`,
    },
    {
      label: 'Turning the value into a session creation_config',
      code: `const { mount_ids, mount_id_map, mount_options } = toMountCreationConfig(
  form.getFieldValue('vfolderMounts'),
);

await baiClient.createIfNotExists(image, sessionName, {
  ...resources,
  mount_ids,
  mount_id_map,
  mount_options,
});`,
    },
    {
      label: 'Scoping the picker',
      code: `<BAIVFolderMountConfigInput
  currentProjectId={currentProject.id}
  ownerEmail={ownerEmail}
  mountableHosts={mountableHosts}
  autoMountedFolderNames={autoMountedFolderNames}
  filter={(folder) => folder.status === 'ready'}
  value={mounts}
  onChange={setMounts}
/>`,
    },
    {
      label: 'Controlled, outside a form',
      code: `<BAIVFolderMountConfigInput
  value={mounts}
  onChange={setMounts}
  currentProjectId={currentProject.id}
  mountableHosts={mountableHosts}
/>`,
    },
  ],
} satisfies ComponentDoc;

export default docs;
