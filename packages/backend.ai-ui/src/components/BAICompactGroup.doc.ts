import type { ComponentDoc } from '@astryxdesign/cli/authoring';

export const docs = {
  type: 'component',
  name: 'BAICompactGroup',
  displayName: 'BAI Compact Group',
  category: 'Layout',
  keywords: [
    'compact',
    'space compact',
    'input group',
    'button group',
    'attached',
    'joined',
    'segmented',
  ],
  usage: {
    description:
      'A horizontal run of form controls welded into a single control — what antd `Space.Compact` did for this codebase. It renders an Astryx HStack with `gap` and `wrap` fixed (0 / nowrap) and adds the stylesheet that overlaps adjacent members by one border width, squares the inner corners, and raises the focused member above its neighbour, so two bordered fields read as one surface instead of two boxes colliding. Astryx ships the same recipe inside InputGroup, but InputGroup takes a single group-level label and cannot host two BAIFormItems that each own a label, rules and error message — that is the gap this fills. Every remaining HStack prop except `gap` and `wrap` passes through to the HStack.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Reach for it only when the members are parts of one value — an e-mail prefix and suffix, a number and its unit. Anything else wants a BAIFlex with a gap.',
      },
      {
        guidance: true,
        description:
          'Give each child `flex: 1` or an explicit width, exactly as it was sized inside the plain row this replaces; the group itself spans its container.',
      },
      {
        guidance: true,
        description:
          'Wrap each member in its own BAIFormItem when the fields validate separately — the weld is purely visual and leaves per-field labels and error messages intact.',
      },
      {
        guidance: false,
        description:
          'Expect a vertical variant. The component is horizontal only by decision; supporting stacking requires a `direction` prop plus a mirrored block of rules.',
      },
      {
        guidance: false,
        description:
          'Reintroduce spacing between members through a child margin — a gap undoes the weld and restores the doubled border the component exists to remove.',
      },
    ],
  },
  props: [
    {
      name: 'width',
      type: "HStackProps['width']",
      description:
        'Width of the group. Full-bleed by default because every call site is a full-width form row; pass a size value (or undefined) to size it to its content instead.',
      default: "'100%'",
    },
    {
      name: 'className',
      type: 'string',
      description:
        'Extra class, appended to the internal `bai-compact-group` class rather than replacing it.',
    },
    {
      name: 'children',
      type: 'ReactNode',
      description:
        'The welded members: an Astryx control directly, or a wrapper such as BAIFormItem that renders one. The stylesheet reaches the bordered surface either way.',
    },
  ],
  examples: [
    {
      label: 'E-mail prefix and suffix as one control',
      code: `<BAICompactGroup>
  <BAIFormItem
    name="email_prefix"
    label={t('credential.EmailPrefix')}
    style={{ flex: 1 }}
    rules={[{ required: true }, { max: 30 }]}
  >
    <AstryxFormTextInput label={t('credential.EmailPrefix')} />
  </BAIFormItem>
  <BAIFormItem
    name="email_suffix"
    label={t('credential.EmailSuffix')}
    style={{ flex: 1 }}
    rules={[{ required: true }, { max: 30 }]}
  >
    <AstryxFormTextInput label={t('credential.EmailSuffix')} />
  </BAIFormItem>
</BAICompactGroup>`,
    },
  ],
} satisfies ComponentDoc;

export default docs;
