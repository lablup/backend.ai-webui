#!/usr/bin/env bash
# Replaces the Git LFS pointer files among the visual test baselines with the
# images (ADR 0031). Exits at once when none is a pointer. Installs the pinned
# git-lfs on Linux x86_64 when it is missing.
set -euo pipefail

repo="$(git -C "$(dirname "${BASH_SOURCE[0]}")" rev-parse --show-toplevel)"
dir="packages/backend.ai-ui/test/visual/__screenshots__"
# shellcheck source=SCRIPTDIR/../../../.github/scripts/lfs/lib.sh
. "$repo/.github/scripts/lfs/lib.sh"

pointers() { (cd "$repo" && lfs_find_pointer_files "$dir"); }

[ -n "$(pointers)" ] || exit 0

if ! git lfs version >/dev/null 2>&1; then
  if [ "$(uname -s) $(uname -m)" != "Linux x86_64" ]; then
    echo "git-lfs is required for the visual test baselines: install it (https://git-lfs.com), run 'git lfs install --skip-repo', and retry." >&2
    exit 1
  fi
  bin="$(bash "$repo/.github/scripts/lfs/install-git-lfs.sh")"
  [ -z "$bin" ] || export PATH="$bin:$PATH"
fi

hooks="$(mktemp -d)"
trap 'rm -rf "$hooks"' EXIT
git -C "$repo" -c core.hooksPath="$hooks" \
  -c filter.lfs.process="git-lfs filter-process" \
  -c filter.lfs.smudge="git-lfs smudge -- %f" \
  -c filter.lfs.clean="git-lfs clean -- %f" \
  -c filter.lfs.required=true \
  lfs pull --include="$dir/**" --exclude=""

left="$(pointers)"
if [ -n "$left" ]; then
  echo "These visual test baselines are still Git LFS pointers after 'git lfs pull':" >&2
  head -n 10 <<< "$left" | sed 's/^/  /' >&2
  exit 1
fi
echo "Visual test baselines pulled from Git LFS."
