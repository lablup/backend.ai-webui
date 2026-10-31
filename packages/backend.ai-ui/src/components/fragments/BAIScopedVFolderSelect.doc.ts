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
      "Picks virtual folders from `scopedVFoldersV2` (manager 26.9.0), a BAIComplexSelect over two Relay reads. The options are read only once the popup opens, then page 20 at a time over the scopes in `scope` (combined with OR), newest first, extended when the popup scrolls to its end, and the popup search runs on the server as a `name iContains` filter. Each option shows a two-line-tall identicon, the name, a second line with the creator's email, usage mode, host and creation date, and the caller's mount level as welded R/W/D tokens. The value is folder UUIDs (`VFolder.entityId`), so no global id is decoded anywhere. The selected ids are looked up together by `entityId` within `scope` and `filter` (`VFolderFilter.entityId`, manager 26.10.0); the lookup re-runs only when the selection changes, never on paging or search. Its answer labels each id and decides whether it is still reachable: `onResolve` reports the reachable ones (with their names) and the unreachable ones — not found, or rejected by `disableUnmountable` — and fires again whenever that outcome changes. The lookup suspends on first load; the closed select sends no options read.",
    bestPractices: [
      {
        guidance: true,
        description:
          'Wrap it, or the form item holding it, in a Suspense boundary — the selected-value lookup suspends on first load.',
      },
      {
        guidance: true,
        description:
          'Put what decides whether a folder may be used at all in `filter` (it also bounds the lookup of selected ids) and what only trims the list in `optionFilter`, so a selection the list hides is still recognised.',
      },
      {
        guidance: true,
        description:
          'Pass `fallbackLabels` when the value comes with names the caller already knows, so an id the scope no longer reaches still reads as a name.',
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
      name: 'disableUnmountable',
      type: 'boolean',
      description:
        'Lists a folder whose mount level for the caller is NONE as disabled, with a glyph whose tooltip says the caller cannot mount it, and reports a matching selection unresolved.',
      default: 'false',
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
        'Labels for selected ids the options and the lookup do not name — an id the scope no longer reaches. Without one such an id shows as itself.',
    },
    {
      name: 'onResolve',
      type: '(resolution: { resolved: ScopedVFolderSummary[]; unresolved: string[] }) => void',
      description:
        'Fired once the selected ids are looked up, and again whenever the outcome changes.',
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
  disableUnmountable
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
