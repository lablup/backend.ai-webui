import type { ComponentDoc } from '@astryxdesign/cli/authoring';

export const docs = {
  type: 'component',
  name: 'BAIUnmountAfterClose',
  displayName: 'BAI Unmount After Close',
  category: 'Utility',
  keywords: [
    'modal',
    'drawer',
    'unmount',
    'destroyonclose',
    'destroyonhidden',
    'lifecycle',
    'reset',
  ],
  usage: {
    description:
      'Renders no markup of its own: it clones its single modal or drawer child, keeps it mounted until the close animation has finished, then returns null so the child unmounts completely. It reads the child structurally (open, afterClose, afterOpenChange), so any modal-shaped component flows through unchanged, and the callbacks the call site already passed still fire. Use it when a dialog must start from a clean state on every open — a fresh form instance re-applying initialValues, selectors back at their defaults — without losing the exit transition that a bare {open && <Modal />} conditional throws away.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Wrap a modal whose internal state must not survive between opens, such as a form that reads initialValues only on mount.',
      },
      {
        guidance: true,
        description:
          'Keep the child controlled by the parent — the wrapper only observes open, it never opens or closes the dialog itself.',
      },
      {
        guidance: false,
        description:
          'Pass more than one child; React.Children.only throws on a fragment or a list.',
      },
      {
        guidance: false,
        description:
          'Reach for it when the dialog already resets itself — the extra mount cycle refetches every query the child owns.',
      },
    ],
  },
  props: [
    {
      name: 'children',
      type: 'React.ReactElement<BAIUnmountAfterCloseChildProps>',
      description:
        'The single modal or drawer element to manage. It must accept open; its afterClose and afterOpenChange callbacks are intercepted (the originals are still invoked) to detect when the exit animation has completed.',
      required: true,
    },
  ],
  examples: [
    {
      label: 'Reset a modal between opens',
      code: `<BAIUnmountAfterClose>
  <ImageInstallModal
    open={isOpenInstallModal}
    onRequestClose={() => setIsOpenInstallModal(false)}
  />
</BAIUnmountAfterClose>`,
    },
  ],
} satisfies ComponentDoc;

export default docs;
