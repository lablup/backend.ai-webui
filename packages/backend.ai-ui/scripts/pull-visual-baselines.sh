#!/usr/bin/env bash
# Replaces the Git LFS pointer files among the visual test baselines with the
# images (ADR 0031), each checked against its pointer's oid.
#
# Usage: pull-visual-baselines.sh [--ref <rev>] [--remote <name|url>]...
#                                 [--fallback-remote <url>]... [--fallback-report <file>]
#                                 [<dir>]
#
#   --ref              revision whose LFS objects to fetch (default: HEAD)
#   --remote           remote to fetch from, tried in order; default: the current
#                      branch's upstream remote, then origin
#   --fallback-remote  URL fetched without credentials for objects still missing
#   --fallback-report  file to which `<path><TAB><url>` is appended for every
#                      baseline that only a fallback supplied
#   <dir>              baselines directory relative to the repository root
#                      (default: packages/backend.ai-ui/test/visual/__screenshots__)
set -euo pipefail

repo="$(git -C "$(dirname "${BASH_SOURCE[0]}")" rev-parse --show-toplevel)"
# shellcheck source=SCRIPTDIR/../../../.github/scripts/lfs/lib.sh
. "$repo/.github/scripts/lfs/lib.sh"

ref=HEAD remotes=() fallbacks=() report="" dir=""
while [ $# -gt 0 ]; do
  case "$1" in
    --ref) ref="${2:?--ref needs a value}"; shift 2 ;;
    --remote) remotes+=("${2:?--remote needs a value}"); shift 2 ;;
    --fallback-remote) fallbacks+=("${2:?--fallback-remote needs a value}"); shift 2 ;;
    --fallback-report) report="${2:?--fallback-report needs a value}"; shift 2 ;;
    -h|--help) sed -n '2,17p' "$0"; exit 0 ;;
    -*) echo "Unknown option: $1" >&2; exit 2 ;;
    *) [ -z "$dir" ] || { echo "Only one directory may be given." >&2; exit 2; }; dir="${1%/}"; shift ;;
  esac
done

log() { echo "[pull-visual-baselines] $*"; }

if [ -n "$dir" ]; then
  [ -d "$repo/$dir" ] || { log "ERROR: $dir is not a directory." >&2; exit 1; }
else
  dir=packages/backend.ai-ui/test/visual/__screenshots__
fi

pointers() { (cd "$repo" && lfs_find_pointer_files "$dir") | LC_ALL=C sort; }
found="$(pointers)"
[ -n "$found" ] || exit 0

if ! git lfs version >/dev/null 2>&1; then
  if [ "$(uname -s) $(uname -m)" != "Linux x86_64" ]; then
    echo "git-lfs is required for the visual test baselines: install it (https://git-lfs.com), run 'git lfs install --skip-repo', and retry." >&2
    exit 1
  fi
  bin="$(bash "$repo/.github/scripts/lfs/install-git-lfs.sh")"
  [ -z "$bin" ] || export PATH="$bin:$PATH"
  git lfs version >/dev/null 2>&1 || { log "ERROR: git-lfs is still not runnable after installing it." >&2; exit 1; }
fi

work="$(mktemp -d)" restore=""
on_exit() {
  if [ -n "$restore" ]; then
    if git -C "$repo" --literal-pathspecs -c filter.lfs.required=false \
      checkout --pathspec-from-file="$restore" --pathspec-file-nul >/dev/null 2>&1; then
      log "stopped before the baselines were checked out; the pointer files were restored." >&2
    else
      log "ERROR: stopped before the baselines were checked out; run 'git checkout -- $dir' to restore them." >&2
    fi
  fi
  rm -rf "$work"
}
trap on_exit EXIT
trap 'exit 130' INT
trap 'exit 143' TERM

name_files() { head -n 10 "$1" | sed 's/^/  /' >&2; [ "$(wc -l < "$1")" -le 10 ] || echo "  … and more" >&2; }

git -C "$repo" -c core.quotePath=false ls-files -- "$dir" | LC_ALL=C sort > "$work/tracked"
printf '%s\n' "$found" | LC_ALL=C comm -23 - "$work/tracked" > "$work/untracked"
if [ -s "$work/untracked" ]; then
  log "ERROR: untracked files hold Git LFS pointer text; replace or delete them:" >&2
  name_files "$work/untracked"
  exit 1
fi
printf '%s\n' "$found" > "$work/list"
log "$(wc -l < "$work/list" | tr -d ' ') baseline(s) are Git LFS pointers"

lfs_index_pointers "$repo" "$work/list" > "$work/idx"
if awk -F '\t' '$1 == "" { bad = 1 } END { exit !bad }' "$work/idx"; then
  log "ERROR: these baselines have no valid Git LFS pointer staged:" >&2
  awk -F '\t' '$1 == "" { print $3 }' "$work/idx" > "$work/unstaged"
  name_files "$work/unstaged"
  exit 1
fi
cut -f1 "$work/idx" | LC_ALL=C sort -u > "$work/needed"
[ -z "${LFS_USED_OIDS_FILE:-}" ] || cat "$work/needed" >> "$LFS_USED_OIDS_FILE"

store="$(git -C "$repo" lfs env 2>/dev/null | sed -n 's/^LocalMediaDir=//p')"
[ -n "$store" ] || { log "ERROR: git lfs env does not name the local object storage." >&2; exit 1; }
obj() { printf '%s/%s/%s' "${1:0:2}" "${1:2:2}" "$1"; }
missing_objects() {
  local oid
  while IFS= read -r oid; do [ -f "$store/$(obj "$oid")" ] || echo "$oid"; done < "$work/needed"
}

