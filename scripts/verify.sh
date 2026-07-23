#!/bin/bash
# Verification harness for Claude Code agents.
# Run from project root: bash scripts/verify.sh
# Agents should check for "=== ALL PASS ===" in the output.

set -euo pipefail

FAIL=0

run_check() {
  local name="$1"
  shift
  echo "=== $name ==="
  if "$@" 2>&1 | tail -20; then
    echo "--- $name: PASS ---"
  else
    echo "--- $name: FAIL ---"
    FAIL=1
  fi
  echo ""
}

check_warmup_paths() {
  # Verify every path in `server.warmup.clientFiles` (react/vite.config.ts)
  # actually exists. Missing entries don't crash the dev server, but they emit
  # noisy `Pre-transform error` warnings and silently shrink warmup coverage.
  local config=react/vite.config.ts
  local missing=0
  # Pull quoted string literals inside the warmup block. The block is short and
  # bounded by `warmup: {` / the next `},` so this awk window is robust enough.
  while IFS= read -r path; do
    [ -z "$path" ] && continue
    # Paths starting with `./` are relative to vite `root` (= react/).
    # Paths starting with `../` are relative to react/ too (e.g. ../packages/...).
    local resolved
    if [[ "$path" == ./* ]] || [[ "$path" == ../* ]]; then
      resolved="react/${path#./}"
      resolved="${resolved/react\/..\//}"
    else
      resolved="react/$path"
    fi
    if [ ! -f "$resolved" ]; then
      echo "  missing: $path (resolved: $resolved)"
      missing=1
    fi
  done < <(awk '/warmup: \{/,/^[[:space:]]*\},/' "$config" \
    | grep -oE "'[^']+'" \
    | tr -d "'" \
    | grep -v '^clientFiles$')
  return $missing
}

check_relay_drift() {
  # Relay generated artifacts are committed (see relay.dev production setup).
  # Any change under __generated__ after compiling means sources or schema
  # were updated without a matching `pnpm relay` run.
  #
  # Use `git status --porcelain` instead of `git diff --exit-code` so that
  # *new* generated files (e.g. when a developer adds a fragment) are caught
  # as drift too — `git diff` only sees tracked files.
  pnpm run relay || return 1
  local dirty
  dirty=$(git status --porcelain -- \
    'react/src/__generated__' \
    'packages/backend.ai-ui/src/__generated__')
  if [ -n "$dirty" ]; then
    echo "$dirty"
    echo "Relay generated artifacts are out of sync."
    echo "Run \`pnpm relay\` and commit the changes under __generated__."
    return 1
  fi
  return 0
}

check_terminology_drift() {
  # Deterministic i18n terminology checker (read-only). Scans i18n VALUES against
  # packages/backend.ai-webui-docs/terminology.json `avoid[]` (CHECK 1). See
  # scripts/check-terminology-i18n.mjs. (CHECK 2, near-duplicate divergence, is
  # OFF by default — report-only regardless; opt in with `pnpm run lint:terminology -- --check2`.)
  #
  # BLOCKING (FR-3049, team sign-off required): runs in --strict and is invoked
  # INSIDE run_check, so a blocking CHECK 1 finding sets FAIL and prevents
  # `=== ALL PASS ===`. Only bare-English, context-free avoid rows are
  # error-severity (checker `runCheck1`); context-qualified and all non-English
  # rows stay WARN and never block (severity logic unchanged). CHECK 2/3 never
  # affect the exit code. To unblock a legitimate false positive without
  # reverting: add the value/key to scripts/terminology-i18n.allowlist.json
  # (ignoreValues/ignoreKeys) or append `[[i18n-term-ok]]` inline. To fully
  # disable: change --strict back to --warn and move this out of run_check.
  #
  # NOTE: verify.sh is NOT run in CI (it is the local/agent harness), so this
  # flip blocks local + agent runs, not PR merges. A true CI merge-gate would be
  # a separate workflow — see the FR-3049 PR body for why that must be
  # diff-aware (fail only on findings a PR introduces), so a pre-existing drift
  # elsewhere cannot block an unrelated PR.
  node scripts/check-terminology-i18n.mjs --strict
}

run_check "Relay" check_relay_drift
run_check "Lint" pnpm -r --stream lint
run_check "Format" pnpm run format
run_check "TypeScript" pnpm --prefix ./react exec tsc --noEmit
run_check "Vite warmup paths" check_warmup_paths
run_check "Terminology" check_terminology_drift

# Non-English avoid-row precision self-test (FR-3051). This gates the avoid-row
# DATA (are the non-English rows precise?), a separate axis from CHECK 1 above
# (which gates i18n CONTENT and now BLOCKS on bare-English drift). It is
# report-only HERE so that the DATA gate lives in exactly one place — the CI
# workflow terminology-selftest.yml, triggered ONLY by the termbase / checker /
# fixtures paths (never by docs prose or i18n content) — rather than also
# hard-failing this local/agent harness on the live-store budget probe.
echo "=== Terminology self-test (report-only here; hard gate in CI) ==="
node scripts/check-terminology-i18n.selftest.mjs || true
echo ""

if [ $FAIL -eq 0 ]; then
  echo "=== ALL PASS ==="
else
  echo "=== SOME CHECKS FAILED ==="
  exit 1
fi
