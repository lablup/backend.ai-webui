import { createAdminApiContext } from './admin-api';
import type { APIRequestContext } from '@playwright/test';

/**
 * VFolder scaffolding over the manager's REST API, for specs that need a
 * folder to *exist* rather than to test the folder UI itself.
 *
 * The UI helpers in `test-util.ts` (`createVFolderAndVerify` and friends) drive
 * the Data page, so a spec that only needs a mountable folder pays for a folder
 * table round trip — and inherits every unrelated drift in that page's
 * locators. Creating and reaping the folder over the API keeps the spec's
 * failures about the thing it actually asserts, the same reasoning
 * `admin-api.ts` records for user and deployment scaffolding (FR-3138).
 */

export interface CreatedVFolder {
  /** The manager's simple-format UUID, as both delete calls want it. */
  id: string;
  name: string;
}

/** The storage host the account may create folders on. */
async function defaultStorageHost(api: APIRequestContext): Promise<string> {
  const res = await api.get('/func/folders/_/hosts');
  if (!res.ok()) {
    throw new Error(`Failed to list storage hosts (status=${res.status()})`);
  }
  const body = await res.json();
  // `||`, not `??`: a deployment with no default host answers `default: ''`,
  // and the first allowed host is still usable.
  const host: string | undefined = body?.default || body?.allowed?.[0];
  if (!host) {
    throw new Error('No storage host is available for this account');
  }
  return host;
}

/**
 * Creates a user-owned, read-write general folder. `name` must carry the
 * `e2e-` prefix so the suite-wide teardown can reap it if the caller dies.
 */
export async function createVFolderViaApi(
  name: string,
): Promise<CreatedVFolder> {
  const api = await createAdminApiContext();
  try {
    const res = await api.post('/func/folders', {
      data: {
        name,
        host: await defaultStorageHost(api),
        usage_mode: 'general',
        permission: 'rw',
        cloneable: false,
      },
    });
    if (!res.ok()) {
      throw new Error(
        `Failed to create vfolder "${name}" (status=${res.status()}): ${(
          await res.text()
        ).slice(0, 300)}`,
      );
    }
    const body = await res.json();
    return { id: body.id, name: body.name };
  } finally {
    await api.dispose();
  }
}

/**
 * Moves the folder to the trash bin and then purges it, so nothing is left for
 * the suite teardown to find. Best-effort: it warns instead of throwing, so it
 * is safe to call unguarded from a cleanup hook.
 */
export async function deleteVFolderViaApi(
  vfolder: CreatedVFolder,
): Promise<void> {
  const api = await createAdminApiContext();
  try {
    // The two request bodies do NOT agree, and neither matches the `vfolder_id`
    // that `packages/backend.ai-client/src/resources/vfolder.ts` still sends —
    // that client is behind the manager. These keys were read off the manager's
    // own 400s (`vfolderId Field required` / `id Field required`); do not
    // "correct" them against the client without re-checking the response.
    const trashed = await api.delete('/func/folders', {
      data: { vfolderId: vfolder.id },
    });
    const purged = await api.post('/func/folders/delete-from-trash-bin', {
      data: { id: vfolder.id },
    });
    if (!trashed.ok() || !purged.ok()) {
      // Print the bodies: a silent warn is how a key drift like the one above
      // would go unnoticed until the shared server filled up with leftovers.
      console.warn(
        `[deleteVFolderViaApi] "${vfolder.name}" may be left behind — trash=${trashed.status()} ${(
          await trashed.text()
        ).slice(0, 200)} / purge=${purged.status()} ${(
          await purged.text()
        ).slice(0, 200)}`,
      );
    }
  } catch (error) {
    console.warn(
      `[deleteVFolderViaApi] cleanup of "${vfolder.name}" failed; the suite teardown will sweep it.`,
      error,
    );
  } finally {
    await api.dispose();
  }
}
