import type { ComponentDoc } from '@astryxdesign/cli/authoring';

export const docs = {
  type: 'component',
  name: 'BAIArtifactTable',
  displayName: 'BAI Artifact Table',
  category: 'Table & List',
  keywords: [
    'artifact',
    'reservoir',
    'table',
    'list',
    'grid',
    'registry',
    'model store',
  ],
  usage: {
    description:
      'The artifact list of the Reservoir page. It reads the plural fragment `BAIArtifactTableArtifactFragment` on `Artifact`, so the caller passes an ARRAY of artifact nodes (spread the fragment on the connection node and filter out nulls before handing it over). The fragment already pulls the latest revision, the type tag and the status tag, so no extra selection is needed at the call site. Columns are fixed and built internally: name with description and BAIArtifactTypeTag, an availability control (Deactivate when `ALIVE`, Activate when `DELETED`, nothing otherwise), latest version with BAIArtifactStatusTag and a pull button shown only while that revision is `SCANNED`, size, scanned and updated relative times, plus registry and source columns that ship hidden by default. Everything except `dataSource`, `columns` and `rowKey` passes through to BAITable — loading, pagination, rowSelection, onRow and the rest.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Resolve the three callbacks against the same connection you fed the fragment from — each one receives an id, and the page looks the node back up to open the matching modal.',
      },
      {
        guidance: true,
        description:
          'Drive `loading` from the deferred-variables comparison so the table dims while a filter or page change is in flight rather than unmounting.',
      },
      {
        guidance: true,
        description:
          'Copy the artifact array before sorting or reversing it — the fragment data is frozen in the Relay store and the table renders it in the order given.',
      },
      {
        guidance: false,
        description:
          'Pass `columns` or `rowKey`; they are omitted from the props type because the component owns the column set and keys rows by artifact id.',
      },
      {
        guidance: false,
        description:
          'Assume the pull button is present on every row — it renders only when the latest revision status is `SCANNED`, and it is disabled while the artifact availability is not `ALIVE`.',
      },
    ],
  },
  props: [
    {
      name: 'artifactFragment',
      type: 'BAIArtifactTableArtifactFragment$key',
      description:
        'Plural Relay fragment reference — an array of `Artifact` nodes. Nulls are filtered out before rendering, so an empty array renders the table with its empty state.',
      required: true,
    },
    {
      name: 'onClickPull',
      type: '(artifactId: string, revisionId: string) => void',
      description:
        'Called with the artifact id and its latest revision id when the pull button in the latest-version column is clicked. Open the import modal here; the component itself performs no mutation.',
      required: true,
    },
    {
      name: 'onClickDelete',
      type: '(artifactId: string) => void',
      description:
        'Called with the artifact id when the Deactivate control is clicked, which is rendered only for rows whose availability is `ALIVE`.',
      required: true,
    },
    {
      name: 'onClickRestore',
      type: '(artifactId: string) => void',
      description:
        'Called with the artifact id when the Activate control is clicked, which is rendered only for rows whose availability is `DELETED`.',
      required: true,
    },
  ],
  examples: [
    {
      label: 'Reservoir artifact list',
      code: `<BAIArtifactTable
  artifactFragment={filterOutEmpty(artifacts?.edges.map((e) => e?.node) ?? [])}
  loading={deferredQueryVariables !== queryVariables}
  onClickPull={(artifactId, revisionId) => openImportModal(artifactId, revisionId)}
  onClickDelete={(artifactId) => openDeactivateModal(artifactId)}
  onClickRestore={(artifactId) => openActivateModal(artifactId)}
/>`,
    },
  ],
} satisfies ComponentDoc;

export default docs;
