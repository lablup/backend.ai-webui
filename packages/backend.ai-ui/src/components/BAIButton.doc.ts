import type { ComponentDoc } from '@astryxdesign/cli/authoring';

export const docs = {
  type: 'component',
  name: 'BAIButton',
  displayName: 'BAI Button',
  category: 'Action',
  keywords: ['button', 'action', 'cta', 'submit', 'icon button', 'loading'],
  usage: {
    description:
      'The project button. It renders Astryx Button, or Astryx IconButton when an icon is passed with no children, behind an antd-shaped prop vocabulary (type, size, danger, block, loading) so the call sites carried over from the antd era keep compiling. On top of that mapping it adds an accessible-name fallback: an icon-only button resolves its label from aria-label, then title, then a generic placeholder, because Astryx requires a label and antd did not. Remaining props pass through to the underlying Astryx component, and title becomes its tooltip rather than the native browser one.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Pass an async handler to action for mutations and refetches — Astryx clickAction shows the pending spinner, sets aria-busy, and swallows re-clicks until the promise settles, so no local isPending state is needed.',
      },
      {
        guidance: true,
        description:
          'Give every icon-only button an aria-label or title; without one it falls back to a generic placeholder and a screen reader announces nothing useful.',
      },
      {
        guidance: false,
        description:
          'Hand-roll a loading flag around an async onClick when action already derives it from the returned promise.',
      },
      {
        guidance: false,
        description:
          'Expect ghost, shape, htmlType or iconPosition to work — they are not part of the surface, and color is accepted but only danger carries meaning.',
      },
    ],
  },
  props: [
    {
      name: 'type',
      type: "'primary' | 'default' | 'text' | 'link' | 'dashed'",
      description:
        'Emphasis axis. primary maps to the Astryx primary variant, text and link to ghost, default and dashed to secondary. danger overrides whatever this selects.',
    },
    {
      name: 'danger',
      type: 'boolean',
      description:
        'Renders the destructive variant, winning over type and variant. Use it for delete, terminate and purge triggers.',
    },
    {
      name: 'size',
      type: "'small' | 'middle' | 'large'",
      description:
        'antd size names, mapped to the Astryx sm / md / lg element sizes. Left unset, the Astryx default applies.',
    },
    {
      name: 'icon',
      type: 'ReactNode',
      description:
        'Glyph rendered before the label. With no children the component switches to Astryx IconButton, which needs an accessible name from aria-label or title.',
    },
    {
      name: 'children',
      type: 'ReactNode',
      description:
        'Button content. It is also flattened into the Astryx label prop, so text children double as the accessible name.',
    },
    {
      name: 'action',
      type: '() => Promise<void>',
      description:
        'Async click handler wired to Astryx clickAction. The button shows a spinner and reports aria-busy while the promise is pending, and ignores further clicks until it settles.',
    },
    {
      name: 'loading',
      type: 'boolean',
      description:
        'Forces the spinner and blocks interaction. Only needed when the pending state comes from outside; action drives it on its own.',
    },
    {
      name: 'disabled',
      type: 'boolean',
      description:
        'Blocks interaction and applies the Astryx disabled styling.',
    },
    {
      name: 'block',
      type: 'boolean',
      description: 'Stretches the button to the full width of its container.',
    },
    {
      name: 'title',
      type: 'string',
      description:
        'Becomes the Astryx tooltip instead of the native browser title, and serves as the accessible name when there are no text children.',
    },
    {
      name: 'variant',
      type: "'filled' | 'outlined' | 'solid' | 'dashed' | 'text' | 'link'",
      description:
        'antd v6 emphasis axis, resolved together with type. solid behaves like primary, text and link like ghost, everything else like secondary.',
    },
    {
      name: 'color',
      type: 'string',
      description:
        'antd v6 colour axis. Only danger is honoured — it selects the destructive variant; any other value is accepted and ignored, because Astryx Button has no colour slot.',
    },
  ],
  examples: [
    {
      label: 'Async action',
      code: '<BAIButton type="primary" action={handleAssign}>\n  {t(\'general.Add\')}\n</BAIButton>',
    },
    {
      label: 'Destructive icon-only row action',
      code: '<BAIButton\n  danger\n  size="small"\n  icon={<Trash2 />}\n  title={t(\'button.Delete\')}\n  onClick={() => setDeletingTarget(record)}\n/>',
    },
  ],
} satisfies ComponentDoc;

export default docs;
