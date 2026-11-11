/**
 * Per-test resource registry. A test declares every resource name it creates
 * (`resources.name(kind, prefix)` / `resources.declare(kind, name)`) and its
 * body refers only to those names; `cleanup()` (from `afterEach`/`afterAll`)
 * deletes exactly what was declared through the admin API, so it works however
 * far the test got and whatever state it left the page in.
 *
 *   const resources = createTestResources();
 *   test.afterEach(() => resources.cleanup());
 *   const name = resources.name('prometheusQueryPreset', 'e2e-preset-edit');
 *
 * `cleanup()` is idempotent: a declared resource that does not exist (never
 * created, or already deleted by the test under test) is a no-op. It never
 * throws; a failed delete is warned by name and stays registered for the next
 * call. `global-cleanup.teardown.ts` remains the prefix-sweep safety net.
 */
import {
  createAdminApiContext,
  deleteDeploymentsByNameViaApi,
  purgeProjectsByNameViaApi,
  purgePrometheusQueryPresetsByNameViaApi,
  purgeRolesByNameViaApi,
} from './admin-api';
import type { APIRequestContext } from '@playwright/test';

export type TestResourceKind =
  'deployment' | 'prometheusQueryPreset' | 'role' | 'project';

type Remover = (
  api: APIRequestContext,
  name: string,
) => Promise<{ found: number; deleted: number }>;

/**
 * Cleanup order matters: a deployment's auto-scaling rules can reference a
 * Prometheus query preset, so deployments go first, then presets. Roles come
 * before projects because a role can be scoped to one; a user's assignments
 * follow the role by FK cascade, so specs purge fixture users after this.
 */
const REMOVERS: ReadonlyArray<[TestResourceKind, Remover]> = [
  ['deployment', deleteDeploymentsByNameViaApi],
  ['prometheusQueryPreset', purgePrometheusQueryPresetsByNameViaApi],
  ['role', purgeRolesByNameViaApi],
  ['project', purgeProjectsByNameViaApi],
];

export interface TestResources {
  /**
   * Generates a unique name `<prefix>-<timestamp>` (suffixed further if the
   * same prefix was already used in this millisecond), registers it under
   * `kind`, and returns it.
   */
  name(kind: TestResourceKind, prefix: string): string;
  /** Registers an exact, caller-built name under `kind` and returns it. */
  declare(kind: TestResourceKind, name: string): string;
  /** Names currently registered under `kind` (not yet cleaned up). */
  declared(kind: TestResourceKind): readonly string[];
  /**
   * Deletes every registered resource through the admin API. Never throws;
   * resolves to the names it could not remove (empty on full success).
   */
  cleanup(): Promise<string[]>;
}

export function createTestResources(): TestResources {
  const registry = new Map<TestResourceKind, Set<string>>(
    REMOVERS.map(([kind]) => [kind, new Set<string>()]),
  );

  const declare = (kind: TestResourceKind, name: string) => {
    registry.get(kind)!.add(name);
    return name;
  };

  return {
    declare,
    name(kind, prefix) {
      const base = `${prefix}-${Date.now()}`;
      let candidate = base;
      for (let n = 2; registry.get(kind)!.has(candidate); n++) {
        candidate = `${base}-${n}`;
      }
      return declare(kind, candidate);
    },
    declared(kind) {
      return [...registry.get(kind)!];
    },
    async cleanup() {
      const pending = REMOVERS.flatMap(([kind]) =>
        [...registry.get(kind)!].map((name) => `${kind}:${name}`),
      );
      if (pending.length === 0) return [];

      let api: APIRequestContext;
      try {
        api = await createAdminApiContext();
      } catch (error) {
        console.warn(
          `[test-resources] admin API login failed; left for the next cleanup / global sweep: ${pending.join(', ')}`,
          error,
        );
        return pending;
      }

      const failed: string[] = [];
      try {
        for (const [kind, remove] of REMOVERS) {
          const names = registry.get(kind)!;
          for (const name of [...names]) {
            try {
              const { found, deleted } = await remove(api, name);
              if (deleted === found) {
                names.delete(name);
                continue;
              }
              console.warn(
                `[test-resources] removed ${deleted}/${found} ${kind} named "${name}"; will retry on the next cleanup`,
              );
            } catch (error) {
              console.warn(
                `[test-resources] could not clean up ${kind} "${name}":`,
                error,
              );
            }
            failed.push(`${kind}:${name}`);
          }
        }
      } finally {
        await api.dispose();
      }
      return failed;
    },
  };
}
