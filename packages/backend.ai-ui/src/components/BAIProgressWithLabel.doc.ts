import type { ComponentDoc } from '@astryxdesign/cli/authoring';

export const docs = {
  type: 'component',
  name: 'BAIProgressWithLabel',
  displayName: 'BAI Progress With Label',
  category: 'Data Visualization',
  keywords: [
    'progress',
    'progress bar',
    'usage',
    'utilization',
    'meter',
    'gauge',
    'linear progress',
  ],
  usage: {
    description:
      'A compact usage bar that carries its own labels inside the track. It draws the fill itself — an absolutely positioned BAIFlex sized to `percent` over a bordered, muted container — and lays a title on the left and a value label on the right on top of it, so a table cell or a list row can show "what" and "how much" in the height of a single line. `percent` is clamped to 100 and treated as 0 when missing or NaN, so a partially loaded metric renders an empty track rather than breaking the layout. It is not the Astryx ProgressBar wrapper: there is no indeterminate state, no steps and no built-in percentage formatting, only what the two label slots are given.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Format the number at the call site and pass the finished string as `valueLabel` — the component prints it verbatim and adds no unit or percent sign.',
      },
      {
        guidance: true,
        description:
          'Drive `strokeColor` from a theme token so a threshold reads as a state, for example the error token above 80% and the success token below it.',
      },
      {
        guidance: true,
        description:
          'Give it a fixed `width` inside a table column so bars in neighbouring rows are comparable; without one it stretches to fill its flex parent.',
      },
      {
        guidance: false,
        description:
          'Reach for it to show indeterminate work — it renders a proportion, and an unknown `percent` shows as an empty track.',
      },
      {
        guidance: false,
        description:
          'Hide the number with `showInfo={false}` when the bar is the only readout of a value the user needs; the space stays reserved but the label is blank.',
      },
    ],
  },
  props: [
    {
      name: 'percent',
      type: 'number',
      description:
        'Fill proportion, 0–100. Values above 100 are clamped, and undefined or NaN renders an empty track and dims the value label.',
    },
    {
      name: 'title',
      type: 'React.ReactNode',
      description: 'Leading label drawn inside the track, on the left.',
    },
    {
      name: 'valueLabel',
      type: 'React.ReactNode',
      description:
        'Trailing label drawn inside the track, on the right. Already-formatted text — no unit or percent sign is appended.',
    },
    {
      name: 'showInfo',
      type: 'boolean',
      description:
        'Whether `valueLabel` is rendered. When false a blank space keeps the row height stable.',
      default: 'true',
    },
    {
      name: 'strokeColor',
      type: 'string',
      description:
        'Colour of the fill, painted at 70% opacity. Defaults to the success token.',
    },
    {
      name: 'width',
      type: "React.CSSProperties['width']",
      description:
        'Fixed track width. Omitted, the component takes `flex: 1` and fills its parent.',
    },
    {
      name: 'size',
      type: "'small' | 'middle' | 'large'",
      description:
        'Label type scale only — it selects the small, base or large font-size token and does not change the track height.',
      default: "'small'",
    },
    {
      name: 'labelStyle',
      type: 'React.CSSProperties',
      description:
        'Extra style merged into both label texts, after the size-derived font size.',
    },
    {
      name: 'progressStyle',
      type: 'React.CSSProperties',
      description:
        'Extra style merged into the track container, after the border, radius, background and width.',
    },
  ],
  examples: [
    {
      label: 'Utilization bar in a table cell',
      code: `<BAIProgressWithLabel
  percent={percent}
  strokeColor={percent > 80 ? token.colorError : token.colorSuccess}
  width={120}
  valueLabel={toFixedFloorWithoutTrailingZeros(percent, 1) + ' %'}
/>`,
    },
    {
      label: 'Labelled allocation bar',
      code: `<BAIProgressWithLabel
  title={t('agent.Allocated')}
  percent={(occupied / total) * 100}
  valueLabel={\`\${occupied} / \${total}\`}
/>`,
    },
  ],
} satisfies ComponentDoc;

export default docs;
