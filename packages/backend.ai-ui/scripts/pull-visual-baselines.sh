#!/usr/bin/env bash
# Replaces the Git LFS pointer files among the visual test baselines with the
# images (ADR 0031): .github/scripts/lfs/pull-docs-images.sh over the baselines
# directory, so every image written is checked against its pointer's oid.
# Options pass through (--remote, --fallback-remote, --fallback-report, --ref).
# Exits at once when none is a pointer.
set -euo pipefail

repo="$(git -C "$(dirname "${BASH_SOURCE[0]}")" rev-parse --show-toplevel)"
dir="packages/backend.ai-ui/test/visual/__screenshots__"
# shellcheck source=SCRIPTDIR/../../../.github/scripts/lfs/lib.sh
. "$repo/.github/scripts/lfs/lib.sh"

[ -n "$(cd "$repo" && lfs_find_pointer_files "$dir")" ] || exit 0

if ! git lfs version >/dev/null 2>&1 && [ "$(uname -s) $(uname -m)" != "Linux x86_64" ]; then
  echo "git-lfs is required for the visual test baselines: install it (https://git-lfs.com), run 'git lfs install --skip-repo', and retry." >&2
  exit 1
fi

exec bash "$repo/.github/scripts/lfs/pull-docs-images.sh" --root "$dir" "$@" "$repo"
