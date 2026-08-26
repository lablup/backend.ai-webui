import type { ComponentDoc } from '@astryxdesign/cli/authoring';

export const docs = {
  type: 'component',
  name: 'BAISubStepNodes',
  displayName: 'BAI Sub Step Nodes',
  category: 'Table & List',
  keywords: [
    'sub steps',
    'substep',
    'scheduling history',
    'timeline',
    'expanded row',
    'steps',
    'phase',
  ],
  usage: {
    description:
      "The sub-step timeline of one scheduling-history attempt: a compact inline table with one 32px row per step, showing step name, result, duration, start time, error code and message, plus an order connector in a narrow rail column. It reads the plural `BAISubStepNodesFragment` on `SubStepResultGQL`, so the caller spreads `...BAISubStepNodesFragment` inside the history row's `subSteps` selection and passes that list as `subStepsFrgmt` — the array itself, not the history node. It is the body a scheduling-history table renders in `expandedRowRender`. Steps stay in the ascending order the API returns, messages are collapsed to a single line so a multi-line failure reason cannot grow the row, and the panel scrolls sideways rather than truncating long step names or messages. Props other than the two below are spread onto the wrapping `div`.",
    bestPractices: [
      {
        guidance: true,
        description:
          'Always pass `parentPhase` from the owning history row — it is what identifies the trailing lifecycle marker, and without it that entry renders as if it were executed work.',
      },
      {
        guidance: true,
        description:
          'Gate row expansion on `countExecutedSubSteps(subSteps, phase) > 0` from the same module, so a row holding nothing but the lifecycle marker is not expandable.',
      },
      {
        guidance: true,
        description:
          'Pass the deployment history `subSteps` list as-is; only DEPLOYMENT rows carry the trailing lifecycle marker, and session and route histories render every entry as a real step.',
      },
      {
        guidance: false,
        description:
          'Style the rows through `className` overrides that change row height — the 32px row and the rail connector geometry come from the co-located CSS and a taller row breaks the connector.',
      },
    ],
  },
  props: [
    {
      name: 'subStepsFrgmt',
      type: 'BAISubStepNodesFragment$key',
      description:
        'Plural fragment reference to the `SubStepResultGQL` entries of one history row. Null and undefined entries are dropped before rendering; an empty list renders the header row alone.',
      required: true,
    },
    {
      name: 'parentPhase',
      type: 'string | null',
      description:
        "The owning history row's `phase`. A trailing entry whose step name normalizes to this phase is treated as the lifecycle marker: it renders tinted, with no duration and a marker message instead of its own text.",
    },
    {
      name: 'className',
      type: 'string',
      description:
        "Extra class on the outer panel, merged with the component's own `bai-substep-panel` class rather than replacing it.",
    },
  ],
  examples: [
    {
      label: 'Expanded row of a scheduling-history table',
      code: `expandable={{
  rowExpandable: (record) =>
    countExecutedSubSteps(
      dataSource.find((h) => h.id === record.id)?.subSteps ?? [],
      record.phase,
    ) > 0,
  expandedRowRender: (record) => (
    <BAISubStepNodes
      subStepsFrgmt={
        dataSource.find((h) => h.id === record.id)?.subSteps ?? []
      }
      parentPhase={record.phase}
    />
  ),
}}`,
    },
  ],
} satisfies ComponentDoc;

export default docs;
