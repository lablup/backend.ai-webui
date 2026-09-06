import type { ComponentDoc } from '@astryxdesign/cli/authoring';

export const docs = {
  type: 'component',
  name: 'BAIVFolderDeleteButtonV2',
  displayName: 'BAI VFolder Delete Button V2',
  category: 'Action',
  keywords: [
    'delete',
    'trash',
    'vfolder',
    'folder',
    'bulk action',
    'icon button',
    'v2',
  ],
  usage: {
    description:
      'The delete affordance for a selection of virtual folders on pages whose rows are the V2 `VFolder` GraphQL type, such as the project admin data page. It renders a ghost Astryx IconButton with a trash glyph, tinted through the shared `bai-name-action-cell-danger` class so the danger colour follows the theme. Unlike BAIVFolderDeleteButton, its plural fragment selects only `id`: V2 `VFolder` exposes no per-user action permission yet, so the button is always enabled and the backend rejects an unauthorized request. It only opens the flow — the caller owns the confirmation, which for a permanent delete means BAIDeleteConfirmModal with `requireConfirmInput`.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Spread `BAIVFolderDeleteButtonV2Fragment` on the V2 folder rows the page selects from, and pass the selected array as `vfolderFrgmt`.',
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
          'Assume the enabled state means the user may delete — there is no permission gate here, so hide or disable the control yourself where the page already knows the action is unavailable.',
      },
      {
        guidance: false,
        description:
          'Wrap it in a Tooltip to give it a name — the control carries its own, and the wrapper would duplicate it.',
      },
    ],
  },
  props: [
    {
      name: 'vfolderFrgmt',
      type: 'BAIVFolderDeleteButtonV2Fragment$key',
      description:
        'Plural fragment reference for the selected V2 `VFolder` rows. The fragment selects only `id`, so it identifies the selection rather than gating the button.',
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
        'Disables the button. It is the only way to switch the control off, since the component applies no permission check of its own.',
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
      label: 'Bulk action in the project data page toolbar',
      code: `{selectedFolderList.length > 0 && (
  <BAIVFolderDeleteButtonV2
    vfolderFrgmt={selectedFolderList}
    label={t('data.folders.MoveToTrash')}
    onClick={() => toggleDeleteModal()}
  />
)}`,
    },
  ],
} satisfies ComponentDoc;

export default docs;
