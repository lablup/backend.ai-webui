#!/usr/bin/env bash
# Replace Git LFS pointer files under the user manual source with the real
# images, in each given checkout (default: this repository's working tree).
#
# Usage: pull-docs-images.sh [--ref <rev>] [--remote <name|url>]...
#                            [--fallback-remote <url>]... [<worktree-dir>...]
#
#   --ref              revision whose LFS objects to fetch in one batch (default:
#                      HEAD). Pass it when the docs source was checked out from
#                      another commit (`git checkout <rev> -- <src>`); files are
#                      always restored from the index.
#   --remote           remote name or URL to fetch from; repeatable, tried in
#                      order. Default: origin, else the first remote.
#   --fallback-remote  URL tried, anonymously, after those when they lack objects
#                      (a fork PR's head repository). Images it supplies are
#                      materialized, but the run then exits 3: builds of the base
#                      repository's branches fetch only from the base repository.
#
# Covers both layouts: packages/backend.ai-webui-docs/src on normal branches and
# src/ on docs-archive/* branches. Without pointer files it exits 0 at once and
# does not need git-lfs. Otherwise it installs git-lfs if missing, overrides
# lfs.fetchexclude from .lfsconfig, configures the LFS filter per command only
# (never in any git config file), and fails if a pointer file remains.
# Exit codes: 0 done · 1 failure (files unchanged or restored) · 3 see above.
set -euo pipefail

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=SCRIPTDIR/lib.sh
. "${HERE}/lib.sh"

REF="HEAD"
REMOTES=()
FALLBACKS=()
DIRS=()
while [ $# -gt 0 ]; do
  case "$1" in
    --ref) REF="${2:?--ref needs a value}"; shift 2 ;;
    --remote) REMOTES+=("${2:?--remote needs a value}"); shift 2 ;;
    --fallback-remote) FALLBACKS+=("${2:?--fallback-remote needs a value}"); shift 2 ;;
    -h|--help) sed -n '2,24p' "$0"; exit 0 ;;
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

