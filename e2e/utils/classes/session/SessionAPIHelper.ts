import { Page, expect } from '@playwright/test';

/**
 * Configuration for creating a session via Backend.AI API
 */
export interface SessionAPICreateOptions {
  /** Session name */
  sessionName: string;
  /** Session type */
  sessionType: 'batch' | 'interactive';
  /** Startup command (for batch sessions) */
  startupCommand?: string;
  /** Session dependency IDs */
  dependencies?: string[];
}

/**
 * Result of session creation
 */
export interface SessionAPICreateResult {
  sessionId: string;
  sessionName: string;
}

/**
 * SessionAPIHelper - Create and manage sessions via Backend.AI API (globalThis.backendaiclient)
 *
 * Use this helper when you need to create sessions programmatically without going through
 * the session launcher UI. This is useful for:
 * - Testing features that require sessions but are not part of the launcher flow
 * - Setting up dependency relationships between sessions
 * - Creating sessions with specific configurations not exposed in the UI
 *
 * Prerequisites:
 * - The page must be logged in (loginAsUser) and navigated to any page
 *   so that globalThis.backendaiclient is initialized
 *
 * @example
 * ```typescript
 * const helper = new SessionAPIHelper(page);
 * const batch = await helper.create({
 *   sessionName: 'my-batch',
 *   sessionType: 'batch',
 *   startupCommand: 'sleep 300',
 * });
 * const interactive = await helper.create({
 *   sessionName: 'my-interactive',
 *   sessionType: 'interactive',
 *   dependencies: [batch.sessionId],
 * });
 * await helper.waitForStatus(batch.sessionName, ['RUNNING']);
 * await helper.terminate(batch.sessionName);
 * ```
 */
export class SessionAPIHelper {
  private page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Create a session via the Backend.AI API (globalThis.backendaiclient)
   */
  async create(
    options: SessionAPICreateOptions,
  ): Promise<SessionAPICreateResult> {
    return this.page.evaluate(async (opts) => {
      const client = (globalThis as any).backendaiclient;
      if (!client) throw new Error('backendaiclient is not initialized');

      const defaultImage = client._config?.default_import_environment;
      if (!defaultImage) {
        throw new Error(
          'default_import_environment is not configured in client._config',
        );
      }
      const [lang, architecture] = defaultImage.split('@');

      const resources: Record<string, any> = {
        type: opts.sessionType,
        cluster_mode: 'single-node',
        cluster_size: 1,
        maxWaitSeconds: 15,
        enqueueOnly: true,
        reuseIfExists: false,
        config: {
          resources: { cpu: 1, mem: '1g' },
          scaling_group: 'default',
        },
      };

      if (opts.sessionType === 'batch' && opts.startupCommand) {
        resources.startupCommand = opts.startupCommand;
      }

      if (opts.dependencies && opts.dependencies.length > 0) {
        resources.dependencies = opts.dependencies;
      }

      try {
        const result = await client.createIfNotExists(
          lang,
          opts.sessionName,
          resources,
          30000,
          architecture || 'x86_64',
        );

        return {
          sessionId: result.sessionId,
          sessionName: opts.sessionName,
        };
      } catch (err: any) {
        throw new Error(
          `createIfNotExists failed: ${err?.message || JSON.stringify(err)}`,
        );
      }
    }, options);
  }

  /**
   * Terminate a session via the Backend.AI API and wait for TERMINATED status.
   * Silently skips if the session is already terminated or not found.
   */
  async terminate(sessionName: string, waitTimeoutMs = 60000): Promise<void> {
    const destroyed = await this.page
      .evaluate(async (name) => {
        const client = (globalThis as any).backendaiclient;
        try {
          await client.destroy(name);
          return true;
        } catch (e: any) {
          const msg = e?.message || '';
          // Already terminated or not found — skip
          if (msg.includes('404') || msg.includes('No matching')) return false;
          throw e;
        }
      }, sessionName)
      .catch((e) => {
        console.log(`Failed to terminate session ${sessionName}:`, e);
        return false;
      });

    if (destroyed) {
      await this.waitForStatus(sessionName, ['TERMINATED'], waitTimeoutMs);
    }
  }

  /**
   * Wait for a session to reach one of the target statuses by polling the API
   *
   * @param sessionName - Session name to check
   * @param targetStatuses - Array of status strings to match (case-insensitive)
   * @param timeoutMs - Maximum time to wait (default: 120000ms)
   */
  async waitForStatus(
    sessionName: string,
    targetStatuses: string[],
    timeoutMs = 120000,
  ): Promise<void> {
    await expect
      .poll(
        async () => {
          const status = await this.page
            .evaluate(async (name) => {
              const client = (globalThis as any).backendaiclient;
              try {
                const info = await client.get_info(name);
                return info?.result?.status || info?.status || 'UNKNOWN';
              } catch (e: any) {
                const msg = e?.message || '';
                // Session not found usually means it's terminated
                if (msg.includes('404') || msg.includes('No matching'))
                  return 'TERMINATED';
                return `ERROR:${msg}`;
              }
            }, sessionName)
            .catch(() => 'POLL_ERROR');
          return status;
        },
        {
          message: `Waiting for session "${sessionName}" to reach ${targetStatuses.join('/')}`,
          timeout: timeoutMs,
          intervals: [5000, 10000, 10000],
        },
      )
      .toMatch(new RegExp(targetStatuses.join('|'), 'i'));
  }
}
