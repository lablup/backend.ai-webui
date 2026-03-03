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

run_check "Relay" pnpm run relay
run_check "Lint" pnpm run lint
run_check "Format" pnpm run format
run_check "TypeScript" pnpm --prefix ./react exec tsc --noEmit

if [ $FAIL -eq 0 ]; then
  echo "=== ALL PASS ==="
else
  echo "=== SOME CHECKS FAILED ==="
  exit 1
fi
