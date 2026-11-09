import './Panel.css';
import {
  buildSchema,
  type DocumentNode,
  type GraphQLError,
  GraphQLSchema,
  Kind,
  type OperationDefinitionNode,
  parse,
  printSchema,
  validate,
} from 'graphql';
import { getAutocompleteSuggestions, Position } from 'graphql-language-service';
import type * as Monaco from 'monaco-editor';
import {
  type RefObject,
  useEffect,
  useEffectEvent,
  useRef,
  useState,
} from 'react';
import { flushSync } from 'react-dom';
import { createRoot, type Root } from 'react-dom/client';

type MonacoApi = typeof Monaco;

declare global {
  var monaco: MonacoApi | undefined;
  var require: {
    config(config: unknown): void;
    reset?(): void;
    (
      deps: string[],
      onLoad: (api: MonacoApi) => void,
      onError: (e: unknown) => void,
    ): void;
  };
  interface JSON {
    rawJSON?(text: string): unknown;
  }
  var backendaiclient:
    | {
        ready?: boolean;
        requestTimeout: number;
        _config: { connectionMode?: string };
        newSignedRequest(
          method: string,
          path: string,
          body: unknown,
        ): RequestInit & { uri: string };
      }
    | null
    | undefined;
}

const MONACO_VS = '/resources/monaco/vs';
const MARKER_OWNER = 'bai-graphql-devtools';
const MAX_HISTORY = 50;
const EXISTING_LOADER_WAIT_MS = 5000;

let monacoPromise: Promise<MonacoApi> | undefined;

function loadMonaco(): Promise<MonacoApi> {
  monacoPromise ??= new Promise<MonacoApi>((resolve, reject) => {
    if (globalThis.monaco?.editor) {
      resolve(globalThis.monaco);
      return;
    }
    const start = () => {
      globalThis.require.config({ paths: { vs: MONACO_VS } });
      globalThis.require(['vs/editor/editor.main'], resolve, () => {
        globalThis.require.reset?.();
        reject(new Error('could not load the editor bundle'));
      });
    };
    const src = `${MONACO_VS}/loader.js`;
    const existing = document.querySelector(`script[src="${src}"]`);
    if (existing && typeof globalThis.require === 'function') {
      start();
      return;
    }
    const script = existing ?? document.createElement('script');
    const fail = () => {
      clearTimeout(existingTimer);
      script.remove();
      reject(new Error(`could not load ${src}`));
    };
    const existingTimer = existing
      ? setTimeout(fail, EXISTING_LOADER_WAIT_MS)
      : undefined;
    script.addEventListener(
      'load',
      () => {
        clearTimeout(existingTimer);
        if (typeof globalThis.require === 'function') start();
        else fail();
      },
      { once: true },
    );
    script.addEventListener('error', fail, { once: true });
    if (!existing) {
      (script as HTMLScriptElement).src = src;
      document.body.append(script);
    }
  }).catch((error: unknown) => {
    monacoPromise = undefined;
    throw error;
  });
  return monacoPromise;
}

let schemaPromise: Promise<GraphQLSchema> | undefined;
let schemaScrollTop = 0;

function loadSchema(): Promise<GraphQLSchema> {
  schemaPromise ??= fetch('/__graphql-devtools/schema.graphql')
    .then((response) => {
      if (!response.ok) {
        throw new Error(
          `HTTP ${response.status} ${response.statusText}`.trimEnd(),
        );
      }
      return response.text();
    })
    .then((sdl) => {
      const config = buildSchema(sdl, {
        assumeValidSDL: true,
        noLocation: true,
      }).toConfig();
      return new GraphQLSchema({
        ...config,
        types: config.types.filter((type) => !/^(join|link)__/.test(type.name)),
        directives: config.directives.filter(
          (directive) => !/^(join__|link$)/.test(directive.name),
        ),
      });
    })
    .catch((error: unknown) => {
      schemaPromise = undefined;
      throw error;
    });
  return schemaPromise;
}

