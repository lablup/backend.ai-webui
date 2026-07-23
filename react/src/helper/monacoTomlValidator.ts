import {
  type ITextModel,
  createSchemaValidator,
  escapeRegExp,
} from './monacoSchemaValidator';
import type { Monaco } from '@monaco-editor/react';
import { parse } from 'smol-toml';

/**
 * Find the approximate line number for a JSON path (e.g., "/command/0")
 * by searching the model text for the top-level TOML key.
 */
function findLineForPath(model: ITextModel, instancePath: string): number {
  const parts = instancePath.split('/').filter(Boolean);
  if (parts.length === 0) return 1;

  const topKey = parts[0];
  const lineCount = model.getLineCount();
  for (let i = 1; i <= lineCount; i++) {
    const line = model.getLineContent(i);
    if (
      new RegExp(
        `^\\s*(?:${escapeRegExp(topKey)}|"${escapeRegExp(topKey)}"|\\'${escapeRegExp(topKey)}\\')\\s*=`,
      ).test(line)
    ) {
      return i;
    }
  }
  return 1;
}

/**
 * Creates a TOML validator that validates on mount and on content changes.
 * Returns a disposable that cleans up the listener and markers.
 */
export function createTomlValidator(
  monaco: Monaco,
  model: ITextModel,
  schema: object,
): { dispose(): void } {
  return createSchemaValidator(monaco, model, schema, {
    owner: 'toml-schema',
    parse,
    mapParseError: (e) => {
      if (e instanceof Error && 'line' in e && 'column' in e) {
        const tomlErr = e as Error & { line: number; column: number };
        return {
          message: tomlErr.message,
          line: tomlErr.line,
          column: tomlErr.column,
        };
      }
      return null;
    },
    findLineForPath,
  });
}
