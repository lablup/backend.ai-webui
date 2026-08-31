import type { RunContext } from '../command.js';
import { defineCommand } from '../command.js';
import { readConfig } from '../config.js';
import { CliError, EXIT } from '../errors.js';
import {
  fetchManagerVersion,
  fetchPublicManagerVersion,
  fetchWhoAmI,
} from '../manager.js';
import { MAPPINGS_DIR_NAME } from '../mappings/load.js';
import { resolveMappings } from '../mappings/resolve.js';
import { CLI_NAME, MIN_NODE_MAJOR } from '../meta.js';
import { record, renderBlocks, section } from '../output.js';
import type { RepoContext } from '../repo-context.js';
import {
  CHECKOUT_ENV,
  REPO_PACKAGE_NAME,
  REQUIRED_SOURCES,
  locateRepo,
  sourceStatus,
  tryResolveRepoContext,
} from '../repo-context.js';
import {
  readCommittedSchema,
  readSchemaMetaResult,
  SCHEMA_META_FILE,
  SCHEMA_META_STALE_DAYS,
} from '../schema-meta.js';
import type { DocsPage } from '../search/docs-corpus.js';
import {
  docsLanguages,
  docsSrcDir,
  INDEX_LANG,
  loadDocsPage,
  loadDocsPages,
} from '../search/docs-corpus.js';
import { HOST_COMPONENT_DIR } from '../search/i18n-index.js';
import { loadSchema } from '../search/schema-sdl.js';
import { schemaContext } from '../search/schema-search.js';
import { loadTerminology } from '../search/terminology.js';
import {
  loadSession,
  maskSessionId,
  resolveEndpoint,
  sessionFileMode,
  sessionPath,
  SESSION_FILE_MODE,
} from '../session.js';
import { alignmentSession, checkVersionAlignment } from '../version-align.js';
import { join } from 'node:path';

export type CheckStatus = 'ok' | 'warn' | 'fail';

/** A synced data checkout older than this is reported, not refused. */
export const SYNC_STALE_DAYS = 30;

export interface DoctorCheck {
  group: string;
  check: string;
  status: CheckStatus;
  detail: string;
  hint?: string;
}

export interface CheckGroup {
  name: string;
  run(context: { cwd: string }): DoctorCheck[] | Promise<DoctorCheck[]>;
}

const runtimeGroup: CheckGroup = {
  name: 'runtime',
  run: () => {
    const major = Number(process.versions.node.split('.')[0]);
    return [
      {
        group: 'runtime',
        check: 'node version',
        status: major >= MIN_NODE_MAJOR ? 'ok' : 'fail',
        detail: `node ${process.version} (minimum v${MIN_NODE_MAJOR})`,
        hint: major >= MIN_NODE_MAJOR ? undefined : `nvm use ${MIN_NODE_MAJOR}`,
      },
    ];
  },
};

/** What to run when no checkout is in reach — the same hint everywhere. */
const NO_CHECKOUT_HINT = `${CLI_NAME} sync`;

