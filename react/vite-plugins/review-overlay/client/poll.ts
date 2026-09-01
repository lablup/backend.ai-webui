/**
 * The pins poll (R3.4). The server's 15 s cache is what keeps concurrent
 * viewers down to one upstream call, so this only has to be polite.
 */

export interface PollerOptions<T> {
  load: () => Promise<T>;
  onPayload: (payload: T) => void;
  onError: (error: unknown) => void;
  visibleMs?: number;
  idleMs?: number;
  /** How long without a change before the slow cadence takes over. */
  quietAfterMs?: number;
  /**
   * What counts as "the same answer". The default compares the whole payload,
   * which never repeats when it carries a server timestamp — pass the parts
   * that mean something changed instead.
   */
  signatureOf?: (payload: T) => string;
}

export function createPoller<T>({
  load,
  onPayload,
  onError,
  visibleMs = 25_000,
  idleMs = 120_000,
  quietAfterMs = 300_000,
  signatureOf = (payload: T) => JSON.stringify(payload),
}: PollerOptions<T>) {
  let timer = 0;
  let busy = false;
  let running = false;
  let signature = '';
  let lastChangeAt = Date.now();

  async function run() {
    if (busy || !running) return;
    busy = true;
    try {
      const payload = await load();
      const next = signatureOf(payload);
      if (next !== signature) {
        signature = next;
        lastChangeAt = Date.now();
      }
      onPayload(payload);
    } catch (error) {
      onError(error);
    } finally {
      busy = false;
    }
  }

  function schedule() {
    clearTimeout(timer);
    if (!running || document.hidden) return;
    const quiet = Date.now() - lastChangeAt > quietAfterMs;
    timer = window.setTimeout(
      async () => {
        await run();
        schedule();
      },
      quiet ? idleMs : visibleMs,
    );
  }

  const refreshNow = () => {
    void run().then(schedule);
  };

  const onVisibility = () => {
    if (document.hidden) {
      clearTimeout(timer);
      return;
    }
    refreshNow();
  };
  const onFocus = () => refreshNow();

  return {
    start() {
      if (running) return;
      running = true;
      document.addEventListener('visibilitychange', onVisibility);
      window.addEventListener('focus', onFocus);
      refreshNow();
    },
    refreshNow,
    stop() {
      running = false;
      clearTimeout(timer);
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('focus', onFocus);
    },
  };
}

export type Poller = ReturnType<typeof createPoller>;
