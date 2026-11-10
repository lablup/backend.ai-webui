import type { ComponentDoc } from '@astryxdesign/cli/authoring';

export const docs = {
  type: 'component',
  name: 'BAIActivateArtifactsModal',
  displayName: 'BAI Activate Artifacts Modal',
  category: 'Overlay',
  keywords: [
    'artifact',
    'activate',
    'restore',
    'reservoir',
    'confirm',
    'modal',
    'bulk action',
  ],
  usage: {
    description:
      'Confirmation modal for putting one or more deactivated artifacts back into service on the Reservoir page. It reads a plural `BAIActivateArtifactsModalArtifactsFragment` on `Artifact` (selecting `id`, `entityId` and `name`), so the caller spreads that fragment on the artifact rows it selects from and passes the selected array as `selectedArtifactsFragment`. Confirming runs the `partialBulkRestoreArtifacts` mutation over the `entityId`s of that array. When every artifact is activated it shows a success message; when any fail (or the request itself is rejected, which counts every artifact as failed) it shows an error message with the count and lists the failed artifacts with their reasons in BAIBulkErrorModal. Either way it calls `onOk` once the request settles, passing the Relay ids of the failed artifacts. Its content is wrapped in BAIUnmountAfterClose so it unmounts once the modal has closed; remaining props go to BAIModal, but `onOk`, `onCancel`, `okText` and `okButtonProps` are applied after the spread and cannot be overridden.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Hold the selected artifacts in state typed as `BAIActivateArtifactsModalArtifactsFragmentKey` and derive the open state from that array being non-empty, so opening the modal and feeding it data are one decision.',
      },
      {
        guidance: true,
        description:
          'In `onOk`, close the modal, refetch the list when anything succeeded, and keep only `failedArtifactIds` selected so the next activate retries them.',
      },
      {
        guidance: true,
        description:
          'Keep the array non-empty while the modal is open: the body reads the first entry’s `name` in the single-artifact case and falls back to a count otherwise.',
      },
      {
        guidance: false,
        description:
          'Pass `okText` or `okButtonProps` expecting them to apply — this modal sets both after spreading the rest of the props.',
      },
      {
        guidance: false,
        description:
          'Show your own success or failure toast from `onOk`; the modal already reports the mutation result.',
      },
    ],
  },
  props: [
    {
      name: 'selectedArtifactsFragment',
      type: 'BAIActivateArtifactsModalArtifactsFragment$key',
      description:
        'Plural fragment reference for the artifacts to activate. Its `entityId`s become the `partialBulkRestoreArtifacts` input and its `name` drives the confirmation copy; an empty array renders the plural message with a count of 0.',
      required: true,
    },
    {
      name: 'onOk',
      type: '(e: React.MouseEvent<HTMLButtonElement>, failedArtifactIds: string[]) => void',
      description:
        'Called once the request settles, with the Relay ids of the artifacts that were not activated (empty when all succeeded). Close the modal, refetch, and keep the failed ones selected here.',
    },
    {
      name: 'onCancel',
      type: '(e: React.MouseEvent<HTMLElement>) => void',
      description:
        'Called when the user dismisses the modal. The event is forwarded unchanged and no mutation runs.',
    },
  ],
  examples: [
    {
      label: 'Activating the selected artifacts on the Reservoir page',
      code: `<BAIActivateArtifactsModal
  open={!!selectedRestoreArtifacts.length}
  selectedArtifactsFragment={selectedRestoreArtifacts}
  onCancel={() => setSelectedRestoreArtifacts([])}
  onOk={(_e, failedArtifactIds) => {
    updateFetchKey();
    setSelectedRestoreArtifacts([]);
    setSelectedArtifactIdList((prev) =>
      prev.filter((v) => failedArtifactIds.includes(v.id)),
    );
  }}
/>`,
    },
  ],
} satisfies ComponentDoc;

export default docs;
