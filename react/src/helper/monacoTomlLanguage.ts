import type { Monaco } from '@monaco-editor/react';

// Monaco language registration is global and persists across component lifecycles.
export function registerTomlLanguage(monaco: Monaco) {
  if (
    monaco.languages
      .getLanguages()
      .some((lang: { id: string }) => lang.id === 'toml')
  )
    return;

  monaco.languages.register({
    id: 'toml',
    extensions: ['.toml'],
    aliases: ['TOML'],
    mimetypes: ['application/toml'],
  });

  monaco.languages.setMonarchTokensProvider('toml', {
    tokenizer: {
      root: [
        // Comments
        [/#.*$/, 'comment'],

        // Table headers
        [/\[\[/, 'keyword', '@arrayTable'],
        [/\[/, 'keyword', '@table'],

        // Key-value pairs
        [/[a-zA-Z_][a-zA-Z0-9_-]*(?=\s*=)/, 'variable'],
        [/"(?:[^"\\]|\\.)*"(?=\s*=)/, 'variable'],
        [/'[^']*'(?=\s*=)/, 'variable'],

        // Equals sign
        [/=/, 'delimiter'],

        // Values
        [/"""/, 'string', '@multilineBasicString'],
        [/'''/, 'string', '@multilineLiteralString'],
        [/"(?:[^"\\]|\\.)*"/, 'string'],
        [/'[^']*'/, 'string'],
        [/\b(?:true|false)\b/, 'keyword.constant'],
        [/\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}:\d{2}/, 'number.date'],
        [/\d{4}-\d{2}-\d{2}/, 'number.date'],
        [/\d{2}:\d{2}:\d{2}/, 'number.date'],
        [/[+-]?(?:0x[0-9a-fA-F_]+|0o[0-7_]+|0b[01_]+)/, 'number.hex'],
        [
          /[+-]?(?:\d[\d_]*\.[\d_]*(?:[eE][+-]?\d[\d_]*)?|\.?\d[\d_]*[eE][+-]?\d[\d_]*)/,
          'number.float',
        ],
        [/[+-]?(?:inf|nan)\b/, 'number.float'],
        [/[+-]?\d[\d_]*/, 'number'],
      ],

      table: [
        [/[^\]]+/, 'type'],
        [/\]/, 'keyword', '@pop'],
      ],

      arrayTable: [
        [/[^\]]+/, 'type'],
        [/\]\]/, 'keyword', '@pop'],
      ],

      multilineBasicString: [
        [/"""/, 'string', '@pop'],
        [/[^"\\]+/, 'string'],
        [/\\./, 'string.escape'],
        [/"/, 'string'],
      ],

      multilineLiteralString: [
        [/'''/, 'string', '@pop'],
        [/[^']+/, 'string'],
        [/'/, 'string'],
      ],
    },
  });
}
