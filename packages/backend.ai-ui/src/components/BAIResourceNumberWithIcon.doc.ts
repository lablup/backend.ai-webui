import type { ComponentDoc } from '@astryxdesign/cli/authoring';

// No `type: 'component'` stamp: CLI 0.5.0's stamped component schema requires
// a top-level `props` array and has no multi-component variant, so a stamped
// `components` doc fails validation. Unstamped docs are shape-sniffed and the
// multi form is accepted.
export const docs = {
  name: 'BAIResourceNumberWithIcon',
  displayName: 'BAI Resource Number With Icon',
  category: 'Content',
  keywords: [
    'resource',
    'cpu',
    'memory',
    'gpu',
    'accelerator',
    'quantity',
    'unit',
    'metric',
  ],
  usage: {
    description:
      'Renders one resource slot as icon + amount + unit — the way CPU, memory and accelerator figures appear in every Backend.AI table, preset and session panel. Formatting is not hardcoded: the icon, display unit, rounding and binary-versus-decimal handling all come from BAIMetaDataProvider and BAIResourceSlotsProvider, so a slot only the server knows about still renders (with the generic chip icon and no unit). Optional max appends a `~max` bound, with `~∞` for Infinity, and comparedValue renders an allocated-versus-requested pair (`1 / 2 Core`) under one shared unit, tooltipped and suppressed when both sides round to the same displayed number. The icon half is exported on its own as ResourceTypeIcon.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Mount BAIResourceSlotsProvider above any surface using this component, otherwise every server-configured slot degrades to the generic icon without a unit.',
      },
      {
        guidance: true,
        description:
          'Pass the raw backend value as value and let the component format it — rounding and the binary GiB conversion are slot metadata, not a call-site decision.',
      },
      {
        guidance: true,
        description:
          'Use comparedValue for allocated-versus-requested pairs so both numbers share one unit and carry the explanatory tooltip.',
      },
      {
        guidance: true,
        description:
          'Reach for ResourceTypeIcon alone in a dense header or legend where the number is rendered separately.',
      },
      {
        guidance: false,
        description:
          'Pre-format the number into value; a string that is already rounded is rounded again against the slot format.',
      },
      {
        guidance: false,
        description:
          'Set hideTooltip on a list of accelerator icons — the tooltip carries the slot description, which is the only place the full device name appears.',
      },
    ],
  },
  components: [
    {
      name: 'BAIResourceNumberWithIcon',
      displayName: 'BAI Resource Number With Icon',
      description:
        'The full row: slot icon, formatted amount, optional bound and compared value, and the display unit.',
      props: [
        {
          name: 'type',
          type: 'string',
          description:
            'Resource slot name, such as "cpu", "mem", "cuda.device" or "rocm.device". It selects the icon, unit and number format. An unknown slot renders its own name as plain text.',
          required: true,
        },
        {
          name: 'value',
          type: 'string',
          description:
            'The amount, as the backend reports it. Formatted against the slot number format — binary slots convert to GiB, others honour the slot rounding length.',
          required: true,
        },
        {
          name: 'max',
          type: 'string',
          description:
            'Upper bound appended as `~max`. The literal "Infinity" renders as `~∞`.',
        },
        {
          name: 'comparedValue',
          type: 'string',
          description:
            'Reference amount rendered after the primary one as `value / comparedValue` in the muted color, sharing one unit, with an "Allocated / Requested" tooltip. Ignored when it rounds to the same displayed number as value.',
        },
        {
          name: 'opts',
          type: '{ shmem?: number }',
          description:
            'Extra slot options. For type "mem", a positive shmem appends the shared-memory size in GiB as a secondary note.',
        },
        {
          name: 'hideTooltip',
          type: 'boolean',
          description:
            'Suppresses the slot-description tooltip on the icon. The compared-value tooltip is independent and stays.',
          default: 'false',
        },
        {
          name: 'extra',
          type: 'ReactNode',
          description:
            'Trailing content placed inside the same flex row, after the unit.',
        },
      ],
    },
    {
      name: 'ResourceTypeIcon',
      displayName: 'Resource Type Icon',
      description:
        'The icon half on its own — the CPU, memory or accelerator glyph for a slot, with the slot description as its tooltip.',
      props: [
        {
          name: 'type',
          type: 'ResourceSlotName | string',
          description:
            'Resource slot name. CPU and memory use built-in lucide glyphs; a known accelerator uses its vendor icon; anything else loads the icon the server names from the host icon directory, falling back to a generic chip.',
          required: true,
        },
        {
          name: 'showTooltip',
          type: 'boolean',
          description:
            'Whether the icon carries a tooltip. The content is tooltipProps.title, else the slot description, else the slot name.',
          default: 'true',
        },
        {
          name: 'tooltipProps',
          type: '{ title?: ReactNode; placement?: AntdPlacement }',
          description:
            'Overrides the tooltip body and position. The antd-shaped compound placement (for example "left" or "topLeft") is split into the Astryx placement and alignment pair.',
        },
        {
          name: 'size',
          type: 'number',
          description:
            'Icon box in pixels, applied to the built-in glyphs and to the host-loaded image.',
          default: '16',
        },
      ],
    },
  ],
  examples: [
    {
      label: 'Resource limits in a table cell',
      code: `<BAIFlex direction="row" gap="xxs">
  {row?.resource_limits?.map((limit) => (
    <BAIResourceNumberWithIcon
      key={limit?.key}
      type={limit?.key || ''}
      value={limit?.min || '0'}
      max={limit?.max || 'Infinity'}
    />
  ))}
</BAIFlex>`,
    },
    {
      label: 'Icon only, in a compact header',
      code: `<BAIFlex gap="xxs" align="center">
  <ResourceTypeIcon type="mem" />
  <BAIText>{t('agent.Memory')}</BAIText>
</BAIFlex>`,
    },
  ],
} satisfies ComponentDoc;

export default docs;
