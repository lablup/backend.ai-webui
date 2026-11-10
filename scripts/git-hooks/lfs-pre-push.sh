#!/usr/bin/env bash
# Git LFS pre-push step, run from .husky/pre-push. Husky owns core.hooksPath, so
# `git lfs install` cannot install its own pre-push hook here (#11040).
#
# Usage: lfs-pre-push.sh <remote-name> <remote-url>   (git's ref lines on stdin)
#
# Looks at the LFS-tracked files the pushed commits add or change (merge
# resolutions included; commits the target remote already has excluded):
# - any of them committed as raw bytes instead of an LFS pointer → refused;
# - otherwise, with git-lfs installed and LFS files in the push, `git lfs
#   pre-push` uploads their objects;
# - every other push goes through, with or without git-lfs.
set -euo pipefail

top="$(git rev-parse --show-toplevel)"
# shellcheck source=SCRIPTDIR/../../.github/scripts/lfs/lib.sh
. "${top}/.github/scripts/lfs/lib.sh"

work="$(mktemp -d)"
trap 'rm -rf "$work"' EXIT
cat > "${work}/refs"

is_zero() { [[ ! "$1" =~ [^0] ]]; }

# Attributes as each pushed commit has them (git >= 2.40), else the working tree's.
src_ok=0
git check-attr --source HEAD filter -- .gitattributes >/dev/null 2>&1 && src_ok=1

# Commits the target already has: its remote-tracking refs (all of them when
# pushing to a URL), plus the ref's previous tip.
if [ -n "${1:-}" ] && git remote get-url "$1" >/dev/null 2>&1; then
  known=(--remotes="$1")
else
  known=(--remotes)
fi

# "<commit>\t<new blob>\t<path>" for every file (not a symlink or submodule)
# a pushed commit adds or modifies.
while read -r _lref lsha _rref rsha; do
  [ -n "${lsha:-}" ] || continue
  is_zero "$lsha" && continue
  range=("$lsha" --not "${known[@]}")
  if ! is_zero "$rsha" && git cat-file -e "${rsha}^{commit}" 2>/dev/null; then
    range+=("$rsha")
  fi
  git -c core.quotePath=false log --format='commit %H' --raw --no-abbrev --no-renames \
    --diff-filter=d --cc "${range[@]}" |
    while IFS= read -r line; do
      case "$line" in
        "commit "*) commit="${line#commit }" ;;
        :*)
          meta="${line%%$'\t'*}"
          read -ra f <<< "$meta"
          # ":<modes…> <oids…> <status>": the result's mode and blob come last of each.
          case "${f[${#f[@]}/2-1]}" in 120000 | 160000) continue ;; esac
          printf '%s\t%s\t%s\n' "$commit" "${f[${#f[@]}-2]}" "${line#*$'\t'}"
          ;;
      esac
    done >> "${work}/changed"
done < "${work}/refs"

# Keep the LFS-tracked ones: "<blob>\t<path>".
: > "${work}/lfs"
if [ -s "${work}/changed" ]; then
  cut -f1 "${work}/changed" | awk '!seen[$0]++' > "${work}/commits"
  while IFS= read -r commit; do
    awk -F'\t' -v c="$commit" '$1 == c { print $2 "\t" $3 }' "${work}/changed" > "${work}/one"
    src=()
    [ "$src_ok" -eq 0 ] || src=(--source "$commit")
    cut -f2- "${work}/one" | git -c core.quotePath=false check-attr ${src[@]+"${src[@]}"} --stdin filter |
      paste "${work}/one" - |
      awk -F'\t' '$3 ~ /: filter: lfs$/ { print $1 "\t" $2 }' >> "${work}/lfs"
  done < "${work}/commits"
fi

# Raw content: larger than any pointer, or small but not a valid pointer.
: > "${work}/raw"
if [ -s "${work}/lfs" ]; then
  cut -f1 "${work}/lfs" | sort -u | git cat-file --batch-check='%(objectname) %(objecttype) %(objectsize)' |
    while read -r oid type size; do
      [ "$type" = blob ] || continue
      if [ "$size" -gt 1024 ] || ! git cat-file blob "$oid" | lfs_is_valid_pointer; then
        awk -F'\t' -v o="$oid" '$1 == o { print $2 }' "${work}/lfs"
      fi
    done | sort -u > "${work}/raw"
fi

has_lfs=0
command -v git-lfs >/dev/null 2>&1 && has_lfs=1

if [ -s "${work}/raw" ]; then
  {
    echo
    echo "These files belong in Git LFS but were committed as raw bytes (git-lfs was not set up"
    echo "when they were added), so the push is refused:"
    head -n 10 "${work}/raw" | sed 's/^/  /'
    n="$(wc -l < "${work}/raw" | tr -d ' ')"
    [ "$n" -le 10 ] || echo "  … and $((n - 10)) more"
    echo
    [ "$has_lfs" -eq 1 ] || echo "Install git-lfs (https://git-lfs.com) first."
    echo "Run 'git lfs install --skip-repo' once, then rewrite the commits that added them, so the"
    echo "raw bytes do not stay in the history:"
    echo "  last commit:  git add --renormalize -- <the files> && git commit --amend --no-edit"
    echo "  older ones:   git rebase -i <base>, and the same for each 'edit'ed commit"
    echo
  } >&2
  exit 1
fi

# Nothing to upload, or no git-lfs: without it a pointer can only come from an
# existing one (moved, merged, rebased), whose object the remote already has.
[ -s "${work}/lfs" ] && [ "$has_lfs" -eq 1 ] || exit 0

git lfs pre-push "$@" < "${work}/refs"
