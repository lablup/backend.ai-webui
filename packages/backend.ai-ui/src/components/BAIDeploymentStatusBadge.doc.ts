import type { ComponentDoc } from '@astryxdesign/cli/authoring';

export const docs = {
  type: 'component',
  name: 'BAIDeploymentStatusBadge',
  displayName: 'BAI Deployment Status Badge',
  category: 'Feedback & Status',
  keywords: [
    'deployment status',
    'status badge',
    'status tag',
    'lifecycle',
    'health',
    'badge',
    'label',
    'serving',
  ],
  usage: {
    description:
      "The single badge that reports a deployment state, folding lifecycle (DEPLOYING, SCALING, STOPPING, STOPPED, TERMINATED, PENDING, READY) and health (HEALTHY, UNHEALTHY, DEGRADED, NOT_CHECKED) into one badge rather than showing two. The system changes this value on its own, so it renders an Astryx Badge whose variant comes from `badgeVariantForStatus('deployment', status)` and a translated label pulled through useBAIi18n, and it spins a LoaderCircle icon while the deployment is actively processing — DEPLOYING and SCALING, but not PENDING, which is queued rather than working. The module also exports the predicates the rest of the serving UI reads: isDeploymentInStoppedCategory for hiding live-only actions and isDeploymentInProgress for the spinner rule. variant and label are derived and so omitted from the props type; the remaining Astryx Badge props pass through.",
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
          'Adding a separate health badge beside it; the health states are already members of the same status union and would duplicate the same fact.',
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
        'Accepted from Astryx Badge and overridden — the component owns the icon slot so that only the in-progress statuses carry a spinner.',
    },
  ],
  examples: [
    {
      label: 'Deployment detail header',
      code: '<BAIDeploymentStatusBadge status={deploymentStatus} />',
    },
    {
      label: 'In a metadata row, next to a history control',
      code: `<MetadataListItem label={t('deployment.Lifecycle')}>
  <BAIFlex align="center" gap="xs">
    <BAIDeploymentStatusBadge
      status={deployment.metadata.status as BAIDeploymentStatus}
    />
  </BAIFlex>
</MetadataListItem>`,
    },
  ],
} satisfies ComponentDoc;

export default docs;
