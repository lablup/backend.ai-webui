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
      'The option element inside an Astryx SegmentedControl. It wraps Astryx SegmentedControlItem for one reason: Astryx types label as a string but renders it straight through as children, so a ReactNode label works at runtime and only fails the type. This wrapper widens label to ReactNode, and allows isLabelHidden only with a string label, since a hidden label becomes the aria-label and a node would collapse into a broken one. It is the item webui uses for every segment (ADR 0014): plain text, a node label with a trailing help tooltip or a formatted value, or an icon-only segment with a hidden string label. Every other prop (value, icon, isDisabled, …) passes through to SegmentedControlItem unchanged.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Render it as a direct child of BAISegmentedControl, which owns the value, onChange and the group label.',
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
    {
      name: 'isLabelHidden',
      type: 'boolean',
      description:
        'Hides the label visually and keeps it as the accessible name, for an icon-only segment. Only allowed with a string label.',
    },
  ],
  examples: [
    {
      label: 'Segment with a trailing help tooltip',
      code: `<BAISegmentedControl
  aria-label={t('session.launcher.ClusterMode')}
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
</BAISegmentedControl>`,
    },
  ],
} satisfies ComponentDoc;

export default docs;
