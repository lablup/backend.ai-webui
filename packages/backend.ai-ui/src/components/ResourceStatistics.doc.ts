import type { ComponentDoc } from '@astryxdesign/cli/authoring';

export const docs = {
  type: 'component',
  name: 'ResourceStatistics',
  displayName: 'Resource Statistics',
  category: 'Data Visualization',
  keywords: [
    'resource',
    'statistics',
    'cpu',
    'memory',
    'accelerator',
    'gpu',
    'usage',
    'metrics',
  ],
  usage: {
    description:
      'The CPU / memory / accelerator readout shown on resource summary cards. It takes one already-shaped `resourceData` object and lays it out in the house arrangement: CPU and memory in a divider-separated row, then the accelerators in a second divider-separated row on a raised, rounded panel of their own, with each entry rendered as a BAIStatistic. `displayType` picks which side of every slot to read — occupied ("used") or remaining ("free") — and the free readout is tinted with the success colour. When the data carries no CPU, no memory and no accelerators, it renders an Astryx EmptyState instead of an empty row. Shaping the raw resource slots into `resourceData` is the caller’s job; the module also exports `processMemoryValue` and `convertToNumber` for that step.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Convert memory through the exported `processMemoryValue` so the number matches the `displayUnit` its metadata declares.',
      },
      {
        guidance: true,
        description:
          'Pass `progressMode="normal"` on dashboard cards where the ratio matters, and leave it hidden in dense contexts where only the numbers are read.',
      },
      {
        guidance: true,
        description:
          'Place it inside a BAICard whose header carries the used/free toggle, so the switch and the numbers it controls stay in one surface.',
      },
      {
        guidance: false,
        description:
          'Guard it with your own "no data" branch — an empty `resourceData` already renders the EmptyState.',
      },
      {
        guidance: false,
        description:
          'Send raw slot strings straight in; `resourceData` expects numeric `current` / `total` pairs, with `total` omitted where the limit is unbounded.',
      },
    ],
  },
  props: [
    {
      name: 'resourceData',
      type: '{ cpu: ResourceEntry | null; memory: ResourceEntry | null; accelerators: Array<ResourceEntry & { key: string }> }',
      description:
        'The shaped statistics. Each entry carries `used` and `free` as `{ current, total? }` plus `metadata: { title, displayUnit }`. A null cpu or memory omits that statistic; an empty accelerators array omits the accelerator panel.',
      required: true,
    },
    {
      name: 'displayType',
      type: "'used' | 'free'",
      description:
        'Which side of every entry to read. "free" additionally tints each statistic with the success colour.',
      required: true,
    },
    {
      name: 'progressMode',
      type: "'ghost' | 'hidden' | 'normal'",
      description:
        'Forwarded to every BAIStatistic: "hidden" prints numbers only, "normal" adds the stepped progress bar with a used/total tooltip, "ghost" reserves its space.',
      default: "'hidden'",
    },
    {
      name: 'progressSteps',
      type: 'number',
      description:
        'Segment count of each statistic’s progress bar. Left unset, BAIStatistic’s own default applies.',
    },
    {
      name: 'precision',
      type: 'number',
      description: 'Decimal places used when formatting every value.',
      default: '2',
    },
  ],
  examples: [
    {
      label: 'Resource card body',
      code: `<ResourceStatistics
  resourceData={resourceData}
  displayType="used"
  progressMode="normal"
/>`,
    },
    {
      label: 'Toggling between occupied and remaining',
      code: `{resourceSlotsDetails.isLoading ? (
  <BAISkeleton />
) : (
  <ResourceStatistics
    resourceData={agentStatsData}
    displayType={displayType === 'used' ? 'used' : 'free'}
    progressMode="normal"
  />
)}`,
    },
  ],
} satisfies ComponentDoc;

export default docs;
