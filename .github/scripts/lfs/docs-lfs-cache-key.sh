#!/usr/bin/env bash
# Prints the actions/cache key for the Git LFS objects of the user manual's
# images at <rev> (default: HEAD): `docs-lfs-v1-<sha256>` over the sorted blob ids
# of the image pointers, which name the LFS objects one to one. Text-only
# changes keep the key; changing an image changes it.
#
# Usage: docs-lfs-cache-key.sh [--root <dir>]... [--prefix <prefix>] [<rev>]
#
#   --root    directory to key instead of the user manual source; repeatable
#   --prefix  key prefix (default: docs-lfs-v1-)
set -euo pipefail

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=SCRIPTDIR/lib.sh
. "${HERE}/lib.sh"

PREFIX="docs-lfs-v1-"
REV="HEAD"
roots=()
while [ $# -gt 0 ]; do
  case "$1" in
    --root) roots+=("${2:?--root needs a value}"); shift 2 ;;
    --prefix) PREFIX="${2:?--prefix needs a value}"; shift 2 ;;
    -*) echo "Unknown option: $1" >&2; exit 2 ;;
    *) REV="$1"; shift ;;
  esac
done
top="$(git rev-parse --show-toplevel)"
if [ ${#roots[@]} -eq 0 ]; then
  while IFS= read -r root; do roots+=("$root"); done < <(lfs_docs_roots "$top")
fi

hash="$(
  if [ ${#roots[@]} -gt 0 ]; then
    git -C "$top" -c core.quotePath=false ls-tree -r "$REV" -- "${roots[@]}" |
      awk -F '\t' 'tolower($2) ~ /\.(png|jpe?g|gif|webp)$/ { split($1, m, " "); print m[3] }' |
      LC_ALL=C sort -u
  fi | "${LFS_SHA256[@]}" | cut -c1-64
)"
echo "${PREFIX}${hash}"
