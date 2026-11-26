/**
 * Registers one drill as a Playwright test and turns it into a readable
 * report. The test body runs the steps in order, screenshots the result of
 * each, and its `finally` always runs the drill's teardown and the resource
 * registry cleanup — a failed or timed-out step does not skip cleanup.
 */
import type { GraphQLMockMap } from '../mocks/session/graphql-interceptor';
import { setupGraphQLMocks } from '../mocks/session/graphql-interceptor';
import type { TestResources } from '../utils/test-resources';
import { createTestResources } from '../utils/test-resources';
import {
  loginAsAdmin,
  loginAsUser,
  loginAsUser2,
  webuiEndpoint,
} from '../utils/test-util';
import type { DrillReport, StepReport } from './report';
import { reportDirectory, screenshotName, writeReport } from './report';
import type {
  Drill,
  DrillAccount,
  DrillContext,
  DrillTeardownContext,
} from './types';
import type { Page } from '@playwright/test';
import { test } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

const reports: DrillReport[] = [];

/** The report folder: the drill id when one was selected, else `all`. */
function reportLabel(): string {
  const id = process.env.E2E_DRILL?.trim();
  return id && /^[a-z0-9-]+$/.test(id) ? id : 'all';
}

const describeError = (error: unknown): string =>
  error instanceof Error ? (error.stack ?? error.message) : String(error);

