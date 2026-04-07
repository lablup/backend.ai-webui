import type { ITextModel } from './monacoSchemaValidator';
import type { Monaco } from '@monaco-editor/react';
import { parse } from 'yaml';

type CompletionItem = {
  label: string;
  kind: number;
  detail?: string;
  documentation?: string;
  insertText: string;
  insertTextRules?: number;
  sortText?: string;
};

type JSONSchema = {
  type?: string | string[];
  properties?: Record<string, JSONSchema>;
  items?: JSONSchema;
  $ref?: string;
  $defs?: Record<string, JSONSchema>;
  oneOf?: JSONSchema[];
  anyOf?: JSONSchema[];
  description?: string;
  default?: unknown;
  required?: string[];
  examples?: unknown[];
  enum?: unknown[];
  additionalProperties?: boolean | JSONSchema;
};

/**
 * Resolve a JSON Schema `$ref` pointer (e.g., "#/$defs/ModelConfig")
 * within the root schema.
 */
function resolveRef(ref: string, root: JSONSchema): JSONSchema | undefined {
  if (!ref.startsWith('#/')) return undefined;
  const parts = ref.slice(2).split('/');
  let current: unknown = root;
  for (const part of parts) {
    if (current == null || typeof current !== 'object') return undefined;
    current = (current as Record<string, unknown>)[part];
  }
  return current as JSONSchema | undefined;
}

/**
 * Resolve a schema node, following `$ref` and unwrapping `oneOf`/`anyOf`
 * to find the first object-typed schema.
 */
function resolveSchema(schema: JSONSchema, root: JSONSchema): JSONSchema {
  if (schema.$ref) {
    const resolved = resolveRef(schema.$ref, root);
    if (resolved) return resolveSchema(resolved, root);
  }
  // Unwrap oneOf/anyOf — pick the first object-typed alternative
  for (const branch of schema.oneOf ?? schema.anyOf ?? []) {
    const resolved = resolveSchema(branch, root);
    if (
      resolved.type === 'object' ||
      resolved.properties ||
      resolved.items ||
      resolved.$ref
    ) {
      return resolved;
    }
  }
  return schema;
}

/**
 * Determine the schema path for the context at the cursor position.
 *
 * Scans lines above the cursor, builds an indentation stack, then trims it
 * to only the entries that are *strictly* less indented than the cursor —
 * i.e., the ancestors. This way, when the cursor is on a blank line inside
 * an array item, we get the array item's object schema (not a sibling key).
 *
 * `cursorIndent` is the column offset of the cursor (0-based), used to
 * decide which stack entries are parents vs. siblings.
 */
