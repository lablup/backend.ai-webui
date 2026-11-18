#!/usr/bin/env bash
# Prints the actions/cache key for the visual test baselines' Git LFS objects at
# <rev> (default: HEAD): `bui-visual-lfs-v1-<sha256>` over the sorted blob ids of
# the baseline pointers, which name the LFS objects one to one.
#
# Usage: visual-lfs-cache-key.sh [<rev>]
set -euo pipefail

repo="$(git -C "$(dirname "${BASH_SOURCE[0]}")" rev-parse --show-toplevel)"
# shellcheck source=SCRIPTDIR/../../../.github/scripts/lfs/lib.sh
. "$repo/.github/scripts/lfs/lib.sh"

rev="${1:-HEAD}"
dir=packages/backend.ai-ui/test/visual/__screenshots__
hash="$(
  git -C "$repo" -c core.quotePath=false ls-tree -r "$rev" -- "$dir" |
    awk -F '\t' 'tolower($2) ~ /\.png$/ { split($1, m, " "); print m[3] }' |
    LC_ALL=C sort -u | "${LFS_SHA256[@]}" | cut -c1-64
)"
echo "bui-visual-lfs-v1-${hash}"
