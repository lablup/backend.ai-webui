import type { ComponentDoc } from '@astryxdesign/cli/authoring';

export const docs = {
  type: 'component',
  name: 'BAITextHighlighter',
  displayName: 'BAI Text Highlighter',
  category: 'Content',
  keywords: [
    'highlight',
    'mark',
    'search match',
    'keyword',
    'text highlight',
    'emphasis',
    'find',
  ],
  usage: {
    description:
      'Marks every case-insensitive occurrence of a keyword inside a plain string, so a search term stays visible in the result that matched it. It splits the text on the keyword and paints the matching runs with the warning-hover background token, leaving the rest untouched; the keyword is regex-escaped, so a query containing dots or brackets is matched literally rather than blowing up. With no keyword it renders the text as-is, and with no text it renders nothing, which makes it safe to drop into a cell or option row unconditionally. It is memoized, since it typically re-renders once per keystroke across a whole list.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Feed it the same search value that filtered the list, so what is highlighted is what actually matched.',
      },
      {
        guidance: true,
        description:
          'Pass the text as children of a single string — a name, an ID, a tag value — and let the surrounding component own truncation and colour.',
      },
      {
        guidance: false,
        description:
          'Nest elements inside it; only a string is split, and a node child does not type-check.',
      },
      {
        guidance: false,
        description:
          'Override the highlight background through `style` for decoration — the token is what keeps highlights consistent across tables, tags and select options.',
      },
    ],
  },
  props: [
    {
      name: 'children',
      type: 'string | null',
      description:
        'The text to search within. Empty, null or undefined renders nothing at all.',
    },
    {
      name: 'keyword',
      type: 'string',
      description:
        'The term to highlight, matched case-insensitively and escaped before it becomes a regular expression. Empty renders the text unhighlighted.',
    },
    {
      name: 'style',
      type: 'React.CSSProperties',
      description:
        'Inline style applied to the highlighted runs only. It is merged after the background token, so a background here replaces it.',
    },
  ],
  examples: [
    {
      label: 'Highlighting the search term in a select option',
      code: `<BAITextHighlighter keyword={searchValue}>
  {project.name}
</BAITextHighlighter>`,
    },
    {
      label: 'Inside a table cell',
      code: `<BAIText monospace ellipsis>
  <BAITextHighlighter keyword={filterKeyword}>{row.id}</BAITextHighlighter>
</BAIText>`,
    },
  ],
} satisfies ComponentDoc;

export default docs;
