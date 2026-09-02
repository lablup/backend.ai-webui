import type { ComponentDoc } from '@astryxdesign/cli/authoring';

export const docs = {
  type: 'component',
  name: 'BAISessionAgentIds',
  displayName: 'BAI Session Agent Ids',
  category: 'Content',
  keywords: [
    'agent',
    'agent ids',
    'session',
    'overflow',
    'popover',
    'copy',
    'list',
  ],
  usage: {
    description:
      'Renders the agents a compute session is placed on as one comma-joined line, with the overflow tucked behind a "+N" link. It reads the `BAISessionAgentIdsFragment` on `ComputeSessionNode` (field `agent_ids`), so the caller must spread `...BAISessionAgentIdsFragment` into the session selection and hand the node down as `sessionFrgmt`. Duplicate agent ids are collapsed before counting, so the inline text, the "+N" count and the popover heading all describe the distinct set. The "+N" link only appears when more agents remain than `maxInline`; clicking it opens an Astryx Popover listing the remainder with a "Copy All" button that copies every agent id, inline ones included.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Spread `...BAISessionAgentIdsFragment` alongside the other session fragments in the list or detail query, and pass the whole session node — the component selects `agent_ids` itself.',
      },
      {
        guidance: true,
        description:
          'Lower `maxInline` in narrow table columns so the row stays on one line and the rest moves into the popover.',
      },
      {
        guidance: true,
        description:
          'Set `emptyText` when the surrounding surface uses something other than a dash for "not scheduled yet".',
      },
      {
        guidance: false,
        description:
          'Wrap it in a tooltip or a second popover — the overflow link already owns a click-triggered popover and nesting the two makes the ids unreachable.',
      },
    ],
  },
  props: [
    {
      name: 'sessionFrgmt',
      type: 'BAISessionAgentIdsFragment$key',
      description:
        'Fragment reference to a `ComputeSessionNode`. Its `agent_ids` are de-duplicated and rendered; an empty list renders `emptyText` instead.',
      required: true,
    },
    {
      name: 'maxInline',
      type: 'number',
      description:
        'How many agent ids are shown inline before the rest collapse behind the "+N" popover link.',
      default: '3',
    },
    {
      name: 'emptyText',
      type: 'string',
      description:
        'Text rendered when the session has no agents, typically because it has not been scheduled yet.',
      default: "'-'",
    },
  ],
  examples: [
    {
      label: 'Agent column in the session table',
      code: `{
  key: 'agent',
  title: t('session.Agent'),
  render: (__, session) => <BAISessionAgentIds sessionFrgmt={session} />,
}`,
    },
    {
      label: 'Narrow column with a single inline agent',
      code: '<BAISessionAgentIds sessionFrgmt={session} maxInline={1} />',
    },
  ],
} satisfies ComponentDoc;

export default docs;
