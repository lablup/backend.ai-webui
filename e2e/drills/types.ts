/**
 * A drill is one named scenario that is executed and judged against an
 * already-running WebUI, with a written explanation on every step so the
 * result can be read by someone who never opened the spec. See
 * `e2e/drills/README.md`.
 */
import type { TestResources } from '../utils/test-resources';
import type { APIRequestContext, Browser, Page } from '@playwright/test';

/** The accounts a drill may act as; all but `user` need their own page. */
export type DrillAccount = 'admin' | 'user' | 'user2';

/** Where a step's explanation points in the code (1-based line numbers). */
export interface DrillCodeRef {
  path: string;
  line: number;
  to?: number;
}

export interface DrillContext {
  readonly drillId: string;
  /** Unique per run, so a drill never collides with a previous run's data. */
  readonly runSuffix: string;
  /** The owner account's page. */
  readonly page: Page;
  readonly browser: Browser;
  readonly request: APIRequestContext;
  readonly resources: TestResources;
  /** A page signed in as `account`, opened on first use. */
  as(account: DrillAccount): Promise<Page>;
  /** The page the current step last worked on (the screenshot target). */
  readonly activePage: Page;
}

export interface DrillTeardownContext {
  readonly drillId: string;
  readonly runSuffix: string;
  readonly resources: TestResources;
}

export interface DrillStep {
  /** Stable within the drill; the report keys screenshots by it. */
  id: string;
  title: string;
  /** What changed on screen, in plain words. */
  changed: string;
  /** What the reader should check right there. */
  verify: string;
  /** What a pass looks like, in one line. */
  expected: string;
  /** One to three places in the code that produce what the step shows. */
  code: DrillCodeRef[];
  /**
   * Does the work and asserts its outcome. Resolves to one line describing
   * what was observed; throws when the check fails.
   */
  run(ctx: DrillContext): Promise<string | void>;
}

export interface Drill {
  id: string;
  title: string;
  /** A group of related drills reads and runs in sequence (e.g. `vfolders`). */
  group: string;
  /** Listing order across groups; lower first. */
  order: number;
  /** What must already be true (accounts, roles, server state). */
  prerequisites: string[];
  /** Runs before the first step; a failure is reported as its own step. */
  setup?: (ctx: DrillContext) => Promise<string | void>;
  steps: DrillStep[];
  /** Whole-drill budget; the default is four minutes. */
  timeoutMs?: number;
  /**
   * Removes anything the drill created that the shared resource registry
   * cannot (the registry is cleaned whether or not the steps passed).
   */
  teardown?: (ctx: DrillTeardownContext) => Promise<string | void>;
}
