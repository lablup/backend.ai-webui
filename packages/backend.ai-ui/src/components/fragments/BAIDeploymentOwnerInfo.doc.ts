import type { ComponentDoc } from '@astryxdesign/cli/authoring';

export const docs = {
  type: 'component',
  name: 'BAIDeploymentOwnerInfo',
  displayName: 'BAI Deployment Owner Info',
  category: 'Content',
  keywords: [
    'deployment',
    'owner',
    'creator',
    'user',
    'email',
    'model service',
  ],
  usage: {
    description:
      'Owner cell for a model deployment: the creator’s email, truncated to 200px, wrapped in a tooltip that spells out who created it. It reads `BAIDeploymentOwnerInfo_deployment` on `ModelDeployment`, selecting `creator` — guarded by `@since(version: "26.4.3")` — and that creator’s `email`, `username` and `fullName`, so the caller spreads that fragment on the deployment node and passes the node as `deploymentFrgmt`. The tooltip stacks three lines: a "Created by" label, the full name (falling back to the username, then the email), and the email itself. When no email resolves — an older manager where `creator` is absent, or a deployment with no creator — it renders a secondary-coloured dash instead.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Spread `...BAIDeploymentOwnerInfo_deployment` on the `ModelDeployment` node in the list or detail query and hand the whole record to `deploymentFrgmt`, as BAIModelDeploymentNodes does in its owner column.',
      },
      {
        guidance: true,
        description:
          'Reserve at least 200px for the cell — the email clamps at that width, and everything past it is only reachable through the tooltip.',
      },
      {
        guidance: true,
        description:
          'Treat the dash as a normal state on managers older than 26.4.3, where the `creator` field is not served at all.',
      },
      {
        guidance: false,
        description:
          'Wrap it in another tooltip or in a truncating parent — it already owns both, and the inner text explicitly suppresses its own ellipsis tooltip so the outer one is the only description.',
      },
      {
        guidance: false,
        description:
          'Use it to identify the account a deployment runs as; the fragment reads the creator of the deployment, which is not necessarily its current owner or session user.',
      },
    ],
  },
  props: [
    {
      name: 'deploymentFrgmt',
      type: 'BAIDeploymentOwnerInfo_deployment$key | null | undefined',
      description:
        'Fragment reference for the deployment whose creator is shown. Null, undefined, or a creator without an email all render the secondary dash.',
      required: true,
    },
  ],
  examples: [
    {
      label: 'Owner column in a deployment table',
      code: `{
  key: 'owner',
  title: t('comp:BAIModelDeploymentNodes.Owner'),
  render: (__, record) => <BAIDeploymentOwnerInfo deploymentFrgmt={record} />,
}`,
    },
  ],
} satisfies ComponentDoc;

export default docs;
