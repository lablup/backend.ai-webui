import type { ComponentDoc } from '@astryxdesign/cli/authoring';

export const docs = {
  type: 'component',
  name: 'BAIEntityLabelTokens',
  displayName: 'BAI Entity Label Tokens',
  category: 'Content',
  keywords: ['label', 'entity label', 'key value', 'token', 'filter'],
  usage: {
    description:
      'Shows the `key=value` labels on one entity as Tokens. It reads `BAIEntityLabelTokensFragment` on `EntityLabelConnection`, so the caller spreads it inside the `entityLabels` field every labelable node (SessionV2, VFolder, ModelDeployment, ResourceGroup, …) carries. With `onLabelClick` each token is a button; pair it with `toEntityLabelFilter(label)` to filter a list by the clicked label.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Select `entityLabels(limit: 100)` — without a page size the manager returns 10 labels.',
      },
      {
        guidance: true,
        description:
          'Inside a table row pass `stopRowClick` so a token click does not also select the row.',
      },
    ],
  },
  props: [
    {
      name: 'entityLabelsFrgmt',
      type: 'BAIEntityLabelTokensFragment$key | null | undefined',
      description: 'The entity’s `entityLabels` connection.',
      required: true,
    },
    {
      name: 'onLabelClick',
      type: '(label: { key: string; value: string }) => void',
      description: 'Makes tokens clickable and reports the clicked label.',
    },
    {
      name: 'stopRowClick',
      type: 'boolean',
      description: 'Stops a token click from bubbling to the row.',
    },
    {
      name: 'fallback',
      type: 'ReactNode',
      description: 'Rendered when the entity has no labels.',
    },
  ],
  examples: [
    {
      label: 'Navigate to a filtered list',
      code: `<BAIEntityLabelTokens
  entityLabelsFrgmt={deployment.entityLabels}
  onLabelClick={(label) =>
    navigate({ search: new URLSearchParams({ filter: JSON.stringify(toEntityLabelFilter(label)) }).toString() })
  }
/>`,
    },
  ],
} satisfies ComponentDoc;

export default docs;
