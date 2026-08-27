import type { ComponentDoc } from '@astryxdesign/cli/authoring';

export const docs = {
  type: 'component',
  name: 'BAIText',
  displayName: 'BAI Text',
  category: 'Content',
  keywords: [
    'text',
    'typography',
    'label',
    'ellipsis',
    'truncate',
    'copyable',
    'code',
  ],
  usage: {
    description:
      'Inline text with the antd Typography.Text prop surface and structure, rendered on Astryx tokens: one span that inherits the surrounding font size, plus the semantic colors, the strong/italic/underline/delete decorations, the code, keyboard and mark boxes, CSS truncation (single or multi-line) with an optional tooltip and an expand link, and a copy-to-clipboard control. With ellipsis or copyable the span becomes an inline-flex row holding the clamp box and the controls, so the text still measures its own overflow. Its strings (the copy label, the expand and collapse links) are translated through useBAIi18n. Remaining props are standard HTML attributes and land on the root span.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Pair ellipsis with a width constraint on the element — truncation only happens once the text box is actually bounded.',
      },
      {
        guidance: true,
        description:
          'Pass ellipsis={{ tooltip: true }} in table cells so the full value stays reachable on hover after it is clipped.',
      },
      {
        guidance: true,
        description:
          'Set copyable on identifiers users need to paste elsewhere, such as access keys, image names and endpoint URLs.',
      },
      {
        guidance: false,
        description:
          'Rely on the rendered children as the copy target when they are truncated or built from elements — pass copyable.text with the full value instead.',
      },
      {
        guidance: false,
        description:
          'Express a status color with an inline style; use type="danger", "warning", "success" or "secondary" so the color comes from the theme.',
      },
    ],
  },
  props: [
    {
      name: 'children',
      type: 'ReactNode',
      description:
        'The text content. A string or number is also what copyable writes to the clipboard.',
    },
    {
      name: 'type',
      type: "'secondary' | 'success' | 'warning' | 'danger'",
      description:
        'Semantic color, from the theme tokens (--color-text-secondary, --color-success, --color-warning, --color-error).',
    },
    {
      name: 'strong',
      type: 'boolean',
      description: 'Renders the text at semibold weight.',
    },
    {
      name: 'italic',
      type: 'boolean',
      description: 'Applies an italic font style.',
    },
    {
      name: 'underline',
      type: 'boolean',
      description:
        'Underlines the text. Combined with delete it renders underline plus line-through.',
    },
    {
      name: 'delete',
      type: 'boolean',
      description:
        'Strikes the text through, for values that have been removed or superseded.',
    },
    {
      name: 'mark',
      type: 'boolean',
      description: 'Wraps the text in a highlighted mark box.',
    },
    {
      name: 'code',
      type: 'boolean',
      description: 'Wraps the text in an inline code box.',
    },
    {
      name: 'keyboard',
      type: 'boolean',
      description: 'Wraps the text in a keyboard-key (kbd) box.',
    },
    {
      name: 'disabled',
      type: 'boolean',
      description:
        'Renders the text in the disabled color. Takes precedence over type.',
    },
    {
      name: 'monospace',
      type: 'boolean',
      description:
        'Switches to the code font family without the Code box, for identifiers and hashes shown inline in a table.',
    },
    {
      name: 'size',
      type: 'BAITextSize',
      description:
        'Font size step on the Astryx scale (4xs … 4xl). Without it the text inherits the surrounding size.',
    },
    {
      name: 'inheritColor',
      type: 'boolean',
      description:
        'Takes the surrounding color instead of the default text color, for a BAIText nested in a link or another element that owns the color. Ignored when type or disabled is set.',
    },
    {
      name: 'ellipsis',
      type: 'boolean | BAITextEllipsisConfig',
      description:
        'Clamps the text. true clamps to one line; the object form takes rows for a multi-line clamp, tooltip to reveal the full value on hover, expandable to append an expand and collapse link, and onExpand to observe it.',
    },
    {
      name: 'copyable',
      type: 'boolean | BAITextCopyConfig',
      description:
        'Appends a copy button beside the text. The object form takes text (a string or a function returning one) to copy something other than the children, icon and tooltips as a node or an antd-style [resting, copied] tuple, and onCopy to observe the click; the button shows the copied state for 1.5 seconds after copying.',
    },
    {
      name: 'style',
      type: 'React.CSSProperties',
      description:
        'Merged over the decoration styles this component computes, so it can carry the width constraint that ellipsis needs.',
    },
  ],
  examples: [
    {
      label: 'Monospace identifier in a table cell',
      code: `<BAIText monospace>{record.access_key}</BAIText>`,
    },
    {
      label: 'Truncated name with a tooltip',
      code: `<BAIText ellipsis={{ tooltip: row.name }} style={{ maxWidth: 160 }}>
  {row.name}
</BAIText>`,
    },
  ],
} satisfies ComponentDoc;

export default docs;
