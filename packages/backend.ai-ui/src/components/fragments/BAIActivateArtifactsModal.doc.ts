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
      'Confirmation modal for putting one or more deactivated artifacts back into service on the Reservoir page. It reads a plural `BAIActivateArtifactsModalArtifactsFragment` on `Artifact` (selecting `id` and `name`), so the caller spreads that fragment on the artifact rows it selects from and passes the selected array as `selectedArtifactsFragment`. Confirming runs the `restoreArtifacts` mutation over the local ids of that array, reports success or every returned error through the app-shim message API, and calls `onOk` only after the mutation completes without errors. Its content is wrapped in BAIUnmountAfterClose so it unmounts once the modal has closed; remaining props go to BAIModal, but `onOk`, `onCancel`, `okText` and `okButtonProps` are applied after the spread and cannot be overridden.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Hold the selected artifacts in state typed as `BAIActivateArtifactsModalArtifactsFragmentKey` and derive the open state from that array being non-empty, so opening the modal and feeding it data are one decision.',
      },
      {
        guidance: true,
        description:
          'Clear the selection and refresh the artifact list inside `onOk` — the mutation returns only `id` and `availability`, so anything else the row shows needs a refetch.',
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
        'Plural fragment reference for the artifacts to activate. Its ids become the `restoreArtifacts` input and its `name` drives the confirmation copy; an empty array renders the plural message with a count of 0.',
      required: true,
    },
    {
      name: 'onOk',
      type: '(e: React.MouseEvent<HTMLElement>) => void',
      description:
        'Called after `restoreArtifacts` completes with no errors, never on failure. Clear the selection and refetch here.',
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
  onOk={() => {
    updateFetchKey();
    setSelectedRestoreArtifacts([]);
    setSelectedArtifactIdList([]);
  }}
/>`,
    },
  ],
} satisfies ComponentDoc;

export default docs;