const checkoutGroup: CheckGroup = {
  name: 'checkout',
  run: ({ cwd }) => {
    let found: ReturnType<typeof locateRepo>;
    try {
      found = locateRepo(cwd);
    } catch (error) {
      return [
        {
          group: 'checkout',
          check: 'checkout detection',
          status: 'fail',
          detail: error instanceof Error ? error.message : String(error),
          hint: `unset ${CHECKOUT_ENV}`,
        },
      ];
    }
    if (!found) {
      return [
        {
          group: 'checkout',
          check: 'checkout detection',
          status: 'fail',
          detail: `No ${REPO_PACKAGE_NAME} checkout: no ancestor of ${cwd} has a package.json named "${REPO_PACKAGE_NAME}", and nothing is synced.`,
          hint: NO_CHECKOUT_HINT,
        },
        ...REQUIRED_SOURCES.map((source): DoctorCheck => ({
          group: 'checkout',
          check: source.path,
          status: 'fail',
          detail: 'not checked: no checkout detected',
          hint: NO_CHECKOUT_HINT,
        })),
      ];
    }
    const checks: DoctorCheck[] = [
      {
        group: 'checkout',
        check: 'checkout detection',
        status: 'ok',
        detail: `${found.root} (version ${found.version}, via ${found.source})`,
      },
      ...REQUIRED_SOURCES.map((source): DoctorCheck => {
        const absolute = join(found.root, source.path);
        const status = sourceStatus(found.root, source);
        const detail =
          status === 'ok'
            ? `${source.kind} found at ${absolute}`
            : status === 'missing'
              ? `${source.kind} missing at ${absolute}`
              : `${absolute} exists but is not a ${source.kind}`;
        return {
          group: 'checkout',
          check: source.path,
          status: status === 'ok' ? 'ok' : 'fail',
          detail,
          hint:
            status === 'ok'
              ? undefined
              : found.source === 'synced'
                ? `${CLI_NAME} sync --force`
                : 'git status',
        };
      }),
    ];
    if (found.source === 'synced') {
      // config.json is only cast on read; a hand-edited or foreign record
      // must degrade to a warning, never crash the run.
      const raw = readConfig().sync;
      const sync =
        raw && typeof raw.ref === 'string' && typeof raw.commit === 'string'
          ? raw
          : undefined;
      const syncedAtMs = sync ? Date.parse(sync.syncedAt ?? '') : NaN;
      const ageDays = Number.isFinite(syncedAtMs)
        ? Math.floor((Date.now() - syncedAtMs) / 86_400_000)
        : null;
      const stale = ageDays === null || ageDays > SYNC_STALE_DAYS;
      checks.push({
        group: 'checkout',
        check: 'synced data',
        status: sync && !stale ? 'ok' : 'warn',
        detail: sync
          ? `${sync.ref} at ${sync.commit.slice(0, 9)}, synced ${
              ageDays === null
                ? 'at an unknown time'
                : `${sync.syncedAt} (${ageDays} day(s) ago)`
            }${ageDays !== null && stale ? `, older than ${SYNC_STALE_DAYS} days` : ''}`
          : raw
            ? 'sync record in config.json is not readable (no ref/commit)'
            : 'no sync record in config.json; the checkout may be hand-made',
        hint: sync && !stale ? undefined : `${CLI_NAME} sync`,
      });
    }
    return checks;
  },
};

const docsGroup: CheckGroup = {
  name: 'docs',
  run: ({ cwd }) => {
    const resolved = tryResolveRepoContext(cwd);
    if (!resolved.ok) {
      return [
        {
          group: 'docs',
          check: 'manual sources',
          status: 'fail',
          detail: 'not checked: no checkout detected',
          hint: NO_CHECKOUT_HINT,
        },
      ];
    }
    const { context } = resolved;
    const languages = docsLanguages(context);
    const englishPages = languages.includes(INDEX_LANG)
      ? loadDocsPages(context, INDEX_LANG)
      : [];
    const cache = new Map<string, DocsPage | null>();
    // Hits map to a language by heading index, so parity is the load-bearing
    // property: report the pages where it does not hold.
    const drifted: string[] = [];
    for (const lang of languages.filter((name) => name !== INDEX_LANG)) {
      for (const page of englishPages) {
        const translated = loadDocsPage(
          context,
          lang,
          page.relativePath,
          cache,
        );
        if (!translated || !headingLevelsMatch(translated, page)) {
          drifted.push(`${lang}/${page.relativePath}`);
        }
      }
    }

    const terminology = terminologyStatus(context);

    return [
      {
        group: 'docs',
        check: 'manual sources',
        status: englishPages.length > 0 ? 'ok' : 'fail',
        detail: `${englishPages.length} ${INDEX_LANG} page(s) under ${docsSrcDir(context)}`,
        hint: englishPages.length > 0 ? undefined : 'git status',
      },
      {
        group: 'docs',
        check: 'languages',
        status: languages.length > 1 ? 'ok' : 'warn',
        detail: languages.join(', ') || 'none',
      },
      {
        group: 'docs',
        check: 'heading parity',
        status: drifted.length === 0 ? 'ok' : 'warn',
        detail:
          drifted.length === 0
            ? `every translated page mirrors the ${INDEX_LANG} heading structure`
            : `${drifted.length} page(s) drifted: ${drifted.slice(0, 3).join(', ')}`,
        hint: drifted.length === 0 ? undefined : `${CLI_NAME} docs show --help`,
      },
      {
        group: 'docs',
        check: 'terminology',
        status: terminology.status,
        detail: terminology.detail,
        hint: 'bai-agent search "vfolder" --domain terminology',
      },
    ];
  },
};

