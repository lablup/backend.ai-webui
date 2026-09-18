import type { ComponentDoc } from '@astryxdesign/cli/authoring';

export const docs = {
  type: 'component',
  name: 'BAIArtifactTypeToken',
  displayName: 'BAI Artifact Type Token',
  category: 'Feedback & Status',
  keywords: [
    'artifact',
    'type',
    'tag',
    'token',
    'chip',
    'model',
    'package',
    'image',
  ],
  usage: {
    description:
      'Read-only chip that labels which kind of artifact a Reservoir row or detail header describes. It reads `BAIArtifactTypeTokenFragment` on `Artifact` — a single `type` field — and renders an Astryx Token whose label is the raw enum value and whose icon is a lucide glyph: Brain for MODEL, Package for PACKAGE, Container for IMAGE. The hue is the Token `color` (blue, green, orange respectively) — a type is a classification, so it is a Token rather than a Badge; a type outside those three falls back to the `default` colour with no icon. Spread `...BAIArtifactTypeTokenFragment` on the `Artifact` node in the parent query and hand that node straight to `artifactTypeFrgmt`.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Place it next to the artifact name so type and identity read as one line, as the Reservoir table and the artifact detail header both do.',
      },
      {
        guidance: true,
        description:
          'Pass the artifact node itself once the fragment is spread on it — no field selection or mapping is needed on the caller side.',
      },
      {
        guidance: false,
        description:
          'Reach for it to show pull state or availability; those belong to BAIArtifactStatusBadge and the availability controls, and this chip never changes with them.',
      },
      {
        guidance: false,
        description:
          'Translate or reformat the label around it — the token prints the server enum verbatim so the three artifact kinds stay greppable in the UI.',
      },
    ],
  },
  props: [
    {
      name: 'artifactTypeFrgmt',
      type: 'BAIArtifactTypeTokenFragment$key',
      description:
        'Relay fragment reference for the `Artifact` whose `type` is displayed. It is not nullable, so guard on the artifact existing before rendering the token.',
      required: true,
    },
  ],
  examples: [
    {
      label: 'In an artifact detail header',
      code: '{artifact && <BAIArtifactTypeToken artifactTypeFrgmt={artifact} />}',
    },
    {
      label: 'Beside the name in a table cell',
      code: `<BAIFlex gap="xs">
  <BAILink to={'/reservoir/' + toLocalId(record.id)}>{name}</BAILink>
  <BAIArtifactTypeToken artifactTypeFrgmt={record} />
</BAIFlex>`,
    },
  ],
} satisfies ComponentDoc;

export default docs;
