import type { ComponentDoc } from '@astryxdesign/cli/authoring';

export const docs = {
  type: 'component',
  name: 'BAIStatistic',
  displayName: 'BAI Statistic',
  category: 'Data Visualization',
  keywords: [
    'statistic',
    'metric',
    'kpi',
    'gauge',
    'usage',
    'progress',
    'resource',
    'counter',
  ],
  usage: {
    description:
      'The metric tile of the dashboard and resource panels: a caption, a large value with its unit, and an optional segmented usage bar underneath. It composes Astryx `Text` for the caption and value and Astryx `Tooltip` over the bar, which shows the exact `current / total` pair on hover. The bar itself is a 20-notch strip drawn from tokens rather than an Astryx `ProgressBar`, because the notches are what make a 3/20 readable apart from a 4/20 at a glance; it carries `role="progressbar"` with the usual value attributes. A non-finite `current` renders as "Unlimited", and `total` of `Infinity` leaves the bar empty.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Pass a plain string as `title` when the bar is shown — it becomes the accessible name of the progress bar, which otherwise falls back to a generic "usage".',
      },
      {
        guidance: true,
        description:
          'Pair `progressMode="ghost"` with a loading or empty panel: it keeps the bar’s layout box so tiles do not jump once real data arrives.',
      },
      {
        guidance: true,
        description:
          'Give `progressMode="normal"` a `total`, since the bar and its tooltip have nothing to compare against without one.',
      },
      {
        guidance: true,
        description:
          'Group several tiles with BAIRowWrapWithDividers, the way ResourceStatistics does, so the dividers land only between tiles on the same row.',
      },
      {
        guidance: false,
        description:
          'Preformat the number into `current` as a string — the component owns rounding through `precision` and prints the infinity symbol itself.',
      },
      {
        guidance: false,
        description:
          'Use `style` for anything but a colour accent and outer layout; a `color` there also tints the value text and the filled notches, and any other declaration fights the tile’s fixed typography.',
      },
    ],
  },
  props: [
    {
      name: 'title',
      type: 'ReactNode',
      description:
        'Caption above the value. A string also becomes the accessible name of the usage bar.',
      required: true,
    },
    {
      name: 'current',
      type: 'number',
      description:
        'The measured value. Rendered as "Unlimited" when it is not finite, and left blank when undefined.',
    },
    {
      name: 'total',
      type: 'number',
      description:
        'The quota the value is measured against. Drives the bar percentage and the tooltip; without it `progressMode="normal"` renders no bar.',
    },
    {
      name: 'unit',
      type: 'string',
      description:
        'Unit shown after the value and repeated in the tooltip. Nothing is rendered when it is empty.',
      default: "''",
    },
    {
      name: 'precision',
      type: 'number',
      description:
        'Decimal places used to format `current` and `total`. Trailing zeros are dropped.',
      default: '2',
    },
    {
      name: 'infinityDisplay',
      type: 'string',
      description:
        'Text substituted for a non-finite number; matching it is what switches the value line to the "Unlimited" label.',
      default: "'∞'",
    },
    {
      name: 'progressMode',
      type: "'ghost' | 'hidden' | 'normal'",
      description:
        '"normal" draws the filled usage bar with its tooltip, "ghost" reserves the same space but paints nothing, "hidden" omits the bar entirely.',
      default: "'hidden'",
    },
    {
      name: 'progressSteps',
      type: 'number',
      description:
        'Number of notches in the bar. Lower it only where the tile is too narrow for the default strip.',
      default: '20',
    },
    {
      name: 'style',
      type: 'React.CSSProperties',
      description:
        'Style on the outer column. A `color` here is also applied to the value text and the filled notches.',
    },
  ],
  examples: [
    {
      label: 'Count without a bar',
      code: `<BAIStatistic
  title={t(config.labelKey)}
  current={connection?.count ?? 0}
  progressMode="hidden"
/>`,
    },
    {
      label: 'Resource usage against a quota',
      code: `<BAIStatistic
  title={resourceData.cpu.metadata.title}
  current={resourceData.cpu[displayType].current}
  total={resourceData.cpu[displayType].total}
  unit={resourceData.cpu.metadata.displayUnit}
  progressMode="normal"
  precision={precision}
  style={{ color: displayType === 'free' ? token.colorSuccess : undefined }}
/>`,
    },
  ],
} satisfies ComponentDoc;

export default docs;