function markersFor(
  monaco: MonacoApi,
  model: Monaco.editor.ITextModel,
  schema: GraphQLSchema,
): Monaco.editor.IMarkerData[] {
  const text = model.getValue();
  if (!text.trim()) return [];
  let errors: readonly GraphQLError[];
  try {
    errors = validate(schema, parse(text));
  } catch (error) {
    errors = [error as GraphQLError];
  }
  return errors.map((error) => {
    const node = error.nodes?.[0];
    const location = error.locations?.[0];
    const start = node?.loc
      ? model.getPositionAt(node.loc.start)
      : { lineNumber: location?.line ?? 1, column: location?.column ?? 1 };
    const end = node?.loc
      ? model.getPositionAt(node.loc.end)
      : { lineNumber: start.lineNumber, column: start.column + 1 };
    return {
      severity: monaco.MarkerSeverity.Error,
      message: error.message,
      startLineNumber: start.lineNumber,
      startColumn: start.column,
      endLineNumber: end.lineNumber,
      endColumn: end.column,
    };
  });
}

function attachGraphQL(
  monaco: MonacoApi,
  editor: Monaco.editor.IStandaloneCodeEditor,
  schema: GraphQLSchema,
): Monaco.IDisposable[] {
  const refreshMarkers = () => {
    const model = editor.getModel();
    if (model) {
      monaco.editor.setModelMarkers(
        model,
        MARKER_OWNER,
        markersFor(monaco, model, schema),
      );
    }
  };
  refreshMarkers();
  return [
    editor.onDidChangeModelContent(refreshMarkers),
    monaco.languages.registerCompletionItemProvider('graphql', {
      triggerCharacters: ['{', ' ', '(', ':', '$', '@', '.'],
      provideCompletionItems: (model, position) => {
        if (model !== editor.getModel()) return { suggestions: [] };
        const word = model.getWordUntilPosition(position);
        const range = {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: word.startColumn,
          endColumn: word.endColumn,
        };
        const variableRange =
          model.getLineContent(position.lineNumber)[word.startColumn - 2] ===
          '$'
            ? { ...range, startColumn: word.startColumn - 1 }
            : range;
        return {
          suggestions: getAutocompleteSuggestions(
            schema,
            model.getValue(),
            new Position(position.lineNumber - 1, position.column - 1),
          ).map((item) => ({
            label: item.label,
            kind: monaco.languages.CompletionItemKind.Field,
            detail: item.detail,
            documentation: item.documentation,
            insertText: item.label,
            range: item.label.startsWith('$') ? variableRange : range,
          })),
        };
      },
    }),
  ];
}

function operationLabel(operation: OperationDefinitionNode) {
  const [first] = operation.selectionSet.selections;
  const rootField = 'name' in first ? first.name.value : undefined;
  return [operation.operation, operation.name?.value ?? rootField]
    .filter(Boolean)
    .join(' ');
}

function parseJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return undefined;
  }
}

function printJson(text: string): string {
  if (!JSON.rawJSON) return text;
  const keepNumberSource = (
    _key: string,
    value: unknown,
    context: { source?: string },
  ) =>
    typeof value === 'number' && context.source
      ? JSON.rawJSON?.(context.source)
      : value;
  try {
    return JSON.stringify(
      JSON.parse(
        text,
        keepNumberSource as (key: string, value: unknown) => unknown,
      ),
      null,
      2,
    );
  } catch {
    return text;
  }
}

function replaceText(
  editor: Monaco.editor.IStandaloneCodeEditor | null,
  text: string,
) {
  const model = editor?.getModel();
  if (model) {
    editor?.pushUndoStop();
    editor?.executeEdits(MARKER_OWNER, [
      { range: model.getFullModelRange(), text },
    ]);
    editor?.pushUndoStop();
  }
}

interface EditorProps {
  kind: 'query' | 'variables' | 'result' | 'schema';
  value: string;
  editorRef: RefObject<Monaco.editor.IStandaloneCodeEditor | null>;
  onChange?: (value: string) => void;
}

