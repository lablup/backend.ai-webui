import type { ComponentDoc } from '@astryxdesign/cli/authoring';

export const docs = {
  type: 'component',
  name: 'BAINumberWithUnit',
  displayName: 'BAI Number With Unit',
  category: 'Content',
  keywords: [
    'bytes',
    'size',
    'unit',
    'binary',
    'decimal',
    'formatted number',
    'statistic',
    'humanize',
  ],
  usage: {
    description:
      'Renders a byte-style quantity converted into a target unit, with the number in the primary text colour and the unit in the secondary one. It parses the incoming value-plus-unit string through `convertToBinaryUnit` or `convertToDecimalUnit` (1024-based or 1000-based) and rounds to two decimals. When the value rounds to zero in the requested unit but is not actually zero, it appends the auto-picked unit in parentheses — `0 GiB (512 MiB)` — so a small non-zero amount never reads as nothing. Layout is a BAIFlex row of Astryx Text nodes; it takes no styling props.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Keep `unitType` consistent with the source of the number — storage quotas reported by the manager are binary, so a decimal conversion silently misreports the size.',
      },
      {
        guidance: true,
        description:
          'Use `comparedValue` for a used-of-total reading; it renders as `used / total` with one shared trailing unit, both sides converted the same way.',
      },
      {
        guidance: true,
        description:
          'Pick a `targetUnit` that matches the column so rows line up, and rely on the parenthesised auto unit to rescue the small outliers.',
      },
      {
        guidance: false,
        description:
          'Pass a pre-formatted string such as "3.5 GiB" — the input is a raw value with an optional single-letter unit suffix, like "1024m" or "512".',
      },
      {
        guidance: false,
        description:
          'Build a used-of-total reading by hand in `postfix`; that string is glued to the number and is not converted.',
      },
    ],
  },
  props: [
    {
      name: 'numberUnit',
      type: 'string',
      description:
        'The value to display, optionally carrying a unit suffix — "1024m", "2g", or a bare byte count such as "512".',
      required: true,
    },
    {
      name: 'targetUnit',
      type: 'SizeUnit',
      description:
        "Unit to convert into — '' (bytes), 'k', 'm', 'g', 't', 'p' or 'e'. The rendered suffix is the binary or decimal spelling of it (GiB vs GB); 'auto' is not accepted here, the component picks it only for the parenthesised fallback.",
      required: true,
    },
    {
      name: 'unitType',
      type: "'binary' | 'decimal'",
      description:
        'Conversion base — binary is 1024-based (KiB, MiB, GiB), decimal is 1000-based (KB, MB, GB). It also decides the auto-unit fallback shown in parentheses.',
      required: true,
    },
    {
      name: 'postfix',
      type: 'string',
      description:
        'Text appended directly after the number, before the unit. Rendered verbatim in the primary colour, with no conversion.',
    },
    {
      name: 'comparedValue',
      type: 'string',
      description:
        'Reference value rendered as `/ compared` after the number, converted with the same unit and base and shown in the secondary colour so the pair reads as used-of-total.',
    },
  ],
  examples: [
    {
      label: 'Memory column in a resource preset table',
      code: `<BAINumberWithUnit numberUnit={text} targetUnit="g" unitType="binary" />`,
    },
    {
      label: 'Used of total',
      code: `<BAINumberWithUnit
  numberUnit={usedBytes}
  comparedValue={quotaBytes}
  targetUnit="g"
  unitType="binary"
/>`,
    },
  ],
} satisfies ComponentDoc;

export default docs;
