import type { ComponentDoc } from '@astryxdesign/cli/authoring';

export const docs = {
  type: 'component',
  name: 'BAIId',
  displayName: 'BAI Id',
  category: 'Content',
  keywords: ['id', 'uuid', 'identifier', 'global id', 'relay', 'copyable'],
  usage: {
    description:
      'Renders a resource identifier the way every Backend.AI surface shows one: monospace, clamped to 100px with an ellipsis, a tooltip carrying the full value, and a copy affordance. It accepts either a raw uuid or a Relay globalId — the global id is base64-decoded to its local id, falling back to the raw string when the value is not a valid Relay id, so a malformed backend value never crashes the subtree. It renders BAIText, so the rest of BAITextProps (type, strong, size, code, and the DOM attributes) passes through.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Pass globalId for a value taken straight off a Relay node and uuid for a plain identifier field — exactly one of the two is accepted.',
      },
      {
        guidance: true,
        description:
          'Widen the clamp with style={{ maxWidth: … }} in a column that has the room, rather than dropping the ellipsis config that supplies the tooltip.',
      },
      {
        guidance: true,
        description:
          'Use type="secondary" where the id is a supporting detail next to a human-readable name.',
      },
      {
        guidance: false,
        description:
          'Turn copyable off — a value clamped to 100px is unreadable on screen, and copying is how the user actually consumes it.',
      },
      {
        guidance: false,
        description:
          'Decode a Relay global id at the call site and pass the result as uuid; hand it the globalId and let the component decode it.',
      },
    ],
  },
  props: [
    {
      name: 'uuid',
      type: 'string',
      description:
        'A plain identifier, rendered as given. Mutually exclusive with globalId.',
    },
    {
      name: 'globalId',
      type: 'string',
      description:
        'A Relay global id, decoded to its local id before rendering. An undecodable value falls back to the raw string. Mutually exclusive with uuid.',
    },
    {
      name: 'copyable',
      type: 'boolean | BAITextCopyConfig',
      description:
        'Whether the copy-to-clipboard affordance is shown. On by default, because the displayed value is usually truncated.',
      default: 'true',
    },
    {
      name: 'ellipsis',
      type: 'boolean | BAITextEllipsisConfig',
      description:
        'Truncation config forwarded to BAIText. The default turns the tooltip on, which is the only way to read the full id at the 100px clamp.',
      default: '{ tooltip: true }',
    },
    {
      name: 'monospace',
      type: 'boolean',
      description:
        'Renders in the monospace face, so ids stay column-aligned and character-comparable.',
      default: 'true',
    },
    {
      name: 'style',
      type: 'CSSProperties',
      description:
        'Inline style merged after the default 100px maxWidth, so a maxWidth given here overrides the clamp.',
    },
  ],
  examples: [
    {
      label: 'In a table column',
      code: `{
  title: t('general.ID'),
  dataIndex: 'userId',
  render: (__, record) => <BAIId uuid={record.userId} />,
}`,
    },
    {
      label: 'Relay global id as a supporting detail',
      code: `<BAIId globalId={session.id} type="secondary" />`,
    },
  ],
} satisfies ComponentDoc;

export default docs;
