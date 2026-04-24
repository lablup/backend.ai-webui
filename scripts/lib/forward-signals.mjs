/**
 * forward-signals.mjs — shared helper for dev scripts that spawn a single
 * long-running child process and need to forward POSIX termination signals
 * (SIGINT/SIGTERM/SIGHUP) to the child, then mirror the child's exit.
 *
 * The key difference from the naive inline pattern is that handlers are
 * removed on child exit before re-raising the signal, so the default action
 * takes effect (producing the correct exit status) instead of re-entering
 * our handler and looping.
 */
import process from "node:process";

export function forwardSignals(child) {
  const signals = ["SIGINT", "SIGTERM", "SIGHUP"];
  const handlers = {};
  for (const sig of signals) {
    handlers[sig] = () => {
      if (!child.killed) child.kill(sig);
    };
    process.on(sig, handlers[sig]);
  }
  child.on("exit", (code, signal) => {
    for (const sig of signals) process.off(sig, handlers[sig]);
    if (signal) {
      // Remove our handler (done above) so re-raising takes default action.
      process.kill(process.pid, signal);
      return;
    }
    process.exit(code ?? 0);
  });
}
