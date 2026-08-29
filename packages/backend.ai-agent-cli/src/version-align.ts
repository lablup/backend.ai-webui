import type { FlagSpec } from './command.js';
import { CliError } from './errors.js';
import type { ManagerSession } from './manager.js';
import { fetchManagerVersion, probeIntrospection } from './manager.js';
import { CLI_NAME } from './meta.js';
import type { Block } from './output.js';
import { list, record, section } from './output.js';
import type {
  MarkerSource,
  SchemaIndex,
  SchemaMarker,
} from './search/schema-sdl.js';
import { loadSession, resolveEndpoint } from './session.js';

/** Every command that runs the gate takes the same flag. */
export const STRICT_FLAG: FlagSpec = {
  flag: '--strict',
  description:
    'Refuse (exit 1, code version_mismatch) when the schema is not aligned with the manager, instead of warning.',
  type: 'boolean',
};

/**
 * What `checkVersionAlignment` reads out of a schema context. Both
 * `schemaContext(repo)` and `{ schema: loadSchema(repo) }` satisfy it, so a
 * caller that already parsed the SDL never parses it twice.
 */
export interface SchemaAlignmentContext {
  schema: SchemaIndex;
}

export interface AlignmentFinding {
  /** `Type`, `Type.field` or `Enum.VALUE`. */
  id: string;
  /** The `Added in` / `Deprecated since` version the marker carries. */
  version: string;
  markerSource: MarkerSource;
}

export interface VersionAlignment {
  managerVersion: string;
  /** Marked entries compared against the manager. */
  checked: number;
  /** Entries the manager is too old to have. */
  newerCount: number;
  /** Entries the manager deprecated at or before its own version. */
  deprecatedCount: number;
  newer: AlignmentFinding[];
  deprecated: AlignmentFinding[];
  aligned: boolean;
  /** The one line `--json`-free callers print on stderr. */
  summary: string;
  hint: string;
}

/** Findings kept in the data object; the counts stay exact. */
export const ALIGNMENT_SAMPLE_LIMIT = 10;

/** Ids named in the one-line warning before it says "and N more". */
const SUMMARY_LIMIT = 3;

type Token = { number: number } | { word: string };

function tokenize(version: string): Token[] {
  const tokens: Token[] = [];
  for (const match of version.toLowerCase().matchAll(/(\d+)|([a-z]+)/g)) {
    tokens.push(
      match[1] !== undefined
        ? { number: Number(match[1]) }
        : { word: match[2] },
    );
  }
  return tokens;
}

/**
 * PEP 440-ish ordering over the versions Backend.AI actually writes
 * (`26.4.10`, `24.09.0`, `25.6.0rc1`). Leading zeros are numeric, and a
 * trailing alphabetic run is a pre-release: `26.4.10rc1` < `26.4.10`.
 */
export function compareVersions(a: string, b: string): number {
  const left = tokenize(a);
  const right = tokenize(b);
  const length = Math.max(left.length, right.length);
  for (let i = 0; i < length; i += 1) {
    const one = left[i];
    const other = right[i];
    // A side that ran out is the plain release; a remaining word is a
    // pre-release suffix, so the shorter side is the greater one.
    if (one === undefined) return 'word' in other ? 1 : -1;
    if (other === undefined) return 'word' in one ? -1 : 1;
    if ('number' in one && 'number' in other) {
      if (one.number !== other.number)
        return one.number < other.number ? -1 : 1;
      continue;
    }
    if ('number' in one) return 1;
    if ('number' in other) return -1;
    if (one.word !== other.word) return one.word < other.word ? -1 : 1;
  }
  return 0;
}

interface MarkedEntry {
  id: string;
  marker: SchemaMarker;
  markerSource: MarkerSource;
}

/** The whole schema: a type, then only the fields with a marker of their own. */
function everyMarkedEntry(schema: SchemaIndex): MarkedEntry[] {
  const entries: MarkedEntry[] = [];
  for (const type of schema.types) {
    if (type.markerSource === 'own') {
      entries.push({
        id: type.name,
        marker: type.marker,
        markerSource: 'own',
      });
    }
    for (const field of type.fields) {
      if (field.markerSource !== 'own') continue;
      entries.push({
        id: `${type.name}.${field.name}`,
        marker: field.marker,
        markerSource: 'own',
      });
    }
    for (const value of type.values) {
      if (value.markerSource !== 'own') continue;
      entries.push({
        id: `${type.name}.${value.name}`,
        marker: value.marker,
        markerSource: 'own',
      });
    }
  }
  return entries;
}

