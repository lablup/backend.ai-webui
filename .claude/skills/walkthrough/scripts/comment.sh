#!/usr/bin/env bash
# Post a PR's walkthrough: one comment per PR, edited in place, plus the PR
# description's `## Walkthrough` section.
#
#   comment.sh upsert   --pr N --report <mint.mjs json> [--repo o/r] [--dry-run]
#   comment.sh describe --pr N --report <mint.mjs json> [--not-shown <file>]
#                       [--repo o/r] [--dry-run]
#
# The comment carries exactly one `<!-- bai-walkthrough … -->` marker, no
# `<!-- bai-review -->` marker and no `> 📍` quote block, so the review-pin
# resolver never reads a stop as a finding (FR-3946).
set -euo pipefail

REPO_DEFAULT="lablup/backend.ai-webui"

say() { printf -- '-- walkthrough: %s\n' "$*" >&2; }
die() { printf -- 'comment.sh: %s\n' "$*" >&2; exit 1; }

# ── pure helpers (unit-tested by test-comment.sh) ─────────────────────────────

# marker_key <pr> — the prefix that finds THIS PR's comment. sha/stops/server
# all change on a re-mint, so only `pr=` may be matched on.
marker_key() { printf '<!-- bai-walkthrough v1 pr=%s ' "$1"; }

# marker <pr> <sha> <stops> <server>
marker() {
  printf '<!-- bai-walkthrough v1 pr=%s sha=%s stops=%s server=%s -->' "$1" "$2" "$3" "$4"
}

# diff_anchor <path> — GitHub's per-file anchor in the PR's Files tab.
diff_anchor() { printf 'diff-%s' "$(printf '%s' "$1" | sha256sum | cut -d' ' -f1)"; }

# code_link <repo> <pr> <path> <line> [to]
code_link() {
  local repo=$1 pr=$2 path=$3 line=$4 to=${5:-}
  local range="R$line"
  [ -n "$to" ] && [ "$to" != "null" ] && range="R$line-R$to"
  printf '[%s:%s](https://github.com/%s/pull/%s/files#%s%s)' \
    "$path" "$line" "$repo" "$pr" "$(diff_anchor "$path")" "$range"
}

# code_links <repo> <pr> <code-json> — every ref of one stop, comma-separated.
code_links() {
  local repo=$1 pr=$2 refs=$3 out="" path line to
  [ -n "$refs" ] && [ "$refs" != "null" ] || return 0
  while IFS=$'\t' read -r path line to; do
    [ -n "$path" ] || continue
    [ -n "$out" ] && out+=", "
    out+=$(code_link "$repo" "$pr" "$path" "$line" "$to")
  done < <(jq -r '.[] | [.path, .line, (.to // "")] | @tsv' <<<"$refs")
  printf '%s' "$out"
}

# stop_item <n> <stop-json> <repo> <pr> — one numbered list item. Continuation
# lines carry the two trailing spaces GFM needs to keep them on their own line.
stop_item() {
  local n=$1 stop=$2 repo=$3 pr=$4
  local label kind type ch ck old new links
  label=$(jq -r '.label // ""' <<<"$stop")
  type=$(jq -r '.type // ""' <<<"$stop")
  kind=$(jq -r '.kind // ""' <<<"$stop")
  ch=$(jq -r '.ch // ""' <<<"$stop")
  ck=$(jq -r '.ck // ""' <<<"$stop")
  old=$(jq -r '.old // ""' <<<"$stop")
  new=$(jq -r '.new // ""' <<<"$stop")
  links=$(code_links "$repo" "$pr" "$(jq -c '.code // empty' <<<"$stop")")
  local head="$n. **$label**"
  local tail; tail=$(printf '%s %s' "$type" "$kind"); tail=${tail# }; tail=${tail% }
  [ -n "$tail" ] && head+=" — $tail"
  printf '%s  \n' "$head"
  [ -n "$ch" ] && printf '   %s  \n' "$ch"
  [ -n "$old$new" ] && printf '   `%s` → `%s`  \n' "$old" "$new"
  [ -n "$ck" ] && printf '   check: %s  \n' "$ck"
  [ -n "$links" ] && printf '   code: %s  \n' "$links"
  return 0
}

# comment_body <report-json> <repo> — the whole comment.
comment_body() {
  local report=$1 repo=$2
  local pr sha stops server link n stop
  pr=$(jq -r '.pr' <<<"$report")
  sha=$(jq -r '.sha' <<<"$report")
  server=$(jq -r '.app' <<<"$report")
  link=$(jq -r '.setLink' <<<"$report")
  # A stop that did not resolve has no mark to walk to: it is counted and
  # listed under "Could not pin", never numbered in the walkthrough.
  stops=$(jq -r '[.stops[] | select(.ok)] | length' <<<"$report")
  printf '%s\n' "$(marker "$pr" "$sha" "$stops" "$server")"
  printf '📍 **Walkthrough · %s stops · %s** — [Open the walkthrough](%s)\n' \
    "$stops" "${sha:0:7}" "$link"
  printf 'Served by `%s`.\n\n' "$server"
  n=1
  while IFS= read -r stop; do
    [ -n "$stop" ] || continue
    stop_item "$n" "$stop" "$repo" "$pr"
    n=$((n + 1))
  done < <(jq -c '.stops[] | select(.ok)' <<<"$report")
  if [ "$(jq -r '.couldNotPin | length' <<<"$report")" != 0 ]; then
    printf '\nCould not pin (check by hand):\n'
    jq -r '.couldNotPin[] | "- \(.label) — check: \(.ck)"' <<<"$report"
  fi
}

# describe_body <pr-body> <section> — the body with `## Walkthrough` replaced
# in place, or appended when it has none. Nothing else is touched.
describe_body() {
  local body=$1 section=$2
  if ! grep -qE '^## Walkthrough[[:space:]]*$' <<<"$body"; then
    printf '%s\n\n%s\n' "${body%$'\n'}" "${section%$'\n'}"
    return 0
  fi
  BAI_WT_SECTION=$section awk '
    /^## Walkthrough[[:space:]]*$/ && !done { printf "%s\n", ENVIRON["BAI_WT_SECTION"]; skip = 1; done = 1; next }
    skip && /^## / { skip = 0 }
    !skip { print }
  ' <<<"$body"
}

# walkthrough_section <comment-url> <not-shown-file>
walkthrough_section() {
  local url=$1 file=${2:-} line
  printf '## Walkthrough\n\n'
  printf -- '- [Walkthrough](%s)\n' "$url"
  if [ -n "$file" ] && [ -s "$file" ]; then
    printf '\nNot shown in the walkthrough:\n\n'
    while IFS= read -r line; do
      [ -n "${line// /}" ] || continue
      case "$line" in -\ *) printf '%s\n' "$line" ;; *) printf -- '- %s\n' "$line" ;; esac
    done <"$file"
  fi
}

