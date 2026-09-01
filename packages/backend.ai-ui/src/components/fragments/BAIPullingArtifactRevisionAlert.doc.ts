import type { ComponentDoc } from '@astryxdesign/cli/authoring';

export const docs = {
  type: 'component',
  name: 'BAIPullingArtifactRevisionAlert',
  displayName: 'BAI Pulling Artifact Revision Alert',
  category: 'Feedback & Status',
  keywords: [
    'artifact',
    'revision',
    'pulling',
    'alert',
    'banner',
    'notice',
    'cancel',
  ],
  usage: {
    description:
      'Info banner announcing that one artifact revision is currently being pulled, with a Cancel action in its action slot. It reads `BAIPullingArtifactRevisionAlertFragment` on `ArtifactRevision` (`id`, `status`, `version`) and prints the version in the message. Cancel opens a confirmation modal that warns the pull will restart from the beginning, and on confirm runs the `cancelImportArtifact` mutation with the revision id converted by `toLocalId`; success and failure are reported through the app-shim message API. The component renders one banner per revision and does no filtering of its own — the caller queries the revisions whose status is `PULLING` and maps over them.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Filter to `status: { equals: PULLING }` in the parent query and map the resulting edges, so a revision that finishes disappears on the next fetch.',
      },
      {
        guidance: true,
        description:
          'Refresh the surrounding query from `onOk`, since a successful cancel changes the revision status and the banner should stop rendering.',
      },
      {
        guidance: true,
        description:
          'Stack the banners in a column BAIFlex above the page content, keyed by revision id.',
      },
      {
        guidance: false,
        description:
          'Expect `onOk` on a failed cancel — it fires only after the mutation completes with no GraphQL errors, and the failure path only surfaces an error message.',
      },
      {
        guidance: false,
        description:
          'Add a second confirmation around the Cancel button; the component already opens its own warning modal before mutating.',
      },
    ],
  },
  props: [
    {
      name: 'pullingArtifactRevisionFrgmt',
      type: 'BAIPullingArtifactRevisionAlertFragment$key',
      description:
        'Relay fragment reference for the `ArtifactRevision` being pulled. Its `version` fills the message and its `id` is the cancel-mutation target.',
      required: true,
    },
    {
      name: 'onOk',
      type: '() => void',
      description:
        'Called after the cancel mutation completes without errors, before the success message. Use it to refresh the fetch key of the query that produced the revision.',
    },
  ],
  examples: [
    {
      label: 'One banner per pulling revision',
      code: `<BAIFlex direction="column" gap="sm" align="stretch">
  {pullingArtifacts.map((frgmt) => (
    <BAIPullingArtifactRevisionAlert
      key={frgmt.id}
      pullingArtifactRevisionFrgmt={frgmt}
      onOk={() => updateFetchKey()}
    />
  ))}
</BAIFlex>`,
    },
  ],
} satisfies ComponentDoc;

export default docs;
