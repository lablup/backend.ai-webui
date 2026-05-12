/**
 * Entrypoint for the `bai-smoke` CLI.
 *
 * MVP scaffold (FR-2876):
 * - `list`    — print the catalog of smoke categories. Functional.
 * - `version` — print CLI version + bundled SHA + Playwright version. Functional.
 * - `run`     — stub. The actual Playwright runner ships in FR-2877.
 *
 * Global option parsing (`--endpoint`, `--email`, etc.) is declared on `run`
 * so `--help` documents the eventual flag surface, but every flag is a no-op
 * at this stage.
 */
import { Command } from 'commander';

import { SMOKE_CATALOG } from './catalog.js';
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

// `run` is a stub until FR-2877 wires the Playwright runner.
program
  .command('run')
  .description(
    'Run the smoke suite against an endpoint. Not yet implemented — coming in FR-2877.',
  )
  .option('--endpoint <url>', 'Backend.AI webui endpoint URL.')
  .option('--webserver <url>', 'Backend.AI webserver endpoint URL.')
  .option('--email <email>', 'Account email or username.')
  .option('--password <password>', 'Account password (prefer --password-stdin).')
  .option('--password-stdin', 'Read the password from stdin.')
  .option(
    '--role <role>',
    'Force role selection: auto | admin | user | monitor.',
    'auto',
  )
  .option('--include <tags...>', 'Additional tags to include in the run.')
  .option('--exclude <tags...>', 'Tags to exclude from the run.')
  .option('--pages <pages...>', 'Restrict the run to specific page categories.')
  .option('--workers <n>', 'Playwright worker count.', '1')
  .option('--timeout <ms>', 'Per-test timeout in milliseconds.', '120000')
  .option('--output <dir>', 'Output directory for the smoke report.', './smoke-report')
  .option('--headed', 'Run the browser in headed mode (debugging only).', false)
  .option('--insecure-tls', 'Accept self-signed TLS certificates.', false)
  .action(() => {
    process.stderr.write(
      'bai-smoke run: Not yet implemented. Coming in FR-2877.\n',
    );
    process.exit(2);
  });

program.parseAsync(process.argv).catch((err: unknown) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});
