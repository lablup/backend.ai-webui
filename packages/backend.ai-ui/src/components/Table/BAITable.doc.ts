import type { ComponentDoc } from '@astryxdesign/cli/authoring';

export const docs = {
  type: 'component',
  name: 'BAITable',
  displayName: 'BAI Table',
  category: 'Table & List',
  keywords: [
    'table',
    'data grid',
    'datagrid',
    'grid',
    'list',
    'pagination',
    'sorting',
    'columns',
  ],
  usage: {
    description:
      'The project table: Astryx Table plus an assembled plugin pipeline (column settings, sorting, selection, resizing, sticky columns, scroll modes, expansion) behind an antd-v6-shaped prop contract. It is the only table implementation, so every list surface uses it rather than composing Astryx Table and its plugins by hand — the plugin order it fixes is load-bearing and easy to get wrong. It also owns what Astryx leaves to the caller: its own bottom pagination bar next to the settings gear, a column settings modal, a CSV export modal, and the empty state. Props Astryx exposes and this wrapper does not rename are inherited and forwarded to Astryx Table.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Drive server-side sorting through order and onChangeOrder, which speak the Backend.AI order string (for example -created_at), and give each sortable column a stable key or dataIndex so the string names the right field.',
      },
      {
        guidance: true,
        description:
          'Pass total on the pagination config when the rows are already sliced server-side; leave it out and the table slices dataSource itself.',
      },
      {
        guidance: true,
        description:
          'Give tableSettings a persisted columnOverrides record so column visibility, order and width survive a reload.',
      },
      {
        guidance: false,
        description:
          'Rely on expandedRowRender, column-level fixed, multi-level header groups, or row virtualization — group headers are flattened into captions, pinning is table-wide through sticky, and virtualization is a deferred product decision.',
      },
      {
        guidance: false,
        description:
          'Set showHeader={false} on a table with sortable or selectable columns; the header carries both controls, so hiding it makes them unreachable.',
      },
    ],
  },
  props: [
    {
      name: 'columns',
      type: 'BAIColumnsType<RecordType>',
      description:
        'antd-shaped column model — title, dataIndex, key, render, sorter, width, align, fixed. Nested children groups are flattened, with the group title rendered as a muted caption above each child header.',
    },
    {
      name: 'dataSource',
      type: 'ReadonlyArray<RecordType>',
      description:
        'Rows to render. Sliced by the pagination config unless its total says the slicing already happened server-side.',
    },
    {
      name: 'rowKey',
      type: 'string | ((record: RecordType) => React.Key)',
      description:
        'Stable row identity used for selection, expansion and React keys. A string names a field on the record.',
      default: "'id'",
    },
    {
      name: 'size',
      type: "'small' | 'middle' | 'large'",
      description:
        'antd density names, mapped to the Astryx compact / balanced / spacious densities.',
      default: "'small'",
    },
    {
      name: 'loading',
      type: 'boolean',
      description:
        'Dims the rows while a refetch is in flight. There is no spinner — the existing rows stay readable and in place.',
    },
    {
      name: 'spinnerLoading',
      type: 'boolean',
      description:
        'Parity alias kept for call sites written against the retired antd engine; it behaves exactly like loading.',
    },
    {
      name: 'resizable',
      type: 'boolean',
      description:
        'Drag-to-resize column borders. Resized widths ride the same override record as visibility and order, so tableSettings persists them.',
      default: 'true',
    },
    {
      name: 'order',
      type: 'string | null',
      description:
        'Current sort as a Backend.AI order string, e.g. -created_at for descending. Drives which header shows the active sort arrow.',
    },
    {
      name: 'onChangeOrder',
      type: '(order?: string) => void',
      description:
        'Fired when a sortable header is clicked, with the next order string or undefined when sorting is cleared. Feed it back into the query variables.',
    },
    {
      name: 'rowSelection',
      type: 'BAITableRowSelection<RecordType>',
      description:
        'Enables the checkbox column and reports selection through onChange. Only checkbox selection exists; getCheckboxProps honours disabled, and preserveSelectedRowKeys keeps rows selected across pages.',
    },
    {
      name: 'pagination',
      type: 'false | BAITablePaginationConfig',
      description:
        'Configures the bottom bar — current, defaultPageSize, total, onChange, showSizeChanger, hideOnSinglePage, extraContent. Pass false to drop the bar entirely.',
    },
    {
      name: 'tableSettings',
      type: 'BAITableSettings',
      description:
        'Turns on the settings gear. Column visibility, order and width live in a controllable columnOverrides record reported through onColumnOverridesChange; drag-to-reorder is on unless disableColumnReorder is set.',
    },
    {
      name: 'exportSettings',
      type: 'BAIExportSettings',
      description:
        'Turns on the CSV export button. supportedFields limits what the modal offers and onExport receives the field keys the user picked.',
    },
    {
      name: 'expandable',
      type: 'BAITableExpandable<RecordType>',
      description:
        'Injects a chevron column and renders expandedRowRender output as a synthetic detail row. Expansion can be controlled through expandedRowKeys and onExpandedRowsChange.',
    },
    {
      name: 'emptyState',
      type: 'ReactNode | false',
      description:
        'Shown in place of the body when dataSource is empty. A string is wrapped in the default icon-and-padding EmptyState, any other node renders as-is, and false renders nothing.',
    },
    {
      name: 'locale',
      type: '{ emptyText?: ReactNode }',
      description:
        'antd parity shim. Only emptyText is read, and it follows the same wrapping rules as emptyState.',
    },
    {
      name: 'onRow',
      type: '(record: RecordType, index?: number) => React.HTMLAttributes<HTMLTableRowElement>',
      description:
        'Per-row html props. Only the returned handlers, style and className are applied to the row element.',
    },
    {
      name: 'sticky',
      type: 'boolean',
      description:
        'Pins the leading run of columns marked fixed to the start edge and the trailing run of fixed: "right" columns to the end edge while the table scrolls horizontally.',
      default: 'true',
    },
    {
      name: 'bordered',
      type: 'boolean',
      description:
        'Draws the full cell grid instead of row rules only, by switching Astryx dividers to grid.',
    },
    {
      name: 'scroll',
      type: '{ x?: number | string | true; y?: number | string }',
      description:
        'Enables the scroll modes. x lets width-less columns size to their content and the table scroll sideways; y caps the wrapper height and sticks every header cell.',
    },
    {
      name: 'showHeader',
      type: 'boolean',
      description:
        'Collapses the header row via CSS. Intended only for list-shaped tables with a single unlabelled column; sorting and selection become unreachable while it is off.',
      default: 'true',
    },
    {
      name: 'hasHover',
      type: 'boolean',
      description:
        'Highlights the row under the pointer. Inherited from Astryx Table but defaulted on here, unlike Astryx itself.',
      default: 'true',
    },
    {
      name: 'textOverflow',
      type: "'wrap' | 'truncate'",
      description:
        'How cell content that exceeds its column behaves. Inherited from Astryx Table but defaulted to truncate here so rows keep a uniform height.',
      default: "'truncate'",
    },
    {
      name: 'className',
      type: 'string',
      description:
        'Applied to the dim/scroll wrapper around the table rather than to the table element itself.',
    },
    {
      name: 'style',
      type: 'React.CSSProperties',
      description:
        'Applied to the dim/scroll wrapper around the table rather than to the table element itself.',
    },
  ],
  examples: [
    {
      label: 'Selectable table with server-side sorting',
      code: '<BAITable<Keypair>\n  rowKey="id"\n  loading={isPending}\n  dataSource={items}\n  columns={columns}\n  order={order}\n  onChangeOrder={setOrder}\n  rowSelection={{\n    type: \'checkbox\',\n    selectedRowKeys: selectedKeys,\n    onChange: (keys, rows) => setSelected(rows),\n  }}\n/>',
    },
    {
      label: 'Server-paginated table with column settings',
      code: '<BAITable\n  dataSource={rows}\n  columns={columns}\n  pagination={{\n    current: page,\n    pageSize,\n    total: totalCount,\n    onChange: (nextPage, nextSize) => setPagination(nextPage, nextSize),\n  }}\n  tableSettings={{\n    columnOverrides,\n    onColumnOverridesChange: setColumnOverrides,\n  }}\n/>',
    },
  ],
} satisfies ComponentDoc;

export default docs;
