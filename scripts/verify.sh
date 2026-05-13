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
  done < <(awk '/warmup: \{/,/^\s*\},/' "$config" \
    | grep -oE "'[^']+'" \
    | tr -d "'" \
    | grep -v '^clientFiles$')
  return $missing
}

run_check "Relay" pnpm run relay
run_check "Lint" pnpm run lint
run_check "Format" pnpm run format
run_check "TypeScript" pnpm --prefix ./react exec tsc --noEmit
run_check "Vite warmup paths" check_warmup_paths

if [ $FAIL -eq 0 ]; then
  echo "=== ALL PASS ==="
else
  echo "=== SOME CHECKS FAILED ==="
  exit 1
fi