function findType(schema: SchemaIndex, name: string) {
  return schema.byName.get(name) ?? schema.byLowerName.get(name.toLowerCase());
}

/** A named selection: the effective marker, inherited from the type or not. */
function selectedEntries(
  schema: SchemaIndex,
  selected: string[],
): MarkedEntry[] {
  const entries: MarkedEntry[] = [];
  for (const raw of selected) {
    const id = raw.replace(/^schema:/, '').trim();
    const dot = id.indexOf('.');
    const type = findType(schema, dot < 0 ? id : id.slice(0, dot));
    if (!type) continue;
    if (dot < 0) {
      entries.push({
        id: type.name,
        marker: type.marker,
        markerSource: type.markerSource,
      });
      continue;
    }
    const memberName = id.slice(dot + 1);
    const member =
      type.fields.find((field) => field.name === memberName) ??
      type.values.find((value) => value.name === memberName);
    if (!member) continue;
    entries.push({
      id: `${type.name}.${member.name}`,
      marker: member.marker,
      markerSource: member.markerSource,
    });
  }
  return entries;
}

const describe = (finding: AlignmentFinding): string =>
  `${finding.id} ${finding.version}`;

function summarize(
  findings: AlignmentFinding[],
  total: number,
  what: string,
): string {
  const named = findings.slice(0, SUMMARY_LIMIT).map(describe).join(', ');
  const rest = total - Math.min(findings.length, SUMMARY_LIMIT);
  return `${total} ${what} (${named}${rest > 0 ? `, and ${rest} more` : ''})`;
}

/**
 * Compare the committed SDL's version markers against the manager's version.
 *
 * `selectedFields` narrows the comparison to the ids a command actually
 * touched (`Type`, `Type.field`, `Enum.VALUE`) and uses each one's **effective**
 * marker, so a field inherits its type's. Omit it and the whole schema is
 * compared, counting only entries carrying a marker of their own — a type
 * already stands for the fields that inherit from it.
 *
 * Pure: it performs no I/O. `applyVersionAlignmentGate` is the wrapper that
 * finds the session, fetches the manager version and reports.
 */
export function checkVersionAlignment(
  schemaCtx: SchemaAlignmentContext,
  managerVersion: string,
  selectedFields?: string[],
): VersionAlignment {
  const entries = selectedFields
    ? selectedEntries(schemaCtx.schema, selectedFields)
    : everyMarkedEntry(schemaCtx.schema);

  const newer: AlignmentFinding[] = [];
  const deprecated: AlignmentFinding[] = [];
  let checked = 0;
  for (const entry of entries) {
    const { addedIn, deprecatedSince } = entry.marker;
    if (!addedIn && !deprecatedSince) continue;
    checked += 1;
    if (addedIn && compareVersions(addedIn, managerVersion) > 0) {
      newer.push({
        id: entry.id,
        version: addedIn,
        markerSource: entry.markerSource,
      });
    }
    if (
      deprecatedSince &&
      compareVersions(deprecatedSince, managerVersion) <= 0
    ) {
      deprecated.push({
        id: entry.id,
        version: deprecatedSince,
        markerSource: entry.markerSource,
      });
    }
  }

  const aligned = newer.length === 0 && deprecated.length === 0;
  const parts = [
    newer.length > 0
      ? summarize(newer, newer.length, 'not in the manager yet')
      : undefined,
    deprecated.length > 0
      ? summarize(deprecated, deprecated.length, 'deprecated by the manager')
      : undefined,
  ].filter(Boolean);

  return {
    managerVersion,
    checked,
    newerCount: newer.length,
    deprecatedCount: deprecated.length,
    newer: newer.slice(0, ALIGNMENT_SAMPLE_LIMIT),
    deprecated: deprecated.slice(0, ALIGNMENT_SAMPLE_LIMIT),
    aligned,
    summary: aligned
      ? `schema matches manager ${managerVersion}`
      : `schema is not aligned with manager ${managerVersion}: ${parts.join('; ')}`,
    hint: `${CLI_NAME} schema sync --tag ${managerVersion}`,
  };
}

