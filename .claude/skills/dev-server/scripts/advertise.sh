#!/usr/bin/env bash
# Advertise this box's dev server on every PR it serves, and record what is
# running so later tooling (overlay pins, notifications, the board) can find it.
#
#   advertise.sh boot-env [--branch <b>]
#       Print `export`-ready BAI_DEV_APP / BAI_REVIEW_BOOT_RECORD lines for the
#       app name `pnpm dev` will claim. Run BEFORE boot; the record itself is
#       written by `advertise` after Portless has actually claimed the name.
#   advertise.sh advertise --app <name> [--branch <b>] [--pid <n>]
#                          [--teams-thread [<pr>=]<url>]... [--repo <o/r>]
#   advertise.sh stop --app <name>
#
# Every refusal (box not joined, port mismatch, probe failure) prints one line
# and exits 0: a dev server must boot whether or not it can be advertised. So do
# not read the exit status for whether a PR was actually commented on — read the
# boot record: `served[].commentId` is null for exactly the PRs whose comment
# could not be written. That is the machine-readable failure signal; the printed
# lines (all on stderr) are the human one.
set -euo pipefail

REPO_DEFAULT="lablup/backend.ai-webui"
STATE_DIR="${BAI_DEV_SERVER_STATE_DIR:-$HOME/.local/state/fw/dev-servers}"
DEV_GW_CONFIG="${DEV_GW_CONFIG:-$HOME/.config/fw/dev-gw.json}"
PORTLESS_DIR="${PORTLESS_DIR:-$HOME/.portless}"
JIRA_SITE="${JIRA_SITE:-https://lablup.atlassian.net}"
# The Jira "Teams thread" field. One GET per served PR, at boot only.
JIRA_TEAMS_FIELD="${JIRA_TEAMS_FIELD:-customfield_10176}"

# Human-facing lines go to stderr: `boot-env`'s stdout is `eval`-ed by the caller,
# so a refusal printed there would be evaluated as shell.
say() { printf -- '-- dev-server advertise: %s\n' "$*" >&2; }
die() { printf -- 'advertise.sh: %s\n' "$*" >&2; exit 1; }
# A refusal is not a failure: say why, leave GitHub untouched, let the boot go on.
refuse() { say "$*"; exit 0; }

# missing_tools <tool>... — the ones this box does not have, space-separated.
missing_tools() {
  local t out=""
  for t in "$@"; do command -v "$t" >/dev/null 2>&1 || out+=" $t"; done
  printf '%s' "${out# }"
}

# ── pure helpers (unit-tested by test-advertise.sh) ───────────────────────────

# share_url <share_base> <app> — the {app} template with the claimed name in it.
share_url() {
  local base=$1 app=$2
  [ -n "$base" ] && [ -n "$app" ] || return 1
  printf '%s' "${base//\{app\}/$app}"
}

# marker <box> — the hidden HTML marker that identifies THIS box's comment.
# One per box per PR: a --force takeover by another box carries another marker
# and so leaves the displaced box's comment alone.
marker() { printf '<!-- bai-dev-server box=%s -->' "$1"; }

# stack_line <running_pr> <pr>... — "serves stack #a → #b → #c (running: #c)",
# empty for a served set of one (nothing to explain).
stack_line() {
  local running=$1; shift
  [ "$#" -gt 1 ] || return 0
  local out="" pr
  for pr in "$@"; do
    [ -n "$out" ] && out+=" → "
    out+="#$pr"
  done
  printf 'serves stack %s (running: #%s)' "$out" "$running"
}

# running_pr <served-json> — the PR the server is actually checked out on: the
# topmost served layer, empty when nothing is served. A helper rather than
# `${prs[${#prs[@]} - 1]}`, which is a `bad array subscript` fatal under `set -u`
# on the very path that is supposed to shrug and carry on.
running_pr() { jq -r 'last | .pr // empty' <<<"$1" 2>/dev/null || true; }

