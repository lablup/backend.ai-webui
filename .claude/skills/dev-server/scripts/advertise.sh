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
# and exits 0: a dev server must boot whether or not it can be advertised.
set -euo pipefail

REPO_DEFAULT="lablup/backend.ai-webui"
STATE_DIR="${BAI_DEV_SERVER_STATE_DIR:-$HOME/.local/state/fw/dev-servers}"
DEV_GW_CONFIG="${DEV_GW_CONFIG:-$HOME/.config/fw/dev-gw.json}"
PORTLESS_DIR="${PORTLESS_DIR:-$HOME/.portless}"
JIRA_SITE="${JIRA_SITE:-https://lablup.atlassian.net}"
# The Jira "Teams thread" field. One GET per served PR, at boot only.
JIRA_TEAMS_FIELD="${JIRA_TEAMS_FIELD:-customfield_10176}"

say() { printf -- '-- dev-server advertise: %s\n' "$*"; }
die() { printf -- 'advertise.sh: %s\n' "$*" >&2; exit 1; }
# A refusal is not a failure: say why, leave GitHub untouched, let the boot go on.
refuse() { say "$*"; exit 0; }

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

# jira_key <pr-body> — the FR key from `Resolves #1234 (FR-1234)`.
jira_key() {
  grep -oiE '\(FR-[0-9]+\)' <<<"$1" | head -1 | tr -d '()' | tr '[:lower:]' '[:upper:]'
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
current_branch() { git rev-parse --abbrev-ref HEAD; }
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

# The name `pnpm dev` will claim, resolved with the very module dev.mjs uses so
# the two cannot drift.
resolve_app_name() {
  local branch=$1 root pr_json=null
  root=$(repo_root)
  [ -f "$root/scripts/portless-app-name.mjs" ] || die "scripts/portless-app-name.mjs not found — run this from a backend.ai-webui checkout"
  if [ -z "${PORTLESS_APP_NAME_EXACT:-}" ]; then
    pr_json=$(gh pr list --head "$branch" --state open --json number,title --limit 1 2>/dev/null \
      | jq -c '.[0] // null' 2>/dev/null || printf 'null')
    [ -n "$pr_json" ] || pr_json=null
  fi
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
  curl -sS -m 10 -H "Authorization: Basic $auth" \
    "$JIRA_SITE/rest/api/3/issue/$key?fields=$JIRA_TEAMS_FIELD" 2>/dev/null \
    | jq -r --arg f "$JIRA_TEAMS_FIELD" '.fields[$f] // empty' 2>/dev/null || true
}

# Upsert THIS box's comment on a PR; echoes "<id><TAB><html_url>".
upsert_comment() {
  local repo=$1 pr=$2 box=$3 body=$4 id
  id=$(gh api "repos/$repo/issues/$pr/comments" --paginate \
        --jq "map(select(.body | contains(\"$(marker "$box")\"))) | .[0].id // empty" 2>/dev/null | head -1 || true)
  if [ -n "$id" ]; then
    gh api -X PATCH "repos/$repo/issues/comments/$id" -f body="$body" --jq '[.id, .html_url] | @tsv'
  else
    gh api -X POST "repos/$repo/issues/$pr/comments" -f body="$body" --jq '[.id, .html_url] | @tsv'
  fi
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

  local served; served=$(served_set "$branch")
  local -a prs=(); mapfile -t prs < <(jq -r '.[].pr' <<<"$served")
  if [ "${#prs[@]}" -eq 0 ]; then
    say "no open PR serves branch '$branch' — URL is $url, nothing commented"
  fi
  local running=${prs[${#prs[@]} - 1]:-}
  local stack; stack=$(stack_line "$running" ${prs[@]+"${prs[@]}"})

  local body; body=$(comment_body running "$box" "$url" "$stack")
  local out="$served" i=0 pr pr_branch key thread id comment_url
  for pr in ${prs[@]+"${prs[@]}"}; do
    pr_branch=$(jq -r --argjson i "$i" '.[$i].branch' <<<"$served")
    key=$(jira_key_for_pr "$repo" "$pr")
    thread=""
    local ov
    for ov in ${overrides[@]+"${overrides[@]}"}; do
      case "$ov" in
        "$pr="*) thread=${ov#*=} ;;
        *=*) : ;;
        *) [ "$pr" = "$running" ] && thread=$ov ;;
      esac
    done
    [ -n "$thread" ] || thread=$(teams_thread_for_key "$key")
    IFS=$'\t' read -r id comment_url < <(upsert_comment "$repo" "$pr" "$box" "$body")
    say "PR #$pr ($pr_branch): comment $id, ${key:-no Jira key}, teams thread ${thread:-none}"
    out=$(jq -c --argjson i "$i" --arg k "$key" --arg t "$thread" --arg c "$id" --arg cu "${comment_url:-}" '
      def orNull: if . == "" then null else . end;
      .[$i] += {jiraKey: ($k | orNull), teamsThread: ($t | orNull),
                commentId: (if $c == "" then null else ($c | tonumber) end),
                commentUrl: ($cu | orNull)}' <<<"$out")
    i=$((i + 1))
  done

  local file started local_url worktree; file=$(record_path "$app")
  mkdir -p "$STATE_DIR"
  # Re-advertising the same server keeps its original boot time.
  started=$(jq -r '.startedAt // empty' "$file" 2>/dev/null || true)
  [ -n "$started" ] || started=$(now_iso)
  local_url="https://$app.localhost:$(portless_port)"
  worktree=$(repo_root)
  boot_record "$app" "$url" "$repo" "$branch" "$pid" "$started" "$out" \
    "$box" "$local_url" "$worktree" >"$file"
  say "boot record $file"
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
      gh api -X PATCH "repos/$repo/issues/comments/$id" -f body="$body" --jq '.id' >/dev/null
      say "PR #$pr: comment $id marked stopped"
    else
      upsert_comment "$repo" "$pr" "$box" "$body" >/dev/null
      say "PR #$pr: comment marked stopped"
    fi
  done < <(jq -r '.served[] | [.pr, (.commentId // "")] | @tsv' "$file")

  jq --arg t "$(now_iso)" '.stoppedAt = $t' "$file" >"$file.tmp" && mv "$file.tmp" "$file"
  say "boot record $file marked stopped"
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
