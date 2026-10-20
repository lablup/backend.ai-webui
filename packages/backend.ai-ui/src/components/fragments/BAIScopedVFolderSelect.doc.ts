import type { ComponentDoc } from '@astryxdesign/cli/authoring';

export const docs = {
  type: 'component',
  name: 'BAIScopedVFolderSelect',
  displayName: 'BAI Scoped VFolder Select',
  category: 'Data Input',
  keywords: [
    'vfolder',
    'folder',
    'storage folder',
    'scope',
    'select',
    'paginated select',
    'relay',
  ],
  usage: {
    description:
      "Picks virtual folders from `scopedVFoldersV2` (manager 26.9.0), a BAIComplexSelect over two Relay reads. The options page 100 at a time over the scopes in `scope` (combined with OR), newest first, extended when the popup scrolls to its end, and the popup search runs on the server as a `name iContains` filter. Each option shows a two-line-tall identicon, the name, a second line with the owner (the creator's email for a user folder, `currentProjectName` for a project folder), usage mode, host and creation date, and the caller's mount level as welded R/W/D tokens. The value is folder UUIDs (`VFolder.entityId`), so no global id is decoded anywhere. A selected id the loaded pages do not cover is looked up once by `entityId` within `scope` and `filter`; the answer labels it and decides whether it is still reachable. Once every selected id is accounted for, `onResolve` reports the reachable ones (with their names) and the unreachable ones — not found, or rejected by `isFolderDisabled` — and it fires again whenever that outcome changes. A failed lookup, such as a manager without `VFolderFilter.entityId` (26.10.0), leaves its ids in neither list, so a consumer never drops a selection on a lookup it could not make. The page read suspends on first load; the lookup does not.",
    bestPractices: [
      {
        guidance: true,
        description:
          'Wrap it, or the form item holding it, in a Suspense boundary — the page read suspends on first load.',
      },
      {
        guidance: true,
        description:
          'Put what decides whether a folder may be used at all in `filter` (it also bounds the lookup of selected ids) and what only trims the list in `optionFilter`, so a selection the list hides is still recognised.',
      },
      {
        guidance: true,
        description:
          'Pass `fallbackLabels` when the value comes with names the caller already knows, so the trigger shows them before the lookup answers.',
      },
      {
        guidance: true,
        description:
          'Use `onResolve` to prune or rename a stored selection; `BAIVFolderMountConfigInput` drops the unresolved ids with a warning and backfills names this way.',
      },
      {
        guidance: false,
        description:
          'Pass a Relay global id as the value — the value is the folder UUID, the same one `VFolderFilter.entityId` takes.',
      },
    ],
  },
  props: [
    {
      name: 'scope',
      type: 'VFolderScope',
      description:
        'The scopes whose folders are read (`user`, `project`, `domain`, each a list of `{ value: uuid }`), combined with OR. Every scope is authorized by the manager before the read runs.',
      required: true,
    },
    {
      name: 'filter',
      type: 'VFolderFilter',
      description:
        'ANDed onto the options and onto the lookup of selected ids. A selected folder outside it is reported unresolved.',
    },
    {
      name: 'optionFilter',
      type: 'VFolderFilter',
      description:
        'ANDed onto the options only; a selected folder it excludes stays selected and resolved.',
    },
    {
      name: 'isFolderDisabled',
      type: '(folder: ScopedVFolderSummary) => boolean',
      description:
        "A matching option is listed disabled, and a matching selection is reported unresolved. The summary carries `entityId`, `name`, `host` and the caller's mount level as `permission`.",
    },
    {
      name: 'value',
      type: 'string | string[] | null',
      description: 'Folder UUIDs. An array when `multiple` is set.',
    },
    {
      name: 'onChange',
      type: '(value: string | string[] | undefined, option?: BAILabeledValue | BAILabeledValue[]) => void',
      description:
        'Fired with the next UUID(s) and the picked option(s), whose `label` is the folder name.',
    },
    {
      name: 'fallbackLabels',
      type: 'Record<string, string>',
      description:
        'Labels for selected ids, used until the options or the lookup supply the name. Without one an unresolved id shows as itself.',
    },
    {
      name: 'onResolve',
      type: '(resolution: { resolved: ScopedVFolderSummary[]; unresolved: string[] }) => void',
      description:
        'Fired once every selected id is accounted for, and again whenever the outcome changes. Ids whose lookup failed are in neither list.',
    },
    {
      name: 'currentProjectName',
      type: 'string',
      description:
        'Owner shown for a project folder; the folder list carries no project name. Without it the owner line reads the generic "Project".',
    },
    {
      name: 'ref',
      type: 'React.Ref<BAIScopedVFolderSelectRef>',
      description:
        'Exposes `refetch()`, which re-reads the options and looks the selected ids up again.',
    },
  ],
  examples: [
    {
      label: 'Folders a session in this project can mount',
      code: `<BAIScopedVFolderSelect
  multiple
  label={t('session.launcher.Folders')}
  scope={mountableVFolderScope(baiClient.user_uuid, currentProject.id)}
  filter={mountableVFolderFilter(mountableHosts)}
  optionFilter={{ status: { equals: 'READY' } }}
  isFolderDisabled={(folder) => folder.permission === 'NONE'}
  value={folderIds}
  onChange={(ids) => setFolderIds(ids as string[])}
  onResolve={({ unresolved }) =>
    setFolderIds((ids) => ids.filter((id) => !unresolved.includes(id)))
  }
/>`,
    },
  ],
} satisfies ComponentDoc;

export default docs;