function getSchemaPathAtCursor(
  model: ITextModel,
  lineNumber: number,
  cursorIndent: number,
): (string | number)[] {
  const indentStack: {
    indent: number;
    key: string;
    isArrayContainer: boolean;
  }[] = [];

  for (let i = 1; i < lineNumber; i++) {
    const line = model.getLineContent(i);

    // Skip empty lines and comments
    if (/^\s*$/.test(line) || /^\s*#/.test(line)) continue;

    const indent = line.search(/\S/);
    if (indent < 0) continue;

    const isArrayItem = /^\s*-\s/.test(line);
    const keyMatch = line.match(/^\s*(?:-\s+)?(\w[\w.-]*)(?:\s*:)/);

    // Pop entries at the same or deeper indentation
    while (indentStack.length > 0) {
      const top = indentStack[indentStack.length - 1];
      if (top.indent >= indent) {
        indentStack.pop();
      } else {
        break;
      }
    }

    if (isArrayItem && keyMatch) {
      // Split array item into two entries:
      // 1. The array container "- " at `indent` (adds index 0 to path)
      // 2. The key inside it at `indent + 2` (a sibling of other keys)
      indentStack.push({ indent, key: '', isArrayContainer: true });
      indentStack.push({
        indent: indent + 2,
        key: keyMatch[1],
        isArrayContainer: false,
      });
    } else if (isArrayItem) {
      indentStack.push({ indent, key: '', isArrayContainer: true });
    } else if (keyMatch) {
      indentStack.push({ indent, key: keyMatch[1], isArrayContainer: false });
    }
  }

  // Trim to ancestors only: keep entries strictly less indented than cursor.
  while (indentStack.length > 0) {
    const top = indentStack[indentStack.length - 1];
    if (top.indent >= cursorIndent) {
      indentStack.pop();
    } else {
      break;
    }
  }

  // Build path from the remaining (ancestor) entries.
  const path: (string | number)[] = [];
  for (const entry of indentStack) {
    if (entry.isArrayContainer) {
      path.push(0); // Array index
    } else {
      path.push(entry.key); // Object key
    }
  }

  return path;
}

/**
 * Navigate the schema tree following the given path to find the schema
 * at the cursor's context.
 */
function getSchemaAtPath(
  path: (string | number)[],
  schema: JSONSchema,
  root: JSONSchema,
): JSONSchema | undefined {
  let current = resolveSchema(schema, root);

  for (const segment of path) {
    if (typeof segment === 'number') {
      // Array index — follow `items`
      if (current.items) {
        current = resolveSchema(current.items, root);
      } else {
        return undefined;
      }
    } else {
      // Object key — follow `properties`
      const props = current.properties;
      if (props && props[segment]) {
        current = resolveSchema(props[segment], root);
      } else {
        return undefined;
      }
    }
  }

  return current;
}

/**
 * Build a YAML snippet for a property value based on its schema type.
 */
function buildValueSnippet(propSchema: JSONSchema, root: JSONSchema): string {
  const resolved = resolveSchema(propSchema, root);

  if (resolved.enum && resolved.enum.length > 0) {
    // Offer enum choices
    const choices = resolved.enum.join(',');
    return `\${1|${choices}|}`;
  }

  if (resolved.examples && resolved.examples.length > 0) {
    const example = resolved.examples[0];
    if (typeof example === 'string') return ` \${1:${example}}`;
    if (typeof example === 'number') return ` \${1:${example}}`;
  }

  const type = Array.isArray(resolved.type) ? resolved.type[0] : resolved.type;
  switch (type) {
    case 'string':
      return ' ${1:value}';
    case 'integer':
    case 'number':
      return resolved.default != null
        ? ` \${1:${resolved.default}}`
        : ' ${1:0}';
    case 'boolean':
      return ' ${1|true,false|}';
    case 'array':
      return '\n  - ${1}';
    case 'object':
      return '\n  ${1}';
    default:
      return ' ${1}';
  }
}

/**
 * Creates a YAML completion provider that suggests properties from the JSON Schema.
 * Returns a disposable to unregister the provider.
 */
export function createYamlCompletionProvider(
  monaco: Monaco,
  model: ITextModel,
  schema: JSONSchema,
): { dispose(): void } {
  const provider = monaco.languages.registerCompletionItemProvider('yaml', {
    triggerCharacters: ['\n', ' ', ':'],
    provideCompletionItems: (
      targetModel: ITextModel,
      position: { lineNumber: number; column: number },
    ) => {
      // Only provide completions for our specific model
      if (targetModel.uri.toString() !== model.uri.toString()) {
        return { suggestions: [] };
      }

      const lineContent = targetModel.getLineContent(position.lineNumber);
      const textBeforeCursor = lineContent.slice(0, position.column - 1);

      // Don't suggest if we're after a colon (typing a value)
      if (textBeforeCursor.includes(':')) {
        return { suggestions: [] };
      }

      // Determine cursor's effective indentation
      const cursorIndent = textBeforeCursor.search(/\S/);
      const effectiveIndent =
        cursorIndent >= 0 ? cursorIndent : textBeforeCursor.length;

      // Get schema path: ancestors only (strictly less indented than cursor)
      const path = getSchemaPathAtCursor(
        targetModel,
        position.lineNumber,
        effectiveIndent,
      );

      // If the current line starts a new array item, descend into items
      const isInArrayItem = /^\s*-\s*/.test(textBeforeCursor);
      if (isInArrayItem) {
        path.push(0);
      }

      const contextSchema = getSchemaAtPath(path, schema, schema);
      if (!contextSchema?.properties) {
        return { suggestions: [] };
      }

      // Figure out which keys already exist at this level
      let existingKeys: Set<string>;
      try {
        const parsed = parse(targetModel.getValue());
        existingKeys = collectExistingKeys(parsed, path);
      } catch {
        existingKeys = new Set();
      }

      const suggestions: CompletionItem[] = [];
      const required = new Set(contextSchema.required ?? []);
      const word = targetModel.getWordUntilPosition(position);

      let sortIndex = 0;
      for (const [key, propSchema] of Object.entries(
        contextSchema.properties,
      )) {
        if (existingKeys.has(key)) continue;

        const isRequired = required.has(key);
        const valueSnippet = buildValueSnippet(propSchema, schema);
        const detail = [
          propSchema.description,
          isRequired ? '(required)' : undefined,
        ]
          .filter(Boolean)
          .join(' ');

        suggestions.push({
          label: key,
          kind: monaco.languages.CompletionItemKind.Property,
          detail: detail || undefined,
          documentation: propSchema.description,
          insertText: `${key}:${valueSnippet}`,
          insertTextRules:
            monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          // Sort required properties first
          sortText: `${isRequired ? '0' : '1'}-${String(sortIndex++).padStart(3, '0')}`,
        });
      }

      return {
        suggestions: suggestions.map((s) => ({
          ...s,
          range: {
            startLineNumber: position.lineNumber,
            startColumn: word.startColumn,
            endLineNumber: position.lineNumber,
            endColumn: word.endColumn,
          },
        })),
      };
    },
  });

  return provider;
}

/**
 * Collect keys that already exist at the given path in the parsed document.
 */
function collectExistingKeys(
  parsed: unknown,
  path: (string | number)[],
): Set<string> {
  let current: unknown = parsed;
  for (const segment of path) {
    if (current == null || typeof current !== 'object') return new Set();
    if (typeof segment === 'number') {
      if (!Array.isArray(current)) return new Set();
      current = current[0]; // approximate — check first element
    } else {
      current = (current as Record<string, unknown>)[segment];
    }
  }
  if (
    current != null &&
    typeof current === 'object' &&
    !Array.isArray(current)
  ) {
    return new Set(Object.keys(current));
  }
  return new Set();
}
