import type { ComponentDoc } from '@astryxdesign/cli/authoring';

export const docs = {
  type: 'component',
  name: 'BAISessionTypeTokenV2',
  displayName: 'BAI Session Type Token V2',
  category: 'Feedback & Status',
  keywords: [
    'session type',
    'interactive',
    'batch',
    'inference',
    'session v2',
    'token',
    'tag',
  ],
  usage: {
    description:
      'The v2 counterpart of `BAISessionTypeToken`, for the SessionV2 GraphQL surface. It reads the `BAISessionTypeTokenV2Fragment` on `SessionV2MetadataInfo` (field `sessionType`), so the caller spreads `...BAISessionTypeTokenV2Fragment` inside the session `metadata` selection and passes that metadata object as `metadataFrgmt` — not the session node. The value is upper-cased and coloured through the same `sessionType` domain of `tokenColorForStatus` as v1, so a session shows the same hue on both APIs; an unlisted type falls back to the default colour. A null fragment, or one with no session type, renders a dash instead of a token.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Guard on `session.metadata` at the call site and render a dash yourself when the metadata field is absent, as the SessionV2 table does.',
      },
      {
        guidance: true,
        description:
          'Keep the token colour central by using this component wherever a v2 session type is displayed, instead of reading `sessionType` and building a Token inline.',
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
      type: 'BAISessionTypeTokenV2Fragment$key | null',
      description:
        'Fragment reference to a `SessionV2MetadataInfo`. Its `sessionType` becomes the token label; null or empty renders a dash.',
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
      <BAISessionTypeTokenV2 metadataFrgmt={session.metadata} />
    ) : (
      '-'
    ),
}`,
    },
  ],
} satisfies ComponentDoc;

export default docs;
