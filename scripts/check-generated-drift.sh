#!/usr/bin/env bash
# Drift gate for a committed generated artifact (ADR 0003): after the caller
# rebuilt it, fail if git sees the tracked paths modified or new files added.
# Usage: check-generated-drift.sh <label> "<fix command>" <path>...
set -euo pipefail
label=$1; fix=$2; shift 2
dirty=$(git status --porcelain -- "$@")
if [ -n "$dirty" ]; then
  echo "$dirty"
  if [ -n "${GITHUB_ACTIONS:-}" ]; then
    echo "::error title=${label} drift::${label} artifacts are out of sync with the source. Run \`${fix}\` locally and commit the result."
  else
    echo "${label} artifacts are out of sync with the source."
    echo "Run \`${fix}\` and commit the result."
  fi
  git diff --stat -- "$@" || true
  exit 1
fi
echo "${label} artifacts are up to date."