const Editor = ({ kind, value, editorRef, onChange }: EditorProps) => {
  'use memo';
  const hostRef = useRef<HTMLDivElement>(null);

  const createEditor = useEffectEvent((monaco: MonacoApi) => {
    const editor = monaco.editor.create(hostRef.current!, {
      value,
      language: kind === 'query' || kind === 'schema' ? 'graphql' : 'json',
      theme: document.body.classList.contains('dark-theme') ? 'vs-dark' : 'vs',
      readOnly: kind === 'result' || kind === 'schema',
      automaticLayout: true,
      fixedOverflowWidgets: true,
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
    });
    editor.onDidChangeModelContent(() => onChange?.(editor.getValue()));
    if (kind === 'schema') editor.setScrollTop(schemaScrollTop);
    if (kind === 'query' || kind === 'schema') editor.focus();
    return editor;
  });

  useEffect(() => {
    let isDisposed = false;
    const disposables: Monaco.IDisposable[] = [];
    void loadMonaco().then(
      (monaco) => {
        if (isDisposed) return;
        const editor = createEditor(monaco);
        editorRef.current = editor;
        disposables.push(editor);
        if (kind !== 'query') return;
        void loadSchema().then(
          (schema) => {
            if (!isDisposed)
              disposables.push(...attachGraphQL(monaco, editor, schema));
          },
          () => undefined,
        );
      },
      () => undefined,
    );
    return () => {
      isDisposed = true;
      if (kind === 'schema' && editorRef.current) {
        schemaScrollTop = editorRef.current.getScrollTop();
      }
      editorRef.current = null;
      disposables.forEach((disposable) => disposable.dispose());
    };
  }, [kind, editorRef]);

  useEffect(() => {
    if (kind === 'result') editorRef.current?.setValue(value);
  }, [kind, value, editorRef]);

  return (
    <div
      ref={hostRef}
      className={
        kind === 'variables'
          ? 'bai-gql-devtools__editor bai-gql-devtools__editor--variables'
          : 'bai-gql-devtools__editor'
      }
      data-testid={`gql-devtools-${kind}`}
    />
  );
};

interface HistoryEntry {
  id: number;
  status: 'ok' | 'error' | 'not sent';
  label: string;
  time: string;
  query: string;
  variables: string;
  result: string;
}

interface PanelProps {
  isOpen: boolean;
  width: number | null;
  onClose: () => void;
}

