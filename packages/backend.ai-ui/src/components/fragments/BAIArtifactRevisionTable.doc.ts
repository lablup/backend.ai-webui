import type { ComponentDoc } from '@astryxdesign/cli/authoring';

export const docs = {
  type: 'component',
  name: 'BAIArtifactRevisionTable',
  displayName: 'BAI Artifact Revision Table',
  category: 'Table & List',
  keywords: [
    'artifact',
    'revision',
    'version',
    'table',
    'list',
    'history',
    'reservoir',
  ],
  usage: {
    description:
      'The version list on the artifact detail page. It reads two fragments: the plural `BAIArtifactRevisionTableArtifactRevisionFragment` on `ArtifactRevision` for the rows (spread it on each revision node and pass the array), and the single `BAIArtifactRevisionTableLatestRevisionFragment` for the newest revision so that row can be badged "Latest". The revision fragment also pulls the status-tag, download-button and delete-button fragments, so those child components can be fed the same record inside a custom column. Four base columns are built internally — version (with the Latest badge and a `PULLED` tag), status, size and updated — and `customizeColumns` lets the caller reorder them or splice in a controls column. Rows are keyed by revision id, resizing is on, and every other BAITable prop except `dataSource`, `columns` and `rowKey` passes through.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Use `customizeColumns` to insert a per-row action column rather than rendering a parallel table, and build that column from the base array the callback receives.',
      },
      {
        guidance: true,
        description:
          'Feed `latestRevisionFrgmt` from a separate `limit: 1` revisions selection ordered by version descending, so the Latest badge stays correct when the table is paged or filtered.',
      },
      {
        guidance: true,
        description:
          'Wire `pagination` and `rowSelection` from the parent, since the component keeps no selection or page state of its own.',
      },
      {
        guidance: false,
        description:
          'Mutate the base column array inside `customizeColumns` — return a new array built from its entries instead.',
      },
      {
        guidance: false,
        description:
          'Skip `latestRevisionFrgmt` when the value is merely still loading; it accepts null or undefined and simply renders no Latest badge, which silently looks like a correct result.',
      },
    ],
  },
  props: [
    {
      name: 'artifactRevisionFrgmt',
      type: 'BAIArtifactRevisionTableArtifactRevisionFragment$key',
      description:
        'Plural Relay fragment reference — the array of `ArtifactRevision` nodes rendered as rows, in the order given.',
      required: true,
    },
    {
      name: 'latestRevisionFrgmt',
      type: 'BAIArtifactRevisionTableLatestRevisionFragment$key | null | undefined',
      description:
        'Fragment reference for the newest revision; the row whose id matches gets the blue "Latest" badge. Null or undefined renders every row without the badge.',
      required: true,
    },
    {
      name: 'customizeColumns',
      type: '(baseColumns: BAIColumnType<ArtifactRevision>[]) => BAIColumnType<ArtifactRevision>[]',
      description:
        'Transforms the four base columns (version, status, size, updated) into the final column set. Left unset, the base columns are used as-is.',
    },
  ],
  examples: [
    {
      label: 'Version list with a spliced-in controls column',
      code: `<BAIArtifactRevisionTable
  artifactRevisionFrgmt={filterOutNullAndUndefined(
    artifact?.revisions?.edges?.map((e) => e.node),
  )}
  latestRevisionFrgmt={artifact?.latestVersion?.edges[0]?.node}
  loading={deferredQueryVariables !== queryVariables}
  customizeColumns={(baseColumns) => [
    baseColumns[0], // Version
    baseColumns[1], // Status
    controlColumn,
    ...baseColumns.slice(2),
  ]}
/>`,
    },
  ],
} satisfies ComponentDoc;

export default docs;