/** Parity is the level sequence, not the count: h2/h3 swaps drift too. */
export function headingLevelsMatch(a: DocsPage, b: DocsPage): boolean {
  const left = a.parsed.headings;
  const right = b.parsed.headings;
  return (
    left.length === right.length &&
    left.every((heading, index) => heading.level === right[index].level)
  );
}

function terminologyStatus(context: RepoContext): {
  status: CheckStatus;
  detail: string;
} {
  try {
    const terms = loadTerminology(context);
    return { status: 'ok', detail: `${terms.length} concept(s) loaded` };
  } catch (error) {
    return {
      status: 'fail',
      detail: error instanceof Error ? error.message : String(error),
    };
  }
}

const percent = (part: number, whole: number): string =>
  whole === 0 ? '0%' : `${Math.round((part / whole) * 100)}%`;

const schemaGroup: CheckGroup = {
  name: 'schema',
  run: ({ cwd }) => {
    const resolved = tryResolveRepoContext(cwd);
    if (!resolved.ok) {
      return [
        {
          group: 'schema',
          check: 'sdl parses',
          status: 'fail',
          detail: 'not checked: no checkout detected',
          hint: NO_CHECKOUT_HINT,
        },
      ];
    }
    let loaded: ReturnType<typeof schemaContext>;
    try {
      loaded = schemaContext(resolved.context);
    } catch (error) {
      return [
        {
          group: 'schema',
          check: 'sdl parses',
          status: 'fail',
          detail: error instanceof Error ? error.message : String(error),
          hint: 'pnpm run relay',
        },
      ];
    }
    const { stats } = loaded.schema;
    return [
      {
        group: 'schema',
        check: 'sdl parses',
        status: 'ok',
        detail: `${loaded.schema.path} parsed`,
      },
      {
        group: 'schema',
        check: 'type and field counts',
        status: stats.types > 0 && stats.fields > 0 ? 'ok' : 'fail',
        detail: `${stats.types} type(s), ${stats.fields} field(s), ${stats.enumValues} enum value(s)`,
      },
      {
        group: 'schema',
        check: 'marker coverage',
        // Markers are written by hand upstream; thin coverage is a warning,
        // not a broken checkout.
        status: stats.typesWithMarker > 0 ? 'ok' : 'warn',
        detail: `types ${percent(stats.typesWithMarker, stats.types)} (${stats.typesWithMarker}/${stats.types}), fields ${percent(stats.fieldsWithMarker, stats.fields)} (${stats.fieldsWithMarker}/${stats.fields}, ${stats.fieldsWithOwnMarker} own)`,
      },
      {
        group: 'schema',
        check: 'i18n reverse index',
        status: loaded.i18n.stats.labelledFields > 0 ? 'ok' : 'warn',
        detail: `${loaded.i18n.stats.labelledFields} field(s) labelled from ${loaded.i18n.stats.filesWithFragments}/${loaded.i18n.stats.filesScanned} ${HOST_COMPONENT_DIR} file(s)`,
        hint:
          loaded.i18n.stats.labelledFields > 0
            ? undefined
            : `ls ${HOST_COMPONENT_DIR}`,
      },
    ];
  },
};

/**
 * Auth is checked live: a session file that exists but no longer authenticates
 * is exactly the state `whoami` would fail on, so `doctor` must reach out too.
 */