# ── GitHub ───────────────────────────────────────────────────────────────────

# find_comment <repo> <pr> <marker-key> — the id of this PR's walkthrough
# comment, empty when it has none. The key reaches jq through the environment.
find_comment() {
  BAI_WT_KEY=$3 gh api "repos/$1/issues/$2/comments?per_page=100" --paginate \
    --jq 'map(select(.body | contains(env.BAI_WT_KEY))) | .[0].id // empty' 2>/dev/null \
    | head -1 || true
}

# upsert_comment <repo> <pr> <marker-key> <body> — echoes "<id><TAB><html_url>".
upsert_comment() {
  local id; id=$(find_comment "$1" "$2" "$3")
  if [ -n "$id" ]; then
    gh api -X PATCH "repos/$1/issues/comments/$id" -f body="$4" --jq '[.id, .html_url] | @tsv'
  else
    gh api -X POST "repos/$1/issues/$2/comments" -f body="$4" --jq '[.id, .html_url] | @tsv'
  fi
}

pr_body() { gh api "repos/$1/pulls/$2" --jq '.body // ""'; }
set_pr_body() { gh api -X PATCH "repos/$1/pulls/$2" -f body="$3" --jq '.number' >/dev/null; }

# ── subcommands ──────────────────────────────────────────────────────────────

REPORT=""; PR=""; REPO="$REPO_DEFAULT"; NOT_SHOWN=""; DRY=0

parse_args() {
  while [ $# -gt 0 ]; do
    case $1 in
      --pr) PR=${2:?--pr needs a value}; shift 2 ;;
      --report) REPORT=${2:?--report needs a value}; shift 2 ;;
      --repo) REPO=${2:?--repo needs a value}; shift 2 ;;
      --not-shown) NOT_SHOWN=${2:?--not-shown needs a value}; shift 2 ;;
      --dry-run) DRY=1; shift ;;
      *) die "unknown argument '$1'" ;;
    esac
  done
  [ -n "$REPORT" ] || die "--report <json> is required"
  [ -f "$REPORT" ] || die "no report at $REPORT"
  [ -n "$PR" ] || PR=$(jq -r '.pr // empty' "$REPORT")
  [ -n "$PR" ] || die "--pr <n> is required (the report names none)"
}

cmd_upsert() {
  parse_args "$@"
  local report body
  report=$(jq -c . "$REPORT")
  body=$(comment_body "$report" "$REPO")
  if [ "$DRY" = 1 ]; then printf '%s\n' "$body"; return 0; fi
  local out id url
  out=$(upsert_comment "$REPO" "$PR" "$(marker_key "$PR")" "$body")
  IFS=$'\t' read -r id url <<<"$out"
  say "PR #$PR: walkthrough comment $id — $url"
  printf '%s\n' "$url"
}

cmd_describe() {
  parse_args "$@"
  local id url section body next
  id=$(find_comment "$REPO" "$PR" "$(marker_key "$PR")")
  [ -n "$id" ] || die "PR #$PR has no walkthrough comment yet — run \`upsert\` first"
  url="https://github.com/$REPO/pull/$PR#issuecomment-$id"
  section=$(walkthrough_section "$url" "$NOT_SHOWN")
  if [ "$DRY" = 1 ]; then printf '%s\n' "$section"; return 0; fi
  body=$(pr_body "$REPO" "$PR")
  next=$(describe_body "$body" "$section")
  set_pr_body "$REPO" "$PR" "$next"
  say "PR #$PR: description's ## Walkthrough section updated"
}

main() {
  local cmd=${1:-}
  [ $# -gt 0 ] && shift
  case "$cmd" in
    upsert)   cmd_upsert "$@" ;;
    describe) cmd_describe "$@" ;;
    *) die "usage: comment.sh {upsert|describe} --pr <n> --report <json>" ;;
  esac
}

# Sourced by test-comment.sh to exercise the pure helpers above.
if [ "${BASH_SOURCE[0]}" = "$0" ]; then
  main "$@"
fi
