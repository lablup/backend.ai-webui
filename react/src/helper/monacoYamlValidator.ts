import {
  type ITextModel,
  createSchemaValidator,
  escapeRegExp,
} from './monacoSchemaValidator';
import type { Monaco } from '@monaco-editor/react';
import { parse } from 'yaml';

/**
 * Find the approximate line number for a JSON path (e.g., "/models/0/id")
 * by searching the model text for the top-level YAML key.
 */
function findLineForPath(model: ITextModel, instancePath: string): number {
  const parts = instancePath.split('/').filter(Boolean);
  if (parts.length === 0) return 1;

  const topKey = parts[0];
  const lineCount = model.getLineCount();
  for (let i = 1; i <= lineCount; i++) {
    const line = model.getLineContent(i);
    if (new RegExp(`^\\s*${escapeRegExp(topKey)}\\s*:`).test(line)) {
      return i;
    }
  }
  return 1;
}

/**
 * Creates a YAML validator that validates on mount and on content changes.
 * Returns a disposable that cleans up the listener and markers.
 */
export function createYamlValidator(
  monaco: Monaco,
  model: ITextModel,
  schema: object,
): { dispose(): void } {
  return createSchemaValidator(monaco, model, schema, {
    owner: 'yaml-schema',
    parse,
    mapParseError: (e) => {
      if (e instanceof Error && 'linePos' in e) {
        const yamlErr = e as Error & {
          linePos?: [{ line: number; col: number }];
        };
        return {
          message: yamlErr.message.split('\n')[0],
          line: yamlErr.linePos?.[0]?.line ?? 1,
          column: yamlErr.linePos?.[0]?.col ?? 1,
        };
      }
      return null;
    },
    findLineForPath,
  });
}
