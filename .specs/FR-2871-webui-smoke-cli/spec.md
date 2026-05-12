# WebUI Smoke CLI — installation verification e2e runner

> **Epic**: FR-2871 ([link](https://lablup.atlassian.net/browse/FR-2871))
> **Spec Task**: FR-2872 ([link](https://lablup.atlassian.net/browse/FR-2872))
> **Source plan**: `.specs/FR-2871-webui-smoke-cli/webui-smoke-cli.md`

## Overview

A new workspace package, `backend.ai-webui-smoke-cli`, that lets Field-Ops engineers verify Backend.AI WebUI functionality immediately after an on-prem or air-gapped install. The CLI re-uses the existing `e2e/` Playwright assets — selecting only specs tagged `@smoke` — runs them against a customer-provided endpoint, and emits a self-contained HTML + JSON report directory that can be handed off as the install acceptance artifact.

The CLI takes its endpoint and credentials via command-line arguments / environment variables only (no `.env` file editing), auto-detects the logged-in account's role, and operates without contacting the public internet at test-execution time.

## Problem Statement

Field-Ops engineers regularly perform on-prem and air-gapped Backend.AI installs. The current `e2e/` Playwright suite is excellent for CI and developer environments, but it assumes a full developer toolchain: pnpm, the monorepo checkout, Relay compilation, hand-edited `e2e/envs/.env.playwright`, an internet-connected `npx playwright install`, and multiple cross-user accounts (admin + user + user2 + monitor) provisioned for cross-RBAC scenarios.

Customer sites typically provide:

- One endpoint URL (often with a self-signed certificate)
- One service account (often only admin **or** only user — not both)
- No outbound internet for the installation host
- No developer tooling, sometimes not even Node.js

The result today is that post-install verification is done by hand-clicking through the UI, which is slow, inconsistent across engineers, and frequently misses the most common failure mode at customer sites: the app launcher / wsproxy / app-proxy path. We need a single deliverable that a Field-Ops engineer can drop on the install host, run with one command, and hand the resulting report directory to the customer as proof of acceptance.

## Requirements

Functional requirements are grouped by FR-A through FR-J. **FR-A, FR-B, FR-C are MVP.** FR-D through FR-J are Phase 2 and are listed here so this spec remains the single source of truth.

### FR-A — `@smoke` tag convention (MVP)

Introduce a Playwright tag taxonomy and apply it to a starter set of existing e2e specs.

- [ ] Document the tag taxonomy in `e2e/E2E-TEST-NAMING-GUIDELINES.md`:
  - `@smoke` — base smoke set; single account; must complete in 5–10 minutes
  - `@smoke-admin` — admin-only signals (user mgmt, resource policies, agent list)
  - `@smoke-user` — end-user signals (session lifecycle, vfolder, environment list)
  - NOTE: an earlier `@smoke-any` tag was considered for role-agnostic specs, but
    every existing e2e login helper (`loginAsAdmin` / `loginAsUser`) hard-codes a
    named credential. There is no genuinely role-agnostic smoke spec at the helper
    level, so MVP uses only the two role-scoped tags.
- [ ] Tag at least the following existing specs (no-op functional change):
  - Login / logout / token expiry
  - Dashboard render
  - Session lifecycle (create → running → terminate)
  - VFolder create / upload / download / delete
  - Environment & image list
  - (admin) User list, resource policy list, agent list

Acceptance:

- [ ] `pnpm exec playwright test --grep @smoke --list` (run at the repo root, where `playwright.config.ts` lives) lists at minimum the specs above.
- [ ] No existing e2e CI job changes behaviour (tags are additive metadata).

### FR-B — `backend.ai-webui-smoke-cli` workspace scaffold (MVP)

Create the new workspace package with read-only subcommands first.

- [ ] New package at `packages/backend.ai-webui-smoke-cli/` registered in the pnpm workspace.
- [ ] `package.json` exposes a `smoke` bin and a `build` script (tsup or equivalent — implementation choice).
- [ ] `bai-smoke list` prints the available categories and tags resolved from a catalog file.
- [ ] `bai-smoke version` prints CLI version, bundled webui SHA placeholder, and Playwright version.
- [ ] CLI argument parsing layer accepts global options: `--endpoint`, `--webserver`, `--email`, `--password`, `--password-stdin`, `--role`, `--include`, `--exclude`, `--pages`, `--workers`, `--timeout`, `--output`, `--headed`, `--insecure-tls`.
- [ ] All inputs are accepted as CLI flags **or** as `BAI_SMOKE_*` environment variables. The CLI must **not** require editing any `.env` file.

Acceptance:

- [ ] `pnpm --filter backend.ai-webui-smoke-cli run smoke -- list` prints the catalog.
- [ ] `pnpm --filter backend.ai-webui-smoke-cli run smoke -- version` prints version info.
- [ ] `pnpm --filter backend.ai-webui-smoke-cli run smoke -- run --help` documents every option above.

### FR-C — `playwright.smoke.config.ts` + runner (MVP)

Wire the CLI to actually run tagged specs against the supplied endpoint.

- [ ] `playwright.smoke.config.ts` imports the existing repo-root `playwright.config.ts` and overrides:
  - `testDir` to point at the existing `e2e/` directory (the repo-root config already sets `testDir: './e2e'`)
  - `grep` to apply `--include` / `--exclude` tag filters
  - `reporter` to `[['html', { outputFolder: <output>/index, open: 'never' }], ['list']]`
  - `use.baseURL` from `--endpoint`
  - `use.ignoreHTTPSErrors` from `--insecure-tls`
  - `use.video: 'retain-on-failure'`, `use.trace: 'retain-on-failure'`
- [ ] `runner.ts` programmatically invokes Playwright with the smoke config, injecting credentials via process env (never written to disk).
- [ ] Single-account authentication: the runner logs in once with the supplied email/password and reuses storage state across specs.
- [ ] Specs requiring multiple accounts (cross-user RBAC) are excluded from the `@smoke` selection by tag convention.

Acceptance (verifiable in staging):

- [ ] Running `pnpm --filter backend.ai-webui-smoke-cli run smoke -- run --endpoint <staging> --email <email> --password <pw> --output ./report` against a staging Backend.AI cluster:
  - Logs in successfully with the supplied credentials
  - Loads the dashboard
  - Completes at minimum **one session lifecycle** (create batch session → polled to `RUNNING` → terminate cleanly)
  - Writes a Playwright HTML report at `./report/index/index.html`
  - Exits with code `0` on all-pass, non-zero on any failure
- [ ] No single binary or air-gap bundling is required for MVP — those are FR-G and FR-H.

---

### FR-D — `preflight` / `doctor` subcommand + role auto-detection (Phase 2)

- [ ] `bai-smoke doctor` checks: endpoint reachability, TLS, login succeeds, browser binary present at expected path, free disk space ≥ configured minimum, and warns on webui-version-vs-CLI-version mismatch by reading the webui SHA from `/manifest.json` or `index.html` meta.
- [ ] `bai-smoke preflight` (or a `--preflight-only` flag on `run`) performs the doctor checks then exits without running specs.
- [ ] Role auto-detection: after login, the runner inspects the existing login response / `/server/login-check` signal to classify the account as `admin`, `user`, or `monitor`, and includes only tags compatible with the detected role.
- [ ] `--role auto` (default) uses detection; explicit `--role admin|user|monitor` overrides.
- [ ] Detection must not introduce new backend APIs.

Acceptance:

- [ ] Running `doctor` against an unreachable endpoint exits non-zero with a precise reason.
- [ ] Running `doctor` against a wrong-credential endpoint reports "login failed" distinctly from "endpoint unreachable".
- [ ] With `--role auto`, an admin login runs `@smoke + @smoke-admin`; a user login runs `@smoke + @smoke-user`. (See FR-A note: the originally-proposed `@smoke-any` tag was dropped because no genuinely role-agnostic smoke spec exists at the helper level.)

### FR-E — Report post-processing (Phase 2)

- [ ] After Playwright finishes, the runner generates the following inside `--output`:

  ```
  smoke-report-<timestamp>/
  ├── index/                # Playwright html reporter output
  │   └── index.html
  ├── summary.json          # machine-readable {total, passed, failed, skipped, durationMs, byCategory: {...}}
  ├── environment.json      # {endpoint, role, cliVersion, webuiSha, os, playwrightVersion, chromiumVersion}
  ├── traces/               # failed cases only
  ├── videos/               # failed cases only (passing cases pruned)
  └── logs/
      ├── console-*.log
      └── network-*.har     # failures only
  ```
- [ ] Each failed case includes a copy-pasteable diagnostic block: endpoint, role, webui SHA, last 20 console lines, 4xx/5xx network summary.
- [ ] The runner does **not** write any custom Playwright reporter; post-processing reads the JSON reporter output and augments it.

Acceptance:

- [ ] `summary.json` round-trips through `JSON.parse` and contains all fields above.
- [ ] After a forced failure, `traces/` and `videos/` for that case are non-empty; for passing cases, `videos/` is empty.

### FR-F — Single-account safe utils (Phase 2)

- [ ] Audit `e2e/utils/test-util.ts` for assumptions requiring multiple seeded accounts (admin, user, user2, monitor).
- [ ] Extract single-account-safe helpers into a separate module that smoke specs use.
- [ ] No smoke spec may import a helper that requires more than one account.

Acceptance:

- [ ] Smoke specs run green against a fixture environment provisioned with exactly one account.

### FR-G — Chromium bundling + air-gap runtime + `--insecure-tls` (Phase 2)

- [ ] Build artifact ships a `browsers/` directory with the platform-matched Playwright Chromium.
- [ ] At runtime, the CLI sets `PLAYWRIGHT_BROWSERS_PATH` to that bundled path before launching Playwright.
- [ ] `--insecure-tls` flag (default `false`) maps to Playwright `ignoreHTTPSErrors: true`.
- [ ] All external-origin requests (CDNs, Google Fonts) are blocked via `context.route('**/*', …)` allow-list during spec execution.
- [ ] No `npx playwright install` is invoked at runtime.

Acceptance:

- [ ] On a host with outbound traffic blocked (verified via firewall rules), the CLI completes a smoke run successfully against an in-network endpoint.

### FR-H — SEA / pkg binary build + internal release workflow (Phase 2)

- [ ] Build scripts produce platform binaries: `bai-smoke-linux-x64`, `bai-smoke-mac-arm64`, `bai-smoke-win-x64.exe`.
- [ ] Bundled artifact is `.tar.gz` (linux/mac) or `.zip` (win) containing the binary + `browsers/` + `tests/` + `LICENSES.md` + `README.md`.
- [ ] Release publishes to **internal artifact storage only** (private GitHub Release with restricted access is acceptable). No public release.
- [ ] Release tag format: `webui-vX.Y.Z+smoke.N`.

Acceptance:

- [ ] An engineer with no Node.js installed can extract the archive on each supported platform and run `./bai-smoke run …` successfully.

### FR-I — Operator README (Phase 2)

- [ ] One-page README in **English and Korean** covering: extract → chmod → run → read report → known issues.
- [ ] Troubleshooting section covers: self-signed cert, macOS quarantine workaround, Windows SmartScreen workaround, "login failed" vs "endpoint unreachable" disambiguation, leftover resource cleanup (`bai-smoke cleanup --prefix bai-smoke-`).

Acceptance:

- [ ] README fits on one printed page in either language.

### FR-J — Coverage expansion (Phase 2)

Expand the `@smoke` catalog beyond the FR-A starter set. **App launcher is priority 1.**

- [ ] **App launcher (P1)** — start a session, launch one app (jupyter or terminal), confirm the app page actually opens through the app-proxy. This is the most frequent failure mode at customer sites.
- [ ] Model serving — basic serving endpoint deploy + invocation.
- [ ] Basic RBAC — single-account-safe permission checks (no cross-user assertions).

Acceptance:

- [ ] App launcher smoke fails loudly when wsproxy / app-proxy is misconfigured (distinguish "session never reached RUNNING" from "session running, app proxy 502").

## Non-Functional Requirements

All of the following are **mandatory** for the final delivered artifact (Phase 2 completion). MVP relaxes the air-gap and packaging requirements.

- [ ] **Air-gap operation** — at test execution time the CLI must not contact any host other than the supplied webserver / webui endpoint. Verified by running on a host with outbound traffic blocked.
- [ ] **Single-account assumption** — `@smoke` specs must succeed with exactly one provided account. Cross-user RBAC scenarios are excluded from `@smoke` by convention.
- [ ] **Role auto-detection** — login response is the source of truth. No new backend API.
- [ ] **Self-contained report** — the `--output` directory must be portable (zip → email → open). Assets are local; no CDN dependencies in `index.html`.
- [ ] **Failure-only retention** — traces, videos, HAR captures are retained for failed cases only to keep report size manageable.
- [ ] **No secrets to disk** — credentials supplied via flag, env, or `--password-stdin` never end up in the report directory or on disk.

## User Stories

- As a Field-Ops engineer, I want to run one command against a freshly installed Backend.AI cluster so that I can confirm the WebUI works without clicking through it by hand.
- As a Field-Ops engineer working on an air-gapped customer site, I want the CLI to run without internet access so that I do not need to coordinate temporary outbound rules.
- As a Field-Ops engineer holding only one customer-issued account, I want the CLI to auto-adapt to that account's role so that I do not need to ask the customer for additional admin/user pairs.
- As a Field-Ops engineer, I want to hand the customer a report directory so that we have a written acceptance artifact for the install.
- As a Support engineer triaging a failed install, I want each failed case to include a copy-pasteable diagnostic block so that I can open a ticket without re-reproducing locally.
- As a Backend.AI maintainer, I want every PR that touches the WebUI to run the smoke CLI against the dev cluster so that smoke regressions are caught before customer delivery.

## Acceptance Criteria

### MVP (FR-A + FR-B + FR-C) — verifiable in staging

- [ ] `pnpm --filter backend.ai-webui-smoke-cli run smoke -- run --endpoint <staging-url> --email <email> --password <pw> --output ./report` against staging:
  - Logs in successfully
  - Loads the dashboard
  - Completes one full session lifecycle (create → RUNNING → terminate)
  - Writes a Playwright HTML report at `./report/index/index.html`
  - Exits `0` on all-pass, non-zero on any failure
- [ ] `bai-smoke list` and `bai-smoke version` work without an endpoint argument.
- [ ] No CI job in the existing pipeline breaks from the introduction of `@smoke` tags.

### Phase 2 (FR-D … FR-J)

- [ ] A Field-Ops engineer with only the produced archive can complete a smoke run on a fresh, internet-disconnected host on each of: linux-x64, mac-arm64, win-x64.
- [ ] Report directory `summary.json` and `environment.json` schemas are stable and documented.
- [ ] App-launcher smoke distinguishes between session-runtime failures and app-proxy failures in the report.
- [ ] Operator README (KR/EN) is published with the release archive.

## Out of Scope

- Visual regression testing.
- Backend.AI Manager / Agent / Storage health checks — owned by separate diagnostic tooling.
- Load and performance testing.
- SSO / SAML authentication in v1 — deferred. A future `--cookie-file` flag will support pre-issued session cookies; not in this Epic.
- macOS / Windows code signing — first release ships unsigned with documented quarantine workaround.
- Public distribution — internal artifact storage only.
- Custom Playwright reporter — we wrap the bundled HTML reporter and post-process the JSON reporter output instead.

## Risks and Mitigations

| Risk | Mitigation |
|---|---|
| SSO / SAML environments block ID+password login | v1 supports basic auth only; cookie-file injection deferred and documented |
| Customer plugin/theme variants break selectors | `@smoke` specs must prefer `data-testid` and role/text selectors over CSS / XPath |
| WebUI version vs CLI version mismatch causes false failures | `bai-smoke doctor` reads webui SHA from `/manifest.json` and warns against a compat matrix |
| Unsigned binary triggers macOS Gatekeeper / Windows SmartScreen | Document `xattr -d com.apple.quarantine` and SmartScreen "Run anyway" path in README; pursue signing in a follow-up |
| Smoke runs create real sessions/vfolders and pollute customer data | All created resources use a `bai-smoke-<timestamp>-` prefix; `bai-smoke cleanup --prefix bai-smoke-` subcommand handles leftover resources after crashes |
| Self-signed customer certs block TLS | `--insecure-tls` flag maps to `ignoreHTTPSErrors: true`; off by default |
| App launcher failures are hard to attribute (session vs proxy) | App-launcher smoke (FR-J) emits distinct failure reasons for "session never RUNNING" vs "session running, app-proxy non-2xx" |
| Customer outbound is blocked, breaking `npx playwright install` | Chromium is bundled in the release archive (FR-G); CLI sets `PLAYWRIGHT_BROWSERS_PATH` at runtime |

## Related Issues

- FR-2871 — Epic: WebUI Smoke CLI — installation verification e2e runner
- FR-2872 — Spec definition task (this work)
- `docs/plans/webui-smoke-cli.md` — original approved plan
