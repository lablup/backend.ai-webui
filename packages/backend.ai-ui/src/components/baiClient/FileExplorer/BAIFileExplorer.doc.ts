import type { ComponentDoc } from '@astryxdesign/cli/authoring';

export const docs = {
  type: 'component',
  name: 'BAIFileExplorer',
  displayName: 'BAI File Explorer',
  category: 'Table & List',
  keywords: [
    'file explorer',
    'file manager',
    'browser',
    'directory',
    'folder',
    'vfolder',
    'upload',
    'breadcrumb',
  ],
  usage: {
    description:
      "The file browser for a virtual folder: a breadcrumb path, an action bar and a BAITable of entries, backed by `useSearchVFolderFiles` over the connected BAI client's REST file APIs rather than by Relay — so it needs a connected BAIClient provider above it, and it suspends until that client resolves. `mode` picks between the full explorer (checkbox multi-select, upload, rename, download, delete, file editing) and `directoryPicker`, where files are shown but disabled, a row click descends into a directory, and selection, upload and file-creation entry points are hidden while folder create/rename/delete stay. Every mutating affordance is off by default and has to be switched on individually with the `enable*` flags, which callers normally derive from the vfolder's effective permissions. Navigation state lives inside the component: `defaultPath` seeds it once on mount and `onChangeCurrentPath` reports it, including the initial value; a `ref` exposes `refetch` for reloading from outside.",
    bestPractices: [
      {
        guidance: true,
        description:
          "Derive `enableWrite`, `enableDelete` and `enableDownload` from the vfolder's `permissions`, since all of them default to `false` and the explorer is read-only until they are set.",
      },
      {
        guidance: true,
        description:
          'Pass `enableUpload` explicitly whenever uploads should be possible — despite the intent recorded in the source it defaults to `false`, so leaving it out disables both the upload menu and drag-and-drop even when `enableWrite` is on.',
      },
      {
        guidance: true,
        description:
          'Hand `fileDropContainerRef` the element that should accept dropped files (typically the enclosing modal body) — without it the drag overlay has no container to mount into.',
      },
      {
        guidance: true,
        description:
          'Give the explorer a bounded height through `style`; the root flex column stretches to `height: 100%`, and the table scrolls inside it.',
      },
      {
        guidance: false,
        description:
          'Change `defaultPath` to navigate — it is applied once on mount, so later values are ignored; call `refetch` through the ref or remount the explorer instead.',
      },
      {
        guidance: false,
        description:
          'Wire `onChangeFetchKey`; it is declared on the props type but never called, and refreshing is driven by the internal refresh button and the `refetch` ref handle.',
      },
    ],
  },
  props: [
    {
      name: 'targetVFolderId',
      type: 'string',
      description:
        'UUID of the virtual folder to browse. It keys every file listing request and is published on the folder-info context the child controls read.',
      required: true,
    },
    {
      name: 'targetVFolderName',
      type: 'string',
      description:
        'Display name of the folder, forwarded on the folder-info context so child dialogs can name it. Falls back to an empty string.',
    },
    {
      name: 'fetchKey',
      type: 'string',
      description:
        'Changing this string re-runs the file listing query, letting an outer refresh control reload the explorer.',
    },
    {
      name: 'mode',
      type: "'explorer' | 'directoryPicker'",
      description:
        'Which surface to render. `directoryPicker` disables file rows, makes a directory row click navigate, and hides checkbox selection, upload and file creation while keeping folder create, rename and delete.',
      default: "'explorer'",
    },
    {
      name: 'defaultPath',
      type: 'string',
      description:
        "Path inside the vfolder to open at, in the explorer's own notation where `.` is the root. Applied once on mount and ignored afterwards.",
    },
    {
      name: 'onChangeCurrentPath',
      type: '(currentPath: string) => void',
      description:
        'Reports the current path (`.` for the root) on every navigation, and once on mount with the initial value.',
    },
    {
      name: 'onUpload',
      type: '(files: Array<RcFile>, currentPath: string) => void',
      description:
        'Receives files chosen through the upload control or dropped onto the container, together with the path they belong in. The explorer performs no transfer of its own — the caller runs the upload.',
    },
    {
      name: 'tableProps',
      type: 'Partial<BAITableProps<VFolderFile>>',
      description:
        'Spread onto the inner BAITable last, so it can override the row key, data source, columns, loading, pagination, row selection and row handlers the explorer sets.',
    },
    {
      name: 'style',
      type: 'React.CSSProperties',
      description:
        'Merged onto the root flex column, after its `height: 100%`, so a height set here wins.',
    },
    {
      name: 'fileDropContainerRef',
      type: 'React.RefObject<HTMLDivElement | null>',
      description:
        'Parent-owned ref to the element that hosts the drag-and-drop overlay. The drop surface only appears while a drag is in progress and `enableUpload` is set.',
    },
    {
      name: 'enableDownload',
      type: 'boolean',
      description:
        'Shows the download actions on rows and in the action bar. In `directoryPicker` mode the per-row download is suppressed regardless of this flag.',
      default: 'false',
    },
    {
      name: 'enableDelete',
      type: 'boolean',
      description:
        'Enables deleting entries, both per row and for the current multi-selection.',
      default: 'false',
    },
    {
      name: 'enableWrite',
      type: 'boolean',
      description:
        'Allows mutating the folder — inline rename on the name cell and the folder-creation controls. When it is off, names render read-only.',
      default: 'false',
    },
    {
      name: 'enableUpload',
      type: 'boolean',
      description:
        'Gates both upload entry points: the upload control in the action bar and the drag-and-drop overlay. It is independent of `enableWrite` and must be passed explicitly.',
      default: 'false',
    },
    {
      name: 'enableEdit',
      type: 'boolean',
      description:
        'Shows the per-row edit-file action, which calls `onClickEditFile`. Suppressed in `directoryPicker` mode.',
      default: 'false',
    },
    {
      name: 'onChangeFetchKey',
      type: '(fetchKey: string) => void',
      description:
        'Declared on the props type but never invoked by the component; the built-in refresh button refetches directly instead of publishing a key.',
    },
    {
      name: 'ref',
      type: 'React.Ref<BAIFileExplorerRef>',
      description:
        'Exposes a `refetch()` handle so an enclosing component can reload the current directory after an upload or an external change.',
    },
    {
      name: 'onDeleteFilesInBackground',
      type: '(bgTaskId: string, targetVFolderId: string, deletingFilePaths: Array<string>) => void',
      description:
        'Called when a delete is accepted as an asynchronous background task, with the task id and the paths being removed, so the host can track the task and mark those rows.',
    },
    {
      name: 'deletingFilePaths',
      type: 'Array<string>',
      description:
        'Full paths currently being deleted in the background. Matching rows — and rows underneath a matching directory — are shown as in-progress.',
    },
    {
      name: 'onClickEditFile',
      type: '(file: VFolderFile, currentPath: string) => void',
      description:
        'Called with the entry and the directory it lives in when the row edit action is used. Only reachable while `enableEdit` is on and the mode is not `directoryPicker`.',
    },
  ],
  examples: [
    {
      label: 'Full explorer inside a folder modal',
      code: `<BAIFileExplorer
  ref={fileExplorerRef}
  targetVFolderId={vfolderID}
  targetVFolderName={vfolderNode?.metadata?.name ?? 'folder'}
  fetchKey={fetchKey}
  fileDropContainerRef={bodyRef}
  deletingFilePaths={deletingFilePaths}
  enableWrite={hasWritePermission}
  enableUpload={hasWritePermission}
  enableDelete={hasDeletePermission}
  enableDownload
  onUpload={(files, currentPath) => {
    uploadFiles(files, vfolderID, currentPath);
  }}
/>`,
    },
    {
      label: 'Directory-picker mode',
      code: `<BAIFileExplorer
  mode="directoryPicker"
  targetVFolderId={vfolderUuid}
  targetVFolderName={vfolder_node?.name ?? undefined}
  defaultPath={defaultPath ?? '.'}
  onChangeCurrentPath={setCurrentPath}
  enableWrite={hasWriteContentPermission}
  enableDelete={hasDeleteContentPermission}
/>`,
    },
  ],
} satisfies ComponentDoc;

export default docs;
