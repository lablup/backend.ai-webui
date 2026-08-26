import type { ComponentDoc } from '@astryxdesign/cli/authoring';

export const docs = {
  type: 'component',
  name: 'BAIArtifactTypeTag',
  displayName: 'BAI Artifact Type Tag',
  category: 'Feedback & Status',
  keywords: [
    'artifact',
    'type',
    'tag',
    'badge',
    'chip',
    'model',
    'package',
    'image',
  ],
  usage: {
    description:
      'Read-only chip that labels which kind of artifact a Reservoir row or detail header describes. It reads `BAIArtifactTypeTagFragment` on `Artifact` — a single `type` field — and renders an Astryx Badge whose label is the raw enum value and whose icon is a lucide glyph: Brain for MODEL, Package for PACKAGE, Container for IMAGE. The hue comes from the Badge category variants (blue, green, orange respectively); a type outside those three falls back to the `neutral` variant with no icon. Spread `...BAIArtifactTypeTagFragment` on the `Artifact` node in the parent query and hand that node straight to `artifactTypeFrgmt`.',
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
          'Reach for it to show pull state or availability; those belong to BAIArtifactStatusTag and the availability controls, and this chip never changes with them.',
      },
      {
        guidance: false,
        description:
          'Translate or reformat the label around it — the badge prints the server enum verbatim so the three artifact kinds stay greppable in the UI.',
      },
    ],
  },
  props: [
    {
      name: 'artifactTypeFrgmt',
      type: 'BAIArtifactTypeTagFragment$key',
      description:
        'Relay fragment reference for the `Artifact` whose `type` is displayed. It is not nullable, so guard on the artifact existing before rendering the tag.',
      required: true,
    },
  ],
  examples: [
    {
      label: 'In an artifact detail header',
      code: '{artifact && <BAIArtifactTypeTag artifactTypeFrgmt={artifact} />}',
    },
    {
      label: 'Beside the name in a table cell',
      code: `<BAIFlex gap="xs">
  <BAILink to={'/reservoir/' + toLocalId(record.id)}>{name}</BAILink>
  <BAIArtifactTypeTag artifactTypeFrgmt={record} />
</BAIFlex>`,
    },
  ],
} satisfies ComponentDoc;

export default docs;