# comment_body <state:running|stopped> <box> <url> [stack_line]
comment_body() {
  local state=$1 box=$2 url=$3 stack=${4:-}
  printf '%s\n' "$(marker "$box")"
  if [ "$state" = stopped ]; then
    printf 'Dev server on box `%s`: stopped (was %s)\n' "$box" "$url"
  else
    printf 'Dev server on box `%s`: %s\n' "$box" "$url"
    if [ -n "$stack" ]; then printf '%s\n' "$stack"; fi
  fi
}

# served_from_stack <gh-stack-view-json> <current_branch> — the current branch
# and every layer BELOW it, open PRs only, bottom-first.
served_from_stack() {
  jq -c --arg cur "$2" '
    (.branches // []) as $all
    | ($all | map(.name) | index($cur)) as $i
    | (if $i == null then [] else $all[0:$i + 1] end)
    | map(select(.pr != null and .pr.state == "OPEN")
          | {pr: .pr.number, branch: .name})
  ' <<<"$1"
}

# dropped_served <old-record-json> <new-served-json> — the PRs the old boot
# record served that the new served set does not, as `<pr><TAB><commentId>`.
# A PR that merges (or leaves the stack) while the server runs would otherwise
# keep a "running" comment for ever: `stop` walks only the boot record, and the
# run that drops the PR is the run that overwrites it.
dropped_served() {
  jq -rn --argjson old "$1" --argjson new "$2" '
    ($new | map(.pr)) as $keep
    | ($old.served // [])
    | map(. as $e | select(($keep | index($e.pr)) == null))
    | .[] | [.pr, (.commentId // "")] | @tsv
  ' 2>/dev/null || true
}

# jira_key <pr-body> — the FR key from `Resolves #1234 (FR-1234)`.
# A body that names none is empty AND successful: `grep` exits 1, and under
# `pipefail` that would abort the caller's `key=$(...)` assignment mid-run.
jira_key() {
  grep -oiE '\(FR-[0-9]+\)' <<<"$1" | head -1 | tr -d '()' | tr '[:lower:]' '[:upper:]' || true
}

# teams_override <pr> <running> <override>... — the `--teams-thread` value that
# applies to <pr>, or empty. `<pr>=<url>` targets one PR; a bare URL targets the
# running one. Only an all-digit prefix before the FIRST `=` counts as a PR
# selector — a bare Teams URL is full of `=` (groupId=, tenantId=, …) and must
# not be mistaken for one.
teams_override() {
  local pr=$1 running=$2; shift 2
  local ov head out=""
  for ov in "$@"; do
    head=${ov%%=*}
    if [ "$head" != "$ov" ] && [ -n "$head" ] && [ -z "${head//[0-9]/}" ]; then
      [ "$head" = "$pr" ] && out=${ov#*=}
    elif [ "$pr" = "$running" ]; then
      out=$ov
    fi
  done
  printf '%s' "$out"
}

# pr_cache_path <branch> — the PR cache dev.mjs writes, spelled exactly as
# dev.mjs spells it, so an offline `boot-env` predicts the name dev.mjs claims.
pr_cache_path() {
  printf '%s/.cache/backend.ai-webui/pr-%s.json' \
    "$HOME" "$(printf '%s' "$1" | sed -E 's/[^A-Za-z0-9]+/-/g')"
}

# boot_record <app> <url> <repo> <branch> <pid> <startedAt> <served-json>
#             [<box>] [<localUrl>] [<worktree>]
# The last three are context for whoever reads the record; they are null when
# the caller does not have them. Nothing here ever carries an endpoint or a
# credential — the record is as public as the comment.
boot_record() {
  jq -n \
    --arg app "$1" --arg url "$2" --arg repo "$3" --arg branch "$4" \
    --arg pid "$5" --arg startedAt "$6" --argjson served "$7" \
    --arg box "${8:-}" --arg localUrl "${9:-}" --arg worktree "${10:-}" '
    def orNull: if . == "" then null else . end;
    {schemaVersion: 1, app: $app, box: ($box | orNull), url: $url,
     localUrl: ($localUrl | orNull), repo: $repo, branch: $branch,
     worktree: ($worktree | orNull),
     pid: (if $pid == "" then null else ($pid | tonumber) end),
     startedAt: $startedAt, stoppedAt: null, served: $served}
  '
}

record_path() { printf '%s/%s.json' "$STATE_DIR" "$1"; }

# ── environment ──────────────────────────────────────────────────────────────

repo_root() { git rev-parse --show-toplevel; }
# `git branch --show-current` is what dev.mjs uses: empty on a detached HEAD,
# where `rev-parse --abbrev-ref` would answer the literal "HEAD".
current_branch() { git branch --show-current; }
now_iso() { date -u +%Y-%m-%dT%H:%M:%SZ; }

# The port Portless is actually serving on. The gateway forwards to the port it
# was joined with, forever, so a server on any other port is proxied to nothing.
portless_port() {
  local p=${PORTLESS_PORT:-}
  [ -n "$p" ] || { [ -f "$PORTLESS_DIR/proxy.port" ] && p=$(tr -dc '0-9' <"$PORTLESS_DIR/proxy.port"); }
  printf '%s' "$p"
}

# Set SHARE_BASE, or refuse. Guards, in order: joined at all, usable template,
# joined with the port we are actually running on. Assigns a global rather than
# echoing because `refuse` must exit the script, not a command substitution.
gateway_share_base() {
  [ -f "$DEV_GW_CONFIG" ] || refuse "this box has not joined the dev gateway ($DEV_GW_CONFIG missing) — nothing advertised"
  local cfg base target live
  cfg=$(cat "$DEV_GW_CONFIG") || refuse "cannot read $DEV_GW_CONFIG — nothing advertised"
  base=$(jq -r 'select(.share_base | type == "string" and test("^https?://\\{app\\}\\.")) | .share_base' <<<"$cfg" 2>/dev/null || true)
  [ -n "$base" ] || refuse "$DEV_GW_CONFIG has no usable share_base template — nothing advertised"
  target=$(jq -r '(.target_port // .portless_port // empty) | tostring' <<<"$cfg")
  live=$(portless_port)
  if [ -n "$target" ] && [ -n "$live" ] && [ "$target" != "$live" ]; then
    refuse "the gateway was joined with Portless :$target, this server uses :$live — re-run \`dev-gw join\`, nothing advertised"
  fi
  SHARE_BASE=$base
}

gateway_box() { jq -r '.box // empty' "$DEV_GW_CONFIG"; }

# probe_ok <http_status> <raw_headers> — both halves are needed. A two-label app
# name never reaches Portless: Caddy answers a blank 200 with no header. An app
# name Portless does not serve DOES carry the header, on a 404.
probe_ok() {
  case "$1" in 2??) ;; *) return 1 ;; esac
  grep -qiE '^x-portless:[[:space:]]*1[[:space:]]*$' <<<"$2"
}

# Sets PROBE_STATUS for the refusal message.
probe_portless() {
  local url=$1 hdr rc
  hdr=$(mktemp)
  PROBE_STATUS=$(curl -sS -o /dev/null -D "$hdr" -m 10 -w '%{http_code}' "$url" 2>/dev/null) || PROBE_STATUS=""
  probe_ok "$PROBE_STATUS" "$(cat "$hdr")" && rc=0 || rc=1
  rm -f "$hdr"
  return "$rc"
}

# ── app name (pre-boot) ──────────────────────────────────────────────────────

# PORTLESS_APP_NAME_EXACT as dev.mjs reads it (`?.trim()`), so a whitespace-only
# value is falsy on both sides.
exact_mode() {
  local v=${PORTLESS_APP_NAME_EXACT:-}
  v=${v//[[:space:]]/}
  [ -n "$v" ]
}

# lookup_pr <branch> — dev.mjs's `lookupPr`, in shell. It MUST match: the name is
# a function of the PR it returns, and a name that differs from the one dev.mjs
# claims points BAI_REVIEW_BOOT_RECORD and the probe at a server that is not there.
# So: `gh pr view <branch>` (any PR state, not just open), a 4s budget, and the
# same on-disk cache as the offline fallback.
lookup_pr() {
  local branch=$1 out cache
  { [ -n "$branch" ] && [ -z "${PORTLESS_SKIP_PR_LOOKUP:-}" ]; } || { printf 'null'; return; }
  if command -v timeout >/dev/null 2>&1; then
    out=$(timeout 4 gh pr view "$branch" --json number,title 2>/dev/null || true)
  else
    out=$(gh pr view "$branch" --json number,title 2>/dev/null || true)
  fi
  if [ -n "$out" ] && jq -e '.number' <<<"$out" >/dev/null 2>&1; then
    jq -c . <<<"$out"; return
  fi
  cache=$(pr_cache_path "$branch")
  if [ -f "$cache" ] && jq -e . "$cache" >/dev/null 2>&1; then
    jq -c . "$cache"; return
  fi
  printf 'null'
}

# The name `pnpm dev` will claim, resolved with the very module dev.mjs uses so
# the two cannot drift.
resolve_app_name() {
  local branch=$1 root pr_json=null
  root=$(repo_root)
  [ -f "$root/scripts/portless-app-name.mjs" ] || die "scripts/portless-app-name.mjs not found — run this from a backend.ai-webui checkout"
  # Exact mode discards every identifier, so it must not pay for the lookup —
  # dev.mjs skips it there too.
  exact_mode || pr_json=$(lookup_pr "$branch")
  BAI_BRANCH="$branch" BAI_PR_JSON="$pr_json" BAI_MOD="$root/scripts/portless-app-name.mjs" \
    node -e '
      import(process.env.BAI_MOD).then((m) => {
        const name = m.resolveAppName({
          envName: process.env.PORTLESS_APP_NAME,
          branch: process.env.BAI_BRANCH,
          pr: JSON.parse(process.env.BAI_PR_JSON),
          exact: !!(process.env.PORTLESS_APP_NAME_EXACT || "").trim(),
        });
        if (name) process.stdout.write(name);
      });
    '
}

# ── GitHub / Jira ────────────────────────────────────────────────────────────

# The served set: the current branch plus every layer below it (open PRs only),
# or a set of one when the branch is not stacked.
served_set() {
  local branch=$1 stack_json served
  if stack_json=$(gh stack view --json 2>/dev/null) && [ -n "$stack_json" ]; then
    served=$(served_from_stack "$stack_json" "$branch")
    [ "$served" != "[]" ] && { printf '%s' "$served"; return; }
  fi
  gh pr list --head "$branch" --state open --json number --limit 1 \
    | jq -c --arg b "$branch" 'map({pr: .number, branch: $b})'
}

jira_key_for_pr() {
  local repo=$1 pr=$2 body
  body=$(gh pr view "$pr" --repo "$repo" --json body --jq '.body' 2>/dev/null || true)
  jira_key "${body:-}"
}

# ONE Jira GET per served PR, at boot only — never at request time.
teams_thread_for_key() {
  local key=$1
  [ -n "$key" ] || return 0
  local cred=${ATLASSIAN_CRED_FILE:-$HOME/.config/atlassian/credentials}
  local email=${ATLASSIAN_EMAIL:-} token=${ATLASSIAN_API_TOKEN:-}
  if [ -f "$cred" ]; then
    [ -n "$email" ] || email=$(sed -n 's/^[[:space:]]*\(export[[:space:]]*\)\?ATLASSIAN_EMAIL=//p' "$cred" | head -1)
    [ -n "$token" ] || token=$(sed -n 's/^[[:space:]]*\(export[[:space:]]*\)\?ATLASSIAN_API_TOKEN=//p' "$cred" | head -1)
  fi
  [ -n "$email" ] && [ -n "$token" ] || return 0
  local auth; auth=$(printf '%s:%s' "$email" "$token" | base64 | tr -d '\n')
  # The credential arrives on stdin via --config, never in argv: /proc is
  # readable by every other process on a dev box that runs dozens of agents.
  printf 'header = "Authorization: Basic %s"\n' "$auth" \
    | curl -sS -m 10 --config - \
      "$JIRA_SITE/rest/api/3/issue/$key?fields=$JIRA_TEAMS_FIELD" 2>/dev/null \
    | jq -r --arg f "$JIRA_TEAMS_FIELD" '.fields[$f] | select(type == "string") // empty' 2>/dev/null || true
}

# Upsert THIS box's comment on a PR; echoes "<id><TAB><html_url>".
# The marker reaches jq through the environment, never spliced into the program:
# the box name comes from a config file and a `"` in it would rewrite the filter.
# `--paginate` walks every page (the marker may be far down a busy PR) and
# `--jq` runs per page, so the first line printed is the first page that matched.
upsert_comment() {
  local repo=$1 pr=$2 box=$3 body=$4 id
  id=$(BAI_MARKER=$(marker "$box") gh api "repos/$repo/issues/$pr/comments?per_page=100" --paginate \
        --jq 'map(select(.body | contains(env.BAI_MARKER))) | .[0].id // empty' 2>/dev/null | head -1 || true)
  if [ -n "$id" ]; then
    gh api -X PATCH "repos/$repo/issues/comments/$id" -f body="$body" --jq '[.id, .html_url] | @tsv'
  else
    gh api -X POST "repos/$repo/issues/$pr/comments" -f body="$body" --jq '[.id, .html_url] | @tsv'
  fi
}

# patch_stopped <repo> <comment-id> <body> — edit one existing comment to the
# stopped form. Never creates one: a PR we could not comment on must not get its
# first comment from us at teardown.
patch_stopped() {
  gh api -X PATCH "repos/$1/issues/comments/$2" -f body="$3" --jq '.id' >/dev/null
}

# ── subcommands ──────────────────────────────────────────────────────────────

cmd_boot_env() {
  local branch=""
  while [ $# -gt 0 ]; do
    case $1 in
      --branch) branch=${2:?--branch needs a value}; shift 2 ;;
      *) die "boot-env: unknown argument '$1'" ;;
    esac
  done
  [ -n "$branch" ] || branch=$(current_branch)
  local missing; missing=$(missing_tools node jq)
  [ -z "$missing" ] || die "boot-env: missing on this box: $missing"
  local app; app=$(resolve_app_name "$branch")
  [ -n "$app" ] || refuse "no app name to claim for branch '$branch' (Portless will auto-derive one) — no boot record"
  printf 'export BAI_DEV_APP=%q\n' "$app"
  printf 'export BAI_REVIEW_BOOT_RECORD=%q\n' "$(record_path "$app")"
}

cmd_advertise() {
  local app="" branch="" pid="" repo="$REPO_DEFAULT"
  local -a overrides=()
  while [ $# -gt 0 ]; do
    case $1 in
      --app) app=${2:?--app needs a value}; shift 2 ;;
      --branch) branch=${2:?--branch needs a value}; shift 2 ;;
      --pid) pid=${2:?--pid needs a value}; shift 2 ;;
      --repo) repo=${2:?--repo needs a value}; shift 2 ;;
      --teams-thread) overrides+=("${2:?--teams-thread needs a value}"); shift 2 ;;
      *) die "advertise: unknown argument '$1'" ;;
    esac
  done
  [ -n "$app" ] || die "advertise: --app <name> is required"
  [ -n "$branch" ] || branch=$(current_branch)
  local missing; missing=$(missing_tools jq gh curl)
  [ -z "$missing" ] || refuse "missing on this box: $missing — nothing advertised"

  local box url
  SHARE_BASE=""
  gateway_share_base                  # refuses (exit 0) when not joined / port mismatch
  box=$(gateway_box)
  [ -n "$box" ] || refuse "$DEV_GW_CONFIG has no box name — nothing advertised"
  url=$(share_url "$SHARE_BASE" "$app")
  # Belt and braces: a .localhost URL is useless to a reviewer and must never
  # reach a public PR, whatever the config said.
  case "$url" in *.localhost*) refuse "refusing to advertise a .localhost URL ($url)" ;; esac
  PROBE_STATUS=""
  probe_portless "$url" || refuse "$url answered ${PROBE_STATUS:-no response}, not a Portless 2xx — not advertised (is the dev server up? is the app name a single label?)"

  # The record this run overwrites, read before anything touches it: its served
  # set is the only place the comments on PRs we are about to drop are named.
  local file prev; file=$(record_path "$app")
  prev='{}'
  [ -f "$file" ] && prev=$(jq -c . "$file" 2>/dev/null || printf '{}')

  # Neither `gh stack view` nor `gh pr list` failing may cost us the boot record:
  # the URL is good, and the record is what `stop` and the board read later.
  local served
  served=$(served_set "$branch") || served=''
  jq -e 'type == "array"' <<<"$served" >/dev/null 2>&1 || served='[]'
  local -a prs=(); mapfile -t prs < <(jq -r '.[].pr' <<<"$served")
  if [ "${#prs[@]}" -eq 0 ]; then
    say "no open PR serves branch '$branch' — URL is $url, nothing commented"
  fi
  local running; running=$(running_pr "$served")
  local stack; stack=$(stack_line "$running" ${prs[@]+"${prs[@]}"})

  local body; body=$(comment_body running "$box" "$url" "$stack")
  local out="$served" i=0 pr pr_branch key thread id comment_url upsert
  for pr in ${prs[@]+"${prs[@]}"}; do
    pr_branch=$(jq -r --argjson i "$i" '.[$i].branch' <<<"$served")
    key=$(jira_key_for_pr "$repo" "$pr")
    thread=$(teams_override "$pr" "$running" ${overrides[@]+"${overrides[@]}"})
    [ -n "$thread" ] || thread=$(teams_thread_for_key "$key")
    # One PR whose comment cannot be written (locked conversation, rate limit,
    # a revoked token) must not abort the run: the remaining PRs are still
    # served, and the record still has to be written.
    id=""; comment_url=""
    upsert=$(upsert_comment "$repo" "$pr" "$box" "$body") || upsert=""
    if [ -n "$upsert" ]; then
      IFS=$'\t' read -r id comment_url <<<"$upsert" || true
      say "PR #$pr ($pr_branch): comment $id, ${key:-no Jira key}, teams thread ${thread:-none}"
    else
      say "PR #$pr ($pr_branch): could not write the comment — recorded with no comment id"
    fi
    out=$(jq -c --argjson i "$i" --arg k "$key" --arg t "$thread" --arg c "$id" --arg cu "${comment_url:-}" '
      def orNull: if . == "" then null else . end;
      .[$i] += {jiraKey: ($k | orNull), teamsThread: ($t | orNull),
                commentId: (if $c == "" then null else ($c | tonumber) end),
                commentUrl: ($cu | orNull)}' <<<"$out")
    i=$((i + 1))
  done

  # PRs this server served last time and does not now — merged, closed, or below
  # a branch that moved. Their comment still claims a running server for a PR
  # nobody is serving, and after the write below nothing remembers it exists.
  local stopped_body dpr did
  stopped_body=$(comment_body stopped "$box" "$url")
  while IFS=$'\t' read -r dpr did; do
    [ -n "$dpr" ] || continue
    if [ -z "$did" ] || [ "$did" = null ]; then
      say "PR #$dpr: no longer served, and we have no comment there to mark stopped"
    elif patch_stopped "$repo" "$did" "$stopped_body"; then
      say "PR #$dpr: no longer served — comment $did marked stopped"
    else
      say "PR #$dpr: no longer served — could not edit comment $did"
    fi
  done < <(dropped_served "$prev" "$out")

  local started local_url worktree
  mkdir -p "$STATE_DIR"
  # Re-advertising a server that is still running keeps its original boot time.
  # A record already marked stopped belongs to a previous server on this app
  # name, so its boot time must not be carried into the new one's record.
  started=$(jq -r 'select(.stoppedAt == null) | .startedAt // empty' "$file" 2>/dev/null || true)
  [ -n "$started" ] || started=$(now_iso)
  local_url="https://$app.localhost:$(portless_port)"
  worktree=$(repo_root)
  # Write through a sibling temp file: `>"$file"` truncates before jq runs, so a
  # concurrent reader (overlay, board) could see invalid JSON and a jq failure
  # would leave the only record corrupted.
  if boot_record "$app" "$url" "$repo" "$branch" "$pid" "$started" "$out" \
      "$box" "$local_url" "$worktree" >"$file.tmp"; then
    mv "$file.tmp" "$file"
    say "boot record $file"
  else
    rm -f "$file.tmp"
    say "could not write $file — boot record left as is"
  fi
}

