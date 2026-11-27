import { hasGraphQLErrors, parseJson } from './json';

// Session mode posts to `/func/admin/gql`, API-key mode to `<endpoint>/admin/gql`.
const GQL_PATH = '/admin/gql';
const STORAGE_KEY = 'bai-graphql-devtools.log';
const PRESERVE_KEY = 'bai-graphql-devtools.preserve-log';
const MAX_ROWS = { App: 200, Panel: 50 };
const MAX_TEXT = 100_000;
const MAX_MESSAGES = 100;
// Leaves the app's own sessionStorage writes room under the ~5 MB quota.
const MAX_STORED_CHARS = 1_000_000;
const SAVE_DELAY_MS = 300;
const STATES = [
  'pending',
  'streaming',
  'ok',
  'error',
  'not sent',
  'interrupted',
] as const;

export type Source = 'App' | 'Panel';

export interface LogEntry {
  id: number;
  source: Source;
  label: string;
  time: number;
  state: (typeof STATES)[number];
  status?: number;
  duration?: number;
  size?: number;
  query: string;
  variables: string;
  requestHeaders: [string, string][];
  responseHeaders: [string, string][];
  response: string;
  /** Decided on the whole response at capture, since `response` may be cut. */
  hasGraphQLErrors?: boolean;
}

export type NewEntry = Omit<LogEntry, 'id'>;

// Like the Network tab's "Preserve log": off by default, so a reload starts empty.
let isPreserved = readPreserve();
let entries: readonly LogEntry[] = isPreserved ? load() : [];
if (!isPreserved) removeStored();
let nextId = Math.max(0, ...entries.map((entry) => entry.id)) + 1;
let saveTimer: ReturnType<typeof setTimeout> | undefined;
let isNotifyQueued = false;
const listeners = new Set<() => void>();

function readPreserve() {
  try {
    return localStorage.getItem(PRESERVE_KEY) === 'true';
  } catch {
    return false;
  }
}

function removeStored() {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // Storage unavailable: nothing was kept.
  }
}

function isHeaderList(value: unknown) {
  return (
    Array.isArray(value) &&
    value.every(
      (pair) =>
        Array.isArray(pair) &&
        pair.length === 2 &&
        pair.every((part) => typeof part === 'string'),
    )
  );
}

function isEntry(value: unknown): value is LogEntry {
  if (typeof value !== 'object' || value === null) return false;
  const entry = value as Record<string, unknown>;
  return (
    Number.isSafeInteger(entry.id) &&
    (entry.source === 'App' || entry.source === 'Panel') &&
    STATES.includes(entry.state as LogEntry['state']) &&
    typeof entry.time === 'number' &&
    ['label', 'query', 'variables', 'response'].every(
      (key) => typeof entry[key] === 'string',
    ) &&
    ['status', 'duration', 'size'].every(
      (key) => entry[key] === undefined || typeof entry[key] === 'number',
    ) &&
    (entry.hasGraphQLErrors === undefined ||
      typeof entry.hasGraphQLErrors === 'boolean') &&
    isHeaderList(entry.requestHeaders) &&
    isHeaderList(entry.responseHeaders)
  );
}

/** Keeps the newest rows of each source, up to its cap. */
function capRows(list: readonly LogEntry[]) {
  const counts = { App: 0, Panel: 0 };
  return list.filter(
    (entry) => ++counts[entry.source] <= MAX_ROWS[entry.source],
  );
}

function load(): LogEntry[] {
  try {
    const stored: unknown = JSON.parse(
      sessionStorage.getItem(STORAGE_KEY) ?? '[]',
    );
    if (!Array.isArray(stored)) return [];
    const ids = new Set<number>();
    const valid = stored.filter(
      (entry): entry is LogEntry =>
        isEntry(entry) && !ids.has(entry.id) && Boolean(ids.add(entry.id)),
    );
    return capRows(
      valid.map((entry) =>
        entry.state === 'pending' || entry.state === 'streaming'
          ? { ...entry, state: 'interrupted' }
          : entry,
      ),
    );
  } catch {
    return [];
  }
}

function save() {
  clearTimeout(saveTimer);
  saveTimer = undefined;
  // Newest first; a row that alone does not fit is skipped, not the end of the log.
  const kept: string[] = [];
  let total = 2;
  for (const entry of entries) {
    const text = JSON.stringify(
      entry.response.length > MAX_TEXT
        ? { ...entry, response: clip(entry.response) }
        : entry,
    );
    if (total + text.length + 1 > MAX_STORED_CHARS) continue;
    total += text.length + 1;
    kept.push(text);
  }
  try {
    sessionStorage.setItem(STORAGE_KEY, `[${kept.join(',')}]`);
  } catch {
    removeStored();
  }
}

function flushSave() {
  if (saveTimer !== undefined) save();
}

