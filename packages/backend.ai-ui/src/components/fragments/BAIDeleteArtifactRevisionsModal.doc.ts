import type { ComponentDoc } from '@astryxdesign/cli/authoring';

export const docs = {
  type: 'component',
  name: 'BAIDeleteArtifactRevisionsModal',
  displayName: 'BAI Delete Artifact Revisions Modal',
  category: 'Overlay',
  keywords: [
    'artifact',
    'revision',
    'version',
    'delete',
    'remove',
    'cleanup',
    'reservoir',
    'modal',
  ],
  usage: {
    description:
      'Confirmation modal for removing pulled artifact revisions from storage, used on the Reservoir artifact detail page. It reads two fragments the caller must spread: `BAIDeleteArtifactRevisionsModalArtifactFragment` on the single `Artifact` (which also spreads `BAIArtifactDescriptionsFragment` to render the artifact summary above the table) and the plural `BAIDeleteArtifactRevisionsModalArtifactRevisionFragment` on the selected `ArtifactRevision` rows. Revisions whose status is `PULLING` or `SCANNED` cannot be cleaned up: they are filtered out of the `cleanupArtifactRevisions` input and, when any were dropped, a BAIAlert names how many were excluded — but the table still lists every selected revision with its version and human-readable size. The confirm button is danger-styled and stays disabled while the mutation is in flight or when nothing survives the filter. Remaining props are spread onto BAIModal last, so a caller-supplied `title` or `okText` wins; `onOk` and `onCancel` are owned by this component and are required.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Spread both fragments in the detail page query — the artifact one on the artifact node, the revision one on the rows the table selects from — and pass the current selection as `selectedArtifactRevisionFrgmt`.',
      },
      {
        guidance: true,
        description:
          'Gate the open state on both inputs being present (an artifact and a non-empty revision selection), since with no artifact the summary section is skipped entirely.',
      },
      {
        guidance: true,
        description:
          'Clear the selection in `onOk` and refresh the revision list; the mutation returns only the new `status` of the cleaned-up revisions.',
      },
      {
        guidance: false,
        description:
          'Filter `PULLING` or `SCANNED` revisions out before passing them — the modal needs them to count and report the exclusions in its alert.',
      },
      {
        guidance: false,
        description:
          'Read the table as the list of what will be removed; it shows the whole selection, while only the non-`PULLING`, non-`SCANNED` entries are sent.',
      },
    ],
  },
  props: [
    {
      name: 'selectedArtifactFrgmt',
      type: 'BAIDeleteArtifactRevisionsModalArtifactFragment$key | null',
      description:
        'Fragment reference for the artifact the revisions belong to. It feeds the BAIArtifactDescriptions summary shown above the table; when `null`, that summary is omitted and the rest of the modal still works.',
      required: true,
    },
    {
      name: 'selectedArtifactRevisionFrgmt',
      type: 'BAIDeleteArtifactRevisionsModalArtifactRevisionFragment$key',
      description:
        'Plural fragment reference for the selected revisions, selecting `id`, `version`, `size` and `status`. It populates the table in full, while only entries outside `PULLING` and `SCANNED` are sent to `cleanupArtifactRevisions`.',
      required: true,
    },
    {
      name: 'onOk',
      type: '(e: React.MouseEvent<HTMLElement>) => void',
      description:
        'Called after `cleanupArtifactRevisions` returns a payload with no errors, never on failure. Required.',
      required: true,
    },
    {
      name: 'onCancel',
      type: "NonNullable<BAIModalProps['onCancel']>",
      description:
        'Called when the user dismisses the modal. Required, because the caller owns the open state that the selection derives from.',
      required: true,
    },
  ],
  examples: [
    {
      label: 'Removing selected revisions from the artifact detail page',
      code: `<BAIDeleteArtifactRevisionsModal
  selectedArtifactFrgmt={artifact ?? null}
  selectedArtifactRevisionFrgmt={selectedDeleteRevisions}
  open={!!artifact && !_.isEmpty(selectedDeleteRevisions)}
  onOk={() => {
    setSelectedDeleteRevisions([]);
  }}
  onCancel={() => {
    setSelectedDeleteRevisions([]);
  }}
/>`,
    },
  ],
} satisfies ComponentDoc;

export default docs;
