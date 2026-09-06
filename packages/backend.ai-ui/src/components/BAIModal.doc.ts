import type { ComponentDoc } from '@astryxdesign/cli/authoring';

export const docs = {
  type: 'component',
  name: 'BAIModal',
  displayName: 'BAI Modal',
  category: 'Overlay',
  keywords: [
    'modal',
    'dialog',
    'popup',
    'overlay',
    'drawer',
    'confirm',
    'alertdialog',
  ],
  usage: {
    description:
      'The application modal, built on BAIDialog (a portalled Astryx Dialog) with the controller behaviour a bare Dialog does not provide: a header with title, subtitle and close button, a generated OK and Cancel footer with loading and danger states, backdrop and Escape dismissal policy, a skeleton loading state, an afterClose lifecycle, optional window controls (minimize, maximize, fullscreen) and a close guard that can veto a dismissal. Use it for any modal surface in the app; reaching for Astryx Dialog directly means rebuilding the header, footer and dismissal wiring by hand. Nothing is rendered while closed, so children mount fresh on every open, and the built-in labels are translated through useBAIi18n.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Drive the OK button from confirmLoading while an async submit is in flight so the modal cannot be double-submitted.',
      },
      {
        guidance: true,
        description:
          'Pass footer={null} for read-only detail modals; the header close button remains the dismissal path.',
      },
      {
        guidance: true,
        description:
          'Set confirmBeforeClose with onConfirmClose on modals holding unsaved form input — returning false or rejecting keeps the modal open.',
      },
      {
        guidance: true,
        description:
          'Use variant="fullscreen" for edge-to-edge surfaces; a standard dialog is capped at 90vw, so width="90%" and width="100%" render alike.',
      },
      {
        guidance: false,
        description:
          'Build an irreversible-deletion flow on a bare BAIModal — BAIDeleteConfirmModal with requireConfirmInput is the required surface for permanent deletes.',
      },
      {
        guidance: false,
        description:
          'Rely on centered, draggable, getContainer, modalRender or the other compatibility props kept for the migrated call sites; they are accepted and have no effect.',
      },
    ],
  },
  props: [
    {
      name: 'open',
      type: 'boolean',
      description:
        'Whether the modal is visible. While false the component renders nothing, so children unmount.',
    },
    {
      name: 'isOpen',
      type: 'boolean',
      description: 'Alias for open, read when open is not supplied.',
    },
    {
      name: 'onCancel',
      type: '(e: BAIModalCancelEvent) => void',
      description:
        'Fired when the user dismisses the modal through the cancel button, the header close button, Escape or a backdrop click. Escape and backdrop carry no React event, so the argument is undefined there.',
    },
    {
      name: 'onOpenChange',
      type: '(isOpen: boolean) => void',
      description: 'Alias for onCancel, called with false on dismissal.',
    },
    {
      name: 'afterClose',
      type: '() => void',
      description:
        'Called once the modal has closed. Fires from the open-to-closed transition, which is what BAIUnmountAfterClose subscribes to.',
    },
    {
      name: 'afterOpenChange',
      type: '(open: boolean) => void',
      description: 'Called with the new visibility right after it changes.',
    },
    {
      name: 'title',
      type: 'ReactNode',
      description:
        'Header title. A node is accepted, so an icon and text row can be passed, and the dialog labels itself from it.',
    },
    {
      name: 'subtitle',
      type: 'string',
      description: 'Secondary line rendered under the title.',
    },
    {
      name: 'headerContent',
      type: 'ReactNode',
      description:
        'Replaces the entire header row. A close button is appended so dismissal stays reachable.',
    },
    {
      name: 'closeLabel',
      type: 'string',
      description:
        'Accessible name for the close button rendered next to headerContent.',
    },
    {
      name: 'closable',
      type: 'boolean | { closeIcon?: ReactNode }',
      description: 'false removes the header close button.',
    },
    {
      name: 'closeIcon',
      type: 'ReactNode | false',
      description: 'false removes the header close button, like closable.',
    },
    {
      name: 'type',
      type: "'normal' | 'warning' | 'error'",
      description: 'Colors the header title to signal the severity.',
      default: "'normal'",
    },
    {
      name: 'children',
      type: 'ReactNode',
      description: 'Body content, rendered inside the scrolling content slot.',
    },
    {
      name: 'bodyRef',
      type: 'React.Ref<HTMLDivElement>',
      description:
        'Ref to the body wrapper, used where the body doubles as a file drag-and-drop target.',
    },
    {
      name: 'bodyProps',
      type: 'React.HTMLAttributes<HTMLDivElement>',
      description: 'Extra props spread onto the body wrapper element.',
    },
    {
      name: 'loading',
      type: 'boolean',
      description: 'Renders a BAISkeleton in place of the body content.',
    },
    {
      name: 'footer',
      type: 'ReactNode | BAIModalFooterRender',
      description:
        'Replaces the generated footer. null removes the footer entirely; a render function receives the generated footer plus OkBtn and CancelBtn.',
    },
    {
      name: 'onOk',
      type: '(e: React.MouseEvent<HTMLButtonElement>) => void',
      description: 'Click handler for the generated OK button.',
    },
    {
      name: 'okText',
      type: 'ReactNode',
      description: 'Label of the OK button. Falls back to OK.',
    },
    {
      name: 'cancelText',
      type: 'ReactNode',
      description:
        'Label of the Cancel button. Falls back to the translated Cancel label.',
    },
    {
      name: 'okType',
      type: "'primary' | 'danger' | 'default' | 'dashed' | 'link' | 'text' | 'ghost'",
      description:
        'Maps onto the OK button variant. danger renders the destructive variant.',
    },
    {
      name: 'okButtonProps',
      type: 'BAIModalActionButtonProps',
      description:
        'Applied to the OK button: danger, disabled, loading, icon, htmlType, form, style and className are honoured.',
    },
    {
      name: 'cancelButtonProps',
      type: 'BAIModalActionButtonProps',
      description: 'The same options applied to the Cancel button.',
    },
    {
      name: 'confirmLoading',
      type: 'boolean',
      description: 'Puts the OK button into its loading state.',
    },
    {
      name: 'maskClosable',
      type: 'boolean',
      description: 'Whether a backdrop click closes the modal.',
      default: 'true',
    },
    {
      name: 'keyboard',
      type: 'boolean',
      description:
        'Whether Escape closes the modal. Only takes effect once maskClosable is false, since a live backdrop enables both.',
      default: 'true',
    },
    {
      name: 'mask',
      type: 'boolean | { closable?: boolean; blur?: boolean }',
      description:
        'Only closable is read, as an alias for maskClosable. The backdrop itself is owned by BAIDialog and cannot be removed.',
    },
    {
      name: 'width',
      type: 'number | string | BAIModalResponsiveWidth',
      description:
        'Dialog width. A per-breakpoint record collapses to its largest entry, and "auto" is translated to fit-content.',
      default: '520',
    },
    {
      name: 'maxHeight',
      type: 'number | string',
      description:
        'Caps the dialog height; the body scrolls past it while the header and footer stay fixed.',
    },
    {
      name: 'variant',
      type: "'standard' | 'fullscreen'",
      description:
        'fullscreen fills the viewport and makes width and maxHeight inert. It is the only way to render edge to edge.',
    },
    {
      name: 'windowActions',
      type: "Array<'minimize' | 'maximize' | 'fullscreen'>",
      description:
        'Renders the named window controls in the header. A minimized modal collapses to a title bar but still keeps the page behind it blocked.',
    },
    {
      name: 'onWindowStateChange',
      type: "(state: 'default' | 'minimized' | 'maximized' | 'fullscreen') => void",
      description:
        'Called whenever a window control changes the state, including the reset back to default on close.',
    },
    {
      name: 'minimizedPlacement',
      type: "'bottomRight' | 'bottomLeft' | 'topRight' | 'topLeft'",
      description: 'Corner the minimized title bar parks in.',
      default: "'bottomRight'",
    },
    {
      name: 'confirmBeforeClose',
      type: 'boolean',
      description: 'Runs onConfirmClose before every dismissal.',
    },
    {
      name: 'onConfirmClose',
      type: '() => void | boolean | Promise<boolean>',
      description:
        'Close guard. Returning false or rejecting prevents the modal from closing.',
    },
    {
      name: 'styles',
      type: 'BAIModalSemanticStyles',
      description:
        'Per-slot inline styles for root, header, title, body, footer and container. The function form is accepted and ignored.',
    },
    {
      name: 'classNames',
      type: 'BAIModalSemanticClassNames',
      description:
        'Per-slot class names for the same slots. The function form is accepted and ignored.',
    },
    {
      name: 'zIndex',
      type: 'number',
      description:
        'Forwarded to BAIDialog. The modal is a portalled element with a real z-index, so a passed value takes effect.',
    },
  ],
  examples: [
    {
      label: 'Read-only detail modal',
      code: `<BAIModal
  open={open}
  title={t('credential.UserDetail')}
  footer={null}
  onCancel={onRequestClose}
>
  <UserDetail userId={userId} />
</BAIModal>`,
    },
    {
      label: 'Form modal with a pending OK button',
      code: `<BAIModal
  open={open}
  title={t('settings.ConfigPerJobScheduler')}
  confirmLoading={isSaving}
  okText={t('button.Save')}
  onOk={handleSave}
  onCancel={onRequestClose}
>
  <SchedulerSettingForm ref={formRef} />
</BAIModal>`,
    },
  ],
} satisfies ComponentDoc;

export default docs;
