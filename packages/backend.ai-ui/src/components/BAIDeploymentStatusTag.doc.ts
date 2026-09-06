import type { ComponentDoc } from '@astryxdesign/cli/authoring';

export const docs = {
  type: 'component',
  name: 'BAIDeploymentStatusTag',
  displayName: 'BAI Deployment Status Tag',
  category: 'Feedback & Status',
  keywords: [
    'deployment status',
    'status tag',
    'lifecycle',
    'health',
    'chip',
    'label',
    'serving',
  ],
  usage: {
    description:
      'The single tag that reports a deployment state, folding lifecycle (DEPLOYING, SCALING, STOPPING, STOPPED, TERMINATED, PENDING, READY) and health (HEALTHY, UNHEALTHY, DEGRADED, NOT_CHECKED) into one chip rather than showing two. It renders BAITag with a semantic colour name resolved from the status and a translated label pulled through useBAIi18n, and it spins a LoaderCircle icon while the deployment is actively processing — DEPLOYING and SCALING, but not PENDING, which is queued rather than working. The module also exports the predicates the rest of the serving UI reads: isDeploymentInStoppedCategory for hiding live-only actions and isDeploymentInProgress for the spinner rule. color is derived and so omitted from the props type; the remaining BAITag props pass through.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Narrow a Relay status field to the exported BAIDeploymentStatus type before passing it — the map has an entry for every member of that union and nothing else.',
      },
      {
        guidance: true,
        description:
          'Gate start-chat, add-revision and lifecycle mutations with isDeploymentInStoppedCategory instead of comparing status strings at the call site, so the stopped set stays defined in one place.',
      },
      {
        guidance: false,
        description:
          'Adding a separate health tag beside it; the health states are already members of the same status union and would duplicate the same fact.',
      },
      {
        guidance: false,
        description:
          'Passing an icon to signal progress — the component sets the icon slot itself after the spread, so a value given here is replaced.',
      },
    ],
  },
  props: [
    {
      name: 'status',
      type: "'HEALTHY' | 'UNHEALTHY' | 'DEGRADED' | 'NOT_CHECKED' | 'DEPLOYING' | 'SCALING' | 'STOPPED' | 'STOPPING' | 'TERMINATED' | 'PENDING' | 'READY'",
      description:
        'The deployment state to display. Selects the semantic colour, the translated label, and whether the spinner icon is shown.',
      required: true,
    },
    {
      name: 'icon',
      type: 'React.ReactNode',
      description:
        'Accepted from BAITag and overridden — the component owns the icon slot so that only the in-progress statuses carry a spinner.',
    },
  ],
  examples: [
    {
      label: 'Deployment detail header',
      code: '<BAIDeploymentStatusTag status={deploymentStatus} />',
    },
    {
      label: 'In a metadata row, next to a history control',
      code: `<MetadataListItem label={t('deployment.Lifecycle')}>
  <BAIFlex align="center" gap="xs">
    <BAIDeploymentStatusTag
      status={deployment.metadata.status as BAIDeploymentStatus}
    />
  </BAIFlex>
</MetadataListItem>`,
    },
  ],
} satisfies ComponentDoc;

export default docs;
