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

- Must be run from a `backend.ai-webui` monorepo checkout — the e2e
  specs are not bundled yet. Tarball / single-binary distribution is
  tracked in FR-2881.
- Air-gap binary, `doctor` command, and rich diagnostic reports → Phase 2.
- `--also-include` widens the smoke set; to narrow it, use `--pages`
  instead. The legacy `--include` flag is a deprecated hidden alias and
  will be removed in a future release.
- `--insecure-tls` accepts self-signed certs but does not pin
  fingerprints — only enable on trusted networks.

This is an alpha MVP. Full operator docs (EN + KO) land with FR-2883.
