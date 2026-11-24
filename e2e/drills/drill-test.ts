/**
 * Registers one drill as a Playwright test and turns it into a readable
 * report. The test body runs the steps in order, screenshots the result of
 * each, and the describe's `afterAll` always cleans up — a failed or timed-out
 * step does not skip teardown.
 */
import type { GraphQLMockMap } from '../mocks/session/graphql-interceptor';
import { setupGraphQLMocks } from '../mocks/session/graphql-interceptor';
import { createTestResources } from '../utils/test-resources';
import { loginAsAdmin, loginAsUser, loginAsUser2 } from '../utils/test-util';
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
  const id = process.env.E2E_DRILL;
  return id && /^[a-z0-9-]+$/.test(id) ? id : 'all';
}

const describeError = (error: unknown): string =>
  error instanceof Error ? (error.stack ?? error.message) : String(error);

export function registerDrill(drill: Drill): void {
  test.describe(`[drill:${drill.id}] ${drill.title}`, () => {
    let report: DrillReport | undefined;
    let resources = createTestResources();
    let runSuffix = '';

    test.afterAll(async () => {
      if (!report) return;
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
        report.steps.some((step) => step.status === 'failed')
          ? 'failed'
          : 'passed';
      const written = writeReport(reports, reportLabel());
      console.log(`[drill] report: ${written.html}`);
    });

    test(`[drill:${drill.id}] ${drill.title}`, async ({
      page,
      request,
      browser,
    }) => {
      test.setTimeout(drill.timeoutMs ?? 240_000);
      runSuffix = `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      resources = createTestResources();
      const pages = new Map<DrillAccount, Page>();
      pages.set('user', page);
      let active = page;
      // Registered mock maps apply to every page of the drill, including the
      // ones `as()` opens later.
      const mockMaps: GraphQLMockMap[] = [];
      const applyMocks = async (target: Page) => {
        for (const mocks of mockMaps) {
          await setupGraphQLMocks(target, mocks);
        }
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
            active = open;
            return open;
          }
          const next = await browser.newPage();
          pages.set(account, next);
          await applyMocks(next);
          if (account === 'admin') await loginAsAdmin(next, request);
          else if (account === 'user2') await loginAsUser2(next, request);
          else await loginAsUser(next, request);
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

      report = {
        drillId: drill.id,
        title: drill.title,
        group: drill.group,
        prerequisites: drill.prerequisites,
        status: 'failed',
        startedAt: new Date().toISOString(),
        finishedAt: new Date().toISOString(),
        runSuffix,
        target: process.env.E2E_WEBUI_ENDPOINT ?? '(E2E_WEBUI_ENDPOINT unset)',
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

      // Signing in the owner is part of the drill's setup, not a check.
      const setupReport = {
        status: 'passed' as 'failed' | 'passed',
        error: '',
      };
      report.setup = setupReport;
      try {
        await ctx.as('user');
      } catch (error) {
        setupReport.status = 'failed';
        setupReport.error = describeError(error);
        throw error;
      }
      if (drill.setup) {
        try {
          await drill.setup(ctx);
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
              const name = screenshotName(drill.id, step.id);
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
    });
  });
}
