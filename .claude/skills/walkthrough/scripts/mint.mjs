#!/usr/bin/env node
/**
 * Mint a PR's walkthrough stops headless, then verify they resolve.
 *
 * Reads the stop manifest the implementing session wrote and the dev server's
 * boot record, logs in with the box's e2e admin account, replays each stop's
 * `via`, mints the `#bai=v3` anchor with the overlay's OWN in-page modules
 * (`/__review/{anchor,codec,id,stop-guard}.js`), builds the set link and opens
 * it in a fresh page to check every stop really lands on its element.
 *
 *   mint.mjs --manifest <path> [--app <name>] [--endpoint <url>] [--sha <sha>]
 *            [--pr <n>] [--env-file <path>] [--report <path>] [--settle <ms>]
 *            [--dry-run]
 *
 * Without `--pr` the PR is the current branch's and the app is the name
 * `dev-server` claims for it. With `--pr <n>` the PR is looked up on GitHub:
 * the app is whichever live boot record serves that PR (a `/rename` word
 * cannot be predicted from the title), the sha is the PR head, and a server
 * whose worktree is behind that head is refused rather than described.
 *
 * Exit: 0 a set link · 2 usage / bad manifest · 3 preflight (no walkthrough).
 */
import { parseManifest, projectBasePath, stopLabel } from "./manifest.mjs";
import { readRecords, recordServingPr } from "./resolve.mjs";
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, resolve } from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(HERE, "../../../..");
const STATE_DIR =
  process.env.BAI_DEV_SERVER_STATE_DIR ??
  resolve(homedir(), ".local/state/fw/dev-servers");
/**
 * The overlay's ladder retries while the SPA renders, and guided mode may
 * fetch before it renders: 30 s is the whole budget a stop gets.
 */
const RESOLVE_TIMEOUT_MS = 30_000;
/** How long a lazy route gets to render the element a stop names. */
const FIND_TIMEOUT_MS = 45_000;
/** `PIN_BODY_SRC` in codec.ts: `parseFragments` silently drops a longer part. */
const MAX_PART_B64 = 2048;

const fail = (code, message) => {
  process.stderr.write(`walkthrough: ${message}\n`);
  process.exit(code);
};

// ---------------------------------------------------------------------------
// inputs
// ---------------------------------------------------------------------------

function parseArgs(argv) {
  const flags = {
    manifest: "",
    app: "",
    endpoint: "",
    sha: "",
    pr: "",
    envFile: "",
    report: "",
    settle: "",
    dryRun: false,
  };
  const names = {
    "--manifest": "manifest",
    "--app": "app",
    "--endpoint": "endpoint",
    "--sha": "sha",
    "--pr": "pr",
    "--env-file": "envFile",
    "--report": "report",
    "--settle": "settle",
  };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--dry-run") {
      flags.dryRun = true;
      continue;
    }
    const name = names[arg];
    if (!name) fail(2, `unknown argument '${arg}'`);
    const value = argv[i + 1];
    if (value === undefined) fail(2, `${arg} needs a value`);
    flags[name] = value;
    i += 1;
  }
  if (!flags.manifest) fail(2, "--manifest <path> is required");
  return flags;
}

