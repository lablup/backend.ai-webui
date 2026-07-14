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
  # scripts/check-terminology-i18n.mjs. (CHECK 2, key->two-values divergence, is
  # OFF by default — too noisy today; opt in with `pnpm run lint:terminology -- --check2`.)
  #
  # NON-BLOCKING by design: this runs in --warn mode and is invoked OUTSIDE
  # run_check, so it never sets FAIL and never flips `=== ALL PASS ===`.
  # Run `pnpm run lint:terminology` for the standalone report. Flipping this to
  # blocking (via `node scripts/check-terminology-i18n.mjs --strict`) is a
  # separate future task once the warn-mode findings have been triaged.
  node scripts/check-terminology-i18n.mjs --warn
}

run_check "Relay" check_relay_drift
run_check "Lint" pnpm -r --stream lint
run_check "Format" pnpm run format
run_check "TypeScript" pnpm --prefix ./react exec tsc --noEmit
run_check "Vite warmup paths" check_warmup_paths

# Warn-only terminology report. Guarded with `|| true` so `set -e` + the
# checker's exit code can never abort verify.sh or mark the build failed.
echo "=== Terminology (warn-only) ==="
check_terminology_drift || true
echo "--- Terminology: WARN-ONLY (does not affect build status) ---"
echo ""

if [ $FAIL -eq 0 ]; then
  echo "=== ALL PASS ==="
else
  echo "=== SOME CHECKS FAILED ==="
  exit 1
fi
