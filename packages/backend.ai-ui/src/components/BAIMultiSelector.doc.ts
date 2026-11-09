import type { ComponentDoc } from '@astryxdesign/cli/authoring';

export const docs = {
  type: 'component',
  name: 'BAIMultiSelector',
  displayName: 'BAI Multi Selector',
  category: 'Data Input',
  keywords: ['form', 'form item', 'multi select', 'multiple', 'selector'],
  usage: {
    description:
      'Several choices from a static option list; the trigger names the selection. It is ui-common `MultiSelector` with the same props, plus one behaviour: when the closed trigger cannot name every selected option (more than it shows before "+N", "N selected", or text cut off by the ellipsis), hovering or focusing it shows all selected labels in a tooltip. There is no tooltip while the control is disabled or its listbox is open, or when `renderTrigger` (or `formatValue` with the default `labels` trigger) draws the trigger text, since that text is unknown. The trigger defaults to `triggerDisplay="labels"`. Inside a Form.Item it takes value, onChange, disabled, status and its accessible name from the item (ADR 0014). Props: `ui-common component MultiSelector`.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Put the control directly inside a Form.Item; the item owns the visible label, rules, help and extra.',
      },
      {
        guidance: true,
        description:
          'Give options a short label; the tooltip joins the selected labels with commas.',
      },
      {
        guidance: false,
        description:
          'Wrap the control in another element inside a Form.Item: the item clones its direct child, so the wrapper takes the value and onChange.',
      },
    ],
  },
  props: [],
} satisfies ComponentDoc;

export default docs;
