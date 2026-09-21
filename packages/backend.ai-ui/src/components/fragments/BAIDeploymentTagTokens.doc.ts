import type { ComponentDoc } from '@astryxdesign/cli/authoring';

export const docs = {
  type: 'component',
  name: 'BAIDeploymentTagTokens',
  displayName: 'BAI Deployment Tag Tokens',
  category: 'Content',
  keywords: [
    'tag',
    'chip',
    'label',
    'deployment',
    'metadata',
    'token',
    'filter',
  ],
  usage: {
    description:
      'Renders a model deployment’s metadata tags as a wrapping row of default-colour Astryx Tokens — a deployment tag is a user-set label, so it is drawn as a Token rather than a Badge. It reads `BAIDeploymentTagTokens_metadata` on `ModelDeploymentMetadata` — a single `tags` field — so the caller spreads that fragment on the deployment’s `metadata` object and passes it as `metadataFrgmt`. Every entry is split on commas and trimmed, so a legacy comma-joined value becomes one token per tag and blank segments disappear. Supplying `onTagClick` is what makes the tokens interactive: each is passed to Token `onClick`, which renders an accessible inner button (focusable, fires on click and on Enter or Space); without it they are plain, non-interactive labels.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Spread `...BAIDeploymentTagTokens_metadata` on the deployment’s `metadata` field in the parent query and pass `record.metadata`, not the deployment node itself.',
      },
      {
        guidance: true,
        description:
          'Pair `onTagClick` with `stopRowClick` inside a clickable table row, so activating a token navigates to the filtered list without also triggering the row’s own handler.',
      },
      {
        guidance: true,
        description:
          'Give `fallback` something meaningful in a table column — the default renders nothing at all when the deployment has no tags.',
      },
      {
        guidance: false,
        description:
          'Rely on `stopRowClick` when `onTagClick` is absent; propagation is only stopped inside the Token `onClick` handler, which exists only when a click handler is given.',
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
      type: 'BAIDeploymentTagTokens_metadata$key | null | undefined',
      description:
        'Fragment reference for the deployment metadata whose `tags` are rendered. Null, undefined, or an empty tag list all produce `fallback`.',
      required: true,
    },
    {
      name: 'onTagClick',
      type: '(tag: string) => void',
      description:
        'Called with the activated tag on mouse click or Enter/Space. Providing it is what turns the tokens into focusable buttons; omitting it leaves them as static labels.',
    },
    {
      name: 'stopRowClick',
      type: 'boolean',
      description:
        'Stops the click event from bubbling, so a surrounding row handler does not also fire. Only takes effect while `onTagClick` is provided.',
      default: 'false',
    },
    {
      name: 'fallback',
      type: 'React.ReactNode',
      description:
        'Rendered in place of the token row when no tag survives splitting and trimming.',
      default: 'null',
    },
  ],
  examples: [
    {
      label: 'Static tags in a detail card',
      code: '<BAIDeploymentTagTokens metadataFrgmt={deployment.metadata} fallback="-" />',
    },
    {
      label: 'Clickable tags inside a table row',
      code: `<BAIDeploymentTagTokens
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
