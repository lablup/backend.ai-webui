import { type ChildProcess, spawn } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import path from "node:path";

// Chrome Local Network Access blocks a public https page (webui-nightly) from
// calling a backend on a private IP, and web() cannot grant the
// `local-network-access` permission the Playwright suite uses. So, when
// needed, launch Chromium ourselves with the check disabled and attach over CDP.

const isLoopback = (host: string) =>
  host === "localhost" ||
  host.endsWith(".localhost") ||
  host === "[::1]" ||
  /^127\./.test(host);

/**
 * `E2E_AGENT_DISABLE_LNA=1` forces the CDP-launched browser, `=0` forces the
 * engine's own launch; otherwise it is used only for an https app whose
 * backend is on another, non-loopback origin.
 */
export function needsLnaBypass(appUrl: string, endpoint: string | undefined) {
  const flag = process.env.E2E_AGENT_DISABLE_LNA;
  if (flag === "1") return true;
  if (flag === "0" || !endpoint) return false;
  try {
    const app = new URL(appUrl);
    const backend = new URL(endpoint);
    return (
      app.protocol === "https:" &&
      backend.origin !== app.origin &&
      !isLoopback(backend.hostname)
    );
  } catch {
    return false;
  }
}

/** `E2E_AGENT_CHROMIUM`, else the Chromium of the playwright-core that @e2e-dev/web runs on. */
function chromiumPath(): string {
  if (process.env.E2E_AGENT_CHROMIUM) return process.env.E2E_AGENT_CHROMIUM;
  try {
    const root = createRequire(path.resolve("package.json"));
    const fromWeb = createRequire(root.resolve("@e2e-dev/web"));
    return fromWeb("playwright-core").chromium.executablePath();
  } catch (e) {
    throw new Error(
      `e2e-agent: cannot locate Chromium for the LNA bypass; set E2E_AGENT_CHROMIUM (${e})`,
    );
  }
}

const launched = new Set<{ child: ChildProcess; profile: string }>();
const dispose = (entry: { child: ChildProcess; profile: string }) => {
  launched.delete(entry);
  entry.child.kill("SIGKILL");
  rmSync(entry.profile, { recursive: true, force: true, maxRetries: 3 });
};
process.once("exit", () => launched.forEach(dispose));

/** A `connect.cdpEndpoint` resolver: launches headless Chromium without the LNA check. */
export function lnaBypassEndpoint(signal: AbortSignal): Promise<string> {
  const executable = chromiumPath();
  const profile = mkdtempSync(path.join(tmpdir(), "e2e-agent-chromium-"));
  const child = spawn(
    executable,
    [
      "--headless=new",
      "--no-sandbox",
      "--no-first-run",
      "--no-default-browser-check",
      "--remote-debugging-port=0",
      `--user-data-dir=${profile}`,
      "--disable-features=LocalNetworkAccessChecks",
      "about:blank",
    ],
    { stdio: ["ignore", "ignore", "pipe"] },
  );
  const entry = { child, profile };
  launched.add(entry);

  child.once("exit", () => dispose(entry));

  return new Promise((resolve, reject) => {
    let stderr = "";
    let settled = false;
    const onAbort = () => fail("aborted");
    const settle = () => {
      settled = true;
      clearTimeout(timer);
      signal.removeEventListener("abort", onAbort);
    };
    const fail = (reason: string) => {
      if (settled) return;
      settle();
      dispose(entry);
      reject(new Error(`e2e-agent: Chromium launch failed: ${reason}`));
    };
    const timer = setTimeout(() => fail("no DevTools endpoint in 30s"), 30_000);
    if (signal.aborted) return onAbort();
    signal.addEventListener("abort", onAbort, { once: true });
    child.once("error", (e) => fail(String(e)));
    child.once("exit", (code) => fail(`exited with ${code}: ${stderr}`));
    child.stderr?.on("data", (chunk: Buffer) => {
      if (settled) return;
      stderr = (stderr + chunk.toString()).slice(-2000);
      const match = /DevTools listening on (ws:\/\/\S+)/.exec(stderr);
      if (!match) return;
      settle();
      resolve(match[1]);
    });
  });
}
