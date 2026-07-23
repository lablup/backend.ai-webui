import type { Monaco } from '@monaco-editor/react';

type ITextModel = Parameters<Monaco['editor']['setModelMarkers']>[0];
type IMarkerData = Parameters<Monaco['editor']['setModelMarkers']>[2][number];

export type { ITextModel, IMarkerData };

export function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function formatPath(instancePath: string): string {
  if (!instancePath) return 'root';
  return instancePath.replace(/^\//, '').replace(/\//g, '.');
}

interface ParseErrorInfo {
  message: string;
  line: number;
  column: number;
}

interface ValidatorConfig {
  /** Unique owner string for Monaco markers (e.g., 'yaml-schema') */
  owner: string;
  /** Parse source text into a JS object. Throw on syntax errors. */
  parse: (text: string) => unknown;
  /** Extract line/column from a parse error, or null if not a parse error. */
  mapParseError: (error: unknown) => ParseErrorInfo | null;
  /**
   * Find the approximate line number for a JSON path (e.g., "/models/0/id")
   * by searching the model text for the top-level key.
   */
  findLineForPath: (model: ITextModel, instancePath: string) => number;
}

const DEBOUNCE_MS = 300;

/**
 * Creates a schema validator that validates on mount and on content changes.
 * Ajv is compiled once; a version counter prevents stale async results.
 * Returns a disposable that cleans up the listener and markers.
 */
export function createSchemaValidator(
  monaco: Monaco,
  model: ITextModel,
  schema: object,
  config: ValidatorConfig,
): { dispose(): void } {
  let debounceTimer: ReturnType<typeof setTimeout> | null = null;
  let version = 0;
  let disposed = false;

  // Compile schema once, reuse on every validation call.
  const validateFnPromise = import('ajv/dist/2020').then(
    ({ default: Ajv2020 }) => {
      const ajv = new Ajv2020({ allErrors: true });
      return ajv.compile(schema);
    },
  );

  async function doValidate() {
    const thisVersion = ++version;
    const text = model.getValue();
    const markers: IMarkerData[] = [];

    const validate = await validateFnPromise;
    if (thisVersion !== version || disposed) return;

    try {
      const parsed = config.parse(text);
      const valid = validate(parsed);

      if (!valid && validate.errors) {
        for (const err of validate.errors) {
          const line = config.findLineForPath(model, err.instancePath);
          const path = formatPath(err.instancePath);
          markers.push({
            severity: monaco.MarkerSeverity.Warning,
            message: `${path}: ${err.message ?? 'Schema validation error'}`,
            startLineNumber: line,
            startColumn: 1,
            endLineNumber: line,
            endColumn: model.getLineMaxColumn(line),
          });
        }
      }
    } catch (e: unknown) {
      const parseErr = config.mapParseError(e);
      if (parseErr) {
        markers.push({
          severity: monaco.MarkerSeverity.Error,
          message: parseErr.message,
          startLineNumber: parseErr.line,
          startColumn: parseErr.column,
          endLineNumber: parseErr.line,
          endColumn: model.getLineMaxColumn(parseErr.line),
        });
      } else if (e instanceof Error) {
        markers.push({
          severity: monaco.MarkerSeverity.Error,
          message: e.message,
          startLineNumber: 1,
          startColumn: 1,
          endLineNumber: 1,
          endColumn: model.getLineMaxColumn(1),
        });
      }
    }

    if (thisVersion !== version || disposed) return;
    monaco.editor.setModelMarkers(model, config.owner, markers);
  }

  // Initial validation (fire-and-forget with error handling)
  doValidate().catch(() => {});

  const listener = model.onDidChangeContent(() => {
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      doValidate().catch(() => {});
    }, DEBOUNCE_MS);
  });

  return {
    dispose() {
      disposed = true;
      if (debounceTimer) clearTimeout(debounceTimer);
      listener.dispose();
      monaco.editor.setModelMarkers(model, config.owner, []);
    },
  };
}
