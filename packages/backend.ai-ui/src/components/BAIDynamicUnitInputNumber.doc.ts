import type { ComponentDoc } from '@astryxdesign/cli/authoring';

export const docs = {
  type: 'component',
  name: 'BAIDynamicUnitInputNumber',
  displayName: 'BAI Dynamic Unit Input Number',
  category: 'Data Input',
  keywords: [
    'input number',
    'numeric input',
    'unit',
    'memory',
    'storage',
    'size',
    'binary unit',
    'stepper',
  ],
  usage: {
    description:
      'The size field that reads and writes a single `"<number><unit>"` string such as `"4g"`. It composes an Astryx `InputGroup` holding a `NumberInput`, an explicit stepper pair, and a `Selector` for the unit; when only one unit is allowed the selector is replaced by a static `InputGroupText` label. Stepping follows the `dynamicSteps` ladder rather than a linear increment, and carries across units at either end — stepping up from `512g` lands on `1t`, stepping below the bottom of the ladder drops to the next unit down — which is why the arrow keys are intercepted instead of using the native `NumberInput` stepping. Typing a unit letter switches the unit in place, and an out-of-range entry is clamped to `min`/`max` on blur rather than reverted. The value is controllable: pass `value` and `onChange`, or leave both off and let the component hold it.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Express `min` and `max` as unit strings (`"256m"`, `"45g"`) so the bound stays meaningful whichever unit the user has selected.',
      },
      {
        guidance: true,
        description:
          'Narrow `units` to the single unit the backend accepts when a field has no choice to offer — the component then renders a static unit label instead of a dead dropdown.',
      },
      {
        guidance: true,
        description:
          'Set `defaultUnit` for a field that starts empty, so the first typed number lands in the unit the user expects.',
      },
      {
        guidance: false,
        description:
          'Passing the number alone and formatting the unit outside — the whole contract is the combined string, and splitting it breaks the ladder and the carry.',
      },
      {
        guidance: false,
        description:
          'Setting `disableAutoUnit` merely to pin a field to one unit; restricting `units` is the direct way and keeps the ladder arithmetic inside the allowed range.',
      },
    ],
  },
  props: [
    {
      name: 'value',
      type: 'string | null | undefined',
      description:
        'Current value as a `"<number><unit>"` string, e.g. `"4g"`. Controllable — supply it with `onChange`, or omit both and let the component hold the value.',
    },
    {
      name: 'onChange',
      type: '(value: string) => void',
      description:
        'Called with the new combined string whenever the number, the unit, a step, or a blur-time clamp changes it.',
    },
    {
      name: 'min',
      type: 'string',
      description:
        'Lower bound as a unit string. Converted into the currently selected unit for the field bound and for the blur-time clamp.',
      default: "'0m'",
    },
    {
      name: 'max',
      type: 'string',
      description:
        'Upper bound as a unit string, converted the same way as `min`.',
      default: "'300p'",
    },
    {
      name: 'units',
      type: 'Array<string>',
      description:
        'Allowed unit ladder, smallest first (`m` = MiB, `g` = GiB, `t` = TiB, `p` = PiB). A single entry renders a static unit label instead of a selector.',
      default: "['m', 'g', 't', 'p']",
    },
    {
      name: 'dynamicSteps',
      type: 'Array<number>',
      description:
        'The numeric ladder the stepper and the arrow keys move along, instead of a fixed increment.',
      default: '[1, 2, 4, 8, 16, 32, 64, 128, 256, 512]',
    },
    {
      name: 'disableAutoUnit',
      type: 'boolean',
      description:
        'Stops stepping past either end of the ladder from carrying into the neighbouring unit; the value then simply stays within the current unit.',
      default: 'false',
    },
    {
      name: 'roundStep',
      type: 'number',
      description:
        'Rounds the committed number to the nearest multiple of this on blur, keeping the decimal places the step itself declares. Skipped when rounding would cross `min` or `max`.',
    },
    {
      name: 'defaultUnit',
      type: 'string',
      description:
        'Unit used when the value carries none yet. Ignored unless it is listed in `units`; otherwise the first entry of `units` applies.',
    },
    {
      name: 'addonPrefix',
      type: 'ReactNode',
      description:
        'Content rendered as a leading addon inside the input group, before the number field.',
    },
    {
      name: 'addonSuffix',
      type: 'ReactNode',
      description:
        'Content rendered as a trailing addon inside the input group, after the unit.',
    },
    {
      name: 'disabled',
      type: 'boolean',
      description:
        'Disables the whole group — field, stepper and unit selector — and turns off the keyboard ladder and unit-letter handling.',
    },
    {
      name: 'placeholder',
      type: 'string',
      description:
        'Placeholder for the number field. Also serves as the accessible name when `label` is not given.',
    },
    {
      name: 'size',
      type: "'small' | 'middle' | 'large'",
      description:
        'Control size, mapped onto the Astryx sm/md/lg scale for the whole group.',
    },
    {
      name: 'label',
      type: 'string',
      description:
        'Accessible name for the group. Falls back to `placeholder`, then to the generic select string.',
    },
    {
      name: 'isLabelHidden',
      type: 'boolean',
      description:
        'Whether the group label is visually hidden. Defaults to hidden whenever no `label` is supplied, since the field usually sits under a form-item label.',
    },
    {
      name: 'style',
      type: 'CSSProperties',
      description:
        'Inline style on the input group. Call sites typically use it to make the group fill the form-item width.',
    },
    {
      name: 'className',
      type: 'string',
      description: 'Extra class on the input group element.',
    },
  ],
  examples: [
    {
      label: 'Memory field inside a form item',
      code: `<BAIFormItem name="memory" label={t('resourcePreset.Memory')}>
  <BAIDynamicUnitInputNumber
    defaultUnit="g"
    style={{ width: '100%' }}
  />
</BAIFormItem>`,
    },
    {
      label: 'Bounded, GiB only',
      code: `<BAIDynamicUnitInputNumber
  value={memory}
  onChange={setMemory}
  units={['g']}
  min="1g"
  max="512g"
  roundStep={0.5}
/>`,
    },
  ],
} satisfies ComponentDoc;

export default docs;