const Panel = ({ isOpen, width, onClose }: PanelProps) => {
  'use memo';
  const dragRef = useRef<{ x: number; width: number } | null>(null);
  const [query, setQuery] = useState('');
  const [variables, setVariables] = useState('');
  const [result, setResult] = useState('');
  const [allowMutations, setAllowMutations] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [tab, setTab] = useState<'query' | 'schema'>('query');
  const [schemaText, setSchemaText] = useState<string | null>(null);
  const [monacoError, setMonacoError] = useState<string | null>(null);
  const [schemaError, setSchemaError] = useState<string | null>(null);
  const queryEditorRef = useRef<Monaco.editor.IStandaloneCodeEditor>(null);
  const variablesEditorRef = useRef<Monaco.editor.IStandaloneCodeEditor>(null);
  const resultEditorRef = useRef<Monaco.editor.IStandaloneCodeEditor>(null);
  const schemaEditorRef = useRef<Monaco.editor.IStandaloneCodeEditor>(null);

  useEffect(() => {
    (tab === 'schema' ? schemaEditorRef : queryEditorRef).current?.focus();
  }, [tab]);

  const showSchemaError = (error: unknown) =>
    setSchemaError(
      `Schema not loaded: ${(error as Error).message} (reopen the panel to retry)`,
    );

  useEffect(() => {
    if (!isOpen) return;
    dragRef.current = null;
    setMonacoError(null);
    setSchemaError(null);
    void loadMonaco().then(
      () => loadSchema().catch(showSchemaError),
      (error: unknown) =>
        setMonacoError(
          `Monaco editor not loaded: ${(error as Error).message} (reopen the panel to retry)`,
        ),
    );
  }, [isOpen]);

  const openSchema = () => {
    setTab('schema');
    if (tab === 'schema' || schemaText !== null) return;
    void loadSchema()
      .then((schema) => {
        setSchemaText(printSchema(schema));
        setSchemaError(null);
      })
      .catch((error: unknown) => {
        setTab('query');
        showSchemaError(error);
      });
  };

  const restore = (entry: HistoryEntry) => {
    setTab('query');
    setQuery(entry.query);
    setVariables(entry.variables);
    setResult(entry.result);
    replaceText(queryEditorRef.current, entry.query);
    replaceText(variablesEditorRef.current, entry.variables);
  };

  const run = async () => {
    if (isRunning) return;
    const time = new Date().toLocaleTimeString();
    const sentQuery = queryEditorRef.current?.getValue() ?? query;
    const sentVariables = variablesEditorRef.current?.getValue() ?? variables;
    const record = (
      status: HistoryEntry['status'],
      label: string,
      text: string,
    ) => {
      setResult(text);
      setHistory((entries) =>
        [
          {
            id: (entries[0]?.id ?? 0) + 1,
            status,
            label,
            time,
            query: sentQuery,
            variables: sentVariables,
            result: text,
          },
          ...entries,
        ].slice(0, MAX_HISTORY),
      );
    };
    let ast: DocumentNode;
    try {
      ast = parse(sentQuery);
    } catch (error) {
      record(
        'not sent',
        'syntax error',
        `Not sent: ${(error as GraphQLError).message}`,
      );
      return;
    }
    const operations = ast.definitions.filter(
      (definition) => definition.kind === Kind.OPERATION_DEFINITION,
    );
    if (operations.length !== 1) {
      record(
        'not sent',
        `${operations.length} operations`,
        `Not sent: expected exactly one operation, found ${operations.length}.`,
      );
      return;
    }
    const label = operationLabel(operations[0]);
    if (operations[0].operation === 'subscription') {
      record('not sent', label, 'Not sent: subscriptions are not supported.');
      return;
    }
    if (operations[0].operation === 'mutation' && !allowMutations) {
      record(
        'not sent',
        label,
        'Not sent: turn on "Allow mutations" to run a mutation.',
      );
      return;
    }
    let parsedVariables: unknown;
    try {
      parsedVariables = sentVariables.trim() ? JSON.parse(sentVariables) : {};
    } catch (error) {
      record(
        'not sent',
        label,
        `Not sent: invalid variables JSON. ${(error as Error).message}`,
      );
      return;
    }
    if (
      typeof parsedVariables !== 'object' ||
      parsedVariables === null ||
      Array.isArray(parsedVariables)
    ) {
      record('not sent', label, 'Not sent: variables must be a JSON object.');
      return;
    }
    const client = globalThis.backendaiclient;
    if (!client?.ready) {
      record('not sent', label, 'Not sent: log in to the WebUI first.');
      return;
    }
    setIsRunning(true);
    try {
      const request = client.newSignedRequest('POST', '/admin/gql', {
        query: sentQuery,
        variables: parsedVariables,
      });
      const response = await fetch(request.uri, {
        ...request,
        ...(client._config.connectionMode === 'SESSION' && {
          credentials: 'include',
          mode: 'cors',
        }),
        signal: AbortSignal.timeout(client.requestTimeout),
      });
      const text = await response.text();
      const printed = printJson(text);
      record(
        !response.ok ||
          (parseJson(text) as { errors?: unknown[] } | null)?.errors?.length
          ? 'error'
          : 'ok',
        label,
        response.ok
          ? printed
          : `HTTP ${response.status} ${response.statusText}\n${printed}`.trimEnd(),
      );
    } catch (error) {
      const { name, message } = error as Error;
      record('error', label, `Request failed: ${name}: ${message}`);
    }
    setIsRunning(false);
  };

  if (!isOpen) return null;

  return (
    <aside
      className="bai-gql-devtools"
      aria-label="GraphQL devtools"
      data-testid="gql-devtools"
      style={{ width: width ?? undefined }}
      onKeyDownCapture={(event) => {
        if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
          event.preventDefault();
          event.stopPropagation();
          if (tab === 'query' && !event.repeat) void run();
        }
      }}
    >
      <div
        className="bai-gql-devtools__resize"
        role="separator"
        aria-orientation="vertical"
        aria-label="Resize panel"
        data-testid="gql-devtools-resize"
        onPointerDown={(event) => {
          if (event.button !== 0) return;
          const panel = event.currentTarget.parentElement!;
          event.currentTarget.setPointerCapture(event.pointerId);
          dragRef.current = {
            x: event.clientX,
            width: panel.getBoundingClientRect().width,
          };
        }}
        onPointerMove={(event) => {
          const drag = dragRef.current;
          if (drag) {
            flushSync(() => setPanelWidth(drag.width + drag.x - event.clientX));
          }
        }}
        onLostPointerCapture={(event) => {
          dragRef.current = null;
          if (width !== null) {
            const panel = event.currentTarget.parentElement!;
            setPanelWidth(panel.getBoundingClientRect().width);
          }
        }}
        onDoubleClick={() => setPanelWidth(null)}
      />
      <div className="bai-gql-devtools__header">
        <span className="bai-gql-devtools__title">GraphQL</span>
        <button
          type="button"
          className="bai-gql-devtools__button"
          onClick={onClose}
        >
          Close
        </button>
      </div>
      {[monacoError, schemaError].map(
        (message) =>
          message && (
            <span
              key={message}
              role="alert"
              className="bai-gql-devtools__label"
            >
              {message}
            </span>
          ),
      )}
      <div className="bai-gql-devtools__body">
        <div className="bai-gql-devtools__history">
          <div className="bai-gql-devtools__toolbar">
            <span className="bai-gql-devtools__label">History</span>
            <button
              type="button"
              className="bai-gql-devtools__button"
              onClick={() => setHistory([])}
            >
              Clear
            </button>
          </div>
          <ul
            className="bai-gql-devtools__history-list"
            data-testid="gql-devtools-history"
          >
            {history.map((entry) => (
              <li key={entry.id}>
                <button
                  type="button"
                  className="bai-gql-devtools__entry"
                  title={entry.label}
                  disabled={isRunning}
                  onClick={() => restore(entry)}
                >
                  <span className="bai-gql-devtools__entry-label">
                    {entry.label}
                  </span>
                  <span>
                    {entry.time} · {entry.status}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
        <div className="bai-gql-devtools__main">
          <div className="bai-gql-devtools__tabs" role="tablist">
            <button
              type="button"
              role="tab"
              className="bai-gql-devtools__tab"
              aria-selected={tab === 'query'}
              onClick={() => setTab('query')}
            >
              Query
            </button>
            <button
              type="button"
              role="tab"
              className="bai-gql-devtools__tab"
              aria-selected={tab === 'schema'}
              onClick={openSchema}
            >
              Schema
            </button>
          </div>
          <div
            role="tabpanel"
            className={
              tab === 'query'
                ? 'bai-gql-devtools__tabpanel'
                : 'bai-gql-devtools__tabpanel bai-gql-devtools__tabpanel--hidden'
            }
          >
            <Editor
              kind="query"
              value={query}
              editorRef={queryEditorRef}
              onChange={setQuery}
            />
            <span className="bai-gql-devtools__label">Variables</span>
            <Editor
              kind="variables"
              value={variables}
              editorRef={variablesEditorRef}
              onChange={setVariables}
            />
            <div className="bai-gql-devtools__toolbar">
              <button
                type="button"
                className="bai-gql-devtools__button"
                disabled={isRunning}
                onClick={() => void run()}
              >
                Run
              </button>
              <label className="bai-gql-devtools__switch">
                <input
                  type="checkbox"
                  role="switch"
                  checked={allowMutations}
                  onChange={(event) => setAllowMutations(event.target.checked)}
                />
                Allow mutations
              </label>
            </div>
            <span className="bai-gql-devtools__label">Result</span>
            <Editor kind="result" value={result} editorRef={resultEditorRef} />
          </div>
          {(tab === 'schema' || schemaText !== null) && (
            <div
              role="tabpanel"
              className={
                tab === 'schema'
                  ? 'bai-gql-devtools__tabpanel'
                  : 'bai-gql-devtools__tabpanel bai-gql-devtools__tabpanel--hidden'
              }
            >
              {schemaText === null ? (
                <span className="bai-gql-devtools__label">Loading schema…</span>
              ) : (
                <Editor
                  kind="schema"
                  value={schemaText}
                  editorRef={schemaEditorRef}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};

let mounted: { root: Root; container: HTMLElement } | undefined;
let isOpen = false;
let focusedBeforeOpen: Element | null = null;
let panelWidth: number | null = null;

function setPanelWidth(width: number | null) {
  panelWidth = width;
  mounted?.root.render(
    <Panel isOpen={isOpen} width={width} onClose={togglePanel} />,
  );
}

export function togglePanel() {
  if (!mounted) {
    const container = document.createElement('div');
    container.id = 'bai-graphql-devtools-root';
    document.body.append(container);
    mounted = { root: createRoot(container), container };
  }
  const { root, container } = mounted;
  isOpen = !isOpen;
  const panel = (
    <Panel isOpen={isOpen} width={panelWidth} onClose={togglePanel} />
  );
  if (isOpen) {
    focusedBeforeOpen = document.activeElement;
    root.render(panel);
    return;
  }
  const active = document.activeElement;
  const shouldRestoreFocus =
    !active || active === document.body || container.contains(active);
  if (
    shouldRestoreFocus &&
    focusedBeforeOpen instanceof HTMLElement &&
    focusedBeforeOpen.isConnected
  ) {
    focusedBeforeOpen.focus();
  }
  root.render(panel);
}
