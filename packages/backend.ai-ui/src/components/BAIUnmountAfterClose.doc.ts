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
      'Renders no markup of its own: it clones its single modal or drawer child and returns null once the child reports the close, so the child unmounts completely; a child with an exit animation (a drawer) stays mounted until it ends, while ui-common Modal has none and unmounts right after closing. It reads the child structurally (open, afterClose, afterOpenChange), so any modal-shaped component flows through unchanged, and the callbacks the call site already passed still fire. Use it when a dialog must start from a clean state on every open — a fresh form instance re-applying initialValues, selectors back at their defaults — or when the component rendering the modal holds state or queries outside its children.',
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
        guidance: true,
        description:
          'Make the child expose `open` and forward `afterClose` / `afterOpenChange` to the BAIModal, ui-common Modal or BAIDrawer it renders (Modal takes only `afterOpenChange`; its `unmountOnClose` drops only the children and keeps the component that renders the Modal mounted, so use it only when that component must stay mounted), and keep that shell mounted while closed — no `if (!open) return null`. The wrapper injects those callbacks and unmounts only when one fires, so a child that drops them never unmounts (this is how FR-3990 leaked state).',
      },
      {
        guidance: false,
        description:
          'Pass more than one child; React.Children.only throws on a fragment or a list.',
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
