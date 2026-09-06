import type { ComponentDoc } from '@astryxdesign/cli/authoring';

export const docs = {
  type: 'component',
  name: 'BAISelectionLabel',
  displayName: 'BAI Selection Label',
  category: 'Table & List',
  keywords: [
    'selection',
    'selected count',
    'bulk actions',
    'clear selection',
    'deselect',
    'row selection',
    'toolbar',
  ],
  usage: {
    description:
      'The "N selected" summary that sits in a table toolbar next to the bulk actions. It renders an Astryx HStack with a Text count and, when onClearSelection is given, an Astryx ghost IconButton that clears the selection — a real button, so the clear affordance has its own focus ring and accessible name. The count is translated through useBAIi18n, so plural forms follow the active language. It returns null while count is zero or less, so a call site can render it unconditionally and let the toolbar collapse on its own.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Render it unconditionally above the table and let the zero-count null handle the empty case, instead of repeating a length check at every call site.',
      },
      {
        guidance: true,
        description:
          'Pass onClearSelection whenever the page owns the selected keys, so clearing the selection is reachable from the keyboard.',
      },
      {
        guidance: true,
        description:
          'Place it in a BAIFlex with the bulk-action buttons so the count and the actions it applies to read as one group.',
      },
      {
        guidance: false,
        description:
          'Add a separate clear button next to it; the component already owns that control and its tooltip.',
      },
      {
        guidance: false,
        description:
          'Feed it a count that is not the length of the current selection — this label is the only place the user reads how many rows an upcoming bulk action will touch.',
      },
    ],
  },
  props: [
    {
      name: 'count',
      type: 'number',
      description:
        'Number of selected items. Zero or less renders nothing at all.',
      required: true,
    },
    {
      name: 'onClearSelection',
      type: '() => void',
      description:
        'Clears the selection. Providing it is what renders the clear button; without it only the count shows.',
    },
  ],
  examples: [
    {
      label: 'Table toolbar with bulk actions',
      code: `{selectedRowKeys.length > 0 ? (
  <BAIFlex align="center" gap="xs">
    <BAISelectionLabel
      count={selectedRowKeys.length}
      onClearSelection={() => setSelectedRowKeys([])}
    />
    <BAIButton onClick={() => setEditModalOpen(true)}>
      {t('button.Edit')}
    </BAIButton>
  </BAIFlex>
) : null}`,
    },
  ],
} satisfies ComponentDoc;

export default docs;
