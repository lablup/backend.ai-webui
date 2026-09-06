import type { ComponentDoc } from '@astryxdesign/cli/authoring';

export const docs = {
  type: 'component',
  name: 'BAISegmentedControlItem',
  displayName: 'BAI Segmented Control Item',
  category: 'Data Input',
  keywords: [
    'segmented control',
    'segmented',
    'toggle group',
    'radio button',
    'tab switch',
    'option',
  ],
  usage: {
    description:
      'The option element inside an Astryx SegmentedControl. It wraps Astryx SegmentedControlItem for one reason: Astryx types label as a string but renders it straight through as children, so a ReactNode label works at runtime and only fails the type. This wrapper widens label to ReactNode and drops isLabelHidden, which is the single path where the label would reach an attribute and a node would collapse into a broken aria-label. Use it wherever a segment needs more than text — a trailing help tooltip, an icon inline with the label, a formatted value. Every other prop (value, icon, isDisabled, …) passes through to SegmentedControlItem unchanged.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Render it as a direct child of Astryx SegmentedControl, which owns the value, onChange and the group label.',
      },
      {
        guidance: true,
        description:
          'Keep readable text at the start of a node label so the segment still reads as its option name when the extra affordance is ignored.',
      },
      {
        guidance: true,
        description:
          'Mark decorative label extras non-focusable (for example BAIQuestionIconWithTooltip with focusable={false}) so tabbing still moves segment to segment.',
      },
      {
        guidance: false,
        description:
          'Reach for it when the label is plain text — Astryx SegmentedControlItem covers that case directly and the wrapper adds nothing.',
      },
      {
        guidance: false,
        description:
          'Put an interactive control inside the label; the whole segment is the click target, and a nested button competes with selecting the option.',
      },
    ],
  },
  props: [
    {
      name: 'label',
      type: 'React.ReactNode',
      description:
        "The segment's content, widened from Astryx's string. Rendered as children of the segment, so any node survives.",
      required: true,
    },
  ],
  examples: [
    {
      label: 'Segment with a trailing help tooltip',
      code: `<SegmentedControl
  label={t('session.launcher.ClusterMode')}
  value={clusterMode}
  onChange={setClusterMode}
>
  {items.map((item) => (
    <BAISegmentedControlItem
      key={item.value}
      value={item.value}
      label={
        <span>
          {item.label}
          <BAIQuestionIconWithTooltip title={item.tooltip} focusable={false} />
        </span>
      }
    />
  ))}
</SegmentedControl>`,
    },
  ],
} satisfies ComponentDoc;

export default docs;
