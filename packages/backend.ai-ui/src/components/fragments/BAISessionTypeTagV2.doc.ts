import type { ComponentDoc } from '@astryxdesign/cli/authoring';

export const docs = {
  type: 'component',
  name: 'BAISessionTypeTagV2',
  displayName: 'BAI Session Type Tag V2',
  category: 'Feedback & Status',
  keywords: [
    'session type',
    'interactive',
    'batch',
    'inference',
    'session v2',
    'badge',
    'tag',
  ],
  usage: {
    description:
      'The v2 counterpart of `BAISessionTypeTag`, for the SessionV2 GraphQL surface. It reads the `BAISessionTypeTagV2Fragment` on `SessionV2MetadataInfo` (field `sessionType`), so the caller spreads `...BAISessionTypeTagV2Fragment` inside the session `metadata` selection and passes that metadata object as `metadataFrgmt` — not the session node. The value is upper-cased and coloured through the same repo-global `sessionType` badge lookup as v1, so a session shows the same hue on both APIs; an unlisted type falls back to the neutral variant. A null fragment, or one with no session type, renders a dash instead of a badge.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Guard on `session.metadata` at the call site and render a dash yourself when the metadata field is absent, as the SessionV2 table does.',
      },
      {
        guidance: true,
        description:
          'Keep the badge colour central by using this component wherever a v2 session type is displayed, instead of reading `sessionType` and building a Badge inline.',
      },
      {
        guidance: false,
        description:
          'Pass the session node — the fragment is declared on `SessionV2MetadataInfo`, so both the spread and the prop belong to the `metadata` field.',
      },
    ],
  },
  props: [
    {
      name: 'metadataFrgmt',
      type: 'BAISessionTypeTagV2Fragment$key | null',
      description:
        'Fragment reference to a `SessionV2MetadataInfo`. Its `sessionType` becomes the badge label; null or empty renders a dash.',
      required: true,
    },
  ],
  examples: [
    {
      label: 'Session type column in the SessionV2 table',
      code: `{
  key: 'sessionType',
  title: t('comp:SessionV2Nodes.SessionType'),
  render: (__, session) =>
    session.metadata ? (
      <BAISessionTypeTagV2 metadataFrgmt={session.metadata} />
    ) : (
      '-'
    ),
}`,
    },
  ],
} satisfies ComponentDoc;

export default docs;
