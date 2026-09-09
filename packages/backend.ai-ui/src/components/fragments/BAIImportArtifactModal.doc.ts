import type { ComponentDoc } from '@astryxdesign/cli/authoring';

export const docs = {
  type: 'component',
  name: 'BAIImportArtifactModal',
  displayName: 'BAI Import Artifact Modal',
  category: 'Overlay',
  keywords: [
    'artifact',
    'import',
    'pull',
    'download',
    'revision',
    'version',
    'reservoir',
    'modal',
  ],
  usage: {
    description:
      'Confirmation modal for pulling artifact revisions into the local reservoir, used from both the Reservoir list and the artifact detail page. It reads two fragments the caller must spread: `BAIImportArtifactModalArtifactFragment` on the single `Artifact` (whose `id` and `name` are `@required(action: THROW)`, and which also spreads `BAIArtifactDescriptionsFragment` for the summary above the table) and the plural `BAIImportArtifactModalArtifactRevisionFragment` on the selected `ArtifactRevision` rows. Only revisions with status `SCANNED` can be pulled: the table lists just those, and a BAIAlert appears when the selection contained others, naming how many were excluded. Confirming runs `importArtifacts`, and its `@appendEdge` directive inserts the returned revisions into the Relay connections named by `connectionIds`, so a list showing pulling revisions updates without a refetch. `onOk` receives the started background tasks — those with a non-null `taskId`, each carrying the revision `version` and the artifact’s local id and name — for the caller to turn into progress notifications. Remaining props are spread onto BAIModal last, so a caller-supplied `title` or `okText` wins.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Pass the `__id` of every connection that renders pulling revisions in `connectionIds`, so the new revisions appear immediately instead of waiting for the next fetch.',
      },
      {
        guidance: true,
        description:
          'Turn each task handed to `onOk` into a background-task notification keyed by its `taskId`; the mutation only starts the pull, it does not wait for it.',
      },
      {
        guidance: true,
        description:
          'Gate the open state on both an artifact and a non-empty revision selection, and clear the selection in `onOk` so the modal closes once the pull is queued.',
      },
      {
        guidance: false,
        description:
          'Filter the selection down to `SCANNED` before passing it — the modal needs the rest to count and report the exclusions in its alert.',
      },
      {
        guidance: false,
        description:
          'Rely on `connectionIds` for anything but the appended revision edges; the artifact row’s own counters still need a refetch.',
      },
    ],
  },
  props: [
    {
      name: 'selectedArtifactFrgmt',
      type: 'BAIImportArtifactModalArtifactFragment$key | null',
      description:
        'Fragment reference for the artifact being pulled from. It feeds the BAIArtifactDescriptions summary and supplies the id and name attached to each task reported through `onOk`; when `null`, the summary is omitted and those fields fall back to empty strings.',
      required: true,
    },
    {
      name: 'selectedArtifactRevisionFrgmt',
      type: 'BAIImportArtifactModalArtifactRevisionFragment$key',
      description:
        'Plural fragment reference for the selected revisions, selecting `id`, `version`, `size` and `status`. Only the `SCANNED` entries are listed in the table and sent to `importArtifacts`.',
      required: true,
    },
    {
      name: 'onOk',
      type: '(e: React.MouseEvent<HTMLElement>, tasks: { taskId: string; version: string; artifact: { id: string; name: string } }[]) => void',
      description:
        'Called after `importArtifacts` returns a payload with no errors, with the started tasks that have a non-null `taskId`. Not called on failure. Required.',
      required: true,
    },
    {
      name: 'onCancel',
      type: "NonNullable<BAIModalProps['onCancel']>",
      description:
        'Called when the user dismisses the modal. Required, because the caller owns the open state that the selection derives from.',
      required: true,
    },
    {
      name: 'connectionIds',
      type: 'string[]',
      description:
        'Relay connection ids the newly pulled revision edges are appended to. Omitted, an empty list is sent and nothing is inserted into the store.',
    },
  ],
  examples: [
    {
      label: 'Pulling revisions and tracking each task as a notification',
      code: `<BAIImportArtifactModal
  selectedArtifactFrgmt={artifact ?? null}
  selectedArtifactRevisionFrgmt={selectedRevisions}
  open={!!artifact && !_.isEmpty(selectedRevisions)}
  connectionIds={
    artifact?.pullingArtifactRevisions
      ? [artifact.pullingArtifactRevisions.__id]
      : undefined
  }
  onOk={(_e, tasks) => {
    setSelectedRevisions([]);
    tasks.forEach((task) => {
      upsertNotification({
        message: t('reservoirPage.PullingArtifact', {
          name: task.artifact.name,
          version: task.version,
        }),
        type: 'info',
        open: true,
        duration: 0,
        backgroundTask: { status: 'pending', taskId: task.taskId, promise: null, percent: 0 },
      });
    });
  }}
  onCancel={() => setSelectedRevisions([])}
/>`,
    },
  ],
} satisfies ComponentDoc;

export default docs;
