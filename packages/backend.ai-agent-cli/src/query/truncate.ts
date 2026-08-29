/** Default result budget, in bytes of serialised JSON. */
export const DEFAULT_MAX_BYTES = 65536;

/** Strings shorter than this are never worth cutting. */
const MIN_STRING = 16;

/**
 * Keys whose string value is never cut: identity fields and the deep links
 * derived from them. Half an id is not a shorter id, it is a wrong one, and a
 * halved `webui_path` opens nothing — the bytes saved are not worth a link
 * that lies.
 */
export const UNCUTTABLE_KEYS: readonly string[] = [
  'id',
  'row_id',
  'endpoint_id',
  'webui_path',
  'webui_url',
];

export interface TruncateResult<T = unknown> {
  value: T;
  /** JSON paths that were cut, deepest-first. Empty when nothing was. */
  truncated: string[];
  bytes: number;
}

export const jsonBytes = (value: unknown): number =>
  Buffer.byteLength(JSON.stringify(value) ?? 'null', 'utf8');

interface Candidate {
  path: string;
  depth: number;
  /** Parent container plus the key/index the node sits at. */
  parent: Record<string, unknown> | unknown[];
  key: string | number;
}

/** Deep clone through JSON so truncation never mutates the caller's object. */
const clone = <T>(value: T): T =>
  (JSON.parse(JSON.stringify(value ?? null)) ?? null) as T;

function collect(root: unknown): Candidate[] {
  const found: Candidate[] = [];
  const walk = (
    node: unknown,
    path: string,
    depth: number,
    parent: Record<string, unknown> | unknown[] | null,
    key: string | number | null,
  ): void => {
    if (parent !== null && key !== null) {
      const uncuttable =
        typeof key === 'string' && UNCUTTABLE_KEYS.includes(key);
      if (Array.isArray(node) && node.length > 0) {
        found.push({ path, depth, parent, key });
      } else if (
        !uncuttable &&
        typeof node === 'string' &&
        node.length > MIN_STRING
      ) {
        found.push({ path, depth, parent, key });
      }
    }
    if (Array.isArray(node)) {
      node.forEach((item, index) =>
        walk(item, `${path}[${index}]`, depth + 1, node, index),
      );
    } else if (node !== null && typeof node === 'object') {
      for (const [name, item] of Object.entries(node)) {
        walk(
          item,
          path ? `${path}.${name}` : name,
          depth + 1,
          node as Record<string, unknown>,
          name,
        );
      }
    }
  };
  walk(root, '', 0, null, null);
  return found;
}

const sizeOf = (candidate: Candidate): number =>
  jsonBytes((candidate.parent as Record<string, unknown>)[
    candidate.key as string
  ]);

/**
 * Cuts `value` down to `maxBytes` of serialised JSON, **deepest-first**: the
 * innermost arrays and strings lose material before the shape around them
 * does, so the envelope keeps its structure and the caller can see what was
 * dropped. Each pass halves one node; a node is listed in `truncated` the
 * first time it is cut.
 *
 * Deepest-first is a policy, not an optimisation: an agent reading the result
 * needs the top-level shape intact far more than it needs the 400th row.
 */
export function truncateToBudget<T>(
  value: T,
  maxBytes: number,
): TruncateResult<T> {
  const copy = clone(value);
  let bytes = jsonBytes(copy);
  if (bytes <= maxBytes) return { value: copy, truncated: [], bytes };

  const candidates = collect(copy).sort(
    (a, b) => b.depth - a.depth || sizeOf(b) - sizeOf(a) || (a.path < b.path ? -1 : 1),
  );
  const truncated: string[] = [];
  const listed = new Set<string>();

  // Several passes: halving the deepest nodes once may not be enough, and a
  // node that is still the biggest thing at its depth deserves another cut.
  for (let pass = 0; pass < 32 && bytes > maxBytes; pass += 1) {
    let cutAnything = false;
    for (const candidate of candidates) {
      if (bytes <= maxBytes) break;
      const container = candidate.parent as Record<string | number, unknown>;
      const current = container[candidate.key];
      if (Array.isArray(current) && current.length > 0) {
        container[candidate.key] = current.slice(
          0,
          Math.floor(current.length / 2),
        );
      } else if (typeof current === 'string' && current.length > MIN_STRING) {
        container[candidate.key] = `${current.slice(
          0,
          Math.floor(current.length / 2),
        )}…`;
      } else {
        continue;
      }
      cutAnything = true;
      if (!listed.has(candidate.path)) {
        listed.add(candidate.path);
        truncated.push(candidate.path);
      }
      bytes = jsonBytes(copy);
    }
    if (!cutAnything) break;
  }

  return { value: copy, truncated, bytes };
}