while IFS= read -r oid; do
  [ ! -f "$store/$(obj "$oid")" ] || printf '%s\t%s\n' "$oid" "$(obj "$oid")"
done < "$work/needed" > "$work/have"
lfs_hash_mismatches "$store" "$work/have" > "$work/corrupt"
if [ -s "$work/corrupt" ]; then
  log "warning: $(wc -l < "$work/corrupt" | tr -d ' ') corrupted local object(s) discarded; fetching them again" >&2
  (cd "$store" && tr '\n' '\0' < "$work/corrupt" | xargs -0 rm -f)
fi

mkdir -p "$work/hooks"
fetch() { # <remote> [git -c options...]
  local from="$1"; shift
  log "fetching the baselines of $ref from $from"
  git -C "$repo" -c core.hooksPath="$work/hooks" "$@" \
    lfs fetch --include="$dir/**" --exclude="" "$from" "$ref" || log "warning: fetching from $from was incomplete" >&2
}

if [ ${#remotes[@]} -eq 0 ]; then
  branch="$(git -C "$repo" symbolic-ref -q --short HEAD || true)"
  upstream="$([ -z "$branch" ] || git -C "$repo" config --get "branch.$branch.remote" || true)"
  [ -z "$upstream" ] || [ "$upstream" = . ] || [ "$upstream" = origin ] || remotes+=("$upstream")
  if git -C "$repo" remote get-url origin >/dev/null 2>&1; then
    remotes+=(origin)
  elif [ ${#remotes[@]} -eq 0 ]; then
    first="$(git -C "$repo" remote | head -n 1)"
    [ -z "$first" ] || remotes+=("$first")
  fi
fi
[ ${#remotes[@]} -gt 0 ] || { log "ERROR: no git remote to fetch the baselines from." >&2; exit 1; }

for r in "${remotes[@]}"; do
  [ -n "$(missing_objects)" ] || break
  fetch "$r"
done
: > "$work/from-fallback"
for r in ${fallbacks[@]+"${fallbacks[@]}"}; do
  missing_objects > "$work/before"
  [ -s "$work/before" ] || break
  base="${r%/}"; base="${base%.git}"
  fetch "$r" -c "http.$base.extraheader=" -c "http.$base.git.extraheader="
  missing_objects | LC_ALL=C comm -23 "$work/before" - |
    awk -F '\t' -v url="$r" 'NR == FNR { got[$1] = 1; next } $1 in got { print $3 "\t" url }' - "$work/idx" >> "$work/from-fallback"
done

missing_objects > "$work/missing"
if [ -s "$work/missing" ]; then
  awk -F '\t' 'NR == FNR { m[$1] = 1; next } $1 in m { print $3 }' "$work/missing" "$work/idx" > "$work/unfetched"
  log "ERROR: no remote has the Git LFS objects of these baselines (${remotes[*]} ${fallbacks[*]:-}):" >&2
  name_files "$work/unfetched"
  exit 1
fi

tr '\n' '\0' < "$work/list" > "$work/list.nul"
restore="$work/list.nul"
(cd "$repo" && xargs -0 rm -f < "$work/list.nul")
lfs_git=(env -u GIT_LFS_SKIP_SMUDGE git -C "$repo" --literal-pathspecs
  -c core.hooksPath="$work/hooks"
  -c filter.lfs.process="git-lfs filter-process"
  -c filter.lfs.smudge="git-lfs smudge -- %f"
  -c filter.lfs.clean="git-lfs clean -- %f"
  -c filter.lfs.required=true
  -c lfs.fetchexclude=)
"${lfs_git[@]}" checkout --pathspec-from-file="$work/list.nul" --pathspec-file-nul ||
  { log "ERROR: the Git LFS checkout failed." >&2; exit 1; }
restore=""
sleep 1
"${lfs_git[@]}" update-index -q --refresh >/dev/null || true

pointers > "$work/left"
if [ -s "$work/left" ]; then
  log "ERROR: these baselines are still Git LFS pointers after the pull:" >&2
  name_files "$work/left"
  exit 1
fi
cut -f1,3 "$work/idx" > "$work/map"
lfs_hash_mismatches "$repo" "$work/map" > "$work/bad"
if [ -s "$work/bad" ]; then
  log "ERROR: these baselines do not match the oid of their Git LFS pointer:" >&2
  name_files "$work/bad"
  awk -F '\t' 'NR == FNR { b[$0] = 1; next } $2 in b { print $1 }' "$work/bad" "$work/map" |
    while IFS= read -r oid; do rm -f "$store/$(obj "$oid")"; done
  while IFS= read -r path; do git -C "$repo" cat-file blob ":$path" > "$repo/$path"; done < "$work/bad"
  log "Their local objects were deleted and the files are pointers again; re-run this script to download them." >&2
  exit 1
fi
log "pulled $(wc -l < "$work/list" | tr -d ' ') baseline(s), each checked against its oid"

if [ -s "$work/from-fallback" ]; then
  log "warning: $(wc -l < "$work/from-fallback" | tr -d ' ') baseline(s) came only from a fallback remote; ${remotes[*]} does not have them." >&2
  [ -z "$report" ] || cat "$work/from-fallback" >> "$report"
fi
