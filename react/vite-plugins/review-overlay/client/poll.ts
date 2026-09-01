/**
 * The pins poll (R3.4): 25 s while visible, 120 s once the conversation has
 * gone quiet, nothing at all while the tab is hidden, and an immediate read
 * when the reviewer comes back. The server's 15 s cache is what keeps
 * concurrent viewers down to one upstream call, so this only has to be
 * polite, not clever.
 */

export interface PollerOptions<T> {
  load: () => Promise<T>;
  onPayload: (payload: T) => void;
  onError: (error: unknown) => void;
  visibleMs?: number;
  idleMs?: number;
  /** How long without a change before the slow cadence takes over. */
  quietAfterMs?: number;
}

export function createPoller<T>({
  load,
  onPayload,
  onError,
  visibleMs = 25_000,
  idleMs = 120_000,
  quietAfterMs = 300_000,
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
      const next = JSON.stringify(payload);
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