export function registerDrill(drill: Drill): void {
  if (!/^[a-z0-9-]+$/.test(drill.id)) {
    throw new Error(
      `drill id "${drill.id}" must be lower-case kebab-case (it names the report folder)`,
    );
  }
  test.describe(`[drill:${drill.id}] ${drill.title}`, () => {
    // A failure the per-step try/catch never sees — the drill-level timeout
    // firing between steps, an abort outside a step — still fails the test.
    // Mark its report here, after the body's `finally` filled the rest in.
    test.afterEach(() => {
      const info = test.info();
      if (info.status !== info.expectedStatus) {
        const report = reports[reports.length - 1];
        if (report) report.status = 'failed';
      }
    });

    // The last describe to finish writes every report collected so far, and
    // sweeps any registry the body's `finally` could not reach (a timeout or
    // an abort cut it short): `cleanup()` is idempotent, so this runs with a
    // fresh budget and only removes what is still registered.
    test.afterAll(async () => {
      const leftover: string[] = [];
      for (const registry of runRegistries) {
        const failed = await registry.cleanup();
        if (failed.length > 0) leftover.push(...failed);
      }
      if (leftover.length > 0) {
        console.warn(`[drill] could not remove: ${leftover.join(', ')}`);
      }
      if (reports.length === 0) return;
      const written = writeReport(reports, reportLabel());
      console.log(`[drill] report: ${written.html}`);
    });

    const runRegistries: TestResources[] = [];

    test(`[drill:${drill.id}] ${drill.title}`, async ({
      page,
      request,
      browser,
    }) => {
      test.setTimeout(drill.timeoutMs ?? 240_000);
      const runSuffix = `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      // Per run: `--repeat-each` reruns this test in one worker, and each run
      // must clean up its own registry.
      const resources = createTestResources();
      runRegistries.push(resources);
      const report: DrillReport = {
        drillId: drill.id,
        title: drill.title,
        group: drill.group,
        prerequisites: drill.prerequisites,
        status: 'failed',
        startedAt: new Date().toISOString(),
        finishedAt: new Date().toISOString(),
        runSuffix,
        target: webuiEndpoint,
        steps: drill.steps.map((step) => ({
          id: step.id,
          title: step.title,
          changed: step.changed,
          verify: step.verify,
          expected: step.expected,
          code: step.code,
          status: 'not-run',
          durationMs: 0,
        })),
        teardown: { status: 'skipped' },
      };
      reports.push(report);

      const pages = new Map<DrillAccount, Page>();
      pages.set('user', page);
      let active = page;
      // The fixture page is not signed in yet; `as('user')` does it once.
      const signedIn = new Set<DrillAccount>();
      const extraPages: Page[] = [];
      // Registered mock maps apply to every page of the drill, including the
      // ones `as()` opens later.
      const mockMaps: GraphQLMockMap[] = [];
      const applyMocks = async (target: Page) => {
        for (const mocks of mockMaps) {
          await setupGraphQLMocks(target, mocks);
        }
      };
      const signIn = async (account: DrillAccount, target: Page) => {
        if (account === 'admin') await loginAsAdmin(target, request);
        else if (account === 'user2') await loginAsUser2(target, request);
        else await loginAsUser(target, request);
        signedIn.add(account);
      };
      const dir = reportDirectory(reportLabel());
      fs.mkdirSync(dir, { recursive: true });

      const ctx: DrillContext = {
        drillId: drill.id,
        runSuffix,
        page,
        browser,
        request,
        resources,
        get activePage() {
          return active;
        },
        async as(account) {
          const open = pages.get(account);
          if (open) {
            if (!signedIn.has(account)) await signIn(account, open);
            active = open;
            return open;
          }
          // Its own context: the accounts must not share cookies.
          const next = await browser.newPage({
            locale: 'en-US',
            permissions: ['local-network-access'],
          });
          pages.set(account, next);
          extraPages.push(next);
          await applyMocks(next);
          await signIn(account, next);
          active = next;
          return next;
        },
        async mockGraphQL(mocks) {
          mockMaps.push(mocks);
          for (const open of pages.values()) {
            await setupGraphQLMocks(open, mocks);
          }
        },
      };

      // Signing in the owner is part of the drill's setup, not a check.
      const setupReport = {
        status: 'passed' as 'failed' | 'passed',
        error: '',
      };
      report.setup = setupReport;
      // One try around sign-in, setup and the steps: a failure at any of them
      // still reaches the `finally` below, so cleanup never depends on how far
      // the run got.
      try {
        try {
          await ctx.as('user');
        } catch (error) {
          setupReport.status = 'failed';
          setupReport.error = describeError(error);
          throw error;
        }
        if (drill.setup) {
          try {
            const observedSetup = await drill.setup(ctx);
            if (typeof observedSetup === 'string') {
              setupReport.observed = observedSetup;
            }
          } catch (error) {
            setupReport.status = 'failed';
            setupReport.error = describeError(error);
            throw error;
          }
        }
        for (const [index, step] of drill.steps.entries()) {
          const stepReport = report.steps[index] as StepReport;
          const started = Date.now();
          let failure: unknown;
          await test.step(step.title, async () => {
            try {
              const observed = await step.run(ctx);
              if (typeof observed === 'string') stepReport.observed = observed;
              stepReport.status = 'passed';
            } catch (error) {
              failure = error;
              stepReport.status = 'failed';
              stepReport.error = describeError(error);
            } finally {
              stepReport.durationMs = Date.now() - started;
              try {
                // The run suffix keeps `--repeat-each` runs' screenshots apart.
                const name = screenshotName(
                  drill.id,
                  `${runSuffix}-${step.id}`,
                );
                await ctx.activePage.screenshot({
                  path: path.join(dir, name),
                  fullPage: false,
                  timeout: 5_000,
                });
                stepReport.screenshot = name;
              } catch {
                // A dead or mid-navigation page has nothing to show; the text stays.
              }
            }
            if (failure) {
              // Re-raised from here so `test.step` marks the step failed.
              throw failure;
            }
          });
        }
      } finally {
        for (const extra of extraPages) {
          await extra
            .context()
            .close()
            .catch(() => {});
        }
        // The drill's teardown and the registry cleanup belong to this run,
        // so a repeat never orphans the previous run's data.
        const teardown: DrillReport['teardown'] = { status: 'skipped' };
        const teardownCtx: DrillTeardownContext = {
          drillId: drill.id,
          runSuffix,
          resources,
        };
        let observed: string | void;
        try {
          observed = await drill.teardown?.(teardownCtx);
        } catch (error) {
          teardown.status = 'failed';
          teardown.error = describeError(error);
        }
        // Runs even when the drill's own teardown failed: it is the registry
        // that holds what the steps declared.
        const failed = await resources.cleanup();
        if (teardown.status !== 'failed') {
          teardown.status = failed.length === 0 ? 'passed' : 'failed';
        }
        teardown.observed = [
          typeof observed === 'string' ? observed : undefined,
          failed.length === 0
            ? 'registered cleanup removed everything it declared'
            : `could not remove: ${failed.join(', ')}`,
        ]
          .filter(Boolean)
          .join('; ');
        report.teardown = teardown;
        report.finishedAt = new Date().toISOString();
        report.status =
          report.setup?.status === 'failed' ||
          teardown.status === 'failed' ||
          report.steps.some((step) => step.status === 'failed')
            ? 'failed'
            : 'passed';
      }
    });
  });
}
