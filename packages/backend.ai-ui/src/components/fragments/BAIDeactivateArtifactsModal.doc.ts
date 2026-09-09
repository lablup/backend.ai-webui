import type { ComponentDoc } from '@astryxdesign/cli/authoring';

export const docs = {
  type: 'component',
  name: 'BAIDeactivateArtifactsModal',
  displayName: 'BAI Deactivate Artifacts Modal',
  category: 'Overlay',
  keywords: [
    'artifact',
    'deactivate',
    'disable',
    'reservoir',
    'confirm',
    'modal',
    'bulk action',
  ],
  usage: {
    description:
      'Confirmation modal for taking one or more artifacts out of service on the Reservoir page. It reads a plural `BAIDeactivateArtifactsModalArtifactsFragment` on `Artifact` (selecting `id` and `name`), so the caller spreads that fragment on the artifact rows it selects from and passes the selected array as `selectedArtifactsFragment`. Confirming runs the `deleteArtifacts` mutation over the local ids of that array — which flips `availability` rather than destroying the artifact, so BAIActivateArtifactsModal can reverse it — reports the result through the app-shim message API, and calls `onOk` only when no errors came back. The confirm button is styled as danger and shows a loading state while the mutation is in flight. Its content is wrapped in BAIUnmountAfterClose; remaining props are spread onto BAIModal last, so a caller-supplied `title`, `okText` or `okButtonProps` wins.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Hold the selected artifacts in state typed as `BAIDeactivateArtifactsModalArtifactsFragmentKey` and derive the open state from that array being non-empty.',
      },
      {
        guidance: true,
        description:
          'Clear the selection and refresh the artifact list inside `onOk`; the mutation returns only `id` and `availability`.',
      },
      {
        guidance: true,
        description:
          'Reach for this modal rather than BAIDeleteConfirmModal — deactivation is reversible, so it needs a confirm step but not a typed-confirmation gate.',
      },
      {
        guidance: false,
        description:
          'Override `okButtonProps` without re-declaring `danger` and `loading`; the spread replaces the object wholesale and the in-flight state would be lost.',
      },
      {
        guidance: false,
        description:
          'Open it with an empty array — the body then reads as a count of 0 and the mutation would run over no ids.',
      },
    ],
  },
  props: [
    {
      name: 'selectedArtifactsFragment',
      type: 'BAIDeactivateArtifactsModalArtifactsFragment$key',
      description:
        'Plural fragment reference for the artifacts to deactivate. Its ids become the `deleteArtifacts` input and its `name` drives the confirmation copy; the single-artifact message is used only when exactly one entry is present.',
      required: true,
    },
    {
      name: 'onOk',
      type: '(e: React.MouseEvent<HTMLElement>) => void',
      description:
        'Called after `deleteArtifacts` completes with no errors, never on failure. Clear the selection and refetch here.',
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
      label: 'Deactivating the selected artifacts on the Reservoir page',
      code: `<BAIDeactivateArtifactsModal
  open={!!selectedArtifacts.length}
  selectedArtifactsFragment={selectedArtifacts}
  onCancel={() => setSelectedArtifacts([])}
  onOk={() => {
    updateFetchKey();
    setSelectedArtifacts([]);
    setSelectedArtifactIdList([]);
  }}
/>`,
    },
  ],
} satisfies ComponentDoc;

export default docs;
