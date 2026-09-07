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
      "Form control for choosing vfolders and configuring how each one is mounted. It renders a multi-select folder picker inside its own Suspense boundary — so the folder list is loaded internally and no queryRef is needed — and gives every selected folder a row with an alias input and a `BAIVFolderPathPicker` for its subpath, so the mounted subfolder is browsed rather than typed. The picker is BAIVFolderSelect in `row_id` mode by default; `renderFolderSelect` swaps in any select that emits vfolder UUIDs — BAILegacyVFolderSelect for a session mount field, which is the only source that can apply the launcher's mount gates and report its auto-mounted dotfiles. The value is a `VFolderMountConfigValue[]` where `vfolderId` is the vfolder UUID and `mountDestination` is the raw alias exactly as typed: empty resolves to `${aliasBasePath}${name}`, a relative segment resolves under `aliasBasePath`, and an absolute path is used as-is. The module owns the whole mount-value vocabulary so a consumer never restates it: `DEFAULT_ALIAS_BASE_PATH`, `inputToMountDestination` / `mountDestinationToInput` (the two directions of the alias rule), `resolveVFolderMounts` (every entry's name, resolved path, default-alias flag and subpath in one pass), `toMountCreationConfig` (the manager `creation_config` mount fields), `getVFolderMountConfigStatuses` / `isVFolderMountConfigValid` (per-entry validity), and `useVFolderMountConfigFormRule` (a ready `Form.Item` `rules` entry with BUI-translated messages). The inline per-row errors are advisory only; the form rule is what makes `form.validateFields()` reject.",
    bestPractices: [
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
          'Scope the picker with `currentProjectId` and `filter` so users cannot select folders the session will not be able to mount.',
      },
      {
        guidance: true,
        description:
          'Render BAILegacyVFolderSelect through `renderFolderSelect` for a session mount field, and feed its `onAutoMountedFoldersChange` back into `autoMountedFolderNames` — the default GraphQL select cannot see the mount-in-session host gate or the auto-mounted dotfiles.',
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
          'Set `name` yourself on a new entry — names are backfilled from the select as folder nodes resolve, and that callback is the only source of them.',
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
        'Fired with the whole next list on selection change, alias edit, subpath pick, row removal, and when asynchronously resolved folder names are backfilled.',
    },
    {
      name: 'currentProjectId',
      type: 'string',
      description:
        'Project scope forwarded to the folder select, limiting which vfolders can be picked.',
    },
    {
      name: 'filter',
      type: 'string',
      description:
        'Server-side filter expression forwarded to the default folder select. A `renderFolderSelect` slot supplies its own filtering.',
    },
    {
      name: 'renderFolderSelect',
      type: '(api: VFolderMountConfigSelectApi) => React.ReactNode',
      description:
        'Renders the folder picker in place of the default BAIVFolderSelect. The api carries `value` / `onChange` / `onResolvedNamesChange` / `multiple` / `isDisabled` / `currentProjectId` / `label` / `isLabelHidden` — spread it onto any select that emits vfolder UUIDs.',
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
        'Names of folders mounted automatically. Their default mount paths join the overlap check, so a user alias colliding with one is flagged with its own `overlappingWithAutoMount` kind and message, and the names are listed as read-only chips below the rows.',
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
      label: 'Session mount field over the legacy folder list',
      code: `<BAIVFolderMountConfigInput
  currentProjectId={currentProject.id}
  autoMountedFolderNames={autoMountedFolderNames}
  renderFolderSelect={(api) => (
    <BAILegacyVFolderSelect
      {...api}
      ownerEmail={ownerEmail}
      filter={(folder) => !folder.name.startsWith('.')}
      onAutoMountedFoldersChange={setAutoMountedFolderNames}
    />
  )}
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
/>`,
    },
  ],
} satisfies ComponentDoc;

export default docs;
