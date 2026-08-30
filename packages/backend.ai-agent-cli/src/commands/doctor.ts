import { defineCommand } from '../command.js';
import { EXIT } from '../errors.js';
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
import { loadTerminology } from '../search/terminology.js';
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
  run(context: { cwd: string }): DoctorCheck[];
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

/** Later tickets append groups here (auth, schema alignment, mappings). */
export const CHECK_GROUPS: CheckGroup[] = [
  runtimeGroup,
  checkoutGroup,
  docsGroup,
];

export interface DoctorData {
  checks: DoctorCheck[];
  summary: { total: number; ok: number; warn: number; fail: number };
}

export const doctorCommand = defineCommand<DoctorData>({
  name: 'doctor',
  summary: 'Diagnose the CLI environment and the detected checkout.',
  usage: `${CLI_NAME} doctor [--json]`,
  flags: [],
  maxArgs: 0,
  run: ({ cwd }) => {
    const checks = CHECK_GROUPS.flatMap((group) => group.run({ cwd }));
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