pick_remotes() {
  local top="$1"
  if [ ${#REMOTES[@]} -gt 0 ]; then printf '%s\n' "${REMOTES[@]}"; return; fi
  if git -C "$top" remote get-url origin >/dev/null 2>&1; then echo origin; return; fi
  git -C "$top" remote | head -n1
}

report_pointers() {
  local list="$1" n
  n="$(wc -l < "$list" | tr -d ' ')"
  head -n 10 "$list" | sed 's/^/  /' >&2
  [ "$n" -le 10 ] || echo "  … and $((n - 10)) more" >&2
}

fail_on_untracked() { # <top> <file listing untracked pointer files>
  [ -s "$2" ] || return 0
  log "ERROR: $1: untracked files hold Git LFS pointer text, which the docs build rejects; replace or delete them:" >&2
  report_pointers "$2"
  exit 1
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
  # Only tracked files can be restored from the index. Untracked pointer text is
  # left alone, but fails the run at the end: every consumer would reject it.
  git -C "$top" ls-files -z -- "${roots[@]}" | tr '\0' '\n' | LC_ALL=C sort > "${work}/tracked"
  (cd "$top" && lfs_find_pointer_files "${roots[@]}") | LC_ALL=C sort > "${work}/found"
  LC_ALL=C comm -12 "${work}/found" "${work}/tracked" > "$list"
  LC_ALL=C comm -23 "${work}/found" "${work}/tracked" > "${work}/untracked"
  n="$(wc -l < "$list" | tr -d ' ')"
  if [ "$n" -eq 0 ]; then
    fail_on_untracked "$top" "${work}/untracked"
    log "${top}: no LFS files — nothing to do"
    rm -rf "$work"
    return 0
  fi
  log "${top}: ${n} LFS pointer file(s) under ${roots[*]}"

  ensure_git_lfs
  local remotes=()
  while IFS= read -r remote; do [ -z "$remote" ] || remotes+=("$remote"); done < <(pick_remotes "$top")
  [ ${#remotes[@]} -gt 0 ] || { log "${top} has no git remote to fetch LFS objects from." >&2; exit 1; }

  local includes=()
  for root in "${roots[@]}"; do includes+=("${root}/**"); done
  # git-lfs installs its hooks wherever core.hooksPath points; keep them out of
  # the checkout, whose later git commands would run them without git-lfs on PATH.
  local hooks="${work}/hooks"
  mkdir -p "$hooks"
  # A fetch that misses objects still downloads the rest, so each later remote
  # only fills in what the earlier ones lacked. A fallback URL is fetched without
  # the base repository's credentials (actions/checkout's extraheader).
  lfs_fetch() { # <remote> [git -c options...]
    local from="$1"; shift
    log "fetching LFS objects of ${REF} from ${from}"
    git -C "$top" -c core.hooksPath="$hooks" "$@" \
      lfs fetch --include="$(IFS=,; echo "${includes[*]}")" --exclude="" "$from" "$REF"
  }
  local r fetched=0 via_fallback=0
  for r in "${remotes[@]}"; do
    if lfs_fetch "$r"; then fetched=1; break; fi
    log "warning: fetching from ${r} was incomplete" >&2
  done
  if [ "$fetched" -eq 0 ]; then
    for r in ${FALLBACKS[@]+"${FALLBACKS[@]}"}; do
      if lfs_fetch "$r" -c "http.${r}.extraheader="; then fetched=1; via_fallback=1; break; fi
      log "warning: fetching from ${r} was incomplete" >&2
    done
  fi
  if [ "$fetched" -eq 0 ]; then
    log "ERROR: ${top}: the LFS objects of ${REF} are not all available from: ${remotes[*]} ${FALLBACKS[*]:-}; nothing was changed." >&2
    log "For a fork PR's images, add --fallback-remote <the fork's clone URL>." >&2
    rm -rf "$work"
    exit 1
  fi

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
  if ! "${lfs_git[@]}" checkout --pathspec-from-file="${list}.nul" --pathspec-file-nul; then
    if git -C "$top" --literal-pathspecs -c filter.lfs.required=false \
      checkout --pathspec-from-file="${list}.nul" --pathspec-file-nul; then
      log "ERROR: ${top}: the LFS checkout failed; the pointer files were restored." >&2
    else
      log "ERROR: ${top}: the LFS checkout failed and restoring the pointer files failed too; run 'git checkout -- ${roots[*]}' to restore them." >&2
    fi
    rm -rf "$work"
    exit 1
  fi
  # Files written in the same second as the index are re-hashed by later git
  # commands, which without the clean filter would see them as modified.
  # Refreshing with the filter, once they are no longer racy, records them clean.
  sleep 1
  "${lfs_git[@]}" update-index -q --refresh >/dev/null || true

  local missing=0 path
  while IFS= read -r path; do
    [ -f "${top}/${path}" ] || { echo "  missing after checkout: ${path}" >&2; missing=1; }
  done < "$list"
  (cd "$top" && lfs_find_pointer_files "${roots[@]}") | LC_ALL=C sort | LC_ALL=C comm -12 - "${work}/tracked" > "$list"
  n="$(wc -l < "$list" | tr -d ' ')"
  if [ "$n" -gt 0 ] || [ "$missing" -ne 0 ]; then
    log "ERROR: ${top}: ${n} file(s) are still Git LFS pointers after the pull:" >&2
    report_pointers "$list"
    log "Check network access to the LFS server, then re-run this script. 'git checkout -- <path>' restores a missing file." >&2
    exit 1
  fi
  log "${top}: materialized all LFS images"
  fail_on_untracked "$top" "${work}/untracked"
  if [ "$via_fallback" -eq 1 ]; then
    FALLBACK_USED=1
    log "warning: ${top}: some LFS objects came only from ${r}; ${remotes[*]} does not have them." >&2
  fi

  if [ -z "${CI:-}" ] && [ -z "$(git -C "$top" config --get filter.lfs.process || true)" ]; then
    log "note: git-lfs filters are not configured here. Run 'git lfs install' before committing images."
  fi
  rm -rf "$work"
}

FALLBACK_USED=0
for d in "${DIRS[@]}"; do
  pull_one "$d"
done
[ "$FALLBACK_USED" -eq 0 ] || exit 3