const authGroup: CheckGroup = {
  name: 'auth',
  run: async ({ cwd }) => {
    let endpoint: string;
    try {
      endpoint = resolveEndpoint({ cwd }).endpoint;
    } catch (error) {
      return [
        {
          group: 'auth',
          check: 'endpoint',
          status: 'warn',
          detail:
            error instanceof CliError ? error.message : 'no endpoint resolved',
          hint: `${CLI_NAME} login --endpoint <manager url>`,
        },
      ];
    }

    const stored = loadSession(endpoint);
    if (!stored) {
      return [
        {
          group: 'auth',
          check: 'session file',
          status: 'warn',
          detail: `no session stored for ${endpoint} (${sessionPath(endpoint)})`,
          hint: `${CLI_NAME} login --endpoint ${endpoint}`,
        },
        {
          group: 'auth',
          check: 'whoami',
          status: 'warn',
          detail: 'not checked: no session stored',
          hint: `${CLI_NAME} login --endpoint ${endpoint}`,
        },
      ];
    }

    const mode = sessionFileMode(stored.path);
    const modeOk = mode === SESSION_FILE_MODE;
    const checks: DoctorCheck[] = [
      {
        group: 'auth',
        check: 'session file',
        status: modeOk ? 'ok' : 'fail',
        detail: `${stored.path} mode ${mode === null ? '?' : mode.toString(8).padStart(4, '0')} (expected 0600), session ${maskSessionId(stored.sessionId)}`,
        hint: modeOk ? undefined : `chmod 600 ${stored.path}`,
      },
    ];

    try {
      const user = await fetchWhoAmI({
        endpoint,
        sessionId: stored.sessionId,
      });
      checks.push({
        group: 'auth',
        check: 'whoami',
        status: 'ok',
        detail: `${user.email} (${user.role}) at ${endpoint}`,
      });
    } catch (error) {
      const isAuth =
        error instanceof CliError && error.code === 'auth_required';
      checks.push({
        group: 'auth',
        check: 'whoami',
        status: isAuth ? 'fail' : 'warn',
        detail: error instanceof Error ? error.message : String(error),
        hint: `${CLI_NAME} login --endpoint ${endpoint}`,
      });
    }
    return checks;
  },
};

/** The curated `mappings/<Type>.yaml` files and every reference they make. */
export const MAPPINGS_GROUP = 'mappings';

const mappingsGroup: CheckGroup = {
  name: MAPPINGS_GROUP,
  run: ({ cwd }) => {
    const resolved = tryResolveRepoContext(cwd);
    if (!resolved.ok) {
      return [
        {
          group: MAPPINGS_GROUP,
          check: 'mapping files',
          status: 'fail',
          detail: 'not checked: no checkout detected',
          hint: NO_CHECKOUT_HINT,
        },
      ];
    }
    let report: ReturnType<typeof resolveMappings>;
    try {
      report = resolveMappings(resolved.context);
    } catch (error) {
      return [
        {
          group: MAPPINGS_GROUP,
          check: 'mapping files',
          status: 'fail',
          detail: error instanceof Error ? error.message : String(error),
          hint: 'pnpm --filter backend.ai-agent-cli build',
        },
      ];
    }
    const { counts, issues, set } = report;
    const failures = issues.filter((issue) => issue.level === 'fail');
    // Synced data is pinned to the manager's release; the curation shipped
    // with the CLI may be newer than that manual, so a dangling docs anchor
    // there is staleness to report, not a broken install.
    const pinned = resolved.context.source === 'synced';
    const warnings = issues.filter((issue) => issue.level === 'warn');
    const line = (issue: (typeof issues)[number]): string =>
      `${issue.file} ${issue.ref}: ${issue.message}`;

    return [
      {
        group: MAPPINGS_GROUP,
        check: 'mapping files',
        status: set.files.length > 0 ? 'ok' : 'warn',
        detail: `${counts.files} file(s) in ${set.dir}, ${counts.types} type(s), ${counts.fields} field(s), ${counts.values} value(s)`,
        hint: set.files.length > 0 ? undefined : `ls ${MAPPINGS_DIR_NAME}`,
      },
      {
        group: MAPPINGS_GROUP,
        check: 'schema.json validation',
        status: set.issues.length === 0 ? 'ok' : 'fail',
        detail:
          set.issues.length === 0
            ? `every mapping validates against ${MAPPINGS_DIR_NAME}/schema.json`
            : set.issues
                .map((issue) => `${issue.file}: ${issue.message}`)
                .join(' | '),
        hint:
          set.issues.length === 0
            ? undefined
            : `${MAPPINGS_DIR_NAME}/schema.json`,
      },
      {
        group: MAPPINGS_GROUP,
        check: 'references resolve',
        status: failures.length === 0 ? 'ok' : pinned ? 'warn' : 'fail',
        detail:
          failures.length === 0
            ? `${counts.concepts} concept(s) and ${counts.docs} docs link(s) resolve`
            : `${failures.length} dangling reference(s)${pinned ? ' (the CLI’s curation is newer than the synced data)' : ''}: ${failures.map(line).join(' | ')}`,
        hint:
          failures.length === 0
            ? undefined
            : pinned
              ? `${CLI_NAME} sync --ref main`
              : `${CLI_NAME} doctor --${MAPPINGS_GROUP}`,
      },
      {
        group: MAPPINGS_GROUP,
        check: 'value coverage',
        status: warnings.length === 0 ? 'ok' : 'warn',
        detail:
          warnings.length === 0
            ? 'every curated enum is complete and every UI-rendered enum is curated'
            : warnings.map(line).join(' | '),
      },
    ];
  },
};

