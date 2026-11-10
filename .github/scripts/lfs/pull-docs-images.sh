#!/usr/bin/env bash
# Replace Git LFS pointer files under the user manual source with the real
# images, in each given checkout (default: this repository's working tree).
#
# Usage: pull-docs-images.sh [--ref <rev>] [--remote <name>] [<worktree-dir>...]
#
#   --ref     revision whose LFS objects to fetch in one batch (default: HEAD).
#             Pass it when the docs source was checked out from another commit
#             (`git checkout <rev> -- <src>`); files are always restored from
#             the index, so a wrong --ref costs only extra downloads.
#   --remote  remote to fetch from (default: origin, else the first remote).
#
# Covers both layouts: packages/backend.ai-webui-docs/src on normal branches and
# src/ on docs-archive/* branches. Without pointer files it exits 0 at once and
# does not need git-lfs. Otherwise it installs git-lfs if missing, overrides
# lfs.fetchexclude from .lfsconfig, configures the LFS filter per command only
# (never in any git config file), and fails if a pointer file remains.
set -euo pipefail

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=SCRIPTDIR/lib.sh
. "${HERE}/lib.sh"

REF="HEAD"
REMOTE=""
DIRS=()
while [ $# -gt 0 ]; do
  case "$1" in
    --ref) REF="${2:?--ref needs a value}"; shift 2 ;;
    --remote) REMOTE="${2:?--remote needs a value}"; shift 2 ;;
    -h|--help) sed -n '2,17p' "$0"; exit 0 ;;
    -*) echo "Unknown option: $1" >&2; exit 2 ;;
    *) DIRS+=("$1"); shift ;;
  esac
done
[ ${#DIRS[@]} -gt 0 ] || DIRS=(".")

log() { echo "[pull-docs-images] $*"; }

ensure_git_lfs() {
  git lfs version >/dev/null 2>&1 && return 0
  local dir
  dir="$(bash "${HERE}/install-git-lfs.sh")"
  [ -z "$dir" ] || export PATH="${dir}:${PATH}"
  git lfs version >/dev/null 2>&1 || { log "git-lfs is still not runnable after installing it." >&2; exit 1; }
}

pick_remote() {
  local top="$1"
  if [ -n "$REMOTE" ]; then echo "$REMOTE"; return; fi
  if git -C "$top" remote get-url origin >/dev/null 2>&1; then echo origin; return; fi
  git -C "$top" remote | head -n1
}

report_pointers() {
  local list="$1" n
  n="$(wc -l < "$list" | tr -d ' ')"
  head -n 10 "$list" | sed 's/^/  /' >&2
  [ "$n" -le 10 ] || echo "  … and $((n - 10)) more" >&2
}

pull_one() {
  local dir="$1" top roots=() root remote work list attrs n
  top="$(git -C "$dir" rev-parse --show-toplevel)"
  while IFS= read -r root; do roots+=("$root"); done < <(lfs_docs_roots "$top")
  if [ ${#roots[@]} -eq 0 ]; then
    log "${top}: no user manual source here — nothing to do"
    return 0
  fi

  work="$(mktemp -d)"
  list="${work}/pointers"
  (cd "$top" && lfs_find_pointer_files "${roots[@]}") > "$list"
  n="$(wc -l < "$list" | tr -d ' ')"
  if [ "$n" -eq 0 ]; then
    log "${top}: no LFS files — nothing to do"
    rm -rf "$work"
    return 0
  fi
  log "${top}: ${n} LFS pointer file(s) under ${roots[*]}"

  ensure_git_lfs
  remote="$(pick_remote "$top")"
  [ -n "$remote" ] || { log "${top} has no git remote to fetch LFS objects from." >&2; exit 1; }

  local includes=()
  for root in "${roots[@]}"; do includes+=("${root}/**"); done
  log "fetching LFS objects of ${REF} from ${remote}"
  # git-lfs installs its hooks wherever core.hooksPath points; keep them out of
  # the checkout, whose later git commands would run them without git-lfs on PATH.
  local hooks="${work}/hooks"
  mkdir -p "$hooks"
  git -C "$top" -c core.hooksPath="$hooks" \
    lfs fetch --include="$(IFS=,; echo "${includes[*]}")" --exclude="" "$remote" "$REF"

  # Restore from the index through the LFS smudge filter. The attributes file
  # covers checkouts whose .gitattributes does not mark the images (yet). It
  # names only the pointer paths (glob chars escaped, whitespace as `?`): a `*`
  # would let git's index refresh run the clean filter over unrelated files.
  attrs="${work}/attributes"
  sed 's/[][*?\\]/\\&/g; s/[[:space:]]/?/g; s/$/ filter=lfs diff=lfs merge=lfs -text/' "$list" > "$attrs"
  tr '\n' '\0' < "$list" > "${list}.nul"
  (cd "$top" && tr '\n' '\0' < "$list" | xargs -0 rm -f)
  local lfs_git=(env -u GIT_LFS_SKIP_SMUDGE git -C "$top" --literal-pathspecs
    -c core.attributesFile="$attrs"
    -c core.hooksPath="$hooks"
    -c filter.lfs.process="git-lfs filter-process"
    -c filter.lfs.smudge="git-lfs smudge -- %f"
    -c filter.lfs.clean="git-lfs clean -- %f"
    -c filter.lfs.required=true
    -c lfs.fetchexclude=)
  "${lfs_git[@]}" checkout --pathspec-from-file="${list}.nul" --pathspec-file-nul
  # Files written in the same second as the index are re-hashed by later git
  # commands, which without the clean filter would see them as modified.
  # Refreshing with the filter, once they are no longer racy, records them clean.
  sleep 1
  "${lfs_git[@]}" update-index -q --refresh >/dev/null || true

  local missing=0 path
  while IFS= read -r path; do
    [ -f "${top}/${path}" ] || { echo "  missing after checkout: ${path}" >&2; missing=1; }
  done < "$list"
  (cd "$top" && lfs_find_pointer_files "${roots[@]}") > "$list"
  n="$(wc -l < "$list" | tr -d ' ')"
  if [ "$n" -gt 0 ] || [ "$missing" -ne 0 ]; then
    log "ERROR: ${top}: ${n} file(s) are still Git LFS pointers after the pull:" >&2
    report_pointers "$list"
    log "Check network access to the LFS server of '${remote}', then re-run this script. 'git checkout -- <path>' restores a missing file." >&2
    exit 1
  fi
  log "${top}: materialized all LFS images"

  if [ -z "${CI:-}" ] && [ -z "$(git -C "$top" config --get filter.lfs.process || true)" ]; then
    log "note: git-lfs filters are not configured here. Run 'git lfs install' before committing images."
  fi
  rm -rf "$work"
}

for d in "${DIRS[@]}"; do
  pull_one "$d"
done
