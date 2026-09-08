#!/usr/bin/env bash
# PROTOTYPE (FR-3882) — throwaway.
# Builds the docs site twice — at BASE and at HEAD — into dist/proto-base and
# dist/proto-head, then restores src/ to the checked-out tree.
# NOTE: temporarily replaces packages/backend.ai-webui-docs/src with the two
# commits' trees; do not run with uncommitted edits under src/.
#
# Usage: bash build-pair.sh <base-rev> <head-rev>
set -euo pipefail
BASE_REV="${1:?base rev}"
HEAD_REV="${2:?head rev}"
cd "$(dirname "$0")/.."

if [ -n "$(git status --porcelain -- src)" ]; then
  echo "src/ has uncommitted changes; commit or discard them first" >&2
  exit 1
fi

pnpm run build:toolkit
rm -rf dist/web dist/proto-base dist/proto-head

build() {
  rm -rf src
  git checkout "$1" -- src
  pnpm exec docs-toolkit build:web --lang all
  mv dist/web "dist/$2"
}
build "$BASE_REV" proto-base
build "$HEAD_REV" proto-head

rm -rf src
git checkout HEAD -- src
echo "built dist/proto-base (${BASE_REV}) and dist/proto-head (${HEAD_REV})"