/** The blocks a command appends so its text output mirrors `alignment`. */
export function renderAlignment(alignment: VersionAlignment): Block[] {
  const findings = [
    ...alignment.newer.map(
      (finding) =>
        `newer than the manager: ${finding.id} (added ${finding.version}, marker ${finding.markerSource})`,
    ),
    ...alignment.deprecated.map(
      (finding) =>
        `deprecated by the manager: ${finding.id} (since ${finding.version}, marker ${finding.markerSource})`,
    ),
  ];
  return [
    section('Version alignment'),
    record([
      ['manager', alignment.managerVersion],
      ['verdict', alignment.aligned ? 'aligned' : 'not aligned'],
      ['checked', alignment.checked],
      ['newer', alignment.newerCount],
      ['deprecated', alignment.deprecatedCount],
      ['summary', alignment.summary],
      ['hint', alignment.aligned ? undefined : alignment.hint],
    ]),
    ...(findings.length > 0 ? [list(findings)] : []),
  ];
}

export function versionMismatchError(alignment: VersionAlignment): CliError {
  return new CliError('version_mismatch', alignment.summary, {
    suggestions: [...alignment.newer, ...alignment.deprecated].map(describe),
    hint: alignment.hint,
  });
}

export interface ManagerReachability {
  managerVersion: string;
  apiVersion?: string;
  source: string;
  /** `undefined` when the manager has introspection disabled. */
  introspection?: boolean;
}

/**
 * The session a version gate runs against, or `undefined` when there is none.
 * Never throws: no session is the normal case, not a failure.
 */
export function alignmentSession(options: {
  cwd: string;
  endpointFlag?: string;
}): ManagerSession | undefined {
  let endpoint: string;
  try {
    endpoint = resolveEndpoint({
      flag: options.endpointFlag,
      cwd: options.cwd,
    }).endpoint;
  } catch {
    return undefined;
  }
  const stored = loadSession(endpoint);
  return stored ? { endpoint, sessionId: stored.sessionId } : undefined;
}

export interface AlignmentGateOptions {
  cwd: string;
  schemaCtx: SchemaAlignmentContext;
  /** Ids the command touched; omit to compare the whole schema. */
  selectedFields?: string[];
  /** `--strict`: refuse instead of warning. */
  strict?: boolean;
  /** Warning sink — `RunContext.notify`, which writes to stderr. */
  notify?: (message: string) => void;
  endpointFlag?: string;
  fetchImpl?: typeof fetch;
}

export interface AlignmentGateResult {
  alignment?: VersionAlignment;
  manager?: ManagerReachability;
}

/**
 * The gate `whoami`, `schema show` — and later `query` / `explain` — run.
 *
 * Without a stored session it does nothing and touches the network zero times.
 * With one it reads the manager version, warns once on stderr by default, and
 * under `--strict` throws `version_mismatch` (exit 1).
 */
export async function applyVersionAlignmentGate(
  options: AlignmentGateOptions,
): Promise<AlignmentGateResult> {
  const session = alignmentSession(options);
  if (!session) return {};

  let version;
  try {
    version = await fetchManagerVersion(session, {
      fetchImpl: options.fetchImpl,
    });
  } catch {
    // An unreachable manager is not a version mismatch; stay quiet.
    return {};
  }

  const alignment = checkVersionAlignment(
    options.schemaCtx,
    version.manager,
    options.selectedFields,
  );
  const manager: ManagerReachability = {
    managerVersion: version.manager,
    ...(version.apiVersion ? { apiVersion: version.apiVersion } : {}),
    source: version.source,
    ...(await probeIntrospection(session, {
      fetchImpl: options.fetchImpl,
    }).then((introspection) =>
      introspection === undefined ? {} : { introspection },
    )),
  };

  if (!alignment.aligned) {
    if (options.strict) throw versionMismatchError(alignment);
    options.notify?.(`warning: ${alignment.summary}; hint: ${alignment.hint}`);
  }
  return { alignment, manager };
}
