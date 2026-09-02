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
      'Form control for choosing vfolders and configuring how each one is mounted. It renders a multi-select BAIVFolderSelect in `row_id` mode inside its own Suspense boundary — so the folder list query is loaded internally and no queryRef is needed — and gives every selected folder a row with an alias input and an optional subpath input. The value is a `VFolderMountConfigValue[]` where `vfolderId` is the folder UUID and `mountDestination` is the raw alias exactly as typed: empty resolves to `${aliasBasePath}${name}`, a relative segment resolves under `aliasBasePath`, and an absolute path is used as-is. Resolve it with the exported `inputToMountDestination`. The inline per-row errors are advisory only; gate a form on validity by calling the exported `isVFolderMountConfigValid` (or `getVFolderMountConfigStatuses` for the per-entry detail) from a `Form.Item` `rules` validator.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Wrap it in one named `Form.Item` with an `isVFolderMountConfigValid` validator, passing the same `aliasBasePath` and `autoMountedFolderNames` you gave the component, so `form.validateFields()` actually rejects invalid mounts.',
      },
      {
        guidance: true,
        description:
          'Convert `mountDestination` with `inputToMountDestination` before sending it to a mount mutation — the emitted value is the raw alias, not the resolved container path.',
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
        guidance: false,
        description:
          'Rewrite `mountDestination` between keystrokes to normalize it; the raw alias is stored verbatim precisely so the input never transforms text mid-edit.',
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
        'Controlled list of mount configurations. Each entry carries `vfolderId` (the folder UUID), the backfilled `name`, the raw `mountDestination` alias, and `subpath`.',
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
        'Fired with the whole next list on selection change, alias or subpath edit, row removal, and when asynchronously resolved folder names are backfilled.',
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
        'Server-side filter expression forwarded to the folder select.',
    },
    {
      name: 'disabled',
      type: 'boolean',
      description:
        'Disables the select, both inputs on every row, and the remove button, while keeping the rows readable.',
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
        'Names of folders mounted automatically. Their default mount paths join the overlap check, so a user alias colliding with one is flagged, and the names are listed as read-only chips below the rows.',
    },
  ],
  examples: [
    {
      label: 'Inside a form, gated on validity',
      code: `<Form.Item
  name="mounts"
  label={t('session.launcher.MountedFolders')}
  rules={[
    {
      validator: (__, value) =>
        isVFolderMountConfigValid(value, { autoMountedFolderNames })
          ? Promise.resolve()
          : Promise.reject(new Error(t('session.launcher.FolderAliasOverlapping'))),
    },
  ]}
>
  <BAIVFolderMountConfigInput
    currentProjectId={currentProject.id}
    autoMountedFolderNames={autoMountedFolderNames}
  />
</Form.Item>`,
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
