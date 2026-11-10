import './Panel.css';
import { manipulateGraphQLQueryWithClientDirectives } from './graphql-transformer';
import {
  addEntry,
  clearEntries,
  getEntries,
  type LogEntry,
  type NewEntry,
  type Origin,
  panelFetch,
  type Source,
  subscribe,
} from './traffic';
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
  useSyncExternalStore,
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
        isManagerVersionCompatibleWith?(version: string): boolean;
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
    let isSettled = false;
    const fail = () => {
      if (isSettled) return;
      isSettled = true;
      clearTimeout(existingTimer);
      if (!existing) script.remove();
      reject(new Error(`could not load ${src}`));
    };
    const existingTimer = existing
      ? setTimeout(fail, EXISTING_LOADER_WAIT_MS)
      : undefined;
    script.addEventListener(
      'load',
      () => {
        if (isSettled) return;
        if (typeof globalThis.require === 'function') {
          isSettled = true;
          clearTimeout(existingTimer);
          start();
        } else {
          fail();
        }
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

interface DiffLine {
  kind: ' ' | '+' | '-';
  text: string;
}

const MAX_DIFF_CELLS = 4_000_000;

function diffLines(before: string, after: string): DiffLine[] {
  const a = before.split('\n');
  const b = after.split('\n');
  if (a.length * b.length > MAX_DIFF_CELLS) {
    return [
      ...a.map((text) => ({ kind: '-' as const, text })),
      ...b.map((text) => ({ kind: '+' as const, text })),
    ];
  }
  const lcs = Array.from(
    { length: a.length + 1 },
    () => new Uint32Array(b.length + 1),
  );
  for (let i = a.length - 1; i >= 0; i--) {
    for (let j = b.length - 1; j >= 0; j--) {
      lcs[i][j] =
        a[i] === b[j]
          ? lcs[i + 1][j + 1] + 1
          : Math.max(lcs[i + 1][j], lcs[i][j + 1]);
    }
  }
  const lines: DiffLine[] = [];
  let i = 0;
  let j = 0;
  while (i < a.length || j < b.length) {
    if (i < a.length && j < b.length && a[i] === b[j]) {
      lines.push({ kind: ' ', text: a[i] });
      i++;
      j++;
    } else if (
      i < a.length &&
      (j === b.length || lcs[i + 1][j] >= lcs[i][j + 1])
    ) {
      lines.push({ kind: '-', text: a[i++] });
    } else {
      lines.push({ kind: '+', text: b[j++] });
    }
  }
  return lines;
}

function normalizeVariables(text: string) {
  try {
    return JSON.stringify(JSON.parse(text.trim() || '{}'));
  } catch {
    return text;
  }
}

function formatSize(bytes: number) {
  return bytes < 1024 ? `${bytes} B` : `${(bytes / 1024).toFixed(1)} kB`;
}

function summary(entry: LogEntry) {
  return [
    new Date(entry.time).toLocaleTimeString(),
    entry.status ?? entry.state,
    entry.status !== undefined && entry.state !== 'ok' && entry.state,
    entry.duration !== undefined && `${entry.duration} ms`,
    entry.size !== undefined && formatSize(entry.size),
  ]
    .filter((part) => part !== false && part !== undefined)
    .join(' · ');
}

const OriginLink = ({ entry }: { entry: LogEntry }) =>
  entry.origin ? (
    <span className="bai-gql-devtools__link">
      ← {entry.origin.label} #{entry.origin.id}
      {entry.isModified && (
        <span className="bai-gql-devtools__modified">modified</span>
      )}
    </span>
  ) : null;

const Code = ({ label, text }: { label: string; text: string }) => (
  <section className="bai-gql-devtools__section">
    <span className="bai-gql-devtools__label">{label}</span>
    <pre className="bai-gql-devtools__code">{text || '(empty)'}</pre>
  </section>
);

const Diff = ({
  label,
  before,
  after,
}: {
  label: string;
  before: string;
  after: string;
}) => (
  <section className="bai-gql-devtools__section">
    <span className="bai-gql-devtools__label">{label}</span>
    <pre className="bai-gql-devtools__code">
      {diffLines(before, after).map((line, index) => (
        <span
          key={index}
          className={`bai-gql-devtools__diff bai-gql-devtools__diff--${
            line.kind === '+' ? 'add' : line.kind === '-' ? 'remove' : 'same'
          }`}
        >
          {line.kind} {line.text}
          {'\n'}
        </span>
      ))}
    </pre>
  </section>
);

interface EntryDetailProps {
  entry: LogEntry;
  isRunning: boolean;
  onOpen: (entry: LogEntry) => void;
}

const EntryDetail = ({ entry, isRunning, onOpen }: EntryDetailProps) => {
  'use memo';
  const headers = (list: [string, string][]) =>
    list.map(([name, value]) => `${name}: ${value}`).join('\n');
  return (
    <div className="bai-gql-devtools__detail" data-testid="gql-devtools-detail">
      <div className="bai-gql-devtools__toolbar">
        <span className="bai-gql-devtools__entry-title">
          <span
            className={`bai-gql-devtools__badge bai-gql-devtools__badge--${entry.source.toLowerCase()}`}
          >
            {entry.source}
          </span>
          <span className="bai-gql-devtools__label">
            {entry.label} #{entry.id}
          </span>
        </span>
        <button
          type="button"
          className="bai-gql-devtools__button"
          disabled={isRunning}
          onClick={() => onOpen(entry)}
        >
          Open in editor
        </button>
      </div>
      <span>{summary(entry)}</span>
      <OriginLink entry={entry} />
      {entry.isModified && entry.origin && (
        <>
          {entry.origin.query.trim() !== entry.query.trim() && (
            <Diff
              label={`Query diff vs #${entry.origin.id}`}
              before={entry.origin.query}
              after={entry.query}
            />
          )}
          {normalizeVariables(entry.origin.variables) !==
            normalizeVariables(entry.variables) && (
            <Diff
              label={`Variables diff vs #${entry.origin.id}`}
              before={entry.origin.variables}
              after={entry.variables}
            />
          )}
        </>
      )}
      <Code label="Query" text={entry.query} />
      <Code label="Variables" text={entry.variables} />
      <Code label="Response" text={printJson(entry.response)} />
      <Code label="Request headers" text={headers(entry.requestHeaders)} />
      <Code label="Response headers" text={headers(entry.responseHeaders)} />
    </div>
  );
};

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
  const entries = useSyncExternalStore(subscribe, getEntries);
  const [filter, setFilter] = useState<'All' | Source>('All');
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [origin, setOrigin] = useState<Origin | null>(null);
  const [tab, setTab] = useState<'query' | 'detail' | 'schema'>('query');
  const [schemaText, setSchemaText] = useState<string | null>(null);
  const [monacoError, setMonacoError] = useState<string | null>(null);
  const [schemaError, setSchemaError] = useState<string | null>(null);
  const queryEditorRef = useRef<Monaco.editor.IStandaloneCodeEditor>(null);
  const variablesEditorRef = useRef<Monaco.editor.IStandaloneCodeEditor>(null);
  const resultEditorRef = useRef<Monaco.editor.IStandaloneCodeEditor>(null);
  const schemaEditorRef = useRef<Monaco.editor.IStandaloneCodeEditor>(null);

  useEffect(() => {
    if (tab !== 'detail') {
      (tab === 'schema' ? schemaEditorRef : queryEditorRef).current?.focus();
    }
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
      })
      .catch((error: unknown) => {
        setTab('query');
        showSchemaError(error);
      });
  };

  const fillEditors = (nextQuery: string, nextVariables: string) => {
    setTab('query');
    setQuery(nextQuery);
    setVariables(nextVariables);
    replaceText(queryEditorRef.current, nextQuery);
    replaceText(variablesEditorRef.current, nextVariables);
  };

  const openInEditor = (entry: LogEntry) => {
    if (isRunning) return;
    fillEditors(entry.query, entry.variables);
    setResult(printJson(entry.response));
    setOrigin(
      entry.source === 'App'
        ? {
            id: entry.id,
            label: entry.label,
            query: entry.query,
            variables: entry.variables,
          }
        : (entry.origin ?? null),
    );
  };

  const startNew = () => {
    fillEditors('', '');
    setResult('');
    setOrigin(null);
  };

  const visibleEntries = entries.filter(
    (entry) =>
      (filter === 'All' || entry.source === filter) &&
      entry.label.toLowerCase().includes(search.trim().toLowerCase()),
  );
  const selected = entries.find((entry) => entry.id === selectedId);

  const run = async () => {
    if (isRunning) return;
    const time = Date.now();
    const startedAt = performance.now();
    const sentQuery = queryEditorRef.current?.getValue() ?? query;
    const sentVariables = variablesEditorRef.current?.getValue() ?? variables;
    const link = origin && {
      origin,
      isModified:
        sentQuery.trim() !== origin.query.trim() ||
        normalizeVariables(sentVariables) !==
          normalizeVariables(origin.variables),
    };
    const record = (
      state: LogEntry['state'],
      label: string,
      text: string,
      details: Partial<NewEntry> = {},
    ) => {
      setResult(text);
      setSelectedId(
        addEntry({
          source: 'Panel',
          label,
          time,
          state,
          query: sentQuery,
          variables: sentVariables,
          requestHeaders: [],
          responseHeaders: [],
          response: text,
          ...link,
          ...details,
        }),
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
    const isCompatibleWith = (version: string) =>
      client.isManagerVersionCompatibleWith?.(version) ?? true;
    let transformedQuery: string;
    try {
      transformedQuery = manipulateGraphQLQueryWithClientDirectives(
        sentQuery,
        parsedVariables,
        (version) =>
          Array.isArray(version)
            ? version.some((item) => !isCompatibleWith(item))
            : !isCompatibleWith(version),
      );
    } catch (error) {
      record(
        'not sent',
        label,
        `Not sent: could not apply client directives. ${(error as Error).message}`,
      );
      return;
    }
    setIsRunning(true);
    try {
      const request = client.newSignedRequest('POST', '/admin/gql', {
        query: transformedQuery,
        variables: parsedVariables,
      });
      const response = await panelFetch(request.uri, {
        ...request,
        ...(client._config.connectionMode === 'SESSION' && {
          credentials: 'include',
          mode: 'cors',
        }),
        signal: AbortSignal.timeout(client.requestTimeout),
      });
      const text = await response.text();
      const printed = printJson(text);
      const details: Partial<NewEntry> = {
        status: response.status,
        duration: Math.round(performance.now() - startedAt),
        size: new TextEncoder().encode(text).length,
        requestHeaders: [...new Headers(request.headers).entries()],
        responseHeaders: [...response.headers.entries()],
      };
      record(
        !response.ok ||
          (parseJson(text) as { errors?: unknown[] } | null)?.errors?.length
          ? 'error'
          : 'ok',
        label,
        response.ok
          ? printed
          : `HTTP ${response.status} ${response.statusText}\n${printed}`.trimEnd(),
        details,
      );
    } catch (error) {
      const detail =
        error instanceof Error
          ? `${error.name}: ${error.message}`
          : typeof error === 'string'
            ? error
            : 'unknown error';
      record('error', label, `Request failed: ${detail}`, {
        duration: Math.round(performance.now() - startedAt),
      });
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
            <span className="bai-gql-devtools__label">Log</span>
            <button
              type="button"
              className="bai-gql-devtools__button"
              onClick={() => {
                clearEntries();
                setSelectedId(null);
              }}
            >
              Clear
            </button>
          </div>
          <div
            className="bai-gql-devtools__filter"
            role="group"
            aria-label="Source"
          >
            {(['All', 'App', 'Panel'] as const).map((value) => (
              <button
                key={value}
                type="button"
                className="bai-gql-devtools__button"
                aria-pressed={filter === value}
                onClick={() => setFilter(value)}
              >
                {value}
              </button>
            ))}
          </div>
          <input
            type="search"
            className="bai-gql-devtools__search"
            placeholder="Search operation"
            aria-label="Search operation"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <ul
            className="bai-gql-devtools__history-list"
            data-testid="gql-devtools-history"
          >
            {visibleEntries.map((entry) => (
              <li key={entry.id}>
                <button
                  type="button"
                  className="bai-gql-devtools__entry"
                  title={`${entry.label} (double-click to open in the editor)`}
                  aria-current={entry.id === selectedId}
                  onClick={() => {
                    setSelectedId(entry.id);
                    setTab('detail');
                  }}
                  onDoubleClick={() => openInEditor(entry)}
                >
                  <span className="bai-gql-devtools__entry-title">
                    <span
                      className={`bai-gql-devtools__badge bai-gql-devtools__badge--${entry.source.toLowerCase()}`}
                    >
                      {entry.source}
                    </span>
                    <span className="bai-gql-devtools__entry-label">
                      {entry.label}
                    </span>
                    <span>#{entry.id}</span>
                  </span>
                  <OriginLink entry={entry} />
                  <span>{summary(entry)}</span>
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
              aria-selected={tab === 'detail'}
              onClick={() => setTab('detail')}
            >
              Detail
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
            <div className="bai-gql-devtools__toolbar">
              <span data-testid="gql-devtools-origin">
                {origin
                  ? `Editing from ← ${origin.label} #${origin.id}`
                  : 'New query'}
              </span>
              <span className="bai-gql-devtools__filter">
                {origin && (
                  <button
                    type="button"
                    className="bai-gql-devtools__button"
                    onClick={() => setOrigin(null)}
                  >
                    Unlink
                  </button>
                )}
                <button
                  type="button"
                  className="bai-gql-devtools__button"
                  disabled={isRunning}
                  onClick={startNew}
                >
                  New
                </button>
              </span>
            </div>
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
          {tab === 'detail' && (
            <div role="tabpanel" className="bai-gql-devtools__tabpanel">
              {selected ? (
                <EntryDetail
                  entry={selected}
                  isRunning={isRunning}
                  onOpen={openInEditor}
                />
              ) : (
                <span className="bai-gql-devtools__label">
                  Select a log row to see its request and response.
                </span>
              )}
            </div>
          )}
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
    mounted = { root: createRoot(container), container };
    document.body.append(container);
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
