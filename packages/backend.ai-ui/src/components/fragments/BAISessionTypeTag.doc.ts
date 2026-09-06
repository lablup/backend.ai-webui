import type { ComponentDoc } from '@astryxdesign/cli/authoring';

export const docs = {
  type: 'component',
  name: 'BAISessionTypeTag',
  displayName: 'BAI Session Type Tag',
  category: 'Feedback & Status',
  keywords: [
    'session type',
    'interactive',
    'batch',
    'inference',
    'tag',
    'badge',
    'chip',
  ],
  usage: {
    description:
      "Renders a compute session's type as a colored Astryx Badge — INTERACTIVE, BATCH or INFERENCE. It reads the `BAISessionTypeTagFragment` on `ComputeSessionNode` (field `type`), so the caller spreads `...BAISessionTypeTagFragment` into the session selection and passes the node as `sessionFrgmt`. The label is upper-cased before rendering and the hue comes from the repo-global `sessionType` badge lookup, so every surface agrees on which colour a type gets; a type outside that lookup falls back to the neutral variant. When the fragment carries no type at all the component renders a dash instead of an empty badge.",
    bestPractices: [
      {
        guidance: true,
        description:
          'Spread `...BAISessionTypeTagFragment` next to the other session fragments and hand over the whole node, rather than reading `type` yourself and rendering a hand-rolled badge.',
      },
      {
        guidance: true,
        description:
          'Use it on both the session list column and the session detail header so a session shows the same colour in both places.',
      },
      {
        guidance: false,
        description:
          'Add a colour or variant override at the call site — the hue is decided centrally so that 60-plus surfaces do not each invent their own.',
      },
    ],
  },
  props: [
    {
      name: 'sessionFrgmt',
      type: 'BAISessionTypeTagFragment$key',
      description:
        'Fragment reference to a `ComputeSessionNode`. Its `type` becomes the badge label; an empty type renders a dash.',
      required: true,
    },
  ],
  examples: [
    {
      label: 'Session type column',
      code: `{
  key: 'type',
  title: t('session.SessionType'),
  render: (__, session) => <BAISessionTypeTag sessionFrgmt={session} />,
}`,
    },
    {
      label: 'Next to the session name in the detail header',
      code: `<BAIFlex gap="xs" align="center">
  <BAIText>{session.name}</BAIText>
  <BAISessionTypeTag sessionFrgmt={session} />
</BAIFlex>`,
    },
  ],
} satisfies ComponentDoc;

export default docs;
