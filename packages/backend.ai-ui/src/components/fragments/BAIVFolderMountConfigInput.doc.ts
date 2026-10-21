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
      "Form control for choosing vfolders and configuring how each one is mounted. It loads the folder list (through `BAIScopedVFolderSelect`) and the auto-mounted folders itself, so no queryRef is needed and a Suspense boundary is required above it, and gives every selected folder a row that reads source to destination: the folder (identicon and name) fused with a `BAIVFolderPathPicker` for its subpath into one source path, so the mounted subfolder is browsed rather than typed, an arrow, then the mount path input. A newly picked folder starts with an empty mount path whose placeholder shows the default `${aliasBasePath}${name}`; the resolved container path appears under the input only when a relative alias is typed. The header and rows sit in a small BAICard. Both inputs carry a clear button, and the row stacks in a narrow container. Each folder option has a leading checkbox and a two-line-tall identicon, the name, a second line with the creator's email, usage mode, host and creation date, and the R/W/D permission as welded tokens at the trailing edge. Beside the select sits a button group: a refresh button that re-reads the folder options and the auto-mounted folders, and — only when `onClickCreateFolder` is given — a create button that hands the click back to the host, whose folder-creation modal it is; `ref.refetch()` exposes the same refresh imperatively so the host can pull in a folder it just created. The select pages `scopedVFoldersV2` over the `scope` the caller passes, filtered and searched on the server: the host must be one of the `mountableHosts` the caller supplies (those granting `mount-in-session`), the folder must be ready, and dotfile folders are left out because the session mounts them regardless. `filter`, a `VFolderFilter`, is ANDed onto that query and narrows the options only. A folder whose mount level for the caller is NONE is listed disabled, since the server refuses to mount it. The selected folders are looked up by `entityId`; one the mount gates reject — an unreachable host or project, or mount level NONE — is pruned from the value with a warning toast, and an entry without a `name` (or with a stale one) gets the folder's current name. The auto-mounted folders are the ready dotfile folders in the same scope and hosts, read with `useSuspendedAutoMountedVFolders`; their default paths join the overlap check and they are listed read-only under the rows. The value is a `VFolderMountConfigValue[]` where `vfolderId` is the vfolder UUID and `mountDestination` is the raw alias exactly as typed: empty resolves to `${aliasBasePath}${name}`, a relative segment resolves under `aliasBasePath`, and an absolute path is used as-is. The module owns the whole mount-value vocabulary so a consumer never restates it: `inputToMountDestination` / `mountDestinationToInput` (the two directions of the alias rule), `resolveVFolderMounts` (every entry's name, resolved path, default-alias flag and subpath in one pass), `toMountCreationConfig` (the manager `creation_config` mount fields), `getVFolderMountConfigStatuses` (per-entry validity), and `useVFolderMountConfigFormRule` (a ready `Form.Item` `rules` entry with BUI-translated messages). The inline per-row errors are advisory only; the form rule is what makes `form.validateFields()` reject.",
    bestPractices: [
      {
        guidance: true,
        description:
          'Put a Suspense boundary above it — it suspends on the folder list on first load.',
      },
      {
        guidance: true,
        description:
          'Wrap it in one named `Form.Item` whose `rules` carry `useVFolderMountConfigFormRule({ aliasBasePath, autoMountedFolders })`, with `autoMountedFolders` from `useSuspendedAutoMountedVFolders` called with the same `scope` and `mountableHosts` — it shares the query the component reads, so the rule and the rows agree and a refresh reaches both.',
      },
      {
        guidance: true,
        description:
          'Build the mount payload with `toMountCreationConfig` (or `resolveVFolderMounts` for display) rather than resolving `mountDestination` by hand — the emitted value is the raw alias, not the resolved container path.',
      },
      {
        guidance: true,
        description:
          'Pass the `scope` a session mounts from (`mountableVFolderScope(userId, projectId)`) and the `mountableHosts`, and narrow it with a `filter` (a `VFolderFilter`) for what this consumer cannot mount, so users cannot pick folders the session will not be able to mount.',
      },
      {
        guidance: true,
        description:
          'Pass `onClickCreateFolder` together with a `ref` when the host has a folder-creation modal: open the modal on the click, then call `ref.current?.refetch()` and append the created folder to the value, so the select already knows it.',
      },
      {
        guidance: false,
        description:
          'Prune a stored selection yourself before passing it in — the component drops entries the mount gates reject and warns the user, so a launcher can hand it a template value untouched.',
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
      name: 'scope',
      type: 'VFolderScope',
      description:
        "The scopes the folder options and the auto-mounted folders are read over, combined with OR. A session usually passes `mountableVFolderScope(userId, projectId)`: the caller's folders plus the project's. Which of those folders the server lets the session mount is the manager's call.",
      required: true,
    },
    {
      name: 'filter',
      type: 'VFolderFilter',
      description:
        'Server-side `VFolderFilter` ANDed onto the options query, after the mount gates. It narrows the options only; a selected folder it excludes stays selected.',
    },
    {
      name: 'mountableHosts',
      type: 'string[]',
      description:
        "Hosts granting `mount-in-session`, applied as the host gate on the folder list it loads. Merging the domain / project / keypair `allowed_vfolder_hosts` into this list is the host app's job.",
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
      name: 'folderExplorerPath',
      type: "(vfolderId: string) => LinkProps['to']",
      description:
        "Route that opens a folder in the host app's folder explorer. Given, every folder name the component renders — each mount row and each auto-mounted badge — becomes a link to it; omitted, they stay plain text.",
    },
    {
      name: 'onClickCreateFolder',
      type: '() => void',
      description:
        "Opens the host app's folder-creation modal. The create button in the group beside the select is rendered only when this is given, because the modal is a host component; pair it with `ref.refetch()` so the new folder appears in the options once it is created.",
    },
    {
      name: 'ref',
      type: 'React.Ref<BAIVFolderMountConfigInputRef>',
      description:
        'Exposes `refetch(): void`, which re-reads the folder options and the auto-mounted folders. Call it after creating a folder from `onClickCreateFolder`, then append the new entry to the value.',
    },
  ],
  examples: [
    {
      label: 'Inside a form, gated on validity',
      code: `const scope = mountableVFolderScope(baiClient.user_uuid, currentProject.id);
const { autoMountedFolders } = useSuspendedAutoMountedVFolders({
  scope,
  mountableHosts,
});
const mountConfigRule = useVFolderMountConfigFormRule({ autoMountedFolders });

<Form.Item
  name="vfolderMounts"
  label={t('session.launcher.MountedFolders')}
  rules={[mountConfigRule]}
>
  <BAIVFolderMountConfigInput
    scope={scope}
    mountableHosts={mountableHosts}
    folderExplorerPath={generateFolderPath}
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
  scope={scope}
  mountableHosts={mountableHosts}
  filter={{ usageMode: { notEquals: 'MODEL' } }}
  value={mounts}
  onChange={setMounts}
/>`,
    },
    {
      label: 'Controlled, outside a form',
      code: `<BAIVFolderMountConfigInput
  value={mounts}
  onChange={setMounts}
  scope={scope}
  mountableHosts={mountableHosts}
/>`,
    },
  ],
} satisfies ComponentDoc;

export default docs;