const gitIn = (cwd, ...args) => {
  try {
    return execFileSync("git", args, {
      cwd,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
  } catch {
    return "";
  }
};
const git = (...args) => gitIn(REPO_ROOT, ...args);

/** `KEY=value` lines, quotes stripped — the `.env.playwright` dialect. */
function readEnvFile(file) {
  const out = {};
  for (const line of readFileSync(file, "utf8").split("\n")) {
    const match = /^\s*([A-Z0-9_]+)\s*=\s*(.*)$/.exec(line);
    if (match) out[match[1]] = match[2].trim().replace(/^["']|["']$/g, "");
  }
  return out;
}

/**
 * The endpoint the dev server was booted with. Read from the running process,
 * never from the boot record — the record is as public as the PR comment.
 */
function endpointFromProcess(pid) {
  if (!pid) return "";
  try {
    const environ = readFileSync(`/proc/${pid}/environ`, "utf8").split("\0");
    for (const entry of environ) {
      if (entry.startsWith("VITE_DEFAULT_API_ENDPOINT="))
        return entry.slice("VITE_DEFAULT_API_ENDPOINT=".length);
    }
  } catch {
    // Another user's process, or a server that outlived its /proc entry.
  }
  return "";
}

const gh = (args) =>
  JSON.parse(
    execFileSync("gh", args, {
      encoding: "utf8",
      timeout: 8000,
      stdio: ["ignore", "pipe", "ignore"],
    }),
  );

/** The PR `--pr` names: its branch and head, or a preflight refusal. */
function lookupPr(value) {
  const number = Number.parseInt(value, 10);
  if (!Number.isInteger(number) || number <= 0)
    fail(2, `--pr needs a PR number, not '${value}'`);
  try {
    return gh([
      "pr",
      "view",
      String(number),
      "--json",
      "number,title,headRefName,headRefOid,url",
    ]);
  } catch {
    return fail(3, `PR #${number} not found on GitHub (or gh is offline)`);
  }
}

/** `owner/repo` of this checkout, or "" when gh cannot say. */
function repoName() {
  try {
    return gh(["repo", "view", "--json", "nameWithOwner"]).nameWithOwner ?? "";
  } catch {
    return "";
  }
}

/** The app name `dev-server` would claim for `target`'s branch (or ours). */
async function resolveApp(flags, target) {
  if (flags.app) return flags.app;
  const branch = target?.headRefName || git("branch", "--show-current");
  let pr = target ? { number: target.number, title: target.title } : null;
  if (!pr) {
    try {
      pr = gh(["pr", "view", branch, "--json", "number,title"]);
    } catch {
      // Offline, or no PR yet: `resolveAppName` falls back to the branch alone.
    }
  }
  const mod = await import(resolve(REPO_ROOT, "scripts/portless-app-name.mjs"));
  const name = mod.resolveAppName({
    envName: process.env.PORTLESS_APP_NAME,
    branch,
    pr,
    exact: !!(process.env.PORTLESS_APP_NAME_EXACT ?? "").trim(),
  });
  if (!name) fail(3, `no app name for branch '${branch}' — pass --app <name>`);
  return name;
}

function readBootRecord(app, target) {
  const file = resolve(STATE_DIR, `${app}.json`);
  if (!existsSync(file)) {
    if (target)
      fail(
        3,
        `no live dev server serves PR #${target.number} (${target.headRefName}) and no boot record at ${file} — boot one for that branch with the dev-server skill, then re-run`,
      );
    fail(3, `no boot record at ${file} — is the dev server advertised?`);
  }
  try {
    return { file, record: JSON.parse(readFileSync(file, "utf8")) };
  } catch (error) {
    return fail(3, `${file} is not readable JSON (${error.message})`);
  }
}

function prFromRecord(record) {
  const served = Array.isArray(record.served) ? record.served : [];
  const mine = served.find((entry) => entry.branch === record.branch);
  return (mine ?? served[served.length - 1])?.pr ?? null;
}

/** A Portless route answers a 2xx AND `X-Portless: 1`; the header alone is a 404. */
async function probePortless(url) {
  try {
    const response = await fetch(url, {
      redirect: "manual",
      signal: AbortSignal.timeout(10_000),
    });
    return response.status < 300 && response.headers.get("x-portless") === "1";
  } catch {
    return false;
  }
}

/** Guided mode ships as `/__review/guided.js`; an older overlay answers 404. */
async function servesGuidedMode(url) {
  try {
    const response = await fetch(
      `${url.replace(/\/$/, "")}/__review/guided.js`,
      {
        redirect: "manual",
        signal: AbortSignal.timeout(10_000),
      },
    );
    return response.status === 200;
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------
// in-page helpers (serialized into the browser)
// ---------------------------------------------------------------------------

/** Find a stop's element by testid, by CSS selector, or by exact visible text on a control. */
const FIND_JS = `(f) => {
  const visible = (el) => !!el && el.getBoundingClientRect().width > 0;
  if (f.testid) {
    let byTid = [];
    try { byTid = [...document.querySelectorAll('[data-testid="' + f.testid + '"]')]; } catch { return null; }
    return byTid.find(visible) ?? byTid[0] ?? null;
  }
  if (f.selector) {
    let all = [];
    try { all = [...document.querySelectorAll(f.selector)]; } catch { return null; }
    // Optional text narrows a selector that matches several nodes (an SVG label, a cell).
    const wanted = f.text ? all.filter((el) => (el.textContent ?? '').trim() === f.text) : all;
    return wanted.find(visible) ?? wanted[0] ?? null;
  }
  if (f.text) {
    const controls = document.querySelectorAll('button, a, [role="button"], label, th');
    return [...controls].find((el) => visible(el) && el.innerText.trim() === f.text) ?? null;
  }
  return null;
}`;

const OVERLAY_ROOT_JS = `() => {
  const host = document.querySelector('[data-bai-review-overlay]');
  return host ? (host.shadowRoot ?? host) : null;
}`;

async function mintInPage(page, find, fields, at) {
  return page.evaluate(
    async ([find, findJs, fields, at, maxPart]) => {
      const [anchorMod, codecMod, idMod] = await Promise.all(
        ["anchor", "codec", "id"].map(
          (name) => import(/* @vite-ignore */ `/__review/${name}.js`),
        ),
      );
      // A server older than FR-3949 serves no stop-guard; the fields still
      // travel, and that server's decoder is the one that ignores them.
      const guard = await import(
        /* @vite-ignore */ "/__review/stop-guard.js"
      ).catch(() => null);
      const el = (0, eval)(findJs)(find);
      if (!el) return { error: "element not found on the page" };
      el.scrollIntoView({ block: "center" });
      // `stripInvalidStopFields` is the decoder's own gate: a field it would
      // drop on read must never leave here in the first place. `at` is not an
      // anchor field — it only seasons the id.
      const raw = { ...anchorMod.captureAnchorSignals(el), ...fields };
      const anchor = guard ? guard.stripInvalidStopFields(raw) : raw;
      const b64 = await codecMod.encodeAnchor(anchor);
      if (b64.length > maxPart)
        return {
          error: `anchor is ${b64.length} chars; a link part caps at ${maxPart} — shorten ch/ck or drop via/code`,
        };
      const kept = {};
      const dropped = [];
      for (const key of Object.keys(fields)) {
        if (anchor[key] === undefined) dropped.push(key);
        else kept[key] = anchor[key];
      }
      return {
        b64,
        id: idMod.pinId(fields.pr, b64, at),
        anchor: {
          p: anchor.p,
          q: anchor.q ?? "",
          tid: anchor.tid ?? "",
          tag: anchor.tag ?? "",
          txt: anchor.txt ?? "",
          dlg: anchor.dlg ?? 0,
        },
        kept,
        dropped,
      };
    },
    [find, FIND_JS, fields, at, MAX_PART_B64],
  );
}

const waitForOverlay = (page) =>
  page.waitForFunction(() => window.__baiReviewOverlay === true, null, {
    timeout: 30_000,
  });

async function replayVia(page, via, settleMs) {
  for (const step of via ?? []) {
    const { text, tid } = step.click;
    const target = tid
      ? page.getByTestId(tid).first()
      : page.getByText(text, { exact: true }).first();
    await target.click({ timeout: 15_000 });
    await page.waitForTimeout(settleMs);
  }
}

/**
 * Did the stop draw ON its element? Three nodes carry `data-pin-id` — the
 * marker, the card and the box — and `placeAway` moves `.found` to the docked
 * card when the element scrolls out of sight. Only `.markbox.found` is the
 * element-shaped one, so only it can be measured against the landmark.
 */
async function markState(page, id) {
  return page.evaluate(
    ([id, rootJs]) => {
      // Guided mode stamps the located element itself; a reviewer-pin overlay
      // (no guided mode) draws a markbox in the shadow root instead.
      const stamped = document.querySelector(`[data-bai-change="${id}"]`);
      if (stamped && stamped.getBoundingClientRect().width > 0)
        return {
          drawn: true,
          under:
            stamped.closest("[data-testid]")?.getAttribute("data-testid") ?? "",
        };
      const root = (0, eval)(rootJs)();
      const mark = root?.querySelector(`.markbox.found[data-pin-id="${id}"]`);
      if (!mark || mark.getBoundingClientRect().width === 0)
        return { drawn: false, under: "" };
      const box = mark.getBoundingClientRect();
      const host = document.querySelector("[data-bai-review-overlay]");
      const previous = host.style.pointerEvents;
      host.style.pointerEvents = "none";
      const below = document.elementFromPoint(
        box.left + box.width / 2,
        box.top + box.height / 2,
      );
      host.style.pointerEvents = previous;
      const landmark = below?.closest("[data-testid]");
      return {
        drawn: true,
        under: landmark?.getAttribute("data-testid") ?? "",
      };
    },
    [id, OVERLAY_ROOT_JS],
  );
}

/**
 * Poll until the mark draws over the landmark it was captured on. The overlay
 * re-measures on its own schedule, so a read taken right after a scroll can
 * still carry the pre-scroll rect; settling on the expected landmark is what
 * tells a stale read from a wrong one.
 */
async function waitForMark(page, id, expectedTid, timeoutMs) {
  const deadline = Date.now() + timeoutMs;
  let state = { drawn: false, under: "" };
  for (;;) {
    state = await markState(page, id);
    const settled =
      state.drawn && (!expectedTid || state.under === expectedTid);
    if (settled || Date.now() > deadline) return state;
    await page.waitForTimeout(500);
  }
}

// ---------------------------------------------------------------------------
// run
// ---------------------------------------------------------------------------

async function main() {
  const flags = parseArgs(process.argv.slice(2));
  const settleMs = Number.parseInt(flags.settle || "2000", 10);
  if (!Number.isInteger(settleMs) || settleMs < 0)
    fail(2, `--settle takes whole milliseconds, not '${flags.settle}'`);

  let stops;
  try {
    stops = parseManifest(readFileSync(resolve(flags.manifest), "utf8"));
  } catch (error) {
    return fail(2, error.message);
  }

  const target = flags.pr ? lookupPr(flags.pr) : null;
  // On demand for a PR: the live record that serves it names the app, since
  // a `/rename` word in the claimed name is not derivable from the PR.
  const serving =
    target && !flags.app
      ? recordServingPr(readRecords(STATE_DIR), target.number, {
          repo: repoName(),
        })
      : null;
  const app = serving?.record?.app ?? (await resolveApp(flags, target));
  const { file, record } = serving ?? readBootRecord(app, target);
  if (record.stoppedAt)
    fail(
      3,
      `${file} says the server stopped at ${record.stoppedAt} — boot it first`,
    );
  const pr = target?.number ?? prFromRecord(record);
  if (!Number.isInteger(pr))
    fail(3, `no PR for '${app}' in ${file} — pass --pr <n>`);
  const sha = flags.sha || target?.headRefOid || git("rev-parse", "HEAD");
  if (!/^[0-9a-f]{40}$/.test(sha))
    fail(3, `'${sha}' is not a 40-char commit sha`);
  // The comment stamps `sha`; a server whose checkout is behind it would be
  // verified against code the sha does not describe.
  const servedSha = record.worktree
    ? gitIn(record.worktree, "rev-parse", "HEAD")
    : "";
  if (/^[0-9a-f]{40}$/.test(servedSha) && servedSha !== sha)
    fail(
      3,
      `${record.worktree} serves ${servedSha.slice(0, 7)} but the walkthrough would claim ${sha.slice(0, 7)} — update that checkout to the PR head (Vite reloads on its own), then re-run`,
    );

  // advertise.sh refuses an unroutable server rather than publish a
  // `.localhost` URL; a set link goes in the same public comment.
  const base = record.url;
  if (!base) fail(3, `${file} carries no gateway URL — is the box joined?`);
  if (!(await probePortless(base)))
    fail(3, `${base} is not a routable Portless 2xx — no walkthrough`);
  // An overlay without guided mode draws a stop as a bare pin and drops its
  // notes (a branch that predates FR-3950): a walkthrough there misleads.
  if (!(await servesGuidedMode(base)))
    fail(
      3,
      `${base} serves an overlay without guided mode (no /__review/guided.js) — rebase the branch onto a main that includes FR-3950, then re-run; no walkthrough`,
    );

  const envFile =
    flags.envFile ||
    [record.worktree, REPO_ROOT]
      .filter(Boolean)
      .map((root) => resolve(root, "e2e/envs/.env.playwright"))
      .find(existsSync) ||
    "";
  if (!envFile)
    fail(3, "no e2e/envs/.env.playwright on this box — pass --env-file <path>");
  const env = readEnvFile(envFile);
  const endpoint =
    flags.endpoint ||
    endpointFromProcess(record.pid) ||
    env.E2E_WEBSERVER_ENDPOINT;
  if (!endpoint) fail(3, "no backend endpoint — pass --endpoint <url>");
  if (!env.E2E_ADMIN_EMAIL || !env.E2E_ADMIN_PASSWORD)
    fail(3, `${envFile} has no E2E_ADMIN_EMAIL / E2E_ADMIN_PASSWORD`);

  if (flags.dryRun) {
    process.stdout.write(
      `${JSON.stringify({ app, pr, sha, url: base, stops: stops.length }, null, 2)}\n`,
    );
    process.stderr.write(
      `walkthrough: dry run — ${stops.length} stops for PR #${pr} on ${base}\n`,
    );
    return;
  }

  const { chromium } = await import(
    resolve(REPO_ROOT, "node_modules/@playwright/test/index.mjs")
  );
  const browser = await chromium.launch();
  const context = await browser.newContext({
    ignoreHTTPSErrors: true,
    viewport: { width: 1440, height: 900 },
  });
  const page = await context.newPage();
  try {
    await login(page, base, endpoint, env);
    const origin = new URL(page.url()).origin;
    const projectBase = projectBasePath(new URL(page.url()).pathname);

    const at = new Date().toISOString();
    const minted = [];
    const couldNotPin = [];
    for (const stop of stops) {
      const label = stop.label ?? "";
      try {
        const result = await mintStop(page, {
          stop,
          origin,
          projectBase,
          settleMs,
          fields: stopFields(stop, { sha, pr }),
          at,
        });
        if (result.error) {
          couldNotPin.push({
            label: label || describeStop(stop),
            ck: stop.ck,
            reason: result.error,
          });
          continue;
        }
        minted.push({ stop, ...result, label: stopLabel(stop, result.anchor) });
      } catch (error) {
        couldNotPin.push({
          label: label || describeStop(stop),
          ck: stop.ck,
          reason: shortMessage(error),
        });
      }
    }
    if (!minted.length) {
      process.stdout.write(
        `${JSON.stringify({ setLink: "", sha, pr, app, url: base, stops: [], couldNotPin }, null, 2)}\n`,
      );
      fail(
        3,
        `no stop could be minted — ${couldNotPin.map((c) => `${c.label}: ${c.reason}`).join("; ")}`,
      );
    }

    // `deeplink.ts`'s grammar: the whole set rides in the fragment, opened on
    // the first pin's page.
    const link = (pins) => {
      const head = pins[0].anchor;
      const parts = pins.map((m) => `bai=v3.${m.id}.${m.b64}`).join("&");
      return `${origin}${head.p}${head.q ? `?${head.q}` : ""}#${parts}`;
    };

    const verified = await verify(context, {
      minted,
      origin,
      fragment: minted.map((m) => `bai=v3.${m.id}.${m.b64}`).join("&"),
      settleMs,
    });
    for (const entry of verified.failures) couldNotPin.push(entry);

    // A stop that did not resolve is not in the walkthrough, so it is not in
    // the link either: the count, the numbered list and the navigator agree.
    const failed = new Set(verified.failures.map((f) => f.id));
    const resolved = minted.filter((m) => !failed.has(m.id));
    if (!resolved.length)
      fail(
        3,
        `no stop resolved — ${couldNotPin.map((c) => `${c.label}: ${c.reason}`).join("; ")}`,
      );
    const setLink = link(resolved);

    const report = {
      setLink,
      sha,
      pr,
      app,
      url: base,
      // The comment renders off this alone, so each stop carries its wording.
      stops: minted.map((m) => ({
        id: m.id,
        label: m.label,
        ok: !failed.has(m.id),
        ...stopWording(m.kept, m.dropped),
      })),
      couldNotPin: couldNotPin.map(({ label, ck, reason }) => ({
        label,
        ck,
        reason,
      })),
    };
    const json = `${JSON.stringify(report, null, 2)}\n`;
    if (flags.report) {
      mkdirSync(dirname(resolve(flags.report)), { recursive: true });
      writeFileSync(resolve(flags.report), json);
    }
    process.stdout.write(json);
    const unpinned = couldNotPin.length
      ? ` (${couldNotPin.length} could not be pinned)`
      : "";
    // Validation should make this unreachable; say so rather than let the
    // comment quietly disagree with the link.
    for (const m of minted)
      if (m.dropped.length)
        process.stderr.write(
          `walkthrough: ${m.label} — the guard dropped ${m.dropped.join(", ")}\n`,
        );
    process.stderr.write(
      `walkthrough: ${report.stops.filter((s) => s.ok).length}/${stops.length} stops resolved${unpinned} · ${setLink.length} chars\n`,
    );
  } finally {
    await browser.close();
  }
}

const shortMessage = (error) =>
  String(error?.message ?? error)
    .split("\n")[0]
    .slice(0, 160);

/**
 * What the PR comment prints for a stop — read back off the STRIPPED anchor,
 * so the comment says exactly what the link carries. `dropped` names anything
 * the guard refused; `manifest.mjs` means it should always be empty.
 */
function stopWording(kept, dropped) {
  const out = {};
  for (const key of ["ch", "ck", "type", "kind", "old", "new", "code"]) {
    if (kept[key] !== undefined) out[key] = kept[key];
  }
  if (dropped.length) out.dropped = dropped;
  return out;
}

const describeStop = (stop) =>
  `${stop.route} › ${stop.find.testid ?? stop.find.selector ?? `"${stop.find.text}"`}`;

/** The FR-3949 stop fields, minus the ones the manifest left out. */
function stopFields(stop, { sha, pr }) {
  const fields = { ch: stop.ch, ck: stop.ck, sha, pr };
  for (const key of ["old", "new", "type", "kind", "code", "via"]) {
    if (stop[key] !== undefined) fields[key] = stop[key];
  }
  return fields;
}

async function login(page, base, endpoint, env) {
  await page.goto(base, { waitUntil: "domcontentloaded" });
  // A cold Vite load can take a minute; a server with baked credentials lands
  // straight on the app shell, so the form is not the only good outcome.
  const form = page.getByLabel("Email or Username");
  const shell = page.locator('[data-testid="user-dropdown-button"]');
  // `any`, not `race`: it settles on the first of the two that appears AND
  // handles the loser's eventual timeout, which as a bare race would surface
  // 120 s later as an unhandled rejection.
  await Promise.any([
    form.waitFor({ timeout: 120_000 }),
    shell.waitFor({ timeout: 120_000 }),
  ]).catch(async () => {
    // Neither appeared: on a backend the build is ahead of, the shell throws
    // before it ever renders the form, so both sides only ever reject.
    const crashed = await page
      .getByText("An error has occurred")
      .first()
      .isVisible()
      .catch(() => false);
    fail(
      3,
      crashed
        ? "the app shell dies on this backend — no walkthrough (try another endpoint)"
        : "neither the login form nor the app shell appeared — no walkthrough",
    );
  });
  if (await shell.isVisible().catch(() => false)) return;
  await form.fill(env.E2E_ADMIN_EMAIL);
  await page.getByLabel("Password").fill(env.E2E_ADMIN_PASSWORD);
  const endpointInput = page.getByRole("textbox", {
    name: "Endpoint",
    exact: true,
  });
  if (!(await endpointInput.isVisible({ timeout: 1000 }).catch(() => false)))
    await page.getByText("Advanced").click();
  await endpointInput.fill(endpoint);
  await page.getByRole("button", { name: "Login", exact: true }).click();
  try {
    await page.waitForSelector('[data-testid="user-dropdown-button"]', {
      timeout: 90_000,
    });
  } catch {
    const crashed = await page
      .getByText("An error has occurred")
      .first()
      .isVisible()
      .catch(() => false);
    fail(
      3,
      crashed
        ? "the app shell dies after login on this backend — no walkthrough (try another endpoint)"
        : "login did not reach the app shell — no walkthrough",
    );
  }
}

async function mintStop(
  page,
  { stop, origin, projectBase, settleMs, fields, at },
) {
  // Admin pages live outside `/project/<name>`; a stop says so with scope: "app".
  const prefix = stop.scope === "app" ? "" : projectBase;
  await page.goto(`${origin}${prefix}${stop.route}`, {
    waitUntil: "domcontentloaded",
  });
  await waitForOverlay(page);
  await page.waitForTimeout(settleMs);
  await replayVia(page, stop.via, settleMs);
  // A lazy route renders long after `domcontentloaded`, so wait for the
  // element itself rather than guessing how long the page needs.
  await page
    .waitForFunction(
      ([find, findJs]) => !!(0, eval)(findJs)(find),
      [stop.find, FIND_JS],
      { timeout: FIND_TIMEOUT_MS },
    )
    .catch(() => {});
  return mintInPage(page, stop.find, fields, at);
}

/**
 * A reviewer's pass: open the set link, then walk to each stop's own page and
 * replay its `via`. A mark that draws over the wrong landmark is a failure —
 * a wrong mark under a stop is worse than a missing one — and so is a mark
 * that draws over no landmark at all.
 */
async function verify(context, { minted, origin, fragment, settleMs }) {
  const page = await context.newPage();
  const failures = [];
  const landing = minted[0].anchor;
  let landed = false;
  for (const stop of minted) {
    const samePage =
      stop.anchor.p === landing.p &&
      stop.anchor.q === landing.q &&
      !stop.stop.via?.length;
    if (!samePage || !landed) {
      const query = stop.anchor.q ? `?${stop.anchor.q}` : "";
      await page.goto(
        `${origin}${samePage ? landing.p : stop.anchor.p}${query}#${fragment}`,
        { waitUntil: "domcontentloaded" },
      );
      await waitForOverlay(page);
      await page.waitForTimeout(settleMs);
      landed = samePage;
      if (!samePage)
        await replayVia(page, stop.stop.via, settleMs).catch(() => {});
    }
    // Only the focus pin is scrolled to; every other stop of a same-page set
    // would be measured docked-away rather than on its element.
    await page
      .evaluate(
        ([find, findJs]) =>
          (0, eval)(findJs)(find)?.scrollIntoView({ block: "center" }),
        [stop.stop.find, FIND_JS],
      )
      .catch(() => {});
    await page.waitForTimeout(500);
    const state = await waitForMark(
      page,
      stop.id,
      stop.anchor.tid,
      RESOLVE_TIMEOUT_MS,
    );
    if (!state.drawn) {
      failures.push({
        id: stop.id,
        label: stop.label,
        ck: stop.stop.ck,
        reason: "did not resolve within 30s",
      });
      continue;
    }
    if (stop.anchor.tid && state.under !== stop.anchor.tid) {
      failures.push({
        id: stop.id,
        label: stop.label,
        ck: stop.stop.ck,
        reason: `resolved onto '${state.under || "no landmark"}', not '${stop.anchor.tid}'`,
      });
    }
  }
  await page.close();
  return { failures };
}

await main();
