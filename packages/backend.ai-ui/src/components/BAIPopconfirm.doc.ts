import type { ComponentDoc } from '@astryxdesign/cli/authoring';

export const docs = {
  type: 'component',
  name: 'BAIPopconfirm',
  displayName: 'BAI Popconfirm',
  category: 'Overlay',
  keywords: [
    'popconfirm',
    'confirm',
    'confirmation',
    'popover',
    'inline confirm',
    'are you sure',
    'alert dialog',
  ],
  usage: {
    description:
      'The anchored one-click confirmation: an Astryx `Popover` whose content this component owns — an optional icon, a title, a supporting line, then Cancel and Confirm. It is the REVERSIBLE tier of the project confirmation convention (deactivate a keypair, reset a form, leave a shared folder); anything irreversible goes to `BAIDeleteConfirmModal` with `requireConfirmInput` instead. `onConfirm` may return a promise: it is handed to the Astryx `clickAction`, which drives the confirm button pending state, blocks re-entry, closes the popover on resolve and keeps it open on reject so the user can retry. Cancel is rendered first in DOM order and explicitly focused on open, so a stray Enter cancels rather than confirms, and focus is handed back to the trigger on close. Props extend Astryx `PopoverProps`, so `placement`, `alignment`, `isModal`, `hasLightDismiss` and the rest pass through; `content` is not accepted because this component owns it.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Reserve it for actions the user can undo in seconds; permanent deletion belongs in `BAIDeleteConfirmModal` with `requireConfirmInput`.',
      },
      {
        guidance: true,
        description:
          'Return the mutation promise from `onConfirm` so the confirm button shows its own pending state and the popover closes only once the call settles.',
      },
      {
        guidance: true,
        description:
          'Set `isDanger` for a destructive-looking but reversible action, instead of styling the trigger or passing button props.',
      },
      {
        guidance: false,
        description:
          'Wiring `isOpen` when nothing else needs to read the open state — the component manages it on its own, and supplying `isOpen` makes it fully controlled.',
      },
      {
        guidance: false,
        description:
          'Putting a long explanation in `title`; keep the question short and move the detail to `description`, which renders as supporting text.',
      },
    ],
  },
  props: [
    {
      name: 'title',
      type: 'React.ReactNode',
      description:
        'The question. A string renders as semibold text and also becomes the accessible name of the popover dialog.',
      required: true,
    },
    {
      name: 'description',
      type: 'React.ReactNode',
      description:
        'Supporting line under the title. A string renders as secondary supporting text; a node is rendered as-is.',
    },
    {
      name: 'okText',
      type: 'string',
      description:
        'Confirm button label. Defaults to the shared `general.button.Confirm` translation.',
    },
    {
      name: 'cancelText',
      type: 'string',
      description:
        'Cancel button label. Defaults to the shared `general.button.Cancel` translation.',
    },
    {
      name: 'isDanger',
      type: 'boolean',
      description:
        'Renders the confirm button as destructive. Collapses what antd expressed as `okType="danger"` and `okButtonProps={{ danger: true }}`.',
      default: 'false',
    },
    {
      name: 'isOkDisabled',
      type: 'boolean',
      description:
        'Disables the confirm button while leaving the popover open and cancellable.',
      default: 'false',
    },
    {
      name: 'onConfirm',
      type: '(e: React.MouseEvent<HTMLButtonElement>) => void | Promise<void>',
      description:
        'Confirm handler. A returned promise drives the button pending state; the popover closes on resolve and stays open on reject.',
    },
    {
      name: 'onCancel',
      type: '(e: React.MouseEvent<HTMLButtonElement>) => void',
      description:
        'Cancel handler. The popover closes whether or not this is supplied.',
    },
    {
      name: 'icon',
      type: 'React.ReactNode',
      description:
        'Leading icon rendered beside the title, for a warning glyph on a heavier confirmation.',
    },
    {
      name: 'label',
      type: 'string',
      description:
        'Accessible name for the popover dialog. Needed when `title` is not a plain string, which otherwise supplies it.',
    },
    {
      name: 'children',
      type: 'React.ReactNode',
      description:
        'The trigger element the popover anchors to — typically a `Button` or `IconButton`.',
    },
    {
      name: 'isOpen',
      type: 'boolean',
      description:
        'Controlled open state. Supplying it makes the component fully controlled; omitted, it manages its own open state.',
    },
    {
      name: 'onOpenChange',
      type: '(isOpen: boolean) => void',
      description:
        'Called whenever the popover opens or closes, in both the controlled and uncontrolled cases.',
    },
    {
      name: 'width',
      type: 'number | string',
      description: 'Popover panel width.',
      default: '260',
    },
  ],
  examples: [
    {
      label: 'Reversible destructive row action',
      code: `<BAIPopconfirm
  title={t('data.folders.KickOutConfirm', { email: record.shared_to.email })}
  okText={t('button.Confirm')}
  isDanger
  onConfirm={() => handlePermission(record.shared_to.uuid)}
>
  <IconButton
    icon={<UserMinus size="1em" />}
    label={t('data.folders.KickOut')}
    variant="ghost"
    size="sm"
  />
</BAIPopconfirm>`,
    },
    {
      label: 'Discarding unsaved edits',
      code: `<BAIPopconfirm
  title={t('dialog.title.LetsDouble-Check')}
  description={t('dialog.ask.DoYouWantToResetChanges')}
  isDanger
  onConfirm={() => setScript('')}
>
  <Button variant="secondary" label={t('button.Reset')} />
</BAIPopconfirm>`,
    },
  ],
} satisfies ComponentDoc;

export default docs;
