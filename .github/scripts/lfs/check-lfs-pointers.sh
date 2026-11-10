#!/usr/bin/env bash
# Every tracked file whose `filter` attribute is `lfs` must be committed as a
# Git LFS pointer. A raw file there means it was added without git-lfs.
#
# Usage: check-lfs-pointers.sh [<repo-dir>]   (checks the index; exit 1 on offenders)
set -euo pipefail

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=SCRIPTDIR/lib.sh
. "${HERE}/lib.sh"

cd "${1:-.}"
cd "$(git rev-parse --show-toplevel)"

tracked="$(mktemp)"
sizes="$(mktemp)"
trap 'rm -f "$tracked" "$sizes"' EXIT
git ls-files -z | git check-attr --stdin -z filter |
  while IFS= read -r -d '' path && IFS= read -r -d '' _attr && IFS= read -r -d '' value; do
    [ "$value" = lfs ] && printf '%s\n' "$path"
  done > "$tracked" || true

total="$(wc -l < "$tracked" | tr -d ' ')"
if [ "$total" -eq 0 ]; then
  echo "No tracked file has filter=lfs — nothing to check."
  exit 0
fi

# Sizes of the staged blobs, in input order; anything over 1024 bytes is raw.
sed 's/^/:/' "$tracked" | git cat-file --batch-check='%(objectsize)' > "$sizes"
offenders=()
while IFS=$'\t' read -r size path; do
  if ! [[ "$size" =~ ^[0-9]+$ ]] || [ "$size" -gt 1024 ] ||
    ! git cat-file blob ":${path}" | lfs_is_valid_pointer; then
    offenders+=("$path")
  fi
done < <(paste "$sizes" "$tracked")

if [ ${#offenders[@]} -eq 0 ]; then
  echo "All ${total} file(s) with filter=lfs are committed as Git LFS pointers."
  exit 0
fi

echo "::error::${#offenders[@]} of ${total} file(s) with filter=lfs are not committed as valid Git LFS pointers (raw content added without git-lfs?):"
printf '  %s\n' "${offenders[@]}"
cat <<'EOF'

Fix: install git-lfs (https://git-lfs.com) and run `git lfs install` once, then re-add the files so
the LFS clean filter turns them into pointers, and commit:
  git rm --cached -- <file>... && git add -- <file>... && git commit
EOF
exit 1
