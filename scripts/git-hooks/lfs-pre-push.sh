#!/bin/sh
# Git LFS pre-push step, run from .husky/pre-push. Husky owns core.hooksPath, so
# `git lfs install` cannot install its own pre-push hook here (#11040).
#
# Usage: lfs-pre-push.sh <remote-name> <remote-url>   (git's ref lines on stdin)
#
# - git-lfs installed: refuses images under an LFS path committed as raw bytes,
#   then hands the push to `git lfs pre-push`, which uploads the LFS objects.
# - git-lfs missing: refuses the push only when it changes an LFS-tracked file;
#   every other push goes through without git-lfs.
set -eu

work="$(mktemp -d)"
trap 'rm -rf "$work"' EXIT
cat > "$work/refs"

is_zero() { case "$1" in *[!0]*) return 1 ;; *) return 0 ;; esac; }

# "<commit> <path>" for each LFS-tracked file added or modified by the pushed commits.
changed() { git -c core.quotePath=false log --format= --name-only --no-renames --diff-filter=d "$@"; }
while read -r _lref lsha _rref rsha; do
  [ -n "${lsha:-}" ] || continue
  is_zero "$lsha" && continue
  if ! is_zero "$rsha" && git cat-file -e "${rsha}^{commit}" 2>/dev/null; then
    changed "${rsha}..${lsha}"
  else
    changed "$lsha" --not --remotes
  fi |
    sed '/^$/d' | sort -u |
    git -c core.quotePath=false check-attr --stdin filter |
    sed -n 's/: filter: lfs$//p' |
    sed "s|^|${lsha} |" >> "$work/lfs"
done < "$work/refs"

if [ -s "$work/lfs" ]; then
  # Raw content: the newest pushed version is not an LFS pointer.
  while read -r sha path; do
    git cat-file -e "${sha}:${path}" 2>/dev/null || continue
    size="$(git cat-file -s "${sha}:${path}")"
    head="$(git cat-file blob "${sha}:${path}" | head -c 39 | tr -d '\000')"
    if [ "$size" -gt 1024 ] || [ "$head" != "version https://git-lfs.github.com/spec" ]; then
      echo "$path" >> "$work/raw"
    fi
  done < "$work/lfs"
fi

list() { sort -u "$1" | head -n 10 | sed 's/^/  /' >&2; }

if ! command -v git-lfs >/dev/null 2>&1; then
  [ -s "$work/lfs" ] || exit 0
  cut -d' ' -f2- "$work/lfs" > "$work/paths"
  {
    echo
    echo "This push changes files stored in Git LFS, but git-lfs is not installed,"
    echo "so their content would not be uploaded and GitHub would reject the push:"
  } >&2
  list "$work/paths"
  {
    echo
    echo "Install git-lfs (https://git-lfs.com), run 'git lfs install --skip-repo' once, then:"
    echo "  git add --renormalize -- <the files above> && git commit"
    echo "(it turns files committed without git-lfs into LFS pointers), and push again."
    echo
  } >&2
  exit 1
fi

if [ -s "$work/raw" ]; then
  {
    echo
    echo "These files belong in Git LFS but were committed as raw bytes (git-lfs filters not"
    echo "configured when they were added):"
  } >&2
  list "$work/raw"
  {
    echo
    echo "Run 'git lfs install --skip-repo' once, then:"
    echo "  git add --renormalize -- <the files above> && git commit"
    echo "and push again."
    echo
  } >&2
  exit 1
fi

git lfs pre-push "$@" < "$work/refs"
