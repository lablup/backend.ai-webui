import type { ComponentDoc } from '@astryxdesign/cli/authoring';

export const docs = {
  type: 'component',
  name: 'BAIDirectoryPickerModal',
  displayName: 'BAI Directory Picker Modal',
  category: 'Overlay',
  keywords: [
    'directory picker',
    'folder picker',
    'path',
    'browse',
    'vfolder',
    'modal',
    'dialog',
  ],
  usage: {
    description:
      "A directory-only browser in a dialog, built on BAIFileExplorer's `directoryPicker` mode: files are listed but not selectable, a directory row click descends, folder create, rename and delete follow the caller's permissions, and the footer shows the current location next to the button that confirms it. It does not run its own query — the opener loads the exported `BAIDirectoryPickerQuery` (`vfolder_node` name and permissions) through `useQueryLoader` and passes the resulting reference as `queryRef`, which the modal reads with `usePreloadedQuery` to title itself and derive the write and delete flags. Because it suspends on that query and on the BAIClient promise consumed inside the explorer, the opener must mount it inside a transition or provide a Suspense boundary. The picker speaks sub paths (`''` is the vfolder root) while the explorer uses `.`, and the modal translates between the two. All other props pass through to BAIModal except `onOk`, `onCancel`, `footer` and `title`, which it owns.",
    bestPractices: [
      {
        guidance: true,
        description:
          'Call `loadQuery` for `BAIDirectoryPickerQuery` in the trigger handler and flip the open state in the same `startTransition`, so the in-flight time surfaces as a pending trigger rather than an empty Suspense gap.',
      },
      {
        guidance: true,
        description:
          'Wrap the modal in `BAIUnmountAfterClose` and render it only once a query reference exists, so browsing state resets between openings.',
      },
      {
        guidance: true,
        description:
          'Treat the `undefined` argument to `onRequestClose` as a cancel and keep the previous value — an empty string is a real answer meaning the vfolder root.',
      },
      {
        guidance: false,
        description:
          'Pass a `queryRef` loaded for a different vfolder than `vfolderUuid`; the title and permissions come from the reference while the listing comes from the UUID, so a mismatch shows one folder and browses another.',
      },
      {
        guidance: false,
        description:
          'Supply `title` or `footer` — both are removed from the props type, because the folder name in the header and the selected-path row in the footer are what the picker is.',
      },
    ],
  },
  props: [
    {
      name: 'vfolderUuid',
      type: 'string',
      description:
        'UUID of the virtual folder to browse. Passed straight to the inner explorer as the listing target.',
      required: true,
    },
    {
      name: 'queryRef',
      type: 'PreloadedQuery<BAIDirectoryPickerModalQuery>',
      description:
        "Preloaded reference to `BAIDirectoryPickerQuery`, keyed by this vfolder's global id. Supplies the folder name for the title and the `write_content` / `delete_content` permissions that gate folder CRUD inside the picker.",
      required: true,
    },
    {
      name: 'defaultPath',
      type: 'string',
      description:
        'Sub path to start browsing from, where an empty string is the vfolder root. Seeds the explorer once on mount and also seeds the path shown in the footer.',
    },
    {
      name: 'onRequestClose',
      type: '(selectedSubPath?: string) => void',
      description:
        'Called with the confirmed sub path when the footer button is used, and with `undefined` on cancel, Escape or the header close. An empty string means the vfolder root was chosen, so the argument must be tested against `undefined` rather than for truthiness.',
      required: true,
    },
  ],
  examples: [
    {
      label: 'Opened render-as-you-fetch from a trigger',
      code: `const [pickerQueryRef, loadPickerQuery] =
  useQueryLoader<BAIDirectoryPickerModalQuery>(BAIDirectoryPickerQuery);
const [isOpen, setIsOpen] = useState(false);
const [isPending, startTransition] = useTransition();

const openPicker = () => {
  startTransition(() => {
    loadPickerQuery(
      { vfolderGlobalId: toGlobalId('VirtualFolderNode', vfolderUuid) },
      { fetchPolicy: 'store-and-network' },
    );
    setIsOpen(true);
  });
};

return (
  pickerQueryRef != null && (
    <BAIUnmountAfterClose>
      <BAIDirectoryPickerModal
        open={isOpen}
        vfolderUuid={vfolderUuid}
        queryRef={pickerQueryRef}
        defaultPath={subPath ?? ''}
        onRequestClose={(newSubPath) => {
          if (newSubPath !== undefined) {
            setSubPath(newSubPath);
          }
          setIsOpen(false);
        }}
      />
    </BAIUnmountAfterClose>
  )
);`,
    },
  ],
} satisfies ComponentDoc;

export default docs;
