import type { ComponentDoc } from '@astryxdesign/cli/authoring';

export const docs = {
  type: 'component',
  name: 'BAIDeleteConfirmModal',
  displayName: 'BAI Delete Confirm Modal',
  category: 'Overlay',
  keywords: [
    'delete',
    'confirm',
    'confirmation dialog',
    'destructive',
    'type to confirm',
    'danger modal',
    'remove',
  ],
  usage: {
    description:
      'The confirmation modal for destructive actions. It builds on BAIModal (Astryx Dialog) and adds the pieces the project’s destructive-confirmation convention requires: a warning-marked title, a boxed and scrollable list of the exact items being deleted, an optional typed-confirmation field that keeps the danger button disabled until the user retypes `confirmText`, and the "this action cannot be undone" warning. Irreversible actions — permanent deletion, purge, force termination — must go through this component with `requireConfirmInput`; reversible ones belong to BAIPopconfirm, a row action’s `popConfirm`, or `modal.confirm` from the app-shim, and a reversible action that still deserves a modal can pass `reversible` here to drop both the input and the warning. BAIDeleteConfirmModalProps extends BAIModalProps minus `title` and `children`, so open state, footer buttons and the rest of the modal surface pass through.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Give `confirmText` a string the user can read straight off the modal — the resource name shown in `items`, never an opaque token.',
      },
      {
        guidance: true,
        description:
          'Set `requireConfirmInput` on every permanent deletion, even a single-item one, since the gate is only automatic when more than one item is listed.',
      },
      {
        guidance: true,
        description:
          'Pass `target` and let the default description phrase itself, instead of writing a fresh sentence per call site.',
      },
      {
        guidance: true,
        description:
          'Supply `confirmText` explicitly whenever an item `label` is a ReactNode, because the automatic fallback can only read a string label.',
      },
      {
        guidance: true,
        description:
          'Set `plainItems` when an item label is already a self-contained block such as a table, so the default surface does not draw a second border around it.',
      },
      {
        guidance: false,
        description:
          'Reintroduce an ad-hoc "modal with a text input" for a destructive flow; the copy, layout and danger styling live here on purpose.',
      },
      {
        guidance: false,
        description:
          'Use `reversible` to make a delete feel lighter — it is for actions the user can undo in seconds without help, such as revoking a role assignment.',
      },
    ],
  },
  props: [
    {
      name: 'items',
      type: 'BAIDeleteConfirmModalItem[]',
      description:
        'The rows being deleted, each with a `key` and a `label`. An empty array leaves the danger button disabled, and more than one item arms the typed-confirmation gate on its own.',
      required: true,
    },
    {
      name: 'title',
      type: 'React.ReactNode',
      description:
        'Modal title, rendered next to a warning icon. Defaults to the localized "Delete" or "Delete N items".',
    },
    {
      name: 'description',
      type: 'React.ReactNode',
      description:
        'Copy above the item list. Falls back to a `target`-based sentence, then to a generic one.',
    },
    {
      name: 'target',
      type: 'React.ReactNode',
      description:
        'Resource type label ("Credential", "Project"). Used only to build the default description when `description` is absent.',
    },
    {
      name: 'reversible',
      type: 'boolean',
      description:
        'Keeps the layout but renders neither the typed-confirmation input nor the "cannot be undone" warning, even with `requireConfirmInput` or several items.',
      default: 'false',
    },
    {
      name: 'requireConfirmInput',
      type: 'boolean',
      description:
        'Forces the typed-confirmation gate for a single item. With several items the gate is armed regardless.',
      default: 'false',
    },
    {
      name: 'confirmText',
      type: 'string',
      description:
        'The exact string the user must type. Defaults to a single item’s string label, otherwise the localized "Delete". An explicitly empty value hides the input and leaves the danger button disabled, so an unresolved target can never be confirmed.',
    },
    {
      name: 'inputLabel',
      type: 'React.ReactNode',
      description:
        'Label above the confirmation field. Defaults to the localized "Type {confirmText} to confirm." A node is rendered above the field, and its flattened text becomes the field’s hidden accessible name.',
    },
    {
      name: 'inputProps',
      type: 'BAIDeleteConfirmModalInputProps',
      description:
        'Extra settings for the confirmation field. Only `placeholder` and `disabled` are honoured; the rest of the antd input surface is accepted and ignored.',
    },
    {
      name: 'extraContent',
      type: 'React.ReactNode',
      description:
        'Content rendered below the confirmation field, for per-delete options such as "also remove the data" checkboxes.',
    },
    {
      name: 'cannotBeUndoneText',
      type: 'string',
      description:
        'Overrides the localized "This action cannot be undone." It appears as danger text under the input, or as an error banner when there is no input.',
    },
    {
      name: 'itemListMaxHeight',
      type: 'number',
      description:
        'Pixel height at which the item list starts scrolling. Pass 0 to let it grow without a cap.',
      default: '200',
    },
    {
      name: 'plainItems',
      type: 'boolean',
      description:
        'Drops the item list’s background, border, padding and scrolling, for labels that are already self-contained blocks.',
      default: 'false',
    },
    {
      name: 'open',
      type: 'boolean',
      description:
        'Modal visibility, inherited from BAIModal. Each open edge clears anything previously typed into the confirmation field.',
    },
    {
      name: 'onOk',
      type: '(e: React.MouseEvent<HTMLElement>) => void',
      description:
        'Runs the deletion. Called only once the gate is satisfied; the typed text is cleared first.',
    },
    {
      name: 'onCancel',
      type: '(e: React.MouseEvent<HTMLElement>) => void',
      description: 'Dismisses the modal and clears the typed text.',
    },
    {
      name: 'okText',
      type: 'React.ReactNode',
      description:
        'Label of the confirm button. Defaults to the localized "Delete".',
    },
    {
      name: 'okButtonProps',
      type: 'BAIButtonProps',
      description:
        'Merged over the computed confirm-button props. It is applied last, so overriding `disabled` here bypasses the typed-confirmation gate.',
    },
  ],
  examples: [
    {
      label: 'Permanent deletion with a typed confirmation',
      code: `<BAIDeleteConfirmModal
  open={!!deletingKeypair}
  title={t('credential.DeleteCredential')}
  target={t('general.Credential')}
  items={
    deletingKeypair
      ? [{ key: deletingKeypair.access_key, label: deletingKeypair.access_key }]
      : []
  }
  confirmText={deletingKeypair?.access_key ?? ''}
  requireConfirmInput
  onOk={() => deleteKeypair(deletingKeypair)}
  onCancel={() => setDeletingKeypair(null)}
/>`,
    },
    {
      label: 'Reversible action, same layout without the gate',
      code: `<BAIDeleteConfirmModal
  open={!!revokingAssignment}
  reversible
  title={t('rbac.RemovePermission')}
  description={t('rbac.ConfirmDeletePermissionWithDetail')}
  items={revokingAssignment ? [{ key: revokingAssignment.id, label: revokingAssignment.name }] : []}
  okText={t('button.Remove')}
  onOk={() => revoke(revokingAssignment)}
  onCancel={() => setRevokingAssignment(null)}
/>`,
    },
  ],
} satisfies ComponentDoc;

export default docs;