/**
 * Is the committed SDL the one the manager actually serves? Everything here is
 * a warning at worst: a checkout with no `schema.meta.json` and no session is
 * the normal state, not a broken one.
 */
const alignmentGroup: CheckGroup = {
  name: 'alignment',
  run: async ({ cwd }) => {
    const resolved = tryResolveRepoContext(cwd);
    if (!resolved.ok) {
      return [
        {
          group: 'alignment',
          check: 'schema alignment',
          status: 'warn',
          detail: 'not checked: no checkout detected',
          hint: NO_CHECKOUT_HINT,
        },
      ];
    }
    const { context } = resolved;
    const checks: DoctorCheck[] = [];

    const sdl = readCommittedSchema(context);
    checks.push({
      group: 'alignment',
      check: 'sdl present',
      status: sdl ? 'ok' : 'fail',
      detail: sdl
        ? `${context.schemaPath} (${sdl.bytes} bytes, sha256 ${sdl.sha256.slice(0, 12)}…)`
        : `${context.schemaPath} not readable`,
      hint: sdl ? undefined : `${CLI_NAME} schema sync`,
    });

    const metaResult = readSchemaMetaResult(context);
    const meta = metaResult.kind === 'ok' ? metaResult.meta : null;
    const stale =
      meta !== null &&
      meta.ageDays !== null &&
      meta.ageDays > SCHEMA_META_STALE_DAYS;
    const shaMatches = meta !== null && meta.sha256 === sdl?.sha256;
    checks.push({
      group: 'alignment',
      check: SCHEMA_META_FILE,
      status: meta !== null && !stale && shaMatches ? 'ok' : 'warn',
      detail:
        metaResult.kind === 'missing'
          ? `not recorded: ${metaResult.path} is missing, so the SDL's backend tag is unknown`
          : metaResult.kind === 'invalid'
            ? `not readable: ${metaResult.path} exists but is ${metaResult.reason}, so the SDL's backend tag is unknown`
            : `tag ${metaResult.meta.tag}, fetched ${metaResult.meta.fetchedAt || 'at an unknown time'}${
                metaResult.meta.ageDays === null
                  ? ''
                  : ` (${metaResult.meta.ageDays} day(s) ago)`
              }${stale ? `, older than ${SCHEMA_META_STALE_DAYS} days` : ''}${
                shaMatches ? '' : ', sha256 does NOT match the SDL on disk'
              }`,
      hint:
        meta !== null && !stale && shaMatches
          ? undefined
          : `${CLI_NAME} schema sync`,
    });

    const session = alignmentSession({ cwd });
    // `/func/` is public: the endpoint `init` recorded is enough to compare,
    // even before anyone has logged in.
    const recorded = session ? undefined : readConfig().endpoint;
    if (!session && !recorded) {
      checks.push({
        group: 'alignment',
        check: 'manager version',
        status: 'warn',
        detail: 'not checked: no session stored and no endpoint recorded',
        hint: `${CLI_NAME} init --endpoint <manager url>`,
      });
      checks.push({
        group: 'alignment',
        check: 'verdict',
        status: 'warn',
        detail: meta
          ? `SDL recorded at ${meta.tag}; run init or log in to compare it with a manager`
          : 'unknown: no recorded tag and no manager to compare against',
        hint: `${CLI_NAME} schema sync --dry-run`,
      });
      return checks;
    }
    const endpoint = session?.endpoint ?? recorded!;

    let version;
    try {
      version = session
        ? await fetchManagerVersion(session)
        : await fetchPublicManagerVersion(endpoint);
    } catch (error) {
      checks.push({
        group: 'alignment',
        check: 'manager version',
        status: 'warn',
        detail: error instanceof Error ? error.message : String(error),
        hint: session
          ? `${CLI_NAME} login --endpoint ${endpoint}`
          : `${CLI_NAME} init --endpoint <manager url>`,
      });
      checks.push({
        group: 'alignment',
        check: 'verdict',
        status: 'warn',
        detail: 'unknown: the manager version could not be read',
        hint: `${CLI_NAME} schema sync --dry-run`,
      });
      return checks;
    }

    checks.push({
      group: 'alignment',
      check: 'manager version',
      status: 'ok',
      detail: `${version.manager} at ${endpoint} (via ${version.source}${session ? '' : ', no session'})`,
    });

    const alignment = checkVersionAlignment(
      { schema: loadSchema(context) },
      version.manager,
    );
    checks.push({
      group: 'alignment',
      check: 'verdict',
      status: alignment.aligned ? 'ok' : 'warn',
      detail: `${alignment.summary} (${alignment.checked} marked entries compared)`,
      hint: alignment.hint,
    });
    return checks;
  },
};

