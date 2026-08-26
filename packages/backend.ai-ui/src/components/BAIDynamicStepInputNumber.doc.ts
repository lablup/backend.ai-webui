import type { ComponentDoc } from '@astryxdesign/cli/authoring';

export const docs = {
  type: 'component',
  name: 'BAIDynamicStepInputNumber',
  displayName: 'BAI Dynamic Step Input Number',
  category: 'Data Input',
  keywords: [
    'number input',
    'stepper',
    'spinner',
    'input number',
    'resource',
    'cpu',
    'gpu',
    'quantity',
  ],
  usage: {
    description:
      "A numeric field whose stepping follows a non-linear ladder rather than a fixed increment — `0.125, 0.25, 0.5, 1, 2, 4, 8, …`, the shape resource allocations actually take. It composes an Astryx `InputGroup` around a `NumberInput` plus a pair of stepper `IconButton`s, and cancels `NumberInput`'s own linear ArrowUp / ArrowDown handling so the keyboard walks the same ladder as the buttons. Each step is clamped into `min` / `max` before it is committed. The component is controlled only: `value` and `onChange` are both required, so the caller always owns the state.",
    bestPractices: [
      {
        guidance: true,
        description:
          'Give `dynamicSteps` the values the resource can actually take — the ladder is the whole point of the component, and a linear array makes a plain `NumberInput` the better choice.',
      },
      {
        guidance: true,
        description:
          'Keep `min` and `max` aligned with entries in the ladder, so a step lands on a real rung instead of being clamped to a value the ladder never offers.',
      },
      {
        guidance: true,
        description:
          "Pass a unit string through `addonAfter` — it is flattened to text and rendered as the field's `units`, which reads better than a suffix node.",
      },
      {
        guidance: false,
        description:
          'Expect typed input to be snapped to the ladder; only the steppers and the arrow keys move along it, and a typed value is taken as-is.',
      },
      {
        guidance: false,
        description:
          'Rely on `style` or `className` to size the field — they are declared for source compatibility but are not forwarded to any element; the input fills its `InputGroup`.',
      },
    ],
  },
  props: [
    {
      name: 'dynamicSteps',
      type: 'Array<number>',
      description:
        'The ladder the steppers and arrow keys walk, in ascending order. Also supplies the uncontrolled starting value (its first entry).',
      default:
        '[0, 0.0625, 0.125, 0.25, 0.5, 0.75, 1, 2, 4, 8, 16, 32, 64, 128, 256, 512, 1024, 2048, 4096, 8192, 16384, 32768, 65536]',
    },
    {
      name: 'value',
      type: 'number',
      description:
        'Current value, rendered directly by the field. Pair it with `onChange` for a controlled field.',
      required: true,
    },
    {
      name: 'onChange',
      type: '(value: number) => void',
      description:
        'Called with the new value after a step, an arrow key, or a typed entry. A cleared field reports `0`.',
      required: true,
    },
    {
      name: 'min',
      type: 'number',
      description:
        'Lower bound. A step that would fall below it commits `min` instead, so the ladder never leaves the allowed range.',
    },
    {
      name: 'max',
      type: 'number',
      description: 'Upper bound. A step past it commits `max` instead.',
    },
    {
      name: 'placeholder',
      type: 'string',
      description:
        'Placeholder text. It also stands in as the accessible name when no `label` is given.',
    },
    {
      name: 'disabled',
      type: 'boolean',
      description:
        'Disables the field and both steppers, and makes the arrow keys inert.',
    },
    {
      name: 'addonAfter',
      type: 'ReactNode',
      description:
        "Trailing unit. Flattened to plain text and passed as the number field's `units`, so a node degrades to its text content.",
    },
    {
      name: 'label',
      type: 'string',
      description:
        'Accessible name for the group and the input. Without it the name falls back to `placeholder`, then to a generic string, and the label is hidden.',
    },
    {
      name: 'isLabelHidden',
      type: 'boolean',
      description:
        'Whether the group label is visually hidden. Defaults to hidden whenever no `label` was passed.',
      default: 'label === undefined',
    },
    {
      name: 'style',
      type: 'CSSProperties',
      description:
        'Accepted for source compatibility with the antd-era call sites and not forwarded to any element.',
    },
    {
      name: 'className',
      type: 'string',
      description:
        'Accepted for source compatibility with the antd-era call sites and not forwarded to any element.',
    },
  ],
  examples: [
    {
      label: 'Resource quantity on a power-of-two ladder',
      code: `<BAIDynamicStepInputNumber
  value={value}
  onChange={setValue}
  dynamicSteps={[0, 0.5, 1, 2, 4, 8, 16, 32]}
  min={0}
  max={32}
/>`,
    },
    {
      label: 'With a unit and a visible label',
      code: `<BAIDynamicStepInputNumber
  label={t('session.launcher.MemoryPerContainer')}
  value={memory}
  onChange={setMemory}
  addonAfter="GiB"
  min={0}
/>`,
    },
  ],
} satisfies ComponentDoc;

export default docs;
