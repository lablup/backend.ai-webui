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
      'Inline text built on the Astryx Text primitive, adding the treatments Text does not carry on its own: truncation with an optional tooltip and an expand link, a copy-to-clipboard control, and the semantic color, mark and code boxes. The type, strong, delete, ellipsis and copyable props are mapped onto Astryx equivalents internally (type onto Text color, strong onto weight semibold, delete onto hasStrikethrough, ellipsis onto maxLines), so callers keep one vocabulary across the app. Its strings (the copy label, the expand and collapse links) are translated through useBAIi18n. Remaining props pass through to Astryx Text, which also forwards standard HTML attributes.',
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
          'Combine copyable with non-string children and expect the clipboard to receive the rendered output — the copy target falls back to an empty string unless children are a string or a number, or copyable.text is supplied.',
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
        'Semantic color, mapped onto the matching Astryx Text color. The status colors are defined once in the theme rather than per call site.',
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
      description: 'Wraps the text in an Astryx Code box.',
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
      type: "TextProps['size']",
      description: 'Astryx Text size step, forwarded as-is.',
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
        'Appends a copy button beside the text. The object form takes text to copy something other than the children, icon to replace the glyph, and onCopy to observe the click; the button shows a check for 1.5 seconds after copying.',
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
