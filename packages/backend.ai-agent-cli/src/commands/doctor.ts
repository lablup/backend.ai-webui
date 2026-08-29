import type { RunContext } from '../command.js';
import { defineCommand } from '../command.js';
import { CliError, EXIT } from '../errors.js';
import { fetchWhoAmI } from '../manager.js';
import { MAPPINGS_DIR_NAME } from '../mappings/load.js';
import { resolveMappings } from '../mappings/resolve.js';
import { CLI_NAME, MIN_NODE_MAJOR } from '../meta.js';
import { record, renderBlocks, section } from '../output.js';
import type { RepoContext } from '../repo-context.js';
import {
  REPO_PACKAGE_NAME,
  REQUIRED_SOURCES,
  findRepoRoot,
  sourceStatus,
  tryResolveRepoContext,
} from '../repo-context.js';
import type { DocsPage } from '../search/docs-corpus.js';
import {
  docsLanguages,
  docsSrcDir,
  INDEX_LANG,
  loadDocsPage,
  loadDocsPages,
} from '../search/docs-corpus.js';
import { HOST_COMPONENT_DIR } from '../search/i18n-index.js';
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
import { join } from 'node:path';

export type CheckStatus = 'ok' | 'warn' | 'fail';

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

const checkoutGroup: CheckGroup = {
  name: 'checkout',
  run: ({ cwd }) => {
    const found = findRepoRoot(cwd);
    if (!found) {
      return [
        {
          group: 'checkout',
          check: 'checkout detection',
          status: 'fail',
          detail: `Not inside a ${REPO_PACKAGE_NAME} checkout: no ancestor of ${cwd} has a package.json named "${REPO_PACKAGE_NAME}".`,
          hint: `cd <${REPO_PACKAGE_NAME} checkout> && ${CLI_NAME} doctor`,
        },
        ...REQUIRED_SOURCES.map((source): DoctorCheck => ({
          group: 'checkout',
          check: source.path,
          status: 'fail',
          detail: 'not checked: no checkout detected',
          hint: `cd <${REPO_PACKAGE_NAME} checkout> && ${CLI_NAME} doctor`,
        })),
      ];
    }
    return [
      {
        group: 'checkout',
        check: 'checkout detection',
        status: 'ok',
        detail: `${found.root} (version ${found.version})`,
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
          hint: status === 'ok' ? undefined : 'git status',
        };
      }),
    ];
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
          hint: `cd <${REPO_PACKAGE_NAME} checkout> && ${CLI_NAME} doctor`,
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
          hint: `cd <${REPO_PACKAGE_NAME} checkout> && ${CLI_NAME} doctor`,
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
          hint: `cd <${REPO_PACKAGE_NAME} checkout> && ${CLI_NAME} doctor`,
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
        status: failures.length === 0 ? 'ok' : 'fail',
        detail:
          failures.length === 0
            ? `${counts.concepts} concept(s) and ${counts.docs} docs link(s) resolve`
            : `${failures.length} dangling reference(s): ${failures.map(line).join(' | ')}`,
        hint:
          failures.length === 0
            ? undefined
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

/** Later tickets append groups here. */
export const CHECK_GROUPS: CheckGroup[] = [
  runtimeGroup,
  checkoutGroup,
  docsGroup,
  schemaGroup,
  authGroup,
  mappingsGroup,
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
      await Promise.all(selectGroups(context).map((group) => group.run({ cwd })))
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
