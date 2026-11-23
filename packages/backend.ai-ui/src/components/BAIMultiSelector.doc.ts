import type { ComponentDoc } from '@astryxdesign/cli/authoring';

export const docs = {
  type: 'component',
  name: 'BAIMultiSelector',
  displayName: 'BAI Multi Selector',
  category: 'Data Input',
  keywords: ['form', 'form item', 'multi select', 'multiple', 'selector'],
  usage: {
    description:
      'ui-common `MultiSelector` under its BAI name: several choices from a static option list, the trigger naming the selection. It is the same component and props, with one default changed (ADR 0014): showTooltip is on, so hovering or focusing the trigger lists every selected label, which the trigger cuts off after three. Inside a Form.Item it takes value, onChange, disabled, status and its accessible name from the item and fills the item row. webui imports it from backend.ai-ui, not from the ui-common subpath. Other props: `ui-common component MultiSelector`.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Put the control directly inside a Form.Item; the item owns the visible label, rules, help and extra.',
      },
      {
        guidance: true,
        description:
          'Pass aria-label only where no Form.Item label names the control (a row field, a toolbar).',
      },
      {
        guidance: true,
        description:
          'Make option labels tell options apart on their own: the tooltip lists the labels, not what formatValue renders on the trigger.',
      },
      {
        guidance: false,
        description:
          'Wrap the control in another element inside a Form.Item: the item clones its direct child, so the wrapper takes the value and onChange.',
      },
    ],
  },
  props: [
    {
      name: 'showTooltip',
      type: 'boolean | { content: (items: MultiSelectorSelectedItem[]) => ReactNode }',
      description:
        'Lists every selected label in a tooltip on the trigger while something is selected, held shut while the listbox is open; `{ content }` renders content(items) instead, with the selection as formatValue receives it. None while disabled or with renderTrigger. Pass false where the trigger already sits under another tooltip.',
      default: 'true',
    },
  ],
} satisfies ComponentDoc;

export default docs;