cmd_stop() {
  local app=""
  while [ $# -gt 0 ]; do
    case $1 in
      --app) app=${2:?--app needs a value}; shift 2 ;;
      *) die "stop: unknown argument '$1'" ;;
    esac
  done
  [ -n "$app" ] || die "stop: --app <name> is required"
  local missing; missing=$(missing_tools jq gh)
  [ -z "$missing" ] || refuse "missing on this box: $missing — boot record left as is"
  local file; file=$(record_path "$app")
  [ -f "$file" ] || refuse "no boot record at $file — nothing to stop"

  local box url repo body
  box=$(jq -r '.box // empty' "$file")
  [ -n "$box" ] || box=$(gateway_box 2>/dev/null || true)
  [ -n "$box" ] || refuse "no box name in $file or $DEV_GW_CONFIG — boot record left as is"
  url=$(jq -r '.url' "$file")
  repo=$(jq -r '.repo' "$file")
  body=$(comment_body stopped "$box" "$url")

  local pr id
  while IFS=$'\t' read -r pr id; do
    [ -n "$pr" ] || continue
    if [ -n "$id" ] && [ "$id" != null ]; then
      if patch_stopped "$repo" "$id" "$body"; then
        say "PR #$pr: comment $id marked stopped"
      else
        say "PR #$pr: could not edit comment $id — it may have been deleted"
      fi
    else
      # No id means advertising never got a comment onto this PR. Creating one
      # now would make our first word on it a "stopped" notice — the guarantee
      # `patch_stopped` states, applied to the caller that could route round it.
      say "PR #$pr: no comment of ours to mark stopped"
    fi
  done < <(jq -r '.served[] | [.pr, (.commentId // "")] | @tsv' "$file")

  if jq --arg t "$(now_iso)" '.stoppedAt = $t' "$file" >"$file.tmp"; then
    mv "$file.tmp" "$file"
    say "boot record $file marked stopped"
  else
    rm -f "$file.tmp"
    say "could not rewrite $file — boot record left as is"
  fi
}

main() {
  local cmd=${1:-}
  [ $# -gt 0 ] && shift
  case "$cmd" in
    boot-env)  cmd_boot_env "$@" ;;
    advertise) cmd_advertise "$@" ;;
    stop)      cmd_stop "$@" ;;
    *) die "usage: advertise.sh {boot-env|advertise --app <name>|stop --app <name>}" ;;
  esac
}

# Sourced by test-advertise.sh to exercise the pure helpers above.
if [ "${BASH_SOURCE[0]}" = "$0" ]; then
  main "$@"
fi