// A reload right after a request would otherwise lose the newest rows.
addEventListener('pagehide', flushSave);
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden') flushSave();
});

function commit(next: readonly LogEntry[]) {
  entries = next;
  if (isPreserved) saveTimer ??= setTimeout(save, SAVE_DELAY_MS);
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

export const getIsPreserved = () => isPreserved;

export function setIsPreserved(value: boolean) {
  isPreserved = value;
  try {
    localStorage.setItem(PRESERVE_KEY, String(value));
  } catch {
    // The choice then lasts only for this page.
  }
  clearTimeout(saveTimer);
  saveTimer = undefined;
  if (!value) removeStored();
  commit(entries);
}

export function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

// Panel rows keep their whole result in memory, so restoring one brings it all back.
export function addEntry(entry: NewEntry): number {
  const id = nextId++;
  const response =
    entry.source === 'App' ? clip(entry.response) : entry.response;
  commit(capRows([{ ...entry, id, response }, ...entries]));
  return id;
}

function updateEntry(id: number, patch: Partial<LogEntry>) {
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

const describeError = (error: unknown) =>
  `Request failed: ${error instanceof Error ? `${error.name}: ${error.message}` : String(error)}`;

const messagesText = (messages: string[]) =>
  messages.length ? `[\n${messages.join(',\n')}\n]` : '';

// `messagesText` adds 2 characters per message plus 2, so this keeps it within MAX_TEXT.
const MAX_MESSAGE = MAX_TEXT - 4;

function cutMessage(message: string) {
  if (message.length <= MAX_MESSAGE) return message;
  const keep = MAX_MESSAGE / 2;
  const cut = JSON.stringify(
    `${message.slice(0, keep)}… (${message.length - keep} characters not kept)`,
  );
  return cut.length <= MAX_MESSAGE
    ? cut
    : JSON.stringify(`… (${message.length} characters not kept)`);
}

/** Records each SSE `data` payload as one element of a JSON array, dropping the oldest past the bounds. */
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
  let total = 2;
  let hasErrors = false;
  const push = (message: string) => {
    const kept = cutMessage(message);
    messages.push(kept);
    total += kept.length + 2;
    while (
      messages.length > MAX_MESSAGES ||
      (total > MAX_TEXT && messages.length > 1)
    ) {
      total -= messages.shift()!.length + 2;
    }
  };
  const record = (event: string) => {
    const data = event
      .split(/\r?\n/)
      .filter((line) => line.startsWith('data:'))
      .map((line) => line.slice(5).replace(/^ /, ''))
      .join('\n');
    if (!data) return false;
    const value = parseJson(data);
    if ((value as { errors?: unknown[] } | null)?.errors?.length) {
      hasErrors = true;
    }
    push(value === undefined ? JSON.stringify(data) : data);
    return true;
  };
  const finish = (state: LogEntry['state']) =>
    updateEntry(id, {
      state,
      duration: Math.round(performance.now() - startedAt),
      size,
      response: messagesText(messages),
      hasGraphQLErrors: hasErrors,
    });
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (!done) size += value.byteLength;
      buffer += done
        ? decoder.decode()
        : decoder.decode(value, { stream: true });
      const events = buffer.split(/\r?\n\r?\n/);
      // At the end, a last event without its trailing blank line still counts.
      buffer = done ? '' : (events.pop() ?? '');
      let isChanged = false;
      for (const event of events) isChanged = record(event) || isChanged;
      if (done) break;
      if (isChanged) {
        updateEntry(id, {
          response: messagesText(messages),
          size,
          hasGraphQLErrors: hasErrors,
        });
      }
    }
    finish('ok');
  } catch (error) {
    // graphql-sse aborts the request on `complete` and on unsubscribe.
    if ((error as Error)?.name === 'AbortError') {
      finish('ok');
      return;
    }
    push(JSON.stringify(describeError(error)));
    finish('error');
  }
}

function observe(
  input: RequestInfo | URL,
  init: RequestInit | undefined,
  pending: Promise<Response>,
) {
  const url = input instanceof Request ? input.url : String(input);
  if (!new URL(url, location.href).pathname.endsWith(GQL_PATH)) return;
  const startedAt = performance.now();
  const body = (typeof init?.body === 'string' ? parseJson(init.body) : {}) as
    { query?: string; variables?: unknown; operationName?: string } | undefined;
  if (!body) return;
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
        response: describeError(error),
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
      return copy.arrayBuffer().then((bytes) => {
        const text = new TextDecoder().decode(bytes);
        const hasErrors = hasGraphQLErrors(text);
        updateEntry(id, {
          ...head,
          state: !response.ok || hasErrors ? 'error' : 'ok',
          hasGraphQLErrors: hasErrors,
          duration: Math.round(performance.now() - startedAt),
          size: bytes.byteLength,
          response: clip(text),
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
