# backend.ai-webui-smoke-cli

Post-install smoke verification CLI for Backend.AI WebUI. See
[`.specs/FR-2871-webui-smoke-cli/spec.md`](../../.specs/FR-2871-webui-smoke-cli/spec.md)
for the full spec. The operator-facing README (EN + KO) lands in FR-2883
(Phase 2).

## Usage (alpha)

Prefer reading the password from stdin or an env var — passing
`--password` on the command line exposes the secret to anything that
can read the host process's argv. The CLI scrubs the argv value at
startup, but the original invocation may still surface in shell history
or process listings before the scrub runs.

```sh
# Option 1 — password from stdin (recommended)
printf '%s' "$BAI_PASSWORD" | bai-smoke run \
  --endpoint https://webui.example.com \
  --webserver https://webui.example.com \
  --email admin@example.com \
  --password-stdin \
  --output ./smoke-report

# Option 2 — password from env var
BAI_SMOKE_PASSWORD="$BAI_PASSWORD" bai-smoke run \
  --endpoint https://webui.example.com \
  --webserver https://webui.example.com \
  --email admin@example.com \
  --output ./smoke-report
```

To widen the selection beyond the default `@smoke*` set, use
`--also-include`. To narrow the run, use `--pages`:

```sh
bai-smoke run \
  --endpoint https://webui.example.com \
  --email admin@example.com \
  --password-stdin \
  --also-include "@critical" \
  --pages session,vfolder
```

## Limitations (alpha MVP)

- **Report directories are sensitive.** Playwright's `retain-on-failure`
  trace and video capture the login form being filled, so a run whose login
  fails leaves the operator password inside `trace.zip` (and the failure
  video). Treat `smoke-report-*/` as a credential-bearing artifact: do not
  attach one to a ticket or hand it to a customer without scrubbing it.
- **2FA is not supported.** The shared `login()` helper has no OTP step, so
  a run against a cluster with two-factor login enabled fails at sign-in.
- **The run deletes nothing it did not create.** The repository's global
  `e2e-*` cleanup sweep is deliberately not wired into the smoke config —
  it is unscoped and would delete-forever any customer folder whose name
  contains `e2e-`. Each smoke spec removes its own artifacts; if a run is
  killed mid-test, the artifacts it was using may remain and carry an
  `e2e-` prefix.
- Must be run from a `backend.ai-webui` monorepo checkout — the e2e
  specs are not bundled yet. Build once before the first run:
  `pnpm --filter backend.ai-webui-smoke-cli build`. Tarball / single-binary distribution is
  tracked in FR-2881.
- Air-gap binary, `doctor` command, and rich diagnostic reports → Phase 2.
- `--also-include` widens the smoke set; to narrow it, use `--pages`
  instead. The legacy `--include` flag is a deprecated hidden alias and
  will be removed in a future release.
- `--insecure-tls` accepts self-signed certs but does not pin
  fingerprints — only enable on trusted networks.

This is an alpha MVP. Full operator docs (EN + KO) land with FR-2883.
