import type { ComponentDoc } from '@astryxdesign/cli/authoring';

export const docs = {
  type: 'component',
  name: 'BAIDialog',
  displayName: 'BAI Dialog',
  category: 'Overlay',
  keywords: ['dialog', 'modal', 'overlay', 'popup', 'alertdialog', 'portal'],
  usage: {
    description:
      'The dialog surface every Backend.AI overlay is built on — BAIModal, BAIAlertDialog and BAIDrawerPortal all render one. It renders Astryx `Dialog` in its `isInline` mode inside a portal on `document.body` instead of a native `<dialog>` promoted with `showModal()`: staying out of the browser top layer is the point, because it lets the notification stack paint above an open dialog and stay clickable. On top of the Astryx surface it adds a level stack that resolves z-index, inertness and topmost-only Escape across nested dialogs, a focus trap with trigger-focus restore, scroll lock, an accessible name wired from the dialog title, a direction-aware entry animation measured from the trigger, and a backdrop-click policy derived from `purpose`. Props not listed here come from Astryx `DialogProps` and reach the element carrying `role="dialog"` as plain DOM attributes; `isInline`, `aria-modal` and the Astryx `ref` type are Omitted.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Reach for BAIModal or BAIAlertDialog first — they compose this surface with the project header, footer and button conventions; use BAIDialog directly only when building a new overlay primitive.',
      },
      {
        guidance: true,
        description:
          'Give every dialog an accessible name: render a heading inside it (a DialogHeader title or a `Heading`), or pass `aria-label` / `aria-labelledby`. A dev warning fires when neither is present, and every e2e selector resolves dialogs by role and name.',
      },
      {
        guidance: true,
        description:
          'Pick `purpose` from the dismissal contract you want: `info` allows Escape and backdrop click, `form` allows Escape only, `required` allows neither.',
      },
      {
        guidance: true,
        description:
          'Mark the element that should take focus on open with `data-autofocus`; otherwise focus lands on the dialog title, then on the first focusable element.',
      },
      {
        guidance: false,
        description:
          'Set a z-index through `style` — that object reaches the inner Astryx surface, not the portal root. Use the `zIndex` prop with a `BAI_Z_INDEX` layer so the level stack keeps paint order and inertness in agreement.',
      },
      {
        guidance: false,
        description:
          'Assume an open dialog makes the rest of the page unavailable: only covered dialog roots are inerted, so toasts and notices outside it stay live.',
      },
    ],
  },
  props: [
    {
      name: 'isOpen',
      type: 'boolean',
      description:
        'Whether the dialog is shown. Children stay mounted when it is false, so form state inside survives a close.',
      required: true,
    },
    {
      name: 'onOpenChange',
      type: '(isOpen: boolean) => unknown',
      description:
        'Called with `false` when the dialog asks to close — Escape, or a backdrop click, depending on `purpose`.',
      required: true,
    },
    {
      name: 'children',
      type: 'ReactNode',
      description:
        'Dialog content, typically an Astryx `Layout` with header, content and footer slots.',
      required: true,
    },
    {
      name: 'width',
      type: 'number | string',
      description:
        'Width of the outer sizing box, so a percentage resolves against the viewport rather than the surface. Astryx still caps the surface at 90vw, and `variant="fullscreen"` ignores it.',
      default: '400',
    },
    {
      name: 'maxHeight',
      type: 'number | string',
      description:
        'Maximum height of the surface. Astryx also feeds it to the inner scroll container, so long content scrolls instead of overflowing.',
      default: "'75vh'",
    },
    {
      name: 'position',
      type: 'DialogPosition',
      description:
        'Static placement (`top`, `bottom`, `start`, `end`); the dialog is centred without it. Ignored when `variant` is "fullscreen".',
    },
    {
      name: 'variant',
      type: "'standard' | 'fullscreen'",
      description:
        'Surface shape. "fullscreen" fills the viewport and ignores `width` and `position`.',
      default: "'standard'",
    },
    {
      name: 'purpose',
      type: "'required' | 'form' | 'info'",
      description:
        'Dismissal contract. "info" closes on Escape and backdrop click, "form" on Escape only, "required" on neither and defaults the role to "alertdialog".',
      default: "'info'",
    },
    {
      name: 'padding',
      type: 'SpacingStep',
      description:
        'Internal padding of the surface on the Astryx spacing scale. The theme default applies when unset.',
    },
    {
      name: 'zIndex',
      type: 'number',
      description:
        'Requests a higher position inside the modal band; the level stack resolves it, still placing later dialogs above this one and ignoring values outside the band. Pass a `BAI_Z_INDEX` layer, never a literal.',
    },
    {
      name: 'role',
      type: 'string',
      description:
        'Overrides the ARIA role of the dialog element. Defaults to "alertdialog" when `purpose` is "required", "dialog" otherwise.',
    },
    {
      name: 'className',
      type: 'string',
      description: 'Class applied to the inner Astryx dialog surface.',
    },
    {
      name: 'style',
      type: 'CSSProperties',
      description:
        'Inline style on the inner Astryx dialog surface — not on the portal root, so a z-index here has no effect.',
    },
    {
      name: 'xstyle',
      type: 'StyleXStyles',
      description:
        'StyleX styles forwarded to the inner Astryx dialog surface.',
    },
    {
      name: 'ref',
      type: 'React.Ref<HTMLDivElement>',
      description:
        'Ref to the element carrying `role="dialog"` — a `div`, not a native `<dialog>`.',
    },
  ],
  examples: [
    {
      label: 'Dialog with a Layout body',
      code: `<BAIDialog
  isOpen={isOpen}
  onOpenChange={setIsOpen}
  purpose="form"
  width={520}
>
  <Layout
    header={
      <DialogHeader
        title={t('session.TerminateSession')}
        onOpenChange={setIsOpen}
      />
    }
    content={<LayoutContent>{t('session.TerminateWarning')}</LayoutContent>}
    footer={<LayoutFooter hasDivider>{actions}</LayoutFooter>}
  />
</BAIDialog>`,
    },
    {
      label: 'Named by aria-labelledby, raised inside the modal band',
      code: `<BAIDialog
  isOpen={isOpen}
  onOpenChange={setIsOpen}
  purpose="required"
  role="alertdialog"
  zIndex={BAI_Z_INDEX.modalBase}
  aria-labelledby={titleId}
>
  <Layout
    content={
      <LayoutContent>
        <Heading level={2} id={titleId}>
          {title}
        </Heading>
      </LayoutContent>
    }
  />
</BAIDialog>`,
    },
  ],
} satisfies ComponentDoc;

export default docs;
