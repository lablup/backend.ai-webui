/**
 * Entrypoint for the `bai-smoke` CLI.
 *
 * Subcommands (FR-2877 MVP):
 *   - `list`    — print the catalog of smoke categories.
 *   - `version` — print CLI + WebUI + Playwright version info.
 *   - `run`     — execute the smoke suite against a customer endpoint.
 *
 * Phase 2 subcommands (`doctor`, `preflight`) ship under FR-2878+.
 */
import { Command, Option } from 'commander';
import path from 'node:path';

import { SMOKE_CATALOG } from './catalog.js';
import {
  parseDuration,
  splitCsvArg,
  type SmokeRoleSelection,
  type SmokeRunOptions,
} from './config.js';
import { runSmoke } from './runner.js';
import {
  CLI_NAME,
  CLI_VERSION,
  PLAYWRIGHT_VERSION,
  WEBUI_SHA,
} from './version.js';

const program = new Command();

program
  .name('bai-smoke')
  .description(
    'Post-install smoke verification CLI for Backend.AI WebUI. ' +
      'Runs a curated @smoke subset of the e2e suite against a customer endpoint.',
  )
  .version(CLI_VERSION, '-v, --version', 'Print CLI version and exit.');

program
  .command('list')
  .description('List smoke categories and their @smoke* tag selectors.')
  .action(() => {
    process.stdout.write(`${CLI_NAME} smoke catalog\n`);
    process.stdout.write(`${'-'.repeat(60)}\n`);
    for (const entry of SMOKE_CATALOG) {
      process.stdout.write(`\n[${entry.category}]\n`);
      process.stdout.write(`  ${entry.description}\n`);
      process.stdout.write(`  tags : ${entry.tags.join(' ')}\n`);
      process.stdout.write(`  specs:\n`);
      for (const spec of entry.specs) {
        process.stdout.write(`    - ${spec}\n`);
      }
    }
    process.stdout.write(
      `\n${SMOKE_CATALOG.length} categories registered.\n`,
    );
  });

program
  .command('version')
  .description('Print CLI + WebUI + Playwright version info.')
  .action(() => {
    process.stdout.write(`${CLI_NAME} ${CLI_VERSION}\n`);
    process.stdout.write(`  webui-sha          : ${WEBUI_SHA}\n`);
    process.stdout.write(`  playwright-version : ${PLAYWRIGHT_VERSION}\n`);
    process.stdout.write(`  node               : ${process.version}\n`);
    process.stdout.write(`  platform           : ${process.platform}-${process.arch}\n`);
  });

