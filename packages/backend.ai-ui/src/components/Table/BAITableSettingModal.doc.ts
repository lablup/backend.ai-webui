import type { ComponentDoc } from '@astryxdesign/cli/authoring';

export const docs = {
  type: 'component',
  name: 'BAITableSettingModal',
  displayName: 'BAI Table Setting Modal',
  category: 'Overlay',
  hidden: true,
  keywords: [
    'column settings',
    'column picker',
    'column visibility',
    'reorder columns',
    'table settings',
    'customize columns',
  ],
  usage: {
    description:
      "The column-settings dialog behind BAITable's settings button. It renders a BAIDialog holding a search field and one row per column: a drag handle, a CheckboxInput for visibility, and the column label. Required columns get a locked, always-checked box, and drag-to-reorder runs on dnd-kit inside a DndContext that is skipped while a search term is active, so a filtered subset can never be reordered against the full list. The working set is ordinary component state seeded once per mount, so nothing is committed until Apply: cancel and the close affordance call onRequestClose with undefined, Apply calls it with the new selectedColumnKeys and columnOrder. BAITable renders it internally when tableSettings is set — mount it directly only where the same picker is needed outside BAITable.",
    bestPractices: [
      {
        guidance: true,
        description:
          "Wrap it in BAIUnmountAfterClose — the working set is seeded from props on mount, so without a fresh mount per open the dialog reopens carrying the previous session's edits.",
      },
      {
        guidance: true,
        description:
          'Mark structurally load-bearing columns (the name column, the row identifier) as required so their checkbox is locked and the row cannot lose its identity.',
      },
      {
        guidance: true,
        description:
          'Treat an undefined result as "user cancelled" and leave the stored column state untouched; only a defined result carries an intentional change.',
      },
      {
        guidance: false,
        description:
          'Persist columnOrder when disableReorder is set — the order comes back unchanged there, and writing it back only adds noise to stored settings.',
      },
      {
        guidance: false,
        description:
          'Pass visibleColumnKeys entries that have no matching entry in columns; rows without a column are dropped from the list and from the result.',
      },
    ],
  },
  props: [
    {
      name: 'open',
      type: 'boolean',
      description:
        'Whether the dialog is shown. While false the component renders nothing, so its drag context and state never mount.',
      required: true,
    },
    {
      name: 'columns',
      type: 'Array<BAITableSettingColumn>',
      description:
        'Every column the user may toggle, as { key, label, required }. The label is both the checkbox text and the search target; required locks the checkbox on.',
      required: true,
    },
    {
      name: 'visibleColumnKeys',
      type: 'Array<string>',
      description:
        'Currently visible keys, in current display order. Seeds the checked set and the initial row order — these keys first, the remaining columns after them.',
      required: true,
    },
    {
      name: 'disableReorder',
      type: 'boolean',
      description:
        'Drops the drag handles and the dnd-kit context, leaving a visibility-only picker. columnOrder is still returned, unchanged.',
    },
    {
      name: 'onRequestClose',
      type: '(result?: BAITableSettingResult) => void',
      description:
        'Called on every exit. undefined means cancelled; a result carries selectedColumnKeys (required columns always unioned in) and columnOrder covering every key.',
      required: true,
    },
  ],
  examples: [
    {
      label: 'Column picker for a table',
      code: `<BAIUnmountAfterClose>
  <BAITableSettingModal
    open={isSettingModalOpen}
    columns={columns.map((column) => ({
      key: column.key,
      label: column.title,
      required: !!column.required,
    }))}
    visibleColumnKeys={visibleColumnKeys}
    onRequestClose={(result) => {
      setIsSettingModalOpen(false);
      if (!result) return;
      setVisibleColumnKeys(result.selectedColumnKeys);
      setColumnOrder(result.columnOrder);
    }}
  />
</BAIUnmountAfterClose>`,
    },
  ],
} satisfies ComponentDoc;

export default docs;