/** Later tickets append groups here. */
export const CHECK_GROUPS: CheckGroup[] = [
  runtimeGroup,
  checkoutGroup,
  docsGroup,
  schemaGroup,
  authGroup,
  mappingsGroup,
  alignmentGroup,
];

/** `--mappings` narrows the run to that one group; the default runs them all. */
export function selectGroups(context: RunContext): CheckGroup[] {
  return context.flags[MAPPINGS_GROUP] === true
    ? CHECK_GROUPS.filter((group) => group.name === MAPPINGS_GROUP)
    : CHECK_GROUPS;
}

export interface DoctorData {
  checks: DoctorCheck[];
  summary: { total: number; ok: number; warn: number; fail: number };
}

export const doctorCommand = defineCommand<DoctorData>({
  name: 'doctor',
  summary: 'Diagnose the CLI environment and the detected checkout.',
  usage: `${CLI_NAME} doctor [--${MAPPINGS_GROUP}] [--json]`,
  flags: [
    {
      flag: `--${MAPPINGS_GROUP}`,
      description:
        'Run only the mappings group: validate every mappings/<Type>.yaml and resolve its references.',
      type: 'boolean',
    },
  ],
  maxArgs: 0,
  run: async (context) => {
    const { cwd } = context;
    const checks = (
      await Promise.all(
        selectGroups(context).map((group) => group.run({ cwd })),
      )
    ).flat();
    return {
      checks,
      summary: {
        total: checks.length,
        ok: checks.filter((check) => check.status === 'ok').length,
        warn: checks.filter((check) => check.status === 'warn').length,
        fail: checks.filter((check) => check.status === 'fail').length,
      },
    };
  },
  render: (data, { verbosity }) => {
    const blocks = [section(`${CLI_NAME} doctor`)];
    for (const check of data.checks) {
      blocks.push(
        record([
          ['status', check.status],
          ['check', check.check],
          ...(verbosity === 'dense'
            ? []
            : ([['detail', check.detail]] as Array<[string, string]>)),
          ...(verbosity === 'detail'
            ? ([
                ['group', check.group],
                ['hint', check.hint],
              ] as Array<[string, string | undefined]>)
            : []),
        ]),
      );
    }
    blocks.push(
      record([
        ['total', data.summary.total],
        ['ok', data.summary.ok],
        ['warn', data.summary.warn],
        ['fail', data.summary.fail],
      ]),
    );
    return renderBlocks(blocks);
  },
  exitCode: (data) => (data.summary.fail > 0 ? EXIT.error : EXIT.ok),
});
