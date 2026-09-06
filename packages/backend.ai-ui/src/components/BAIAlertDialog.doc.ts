import type { ComponentDoc } from '@astryxdesign/cli/authoring';

export const docs = {
  type: 'component',
  name: 'BAIAlertDialog',
  displayName: 'BAI Alert Dialog',
  category: 'Overlay',
  keywords: [
    'alert dialog',
    'alertdialog',
    'confirm',
    'confirmation',
    'modal',
    'destructive',
    'are you sure',
  ],
  usage: {
    description:
      'The WAI-ARIA alert-dialog pattern for a consequential but single-click confirmation: a title, a one-sentence description of the consequence, a ghost cancel button and an action button that defaults to the destructive variant. It rebuilds Astryx `AlertDialog`\'s anatomy on top of BAIDialog, because Astryx\'s own off-top-layer path (`isInline`) downgrades the role to `group`; here the surface is portalled into the body, keeps `role="alertdialog"` with both its name and its description wired up, focuses cancel first, and lets Escape — but not a backdrop click — dismiss. The dialog does not close itself: `onAction` must call `onOpenChange(false)` when the work finishes. This is not the irreversible tier — permanent deletion goes through BAIDeleteConfirmModal with `requireConfirmInput`. Open state, `width`, `zIndex` and the rest of the surface props pass through to BAIDialog.',
    bestPractices: [
      {
        guidance: true,
        description:
          "State the consequence in `description` rather than repeating the question — the string is the dialog's accessible description and is what a screen reader announces after the title.",
      },
      {
        guidance: true,
        description:
          'Drive `isActionLoading` from the pending promise and close in `onAction` once it resolves, since the dialog stays open on its own.',
      },
      {
        guidance: true,
        description:
          'Leave `actionVariant` at `destructive` for anything that removes or terminates something, and switch to `primary` only for a neutral confirmation.',
      },
      {
        guidance: false,
        description:
          'Use it for permanent deletion or a purge — those need the typed-confirmation gate of BAIDeleteConfirmModal with `requireConfirmInput`.',
      },
      {
        guidance: false,
        description:
          'Pass rich content: `title` and `description` are plain strings, and a confirmation that needs markup belongs in a BAIDialog you compose yourself.',
      },
    ],
  },
  props: [
    {
      name: 'title',
      type: 'string',
      description:
        "The question, rendered as a level-2 heading and linked as the dialog's accessible name.",
      required: true,
    },
    {
      name: 'description',
      type: 'string',
      description:
        "The consequence of confirming, rendered as secondary body text and linked as the dialog's accessible description.",
      required: true,
    },
    {
      name: 'actionLabel',
      type: 'string',
      description:
        'Label of the confirming button. Name the operation ("Delete", "Terminate") rather than "OK".',
      required: true,
    },
    {
      name: 'onAction',
      type: '() => unknown',
      description:
        'Called when the action button is clicked. The dialog does not auto-close — call `onOpenChange(false)` here once the work is done.',
      required: true,
    },
    {
      name: 'onOpenChange',
      type: '(isOpen: boolean) => unknown',
      description:
        'Called with `false` when the user cancels or presses Escape. Inherited from BAIDialog and also invoked by the cancel button.',
      required: true,
    },
    {
      name: 'cancelLabel',
      type: 'string',
      description:
        "Label of the ghost cancel button. Defaults to BUI's translated `general.button.Cancel`, so override it only when the dismissal means something more specific.",
    },
    {
      name: 'actionVariant',
      type: "ButtonVariant ('destructive' | 'primary' | …)",
      description:
        'Visual weight of the action button. Keep the destructive default for removals; use `primary` when confirming is not harmful.',
      default: "'destructive'",
    },
    {
      name: 'isActionLoading',
      type: 'boolean',
      description:
        "Shows the action button's spinner while the confirmed work is in flight.",
    },
    {
      name: 'isActionDisabled',
      type: 'boolean',
      description:
        'Disables the action button, for a confirmation the caller has decided is not currently available.',
    },
    {
      name: 'isCancelDisabled',
      type: 'boolean',
      description:
        'Disables the cancel button. Escape still cancels, so the dialog never becomes a trap.',
    },
  ],
  examples: [
    {
      label: 'Confirm a destructive action',
      code: `<BAIAlertDialog
  isOpen={isOpen}
  onOpenChange={setIsOpen}
  title={t('session.TerminateSession')}
  description={t('session.TerminateSessionDesc')}
  actionLabel={t('button.Terminate')}
  isActionLoading={isPending}
  onAction={async () => {
    await terminate(session.id);
    setIsOpen(false);
  }}
/>`,
    },
    {
      label: 'Neutral confirmation with a custom cancel label',
      code: `<BAIAlertDialog
  isOpen={isOpen}
  onOpenChange={setIsOpen}
  title={t('modelService.ClearErrors')}
  description={t('modelService.ClearErrorsDesc')}
  actionVariant="primary"
  actionLabel={t('button.Confirm')}
  cancelLabel={t('button.KeepEditing')}
  onAction={() => {
    clearErrors();
    setIsOpen(false);
  }}
/>`,
    },
  ],
} satisfies ComponentDoc;

export default docs;
