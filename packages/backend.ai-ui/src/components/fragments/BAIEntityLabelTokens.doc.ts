import type { ComponentDoc } from '@astryxdesign/cli/authoring';

export const docs = {
  type: 'component',
  name: 'BAIEntityLabelTokens',
  displayName: 'BAI Entity Label Tokens',
  category: 'Content',
  keywords: ['label', 'entity label', 'key value', 'token', 'tag'],
  usage: {
    description:
      'Shows the `key=value` labels on one entity as a BAITokenList. It reads `BAIEntityLabelTokensFragment` on `EntityLabelConnection`, so the caller spreads it inside the `entityLabels` field every labelable node (SessionV2, VFolder, ModelDeployment, ResourceGroup, …) carries. Remaining props go to BAITokenList; `maxInline` defaults to 2.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Select `entityLabels(limit: 100)` — without a page size the manager returns 10 labels.',
      },
      {
        guidance: true,
        description:
          'Render the column only when `useIsLabelableEntityType(type)` is true.',
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
  ],
  examples: [
    {
      label: 'A labels column',
      code: `{
  key: 'labels',
  title: t('comp:BAIEntityLabelTokens.Labels'),
  render: (_, record) => (
    <BAIEntityLabelTokens entityLabelsFrgmt={record.entityLabels} />
  ),
}`,
    },
  ],
} satisfies ComponentDoc;

export default docs;
