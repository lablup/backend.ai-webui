import type { ComponentDoc } from '@astryxdesign/cli/authoring';

export const docs = {
  type: 'component',
  name: 'BAIVFolderDeleteButton',
  displayName: 'BAI VFolder Delete Button',
  category: 'Action',
  keywords: [
    'delete',
    'trash',
    'vfolder',
    'folder',
    'bulk action',
    'permission',
    'icon button',
  ],
  usage: {
    description:
      'The delete affordance for a selection of virtual folders, used in the bulk-action row of the folder list pages. It renders a ghost Astryx IconButton with a trash glyph, tinted through the shared `bai-name-action-cell-danger` class so the danger colour follows the theme, and it gates itself on data: a plural Relay fragment reads `permissions` on the selected VirtualFolderNode records and the button stays disabled unless at least one of them grants `delete_vfolder`. It only opens the flow — the caller owns the confirmation, which for a permanent delete means BAIDeleteConfirmModal with `requireConfirmInput`. For pages whose selection rows are the V2 `VFolder` type, use BAIVFolderDeleteButtonV2 instead.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Spread `BAIVFolderDeleteButtonFragment` on the folder rows the page selects from, so the permission check reads live data instead of a client-side guess.',
      },
      {
        guidance: true,
        description:
          'Have `onClick` open a confirmation — BAIDeleteConfirmModal with `requireConfirmInput` for a permanent delete, since the button itself confirms nothing.',
      },
      {
        guidance: true,
        description:
          'Give `label` the translated action name; it is the accessible name and also the default tooltip text.',
      },
      {
        guidance: false,
        description:
          'Wrap it in a Tooltip to give it a name — the control carries its own, and the wrapper would duplicate it.',
      },
      {
        guidance: false,
        description:
          'Render it with an empty selection; pass the selected rows and let the fragment decide whether the action is available.',
      },
    ],
  },
  props: [
    {
      name: 'vfolderFrgmt',
      type: 'BAIVFolderDeleteButtonFragment$key',
      description:
        'Plural fragment reference for the selected VirtualFolderNode rows. Their `permissions` decide whether the button is enabled — at least one must include `delete_vfolder`.',
      required: true,
    },
    {
      name: 'label',
      type: 'string',
      description:
        'Accessible name of the icon button, and the tooltip text when `tooltip` is not given.',
      required: true,
    },
    {
      name: 'tooltip',
      type: 'string',
      description:
        'Hover text. Falls back to `label`, so set it only when the tooltip should say more than the name.',
    },
    {
      name: 'isDisabled',
      type: 'boolean',
      description:
        'Disables the button regardless of permissions. The permission gate is applied on top, so it can never re-enable a forbidden action.',
    },
    {
      name: 'onClick',
      type: '() => void',
      description:
        'Fired on activation. Open the confirmation flow here — the component performs no mutation.',
    },
    {
      name: 'size',
      type: "'sm' | 'md' | 'lg'",
      description: 'Astryx IconButton size.',
      default: "'md'",
    },
  ],
  examples: [
    {
      label: 'Bulk action in a folder list toolbar',
      code: `{selectedFolderList.length > 0 && (
  <BAIVFolderDeleteButton
    vfolderFrgmt={selectedFolderList}
    label={t('data.folders.MoveToTrash')}
    onClick={() => toggleDeleteModal()}
  />
)}`,
    },
  ],
} satisfies ComponentDoc;

export default docs;
