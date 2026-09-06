import type { ComponentDoc } from '@astryxdesign/cli/authoring';

export const docs = {
  type: 'component',
  name: 'BAIDynamicUnitInputNumberWithSlider',
  displayName: 'BAI Dynamic Unit Input Number With Slider',
  category: 'Data Input',
  keywords: [
    'slider',
    'range',
    'input number',
    'memory',
    'size',
    'unit',
    'allocation',
    'quota',
  ],
  usage: {
    description:
      'The memory-style allocation field: a `BAIDynamicUnitInputNumber` and an Astryx `Slider` bound to one `"<number><unit>"` value such as `"4g"`. The two halves sit in a `BAIFlex` row at a 2:3 ratio; the slider works in GiB internally, converting the string value in and back out (below 1 GiB it writes MiB), and always starts its rail at 0 so the fill reads as a proportion of the maximum. Marks for `min` and `max` are generated automatically and merged with `extraMarks`, with out-of-range marks dropped. When `min` exceeds `max` the slider shows 0 and disables itself rather than rendering a nonsensical rail. Props other than the ones below go to `BAIDynamicUnitInputNumber`, whose `BAIDynamicUnitInputNumberProps` this type extends.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Feed `min` and `max` from the live resource limits so the rail and its end marks describe the range the user can actually allocate.',
      },
      {
        guidance: true,
        description:
          'Use `extraMarks` to mark a meaningful threshold such as remaining quota; a mark beyond `max` is filtered out rather than clipped onto the end.',
      },
      {
        guidance: true,
        description:
          'Give `extraMarks` labels that carry text — a JSX label is flattened to its accessible text, and a label with none renders as an unlabelled tick.',
      },
      {
        guidance: false,
        description:
          'Pass `warn` expecting a tinted track; Astryx `Slider` exposes no slot styling, so the prop is inert.',
      },
      {
        guidance: false,
        description:
          'Set `hideSlider` to reach a plain size field — use `BAIDynamicUnitInputNumber` directly instead, since the slider is only visually hidden and still occupies the row.',
      },
    ],
  },
  props: [
    {
      name: 'extraMarks',
      type: 'BAISliderMarks',
      description:
        "Additional slider marks as a position-keyed map, `{ [value]: ReactNode | { label, style } }`. Converted internally to Astryx's sorted array form; per-mark `style` is not applied, and marks outside `min`–`max` are dropped.",
    },
    {
      name: 'hideSlider',
      type: 'boolean',
      description:
        'Hides the slider column with `visibility: hidden` and zero height, leaving only the number field visible. The column is still in the layout.',
    },
    {
      name: 'warn',
      type: 'string',
      description:
        'Legacy warning threshold. Inert — the warning track tint it drove has no Astryx equivalent and no call site passes it.',
    },
    {
      name: 'step',
      type: 'number',
      description:
        'Slider step in GiB. Also passed to the number field as its `roundStep`, so both halves land on the same grid.',
      default: '0.05',
    },
    {
      name: 'inputMinWidth',
      type: 'number',
      description:
        'Accepted for source compatibility and not applied; the number column carries a fixed 190px minimum width.',
    },
    {
      name: 'addonPrefix',
      type: 'React.ReactNode',
      description:
        'Content rendered before the number field, inside its input group. Forwarded to `BAIDynamicUnitInputNumber`.',
    },
    {
      name: 'addonSuffix',
      type: 'React.ReactNode',
      description:
        'Content rendered after the number field, inside its input group. Forwarded to `BAIDynamicUnitInputNumber`.',
    },
    {
      name: 'min',
      type: 'string',
      description:
        "Lower bound as a unit string. It becomes the slider's first mark and the floor the slider snaps up to, but not the rail's origin — the rail always starts at 0.",
      default: "'0m'",
    },
    {
      name: 'max',
      type: 'string',
      description:
        'Upper bound as a unit string. Sets the slider maximum and its last mark.',
      default: "'32g'",
    },
    {
      name: 'units',
      type: 'Array<string>',
      description:
        'Units offered by the number field. Narrowed here from the base component default, since the slider reasons in MiB and GiB.',
      default: "['m', 'g']",
    },
    {
      name: 'defaultUnit',
      type: 'string',
      description:
        'Unit the number field starts in when the value carries none. Forwarded unchanged.',
    },
    {
      name: 'value',
      type: 'string | null | undefined',
      description:
        'Current size as a unit string, e.g. `"4g"`. Controllable — omit it and the component holds the value itself.',
    },
    {
      name: 'onChange',
      type: '(value: string) => void',
      description:
        'Called with the new unit string from either half. Slider moves below 1 GiB are emitted in MiB, so read the unit rather than assuming one.',
    },
  ],
  examples: [
    {
      label: 'Memory allocation with a remaining-quota mark',
      code: `<BAIDynamicUnitInputNumberWithSlider
  defaultUnit="g"
  min={resourceLimits.mem?.min}
  max={resourceLimits.mem?.max}
  extraMarks={{
    [remainingGiB]: { label: <RemainingMark /> },
  }}
  onChange={(nextValue) => {
    form.setFieldValue('allocationPreset', 'custom');
    runShmemAutomationRule(nextValue || '0g');
  }}
/>`,
    },
    {
      label: 'Slider hidden, number field only',
      code: `<BAIDynamicUnitInputNumberWithSlider
  min="0m"
  max="8g"
  hideSlider
  value={shmem}
  onChange={setShmem}
/>`,
    },
  ],
} satisfies ComponentDoc;

export default docs;
