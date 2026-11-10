#!/usr/bin/env bash
# Deletes the objects in this checkout's local Git LFS storage that are not
# listed in <used-oids-file> (one oid per line; pull-docs-images.sh appends the
# ones it needed when LFS_USED_OIDS_FILE is set). CI runs it before saving the
# storage as a cache, so the cache holds what the build used and stops growing.
#
# Usage: prune-lfs-store.sh <used-oids-file>
set -euo pipefail

used="${1:?usage: prune-lfs-store.sh <used-oids-file>}"
if [ ! -s "$used" ]; then
  echo "[prune-lfs-store] ${used} is empty; nothing pruned"
  exit 0
fi
store="$(git lfs env 2>/dev/null | sed -n 's/^LocalMediaDir=//p')"
if [ -z "$store" ] || [ ! -d "$store" ]; then
  echo "[prune-lfs-store] no local LFS storage; nothing pruned"
  exit 0
fi

stale="$(mktemp)"
trap 'rm -f "$stale"' EXIT
find "$store" -type f -print | awk 'NR == FNR { keep[$0] = 1; next } { o = $0; sub(/.*\//, "", o); if (!(o in keep)) print }' "$used" - > "$stale"
tr '\n' '\0' < "$stale" | xargs -0 rm -f
echo "[prune-lfs-store] kept $(sort -u "$used" | wc -l | tr -d ' ') object(s), removed $(wc -l < "$stale" | tr -d ' ')"
