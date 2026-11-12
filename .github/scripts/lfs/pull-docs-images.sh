#!/usr/bin/env bash
# Replace Git LFS pointer files under the user manual source with the real
# images, in each given checkout (default: this repository's working tree).
#
# Usage: pull-docs-images.sh [--ref <rev>] [--remote <name|url>]...
#                            [--fallback-remote <url>]... [--fallback-report <file>]
#                            [--root <dir>]... [<worktree-dir>...]
#
#   --root             directory, relative to the checkout, to pull instead of the
#                      user manual source; repeatable (the backend.ai-ui visual
#                      test baselines use it).
#   --ref              revision whose LFS objects to fetch in one batch (default:
#                      HEAD). Pass it when the docs source was checked out from
#                      another commit (`git checkout <rev> -- <src>`); files are
#                      always restored from the index.
#   --remote           remote name or URL to fetch from; repeatable, tried in
#                      order. Default: origin, else the first remote.
#   --fallback-remote  URL tried, anonymously, after those when they lack objects
#                      (a fork PR's head repository).
#   --fallback-report  file to which a line `<checkout><TAB><url>` is appended when
#                      a fallback supplied objects the remotes lack: builds of the
#                      base repository's branches fetch from the base repository
#                      only, so the caller decides what to do about it.
#
# Covers both layouts: packages/backend.ai-webui-docs/src on normal branches and
# src/ on docs-archive/* branches. Without pointer files it exits 0 at once and
# does not need git-lfs. Otherwise it installs git-lfs if missing, overrides
# lfs.fetchexclude from .lfsconfig, configures the LFS filter per command only
# (never in any git config file), and fails if a pointer file remains.
# Objects already in local LFS storage (a CI cache) are hashed and not fetched
# again; a corrupted one is re-downloaded. Every image written is checked against
# its pointer's oid. One line per checkout reports the objects needed, already
# local and downloaded.
set -euo pipefail

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=SCRIPTDIR/lib.sh
. "${HERE}/lib.sh"

REF="HEAD"
REMOTES=()
FALLBACKS=()
FALLBACK_REPORT=""
ROOTS=()
DIRS=()
while [ $# -gt 0 ]; do
  case "$1" in
    --ref) REF="${2:?--ref needs a value}"; shift 2 ;;
    --remote) REMOTES+=("${2:?--remote needs a value}"); shift 2 ;;
    --fallback-remote) FALLBACKS+=("${2:?--fallback-remote needs a value}"); shift 2 ;;
    --fallback-report) FALLBACK_REPORT="${2:?--fallback-report needs a value}"; shift 2 ;;
    --root) ROOTS+=("${2:?--root needs a value}"); shift 2 ;;
    -h|--help) sed -n '2,33p' "$0"; exit 0 ;;
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
  [ -z "$dir" ] || { export PATH="${dir}:${PATH}"; LFS_RUN_ONLY_DIR="$dir"; }
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

# On any exit, including Ctrl-C or a cancelled job: remove the temp dir, and
# put back the pointer files when they were deleted but not yet checked out.
CUR_WORK="" RESTORE_TOP="" RESTORE_LIST="" LFS_RUN_ONLY_DIR="" LFS_RUN_ONLY_NOTED=0
on_exit() {
  if [ -n "$RESTORE_LIST" ]; then
    if git -C "$RESTORE_TOP" --literal-pathspecs -c filter.lfs.required=false \
      checkout --pathspec-from-file="$RESTORE_LIST" --pathspec-file-nul >/dev/null 2>&1; then
      log "${RESTORE_TOP}: stopped before the images were checked out; the pointer files were restored." >&2
    else
      log "ERROR: ${RESTORE_TOP}: stopped before the images were checked out, and restoring the pointer files failed; run 'git checkout -- <docs src>' there." >&2
    fi
  fi
  [ -z "$CUR_WORK" ] || rm -rf "$CUR_WORK"
}
trap on_exit EXIT
trap 'exit 130' INT
trap 'exit 143' TERM

