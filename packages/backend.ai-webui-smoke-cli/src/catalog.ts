/**
 * Static catalog of smoke categories surfaced by `bai-smoke list`.
 *
 * The entries here mirror the `@smoke*` tags applied to the corresponding
 * specs under `e2e/` in FR-2875. Keep this file in sync when new specs are
 * tagged into the smoke set. A dynamic spec scanner that derives this list
 * from the tags themselves is planned alongside the packaging work (FR-2881/FR-2882),
 * where the source `e2e/` tree ships inside the artifact.
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
    description:
      'Login form rendering (no login; runs under every role) and successful admin sign-in flow.',
    tags: ['@smoke', '@smoke-admin'],
    specs: ['e2e/auth/login.spec.ts'],
  },
  {
    category: 'dashboard',
    description:
      'Dashboard widgets render after admin login. Regular-user dashboard checks live in a separate (non-smoke) describe.',
    tags: ['@smoke', '@smoke-admin'],
    specs: ['e2e/dashboard/dashboard.spec.ts'],
  },
  {
    category: 'session',
    description:
      'Core session lifecycle (create → RUNNING → terminate, admin) and session launcher cluster-mode sanity (user).',
    tags: ['@smoke', '@smoke-admin', '@smoke-user'],
    specs: [
      'e2e/session/session-lifecycle.spec.ts',
      'e2e/session/session-cluster-mode.spec.ts',
    ],
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
  {
    category: 'user',
    description: 'Admin: bulk user creation modal opens from the dropdown.',
    tags: ['@smoke', '@smoke-admin'],
    specs: ['e2e/user/bulk-user-creation.spec.ts'],
  },
];