program
  .command('run')
  .description('Run the smoke suite against a Backend.AI WebUI endpoint.')
  .addOption(
    new Option('--endpoint <url>', 'Backend.AI WebUI endpoint URL.')
      .env('BAI_SMOKE_ENDPOINT')
      .makeOptionMandatory(true),
  )
  .option(
    '--webserver <url>',
    'Backend.AI webserver endpoint URL. Defaults to --endpoint when omitted.',
  )
  .addOption(
    new Option('--email <email>', 'Login email or username.')
      .env('BAI_SMOKE_EMAIL')
      .makeOptionMandatory(true),
  )
  .addOption(
    new Option(
      '--password <password>',
      'Login password. Prefer --password-stdin or BAI_SMOKE_PASSWORD env.',
    ).env('BAI_SMOKE_PASSWORD'),
  )
  .option('--password-stdin', 'Read the password from stdin instead of --password.')
  .addOption(
    new Option('--role <role>', 'Role selection: auto, admin, or user.')
      .choices(['auto', 'admin', 'user'])
      .default('auto'),
  )
  .option('--include <tags>', 'Comma-separated extra tags to include (e.g. "@critical").')
  .option('--exclude <tags>', 'Comma-separated tags to exclude.')
  .option(
    '--pages <names>',
    'Comma-separated page directory names (e.g. "session,vfolder").',
  )
  .option('--workers <n>', 'Playwright worker count.', (v) => Number.parseInt(v, 10))
  .option(
    '--timeout <duration>',
    'Per-test timeout. Accepts "180s", "3m", or raw ms.',
    '180s',
  )
  .option(
    '--output <dir>',
    'Output directory for the smoke report.',
    () => defaultOutputDir(),
    defaultOutputDir(),
  )
  .option('--headed', 'Run the browser in headed mode (debugging only).', false)
  .option('--insecure-tls', 'Accept self-signed TLS certificates.', false)
  .action(async (raw: Record<string, unknown>) => {
    const password = await resolvePassword(raw);
    if (!password) {
      process.stderr.write(
        'bai-smoke run: --password, --password-stdin, or BAI_SMOKE_PASSWORD is required.\n',
      );
      process.exit(2);
    }

    const endpoint = String(raw.endpoint);
    const webserver =
      typeof raw.webserver === 'string' && raw.webserver.length > 0
        ? raw.webserver
        : endpoint;
    if (webserver === endpoint && !raw.webserver) {
      process.stderr.write(
        '[bai-smoke] --webserver not supplied; reusing --endpoint as the webserver URL.\n',
      );
    }

    let timeoutMs: number;
    try {
      timeoutMs = parseDuration(String(raw.timeout ?? '180s'));
    } catch (err) {
      process.stderr.write(`bai-smoke run: ${(err as Error).message}\n`);
      process.exit(2);
      return;
    }

    const opts: SmokeRunOptions = {
      endpoint,
      webserver,
      email: String(raw.email),
      password,
      role: (raw.role as SmokeRoleSelection) ?? 'auto',
      include: splitCsvArg(raw.include as string | string[] | undefined),
      exclude: splitCsvArg(raw.exclude as string | string[] | undefined),
      pages: splitCsvArg(raw.pages as string | string[] | undefined),
      workers: typeof raw.workers === 'number' && raw.workers > 0 ? raw.workers : undefined,
      timeoutMs,
      outputDir: path.resolve(String(raw.output ?? defaultOutputDir())),
      headed: raw.headed === true,
      insecureTls: raw.insecureTls === true,
    };

    const { exitCode, reportPath, summary } = await runSmoke(opts);

    process.stdout.write('\n');
    process.stdout.write('bai-smoke summary\n');
    process.stdout.write(`${'-'.repeat(60)}\n`);
    process.stdout.write(`  endpoint  : ${summary.endpoint}\n`);
    process.stdout.write(`  webserver : ${summary.webserver}\n`);
    process.stdout.write(`  role      : ${summary.role} (selection: ${summary.roleSelection})\n`);
    if (summary.results) {
      const { total, passed, failed, skipped, flaky } = summary.results;
      process.stdout.write(
        `  results   : ${passed} passed, ${failed} failed, ${skipped} skipped, ${flaky} flaky (total ${total})\n`,
      );
    } else {
      process.stdout.write('  results   : (no JSON reporter output found)\n');
    }
    process.stdout.write(`  report    : ${reportPath}\n`);
    process.stdout.write(`  summary   : ${path.join(opts.outputDir, 'summary.json')}\n`);
    process.exit(exitCode);
  });

program.parseAsync(process.argv).catch((err: unknown) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});

function defaultOutputDir(): string {
  const iso = new Date().toISOString().replace(/[:.]/g, '-');
  return path.resolve(process.cwd(), `smoke-report-${iso}`);
}

async function resolvePassword(raw: Record<string, unknown>): Promise<string | undefined> {
  if (typeof raw.password === 'string' && raw.password.length > 0) {
    return raw.password;
  }
  if (raw.passwordStdin === true) {
    return readStdin();
  }
  return undefined;
}

function readStdin(): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    process.stdin.on('data', (c: Buffer) => chunks.push(c));
    process.stdin.on('end', () => resolve(Buffer.concat(chunks).toString('utf8').trim()));
    process.stdin.on('error', reject);
  });
}
