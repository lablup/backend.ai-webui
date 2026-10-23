import type { ComponentDoc } from '@astryxdesign/cli/authoring';

export const docs = {
  type: 'component',
  name: 'BAIDisabledOptionReason',
  displayName: 'BAI Disabled Option Reason',
  category: 'Data Input',
  keywords: [
    'disabled option',
    'disabled reason',
    'why disabled',
    'select option',
    'tooltip',
  ],
  usage: {
    description:
      'The glyph at the end of a disabled select option whose tooltip says why the option cannot be picked. BAISelect and BAIComplexSelect draw it themselves when an option passes `disabled: { reason }` (the `BAIOptionDisabled` union, the same shape BAINameActionCell row actions take), so most code never renders it directly. The row keeps its height, so a list with many options disabled for the same reason does not grow, and the reason is the glyph accessible name, so a screen reader reads it with the option. The glyph keeps taking hover inside a disabled Selector item, which sets `pointer-events: none`. For a select built directly on Astryx Selector, wrap the `renderOption` result with `withOptionDisabledReason(content, disabled)`; `getOptionDisabledReason(disabled)` returns the reason string or undefined.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Pass `disabled: { reason }` whenever the cause is known; keep a bare `true` for a deliberately silent disable.',
      },
      {
        guidance: true,
        description:
          'Write the reason as the cause the user can act on ("This keypair is inactive."), not as the state ("Disabled").',
      },
      {
        guidance: false,
        description:
          'Carry a separate `disabledReason` next to a boolean `disabled`; the union keeps "a reason but enabled" unrepresentable.',
      },
      {
        guidance: false,
        description:
          'Wrap the whole option row in a Tooltip; a disabled row takes no pointer events in Astryx Selector.',
      },
    ],
  },
  props: [
    {
      name: 'reason',
      type: 'string',
      description:
        'Why the option cannot be picked. The tooltip body and the glyph accessible name.',
      required: true,
    },
  ],
  examples: [
    {
      label: 'Through a select option',
      code: `<BAISelect
  options={keypairs.map((kp) => ({
    value: kp.access_key,
    label: kp.access_key,
    disabled: kp.is_active
      ? false
      : { reason: t('credential.KeypairIsInactive') },
  }))}
/>`,
    },
    {
      label: 'In an Astryx Selector renderOption',
      code: `<Selector
  options={options}
  renderOption={(option) =>
    withOptionDisabledReason(option.label, reasonByValue[option.value])
  }
/>`,
    },
  ],
} satisfies ComponentDoc;

export default docs;
