import type { ComponentDoc } from '@astryxdesign/cli/authoring';

export const docs = {
  type: 'component',
  name: 'BAIRuntimeVariantPresetTable',
  displayName: 'BAI Runtime Variant Preset Table',
  category: 'Table & List',
  keywords: [
    'runtime variant',
    'preset',
    'table',
    'list',
    'admin',
    'environment variable',
    'argument',
  ],
  usage: {
    description:
      "The preset list on the admin Runtime Variant Preset page. It reads the plural `BAIRuntimeVariantPresetTableFragment` on `RuntimeVariantPreset`, so the caller spreads that fragment on each preset node and passes the array as `presetsFrgmt`; rows whose `id` or `name` is missing are dropped by the fragment's `@required(action: NONE)` and never reach the table. Columns cover name, description, runtime variant and its ID, category and display name, preset target and value type (rendered through localized label maps, falling back to the raw enum), default value, key, required flag, rank with an explanatory tooltip, created and modified time. Four of those columns are feature-gated by the connected client — runtime variant, category, display name and required appear only when the server advertises support — so a connected BAI client must be above the table. Description, category, display name, default value and modified time start hidden in the table settings, and the name column is marked required so it cannot be hidden away with its row actions. Sorting is offered only on name, rank and created at. Everything except `dataSource`, `columns` and `onChangeOrder` passes through to BAITable.",
    bestPractices: [
      {
        guidance: true,
        description:
          'Attach the per-row edit and delete controls by overriding the `name` column through `customizeColumns` — it is the column pinned left and protected from being hidden.',
      },
      {
        guidance: true,
        description:
          'Set `disableSorter` when the surrounding query cannot order the list, so no column offers a sort affordance that would do nothing.',
      },
      {
        guidance: true,
        description:
          "Persist the user's column choices through BAITable's `tableSettings`, since several useful columns ship hidden by default.",
      },
      {
        guidance: false,
        description:
          'Assume every column is present — runtime variant, category, display name and required render only against a server version that supports them.',
      },
      {
        guidance: false,
        description:
          'Treat `onChangeOrder` as covering all columns; only name, rank and created at can emit a value.',
      },
    ],
  },
  props: [
    {
      name: 'presetsFrgmt',
      type: 'BAIRuntimeVariantPresetTableFragment$key',
      description:
        'Plural fragment reference for the rows. Spread `BAIRuntimeVariantPresetTableFragment` on each `RuntimeVariantPreset`; rows are keyed by `id`.',
      required: true,
    },
    {
      name: 'customizeColumns',
      type: '(baseColumns: BAIColumnsType<RuntimeVariantPresetNodeInList>) => BAIColumnsType<RuntimeVariantPresetNodeInList>',
      description:
        'Transforms the base column list, which already has the unsupported feature-gated columns removed. Its return value is used verbatim.',
    },
    {
      name: 'disableSorter',
      type: 'boolean',
      description:
        'Strips the `sorter` flag from every column, so the table renders read-only headers and `onChangeOrder` never fires.',
    },
    {
      name: 'onChangeOrder',
      type: "(order: 'name' | 'rank' | 'createdAt' | '-name' | '-rank' | '-createdAt' | null) => void",
      description:
        'Called with the order string to send to the server when sorting changes, or `null` when the sort is cleared.',
    },
  ],
  examples: [
    {
      label: 'Preset list with server-side ordering and pagination',
      code: `<BAIRuntimeVariantPresetTable
  presetsFrgmt={presetHostNodes}
  loading={isRefetching}
  order={order}
  tableSettings={tableSettings}
  pagination={{
    pageSize,
    current,
    total: runtimeVariantPresets?.count ?? 0,
    onChange: (nextCurrent, nextPageSize) => reload(nextCurrent, nextPageSize),
  }}
  onChangeOrder={(nextOrder) => setOrder(nextOrder)}
/>`,
    },
  ],
} satisfies ComponentDoc;

export default docs;
