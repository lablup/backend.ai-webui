const GQL_PATH = '/func/admin/gql';
const STORAGE_KEY = 'bai-graphql-devtools.log';
const MAX_ENTRIES = 200;
const MAX_TEXT = 100_000;
const MAX_MESSAGES = 100;
const SAVE_DELAY_MS = 300;

export type Source = 'App' | 'Panel';

export interface Origin {
  id: number;
  label: string;
  query: string;
  variables: string;
}

export interface LogEntry {
  id: number;
  source: Source;
  label: string;
  time: number;
  state: 'pending' | 'streaming' | 'ok' | 'error' | 'not sent' | 'interrupted';
  status?: number;
  duration?: number;
  size?: number;
  query: string;
  variables: string;
  requestHeaders: [string, string][];
  responseHeaders: [string, string][];
  response: string;
  origin?: Origin;
  isModified?: boolean;
}

export type NewEntry = Omit<LogEntry, 'id'>;

let entries: readonly LogEntry[] = load();
let nextId = (entries[0]?.id ?? 0) + 1;
let saveTimer: ReturnType<typeof setTimeout> | undefined;
let isNotifyQueued = false;
const listeners = new Set<() => void>();

function load(): LogEntry[] {
  try {
    const stored = JSON.parse(sessionStorage.getItem(STORAGE_KEY) ?? '[]');
    if (!Array.isArray(stored)) return [];
    return (stored as LogEntry[]).map((entry) =>
      entry.state === 'pending' || entry.state === 'streaming'
        ? { ...entry, state: 'interrupted' }
        : entry,
    );
  } catch {
    return [];
  }
}

function save() {
  saveTimer = undefined;
  // Drop the oldest entries until the log fits the sessionStorage quota.
  for (let kept = entries.length; kept >= 0; kept = Math.floor(kept / 2)) {
    try {
      sessionStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(entries.slice(0, kept)),
      );
      return;
    } catch {
      if (kept === 0) return;
    }
  }
}

function commit(next: readonly LogEntry[]) {
  entries = next;
  saveTimer ??= setTimeout(save, SAVE_DELAY_MS);
  // Deferred: the app may call `fetch` while React is rendering its own root.
  if (isNotifyQueued) return;
  isNotifyQueued = true;
  queueMicrotask(() => {
    isNotifyQueued = false;
    listeners.forEach((listener) => listener());
  });
}

const clip = (text: string) =>
  text.length > MAX_TEXT
    ? `${text.slice(0, MAX_TEXT)}\n… (${text.length - MAX_TEXT} more characters not kept)`
    : text;

export const getEntries = () => entries;

export function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function addEntry(entry: NewEntry): number {
  const id = nextId++;
  commit(
    [{ ...entry, id, response: clip(entry.response) }, ...entries].slice(
      0,
      MAX_ENTRIES,
    ),
  );
  return id;
}

function updateEntry(id: number, patch: Partial<LogEntry>) {
  if (patch.response !== undefined) patch.response = clip(patch.response);
  commit(
    entries.map((entry) => (entry.id === id ? { ...entry, ...patch } : entry)),
  );
}

export function clearEntries() {
  commit([]);
}

export function operationLabel(query: string, operationName?: string) {
  const text = query.replace(/#[^\n]*/g, '');
  const match =
    /^\s*(?:(query|mutation|subscription)\b\s*([_A-Za-z]\w*)?)?[^{]*\{\s*(?:[_A-Za-z]\w*\s*:\s*)?([_A-Za-z]\w*)/.exec(
      text,
    );
  if (!match) return operationName || 'unparsed request';
  const [, type = 'query', name, rootField] = match;
  return `${type} ${operationName || name || rootField}`;
}

const headerList = (headers: HeadersInit | undefined): [string, string][] => [
  ...new Headers(headers).entries(),
];

const byteLength = (text: string) => new TextEncoder().encode(text).length;

function hasErrors(text: string) {
  try {
    return Boolean(
      (JSON.parse(text) as { errors?: unknown[] })?.errors?.length,
    );
  } catch {
    return false;
  }
}

async function readEvents(
  id: number,
  stream: ReadableStream<Uint8Array>,
  startedAt: number,
) {
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  const messages: string[] = [];
  let buffer = '';
  let size = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    buffer += decoder.decode(value, { stream: true });
    const events = buffer.split(/\r?\n\r?\n/);
    buffer = events.pop() ?? '';
    const data = events
      .map((event) =>
        event
          .split(/\r?\n/)
          .filter((line) => line.startsWith('data:'))
          .map((line) => line.slice(5).trimStart())
          .join('\n'),
      )
      .filter(Boolean);
    if (!data.length) continue;
    messages.push(...data);
    messages.splice(0, Math.max(0, messages.length - MAX_MESSAGES));
    updateEntry(id, { response: messages.join('\n'), size });
  }
  updateEntry(id, {
    state: 'ok',
    duration: Math.round(performance.now() - startedAt),
    size,
  });
}

function observe(
  input: RequestInfo | URL,
  init: RequestInit | undefined,
  pending: Promise<Response>,
) {
  const url = input instanceof Request ? input.url : String(input);
  if (!new URL(url, location.href).pathname.endsWith(GQL_PATH)) return;
  const startedAt = performance.now();
  const body: { query?: string; variables?: unknown; operationName?: string } =
    typeof init?.body === 'string' ? JSON.parse(init.body) : {};
  const query = body.query ?? '';
  const id = addEntry({
    source: 'App',
    label: operationLabel(query, body.operationName),
    time: Date.now(),
    state: 'pending',
    query,
    variables: JSON.stringify(body.variables ?? {}, null, 2),
    requestHeaders: headerList(
      init?.headers ?? (input instanceof Request ? input.headers : undefined),
    ),
    responseHeaders: [],
    response: '',
  });
  const fail = (error: unknown) => {
    try {
      updateEntry(id, {
        state: 'error',
        duration: Math.round(performance.now() - startedAt),
        response: `Request failed: ${error instanceof Error ? `${error.name}: ${error.message}` : String(error)}`,
      });
    } catch {
      // Recording never throws into the app's promise chain.
    }
  };
  pending
    .then((response) => {
      // Runs before the app's own continuation, so the body is still unread.
      const copy = response.clone();
      const head = {
        status: response.status,
        responseHeaders: headerList(response.headers),
      };
      if (
        response.headers.get('Content-Type')?.startsWith('text/event-stream') &&
        copy.body
      ) {
        updateEntry(id, { ...head, state: 'streaming' });
        return readEvents(id, copy.body, startedAt);
      }
      return copy.text().then((text) => {
        updateEntry(id, {
          ...head,
          state: !response.ok || hasErrors(text) ? 'error' : 'ok',
          duration: Math.round(performance.now() - startedAt),
          size: byteLength(text),
          response: text,
        });
      });
    })
    .catch(fail);
}

const nativeFetch = globalThis.fetch;

/** The unwrapped `fetch`; the panel sends with it so its requests are not captured again. */
export const panelFetch: typeof fetch = (input, init) =>
  nativeFetch(input, init);

export function installCapture() {
  if (globalThis.fetch !== nativeFetch) return;
  globalThis.fetch = (input, init) => {
    const pending = nativeFetch(input, init);
    try {
      observe(input, init, pending);
    } catch {
      // Recording must never change what the app sees.
    }
    return pending;
  };
}
