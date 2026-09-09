import type { ComponentDoc } from '@astryxdesign/cli/authoring';

export const docs = {
  type: 'component',
  name: 'BAIDeploymentTagChips',
  displayName: 'BAI Deployment Tag Chips',
  category: 'Content',
  keywords: [
    'tag',
    'chip',
    'label',
    'deployment',
    'metadata',
    'badge',
    'filter',
  ],
  usage: {
    description:
      'Renders a model deployment’s metadata tags as a wrapping row of neutral Badge chips. It reads `BAIDeploymentTagChips_metadata` on `ModelDeploymentMetadata` — a single `tags` field — so the caller spreads that fragment on the deployment’s `metadata` object and passes it as `metadataFrgmt`. Every entry is split on commas and trimmed, so a legacy comma-joined value becomes one chip per tag and blank segments disappear. Supplying `onTagClick` is what makes the chips interactive: they then carry `role="button"`, are focusable, and fire on click as well as on Enter or Space; without it they are plain, non-interactive tags.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Spread `...BAIDeploymentTagChips_metadata` on the deployment’s `metadata` field in the parent query and pass `record.metadata`, not the deployment node itself.',
      },
      {
        guidance: true,
        description:
          'Pair `onTagClick` with `stopRowClick` inside a clickable table row, so activating a chip navigates to the filtered list without also triggering the row’s own handler.',
      },
      {
        guidance: true,
        description:
          'Give `fallback` something meaningful in a table column — the default renders nothing at all when the deployment has no tags.',
      },
      {
        guidance: false,
        description:
          'Rely on `stopRowClick` when `onTagClick` is absent; propagation is only stopped inside the interactive branch, which exists only when a click handler is given.',
      },
      {
        guidance: false,
        description:
          'Pre-split comma-joined tags before passing them in — the component already splits and trims each entry, and doing it twice only risks dropping intended commas.',
      },
    ],
  },
  props: [
    {
      name: 'metadataFrgmt',
      type: 'BAIDeploymentTagChips_metadata$key | null | undefined',
      description:
        'Fragment reference for the deployment metadata whose `tags` are rendered. Null, undefined, or an empty tag list all produce `fallback`.',
      required: true,
    },
    {
      name: 'onTagClick',
      type: '(tag: string) => void',
      description:
        'Called with the activated tag on mouse click or Enter/Space. Providing it is what turns the chips into focusable buttons; omitting it leaves them as static tags.',
    },
    {
      name: 'stopRowClick',
      type: 'boolean',
      description:
        'Stops click and Enter/Space events from bubbling, so a surrounding row handler does not also fire. Only takes effect while `onTagClick` is provided.',
      default: 'false',
    },
    {
      name: 'fallback',
      type: 'React.ReactNode',
      description:
        'Rendered in place of the chip row when no tag survives splitting and trimming.',
      default: 'null',
    },
  ],
  examples: [
    {
      label: 'Static tags in a detail card',
      code: '<BAIDeploymentTagChips metadataFrgmt={deployment.metadata} fallback="-" />',
    },
    {
      label: 'Clickable tags inside a table row',
      code: `<BAIDeploymentTagChips
  metadataFrgmt={record.metadata}
  stopRowClick
  onTagClick={(tag) => {
    webuiNavigate({
      pathname: buildProjectPath('deployments'),
      search: new URLSearchParams({
        filter: JSON.stringify({ tags: { iContains: tag } }),
      }).toString(),
    });
  }}
/>`,
    },
  ],
} satisfies ComponentDoc;

export default docs;