pull_one() {
  local dir="$1" top roots=() root remote work list attrs n
  top="$(git -C "$dir" rev-parse --show-toplevel)"
  if [ ${#ROOTS[@]} -gt 0 ]; then
    for root in "${ROOTS[@]}"; do [ ! -d "${top}/${root}" ] || roots+=("$root"); done
  else
    while IFS= read -r root; do roots+=("$root"); done < <(lfs_docs_roots "$top")
  fi
  if [ ${#roots[@]} -eq 0 ]; then
    log "${top}: no ${ROOTS[*]:-user manual source} here — nothing to do"
    return 0
  fi

  work="$(mktemp -d)"
  CUR_WORK="$work"
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
  # The objects the staged pointers name. git-lfs does not hash an object it
  # finds in local storage (a CI cache restores that storage), neither when
  # fetching nor when smudging, so each local object is hashed here and a
  # corrupted one deleted, which makes the fetch download it again.
  local store needed="${work}/needed" have="${work}/have" bad="${work}/bad"
  local n_needed n_local n_bad n_dl=0 dl_bytes=0
  store="$(git -C "$top" lfs env 2>/dev/null | sed -n 's/^LocalMediaDir=//p')"
  [ -n "$store" ] || { log "ERROR: ${top}: git lfs env does not name the local object storage." >&2; exit 1; }
  lfs_index_pointers "$top" "$list" > "${work}/pointers.idx"
  if awk -F '\t' '$1 == "" { found = 1 } END { exit !found }' "${work}/pointers.idx"; then
    log "ERROR: ${top}: some pointer files have no valid Git LFS pointer staged (an unmerged path?):" >&2
    awk -F '\t' '$1 == "" { print $3 }' "${work}/pointers.idx" > "${work}/unstaged"
    report_pointers "${work}/unstaged"
    exit 1
  fi
  cut -f1,2 "${work}/pointers.idx" | LC_ALL=C sort -u > "$needed"
  n_needed="$(wc -l < "$needed" | tr -d ' ')"
  # CI prunes its cached store to the objects the build used (prune-lfs-store.sh).
  [ -z "${LFS_USED_OIDS_FILE:-}" ] || cut -f1 "$needed" >> "$LFS_USED_OIDS_FILE"
  local oid size
  while IFS=$'\t' read -r oid size; do
    [ ! -f "${store}/${oid:0:2}/${oid:2:2}/${oid}" ] || printf '%s\t%s/%s/%s\n' "$oid" "${oid:0:2}" "${oid:2:2}" "$oid"
  done < "$needed" > "$have"
  lfs_hash_mismatches "$store" "$have" > "$bad"
  n_bad="$(wc -l < "$bad" | tr -d ' ')"
  if [ "$n_bad" -gt 0 ]; then
    log "warning: ${top}: ${n_bad} local LFS object(s) do not match their oid; discarding them" >&2
    (cd "$store" && tr '\n' '\0' < "$bad" | xargs -0 rm -f)
  fi
  n_local="$(( $(wc -l < "$have" | tr -d ' ') - n_bad ))"

  local r fetched=0 via_fallback=0
  if [ "$n_local" -eq "$n_needed" ]; then
    fetched=1
    remotes=()
  fi
  for r in ${remotes[@]+"${remotes[@]}"}; do
    if lfs_fetch "$r"; then fetched=1; break; fi
    log "warning: fetching from ${r} was incomplete" >&2
  done
  if [ "$fetched" -eq 0 ]; then
    for r in ${FALLBACKS[@]+"${FALLBACKS[@]}"}; do
      # The override must cover the LFS endpoint `<repo>.git/info/lfs`, so it is
      # keyed on the URL with and without `.git`.
      local base="${r%/}"; base="${base%.git}"
      if lfs_fetch "$r" -c "http.${base}.extraheader=" -c "http.${base}.git.extraheader="; then
        fetched=1; via_fallback=1; break
      fi
      log "warning: fetching from ${r} was incomplete" >&2
    done
  fi
  if [ "$fetched" -eq 0 ]; then
    log "ERROR: ${top}: the LFS objects of ${REF} are not all available from: ${remotes[*]} ${FALLBACKS[*]:-}; nothing was changed." >&2
    log "For a fork PR's images, add --fallback-remote <the fork's clone URL>." >&2
    rm -rf "$work"
    exit 1
  fi
  if [ "$n_local" -lt "$n_needed" ]; then
    while IFS=$'\t' read -r oid size; do
      [ -f "${store}/${oid:0:2}/${oid:2:2}/${oid}" ] || continue
      n_dl=$((n_dl + 1)); dl_bytes=$((dl_bytes + size))
    done < <(awk -F '\t' 'FILENAME == ARGV[1] { sub(/.*\//, ""); bad[$0] = 1; next }
      FILENAME == ARGV[2] { if (!($1 in bad)) ok[$1] = 1; next }
      !($1 in ok)' "$bad" "$have" "$needed")
  fi
  log "${top}: LFS objects: ${n_needed} needed, ${n_local} already local, ${n_dl} downloaded ($(awk -v b="$dl_bytes" 'BEGIN { printf "%.1f MiB", b / 1048576 }'), ${dl_bytes} bytes)$([ "$n_bad" -eq 0 ] || echo ", ${n_bad} corrupted local object(s) replaced")"

  # Restore from the index through the LFS smudge filter. The attributes file
  # covers checkouts whose .gitattributes does not mark the images (yet). It
  # names only the pointer paths (glob chars escaped, a path with whitespace
  # C-quoted): a wildcard would let git's index refresh run the clean filter over
  # unrelated files.
  attrs="${work}/attributes"
  sed -E -e 's/[][*?\\]/\\&/g' -e '/[[:space:]]|^"/{ s/[\\"]/\\&/g; s/.*/"&"/; }' \
    -e 's/$/ filter=lfs diff=lfs merge=lfs -text/' "$list" > "$attrs"
  tr '\n' '\0' < "$list" > "${list}.nul"
  RESTORE_TOP="$top" RESTORE_LIST="${list}.nul"
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
    RESTORE_LIST=""
    if git -C "$top" --literal-pathspecs -c filter.lfs.required=false \
      checkout --pathspec-from-file="${list}.nul" --pathspec-file-nul; then
      log "ERROR: ${top}: the LFS checkout failed; the pointer files were restored." >&2
    else
      log "ERROR: ${top}: the LFS checkout failed and restoring the pointer files failed too; run 'git checkout -- ${roots[*]}' to restore them." >&2
    fi
    rm -rf "$work"
    exit 1
  fi
  RESTORE_LIST=""
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
  cut -f1,3 "${work}/pointers.idx" > "${work}/files.map"
  lfs_hash_mismatches "$top" "${work}/files.map" > "$bad"
  n="$(wc -l < "$bad" | tr -d ' ')"
  if [ "$n" -gt 0 ]; then
    log "ERROR: ${top}: ${n} file(s) do not match the oid of their LFS pointer:" >&2
    report_pointers "$bad"
    awk -F '\t' 'NR == FNR { b[$0] = 1; next } $2 in b { print substr($1, 1, 2) "/" substr($1, 3, 2) "/" $1 }' \
      "$bad" "${work}/files.map" | (cd "$store" && tr '\n' '\0' | xargs -0 rm -f)
    # Back to pointer text, so that a re-run pulls them again.
    local restored=1
    while IFS= read -r path; do
      if git -C "$top" cat-file blob ":${path}" > "${work}/pointer" 2>/dev/null; then
        cp "${work}/pointer" "${top}/${path}"
      else
        restored=0; echo "  could not restore the pointer of: ${path}" >&2
      fi
    done < "$bad"
    if [ "$restored" -eq 1 ]; then
      log "Their local objects were deleted and the files are pointers again; re-run this script to download them." >&2
    else
      log "Their local objects were deleted; run 'git checkout -- <path>' on the files listed, then re-run this script." >&2
    fi
    exit 1
  fi
  log "${top}: materialized all LFS images (each checked against its oid)"
  fail_on_untracked "$top" "${work}/untracked"
  if [ "$via_fallback" -eq 1 ]; then
    log "warning: ${top}: some LFS objects came only from ${r}; ${remotes[*]} does not have them." >&2
    [ -z "$FALLBACK_REPORT" ] || printf '%s\t%s\n' "$top" "$r" >> "$FALLBACK_REPORT"
  fi

  if [ -z "${CI:-}" ] && [ -n "$LFS_RUN_ONLY_DIR" ] && [ "$LFS_RUN_ONLY_NOTED" -eq 0 ]; then
    log "note: git-lfs is not on your PATH; this run used a copy in ${LFS_RUN_ONLY_DIR}. To commit images, install git-lfs (https://git-lfs.com) or add that directory to PATH."
    LFS_RUN_ONLY_NOTED=1
  fi
  if [ -z "${CI:-}" ] && [ -z "$(git -C "$top" config --get filter.lfs.process || true)" ]; then
    log "note: git-lfs filters are not configured here. Run 'git lfs install --skip-repo' before committing images."
  fi
  rm -rf "$work"
}

for d in "${DIRS[@]}"; do
  pull_one "$d"
done
