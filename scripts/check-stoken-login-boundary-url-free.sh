#!/bin/bash
# Enforce the URL-API prohibition invariant for STokenLoginBoundary (FR-2616).
#
# The boundary component must not read or mutate URL state on its own — the
# `sToken` value is supplied by callers via prop (sourced through `useSToken`
# or equivalent nuqs-based hook). See
# `.specs/draft-stoken-login-boundary/spec.md` section "URL 파라미터 파싱 규약
# (nuqs)" and the file-header comment in `STokenLoginBoundary.tsx`.
#
# This script greps the component source and any sibling files under a
# future `STokenLoginBoundary/` subdirectory for the forbidden tokens.
# Matches cause a non-zero exit so `verify.sh` / CI fails the build.
#
# Run from the repo root:
#   bash scripts/check-stoken-login-boundary-url-free.sh
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
TARGETS=()

if [ -f "$ROOT/react/src/components/STokenLoginBoundary.tsx" ]; then
  TARGETS+=("$ROOT/react/src/components/STokenLoginBoundary.tsx")
fi

if [ -d "$ROOT/react/src/components/STokenLoginBoundary" ]; then
  while IFS= read -r file; do
    TARGETS+=("$file")
  done < <(find "$ROOT/react/src/components/STokenLoginBoundary" -type f \
    \( -name '*.ts' -o -name '*.tsx' \))
fi

if [ ${#TARGETS[@]} -eq 0 ]; then
  echo "no STokenLoginBoundary source found — nothing to check"
  exit 0
fi

# Patterns that indicate direct URL-state access. Comments are stripped
# from source before grepping, so documentation of the rule in the
# file-header comment does not trigger a false match.
FORBIDDEN='window\.location|window\.history|document\.location|\bURLSearchParams\b'

FAIL=0
for file in "${TARGETS[@]}"; do
  # Strip block comments and line comments before grepping so the header
  # documentation does not match. Use a short awk pipeline.
  CLEANED="$(awk '
    BEGIN { in_block = 0 }
    {
      line = $0
      if (in_block) {
        idx = index(line, "*/")
        if (idx > 0) {
          line = substr(line, idx + 2)
          in_block = 0
        } else {
          next
        }
      }
      while (match(line, /\/\*.*\*\//)) {
        line = substr(line, 1, RSTART - 1) substr(line, RSTART + RLENGTH)
      }
      start = index(line, "/*")
      if (start > 0) {
        line = substr(line, 1, start - 1)
        in_block = 1
      }
      sub(/\/\/.*/, "", line)
      print line
    }
  ' "$file")"

  if echo "$CLEANED" | grep -Eq "$FORBIDDEN"; then
    echo "ERROR: forbidden URL API reference in $file"
    echo "$CLEANED" | grep -En "$FORBIDDEN" || true
    FAIL=1
  fi
done

if [ $FAIL -ne 0 ]; then
  echo ""
  echo "STokenLoginBoundary must not reference window.location, window.history,"
  echo "document.location, or URLSearchParams. Callers supply sToken via nuqs."
  exit 1
fi

echo "ok: no forbidden URL APIs in STokenLoginBoundary source"
