/**
 * Static catalog of smoke categories surfaced by `bai-smoke list`.
 *
 * The entries here mirror the `@smoke*` tags applied to the corresponding
 * specs under `e2e/` in FR-2875. Keep this file in sync when new specs are
 * tagged into the smoke set. Once FR-2877 lands the dynamic spec scanner,
 * this file becomes the fallback for environments that ship without the
 * source `e2e/` tree.
 */

export interface SmokeCategory {
  /** Short identifier shown in CLI output. */
  category: string;
  /** Human-readable description. */
  description: string;
  /** Tag(s) Playwright will grep on to include this category. */
  tags: ReadonlyArray<string>;
  /** Spec files (relative to repo root) covered by this category. */
  specs: ReadonlyArray<string>;
}

export const SMOKE_CATALOG: ReadonlyArray<SmokeCategory> = [
  {
    category: 'auth',
    description: 'Login form rendering and successful sign-in flow.',
    tags: ['@smoke', '@smoke-any'],
    specs: ['e2e/auth/login.spec.ts'],
  },
  {
    category: 'dashboard',
    description: 'Dashboard widgets render after login.',
    tags: ['@smoke', '@smoke-any'],
    specs: ['e2e/dashboard/dashboard.spec.ts'],
  },
  {
    category: 'session',
    description:
      'Session lifecycle: create batch session, wait for RUNNING, terminate.',
    tags: ['@smoke', '@smoke-user'],
    specs: ['e2e/session/session-lifecycle.spec.ts'],
  },
  {
    category: 'vfolder',
    description: 'Basic VFolder file creation inside the folder explorer.',
    tags: ['@smoke', '@smoke-user'],
    specs: ['e2e/vfolder/file-create.spec.ts'],
  },
  {
    category: 'agent',
    description: 'Admin: agent list page renders with at least one agent row.',
    tags: ['@smoke', '@smoke-admin'],
    specs: ['e2e/agent/agent.spec.ts'],
  },
];
