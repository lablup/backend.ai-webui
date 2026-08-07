#!/usr/bin/env bash
#
# Informational runner for the antd → Astryx migration gates.
#
# Runs every static gate, prints the current violation counts, mirrors the
# output into $GITHUB_STEP_SUMMARY when present, and ALWAYS exits 0 — this
# is the CI-facing report while the migration is in progress. The blocking
# form of the same checks is `bash scripts/antd-zero-gate.sh` (the final
# gate) and each gate's `--strict` flag.
#
# Usage:  bash scripts/migration-gates/report.sh

set -uo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT_DIR"

SUMMARY="${GITHUB_STEP_SUMMARY:-/dev/null}"

section() {
  local title="$1"
  shift
  echo ""
  echo "===================================================================="
  echo "$title"
  echo "===================================================================="
  local out
  out="$("$@" 2>&1)" || true
  echo "$out"
  {
    echo "### $title"
    echo ""
    echo '```'
    echo "$out"
    echo '```'
    echo ""
  } >> "$SUMMARY"
}

{
  echo "## Astryx migration gates (informational)"
  echo ""
  echo "Non-blocking status report — violations listed here are the"
  echo "migration's remaining work, not build failures."
  echo ""
} >> "$SUMMARY"

# (1) Final antd-zero gate: prod dep graph (a), build output (b, skipped
#     without a build), source import graph (c, the P15 resolver).
section "antd-zero-gate (final gate, expected FAIL until migration completes)" \
  bash scripts/antd-zero-gate.sh

# (2) Hidden antd DOM/CSS coupling.
section ".ant-* selector gate (P6/P17)" \
  node scripts/migration-gates/ant-selector-gate.mjs --counts

# (3) Undeclared var() tokens.
section "undeclared var() token gate (P19)" \
  node scripts/migration-gates/astryx-token-gate.mjs

echo ""
echo "=== migration-gates report done (informational — always exit 0) ==="
exit 0
