import type { ComponentDoc } from '@astryxdesign/cli/authoring';

export const docs = {
  type: 'component',
  name: 'BAIVFolderPathPicker',
  displayName: 'BAI VFolder Path Picker',
  category: 'Data Input',
  keywords: [
    'path picker',
    'folder picker',
    'directory',
    'vfolder',
    'sub path',
    'select',
    'form field',
  ],
  usage: {
    description:
      "A form control for choosing a sub path inside a given virtual folder. It renders a select-like `ComplexSelector` purely as a display trigger — it has no dropdown of its own; every open gesture, mouse or keyboard, is redirected to `BAIDirectoryPickerModal`, so a path can only be picked by browsing and never typed. The value is the sub path within the vfolder: `''` for the vfolder root, `'sub/path'` below it, and `undefined` while nothing has been picked; the trigger displays it with a leading slash so a chosen root is visibly different from an empty field. The vfolder itself is chosen elsewhere and handed in as `vfolderUuid`. `value`, `defaultValue` and `onChange` follow the controllable-value convention, so the component drops into a Form.Item and works controlled or uncontrolled. Opening the picker preloads the modal's query inside a transition, which is what the trigger shows as its loading state.",
    bestPractices: [
      {
        guidance: true,
        description:
          'Pair it with a vfolder select and pass `disabled={!vfolderUuid}` until one is chosen — without a UUID the trigger will not open the picker, and its placeholder says to pick a folder first.',
      },
      {
        guidance: true,
        description:
          'Reset the value whenever the selected vfolder changes, since a sub path is only meaningful inside the folder it was picked from.',
      },
      {
        guidance: true,
        description:
          "Validate with a custom rule that rejects `undefined` rather than Form.Item's `required`, because `''` — the vfolder root — is a valid pick that a required rule would reject.",
      },
      {
        guidance: false,
        description:
          'Drive the trigger open state or loading yourself — the component owns both and redirects every open gesture into the directory picker modal.',
      },
      {
        guidance: false,
        description:
          'Read a stored path back as an absolute one — the leading slash is display only, and `onChange` emits the bare sub path.',
      },
    ],
  },
  props: [
    {
      name: 'vfolderUuid',
      type: 'string',
      description:
        'UUID of the vfolder to browse. Until it is set, the trigger shows the "select a folder first" placeholder and clicking it opens nothing.',
    },
    {
      name: 'value',
      type: 'string',
      description:
        "Controlled sub path: `''` is the vfolder root, `'sub/path'` is below it, and `undefined` means nothing has been picked yet.",
    },
    {
      name: 'defaultValue',
      type: 'string',
      description:
        'Initial sub path for the uncontrolled case. It also seeds the directory picker so the modal opens where the current value points.',
    },
    {
      name: 'onChange',
      type: '(selectedSubPath?: string) => void',
      description:
        'Fired with the newly chosen sub path when the picker is confirmed. Cancelling the modal keeps the current value and emits nothing.',
    },
    {
      name: 'disabled',
      type: 'boolean',
      description:
        'Disables the trigger and blocks the picker from opening, on top of the block that a missing `vfolderUuid` already imposes.',
    },
    {
      name: 'style',
      type: 'React.CSSProperties',
      description:
        'Inline style forwarded to the trigger, typically to set its width.',
    },
    {
      name: 'label',
      type: 'string',
      description:
        'Accessible name of the trigger; visually hidden (the surrounding Form.Item renders the visible label). Defaults to the picker\'s own "Select a path" copy.',
    },
  ],
  examples: [
    {
      label: 'Paired with a vfolder select inside a form',
      code: `<Form.Item
  label="Path"
  name="subPath"
  rules={[
    {
      // '' (the vfolder root) is a valid pick, so \`required\` cannot be used.
      validator: (_rule, value) =>
        value === undefined
          ? Promise.reject(new Error('Please select a path'))
          : Promise.resolve(),
    },
  ]}
>
  <BAIVFolderPathPicker vfolderUuid={vfolderUuid} disabled={!vfolderUuid} />
</Form.Item>`,
    },
    {
      label: 'Uncontrolled, reporting the picked path',
      code: `<BAIVFolderPathPicker
  vfolderUuid={vfolderUuid}
  onChange={setSelectedSubPath}
  style={{ width: '100%' }}
/>`,
    },
  ],
} satisfies ComponentDoc;

export default docs;
