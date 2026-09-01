#!/usr/bin/env bash
# Unit tests for the network-free helpers in advertise.sh.
# Run:  bash .claude/skills/dev-server/scripts/test-advertise.sh
set -uo pipefail

HERE=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
# Sourcing defines the helpers without running main() — see the guard at the
# bottom of advertise.sh.
BAI_DEV_SERVER_STATE_DIR=/tmp/fw-dev-servers
# shellcheck source=./advertise.sh
source "$HERE/advertise.sh"
# advertise.sh sets `set -e` for its own run; the tests deliberately call helpers
# that report failure through their exit status.
set +e

PASS=0 FAIL=0

check() { # check <name> <expected> <actual>
  if [ "$2" = "$3" ]; then
    PASS=$((PASS + 1)); printf 'ok   %s\n' "$1"
  else
    FAIL=$((FAIL + 1)); printf 'FAIL %s\n  expected: %q\n  actual:   %q\n' "$1" "$2" "$3"
  fi
}

# ── URL substitution ──────────────────────────────────────────────────────────
BASE='http://{app}.jongeun.10-82-0-159.sslip.io'
check 'share_url substitutes {app}' \
  'http://fr-3810-pr9330-advertise.jongeun.10-82-0-159.sslip.io' \
  "$(share_url "$BASE" fr-3810-pr9330-advertise)"
check 'share_url keeps plain http and no port' \
  'yes' \
  "$(case "$(share_url "$BASE" x)" in http://*:*) echo no ;; http://*) echo yes ;; esac)"
share_url '' app >/dev/null 2>&1
check 'share_url rejects an empty base' '1' "$?"

# ── marker ────────────────────────────────────────────────────────────────────
check 'marker carries the box name' '<!-- bai-dev-server box=jongeun -->' "$(marker jongeun)"
check 'another box gets another marker (a --force takeover cannot edit it)' \
  'different' \
  "$([ "$(marker jongeun)" = "$(marker other)" ] && echo same || echo different)"

# ── stack line ────────────────────────────────────────────────────────────────
check 'stack_line for three PRs' \
  'serves stack #9328 → #9329 → #9330 (running: #9330)' \
  "$(stack_line 9330 9328 9329 9330)"
check 'stack_line is empty for a served set of one' '' "$(stack_line 9330 9330)"

# ── comment bodies ────────────────────────────────────────────────────────────
URL=$(share_url "$BASE" fr-3810)
RUNNING=$(comment_body running jongeun "$URL" "$(stack_line 9330 9328 9330)")
check 'running body: marker first' '<!-- bai-dev-server box=jongeun -->' "$(head -1 <<<"$RUNNING")"
check 'running body: URL line' \
  'Dev server on box `jongeun`: http://fr-3810.jongeun.10-82-0-159.sslip.io' \
  "$(sed -n 2p <<<"$RUNNING")"
check 'running body: stack line' \
  'serves stack #9328 → #9330 (running: #9330)' \
  "$(sed -n 3p <<<"$RUNNING")"
check 'running body: nothing else' '3' "$(wc -l <<<"$RUNNING")"
check 'single-PR body has no stack line' '2' \
  "$(wc -l <<<"$(comment_body running jongeun "$URL" "$(stack_line 9330 9330)")")"
check 'stopped body' \
  '<!-- bai-dev-server box=jongeun -->
Dev server on box `jongeun`: stopped (was http://fr-3810.jongeun.10-82-0-159.sslip.io)' \
  "$(comment_body stopped jongeun "$URL")"
# The repo is public: the body must never carry connection secrets.
check 'body leaks no endpoint / e-mail / password' 'clean' \
  "$(grep -qiE '@|password|:8090|localhost' <<<"$RUNNING" && echo leak || echo clean)"

# ── probe gate (recorded gateway responses) ───────────────────────────────────
PORTLESS_200='HTTP/1.1 200 OK
Via: 2.0 Caddy
X-Portless: 1'
BLANK_200='HTTP/1.1 200 OK
Server: Caddy
Content-Length: 0'
PORTLESS_404='HTTP/1.1 404 Not Found
Via: 2.0 Caddy
X-Portless: 1'
probe_ok 200 "$PORTLESS_200"; check 'a live Portless route is advertised' 0 $?
probe_ok 200 "$BLANK_200";    check 'a two-label name (blank 200, no header) is refused' 1 $?
probe_ok 404 "$PORTLESS_404"; check 'an app Portless does not serve (404 + header) is refused' 1 $?
probe_ok '' '';               check 'no response at all is refused' 1 $?

# ── served set from a recorded `gh stack view --json` payload ─────────────────
STACK='{
  "trunk": "main",
  "currentBranch": "feat/mid",
  "branches": [
    {"name": "feat/bottom", "isCurrent": false, "pr": {"number": 9328, "state": "OPEN"}},
    {"name": "feat/mid",    "isCurrent": true,  "pr": {"number": 9329, "state": "OPEN"}},
    {"name": "feat/top",    "isCurrent": false, "pr": {"number": 9330, "state": "OPEN"}}
  ]
}'
check 'served set = current branch + every layer below it' \
  '[{"pr":9328,"branch":"feat/bottom"},{"pr":9329,"branch":"feat/mid"}]' \
  "$(served_from_stack "$STACK" feat/mid)"
check 'served set at the top of the stack is the whole stack' \
  '[{"pr":9328,"branch":"feat/bottom"},{"pr":9329,"branch":"feat/mid"},{"pr":9330,"branch":"feat/top"}]' \
  "$(served_from_stack "$STACK" feat/top)"
MERGED=${STACK/\"number\": 9328, \"state\": \"OPEN\"/\"number\": 9328, \"state\": \"MERGED\"}
check 'merged layers are not served' \
  '[{"pr":9329,"branch":"feat/mid"}]' \
  "$(served_from_stack "$MERGED" feat/mid)"
NOPR='{"branches":[{"name":"feat/bottom"},{"name":"feat/mid","pr":{"number":9329,"state":"OPEN"}}]}'
check 'a layer without a PR is skipped' \
  '[{"pr":9329,"branch":"feat/mid"}]' \
  "$(served_from_stack "$NOPR" feat/mid)"
check 'a branch outside the stack serves nothing' '[]' \
  "$(served_from_stack "$STACK" feat/elsewhere)"

# ── the running PR ────────────────────────────────────────────────────────────
check 'the running PR is the top of the served set' '9330' \
  "$(running_pr '[{"pr":9328},{"pr":9329},{"pr":9330}]')"
check 'one served PR is the running one' '9330' "$(running_pr '[{"pr":9330}]')"
# An unstacked branch with no open PR still has to print its line and write its
# record, so this must be an empty string and not a fatal subscript error.
check 'an empty served set has no running PR' '' "$(running_pr '[]')"

# ── --teams-thread overrides ──────────────────────────────────────────────────
# Every real Teams thread URL carries `groupId=`/`tenantId=`, so "has an =" can
# never be what tells a `<pr>=<url>` selector from a bare URL.
TEAMS='https://teams.microsoft.com/l/message/19%3Aabc%40thread.skype/178?groupId=74ae&tenantId=13c6'
check 'a bare URL full of = still applies to the running PR' "$TEAMS" \
  "$(teams_override 9330 9330 "$TEAMS")"
check 'a bare URL does not apply to a lower PR' '' "$(teams_override 9328 9330 "$TEAMS")"
check '<pr>=<url> targets that PR' "$TEAMS" "$(teams_override 9328 9330 "9328=$TEAMS")"
check '<pr>=<url> leaves other PRs alone' '' "$(teams_override 9329 9330 "9328=$TEAMS")"
check 'the last override for a PR wins' 'b' "$(teams_override 9330 9330 9330=a 9330=b)"
check 'no override at all is empty' '' "$(teams_override 9330 9330)"

# ── the PR cache dev.mjs writes (the name must be predicted from the same one) ─
check 'pr cache path matches dev.mjs spelling' \
  "$HOME/.cache/backend.ai-webui/pr-feat-FR-3810-dev-server-advertise.json" \
  "$(pr_cache_path feat/FR-3810-dev-server-advertise)"

# ── missing tools ─────────────────────────────────────────────────────────────
check 'missing_tools names only what is absent' 'definitely-not-a-real-binary' \
  "$(missing_tools jq definitely-not-a-real-binary)"
check 'missing_tools is empty when everything is there' '' "$(missing_tools jq bash)"

# ── say() must not pollute stdout: boot-env's stdout is eval-ed ────────────────
check 'say writes nothing to stdout' '' "$(say 'a refusal' 2>/dev/null)"
check 'say writes to stderr' '-- dev-server advertise: a refusal' \
  "$(say 'a refusal' 2>&1 1>/dev/null)"

# ── the marker never becomes part of a jq program ─────────────────────────────
# The box name comes from a config file; a `"` in it used to rewrite the filter.
BAD_BOX='x") | .[0] | ("'
BAI_MARKER=$(marker "$BAD_BOX")
export BAI_MARKER
check 'a quote in the box name cannot rewrite the comment-search filter' '77' \
  "$(jq -r 'map(select(.body | contains(env.BAI_MARKER))) | .[0].id // empty' <<<"$(jq -n --arg m "$BAI_MARKER" '[{id: 77, body: ("head\n" + $m)}]')")"
check 'and a comment without the marker is not matched' '' \
  "$(jq -r 'map(select(.body | contains(env.BAI_MARKER))) | .[0].id // empty' <<<'[{"id":77,"body":"unrelated"}]')"
unset BAI_MARKER

# ── Jira key from a PR body ───────────────────────────────────────────────────
check 'jira_key from Resolves line' 'FR-3810' \
  "$(jira_key 'Resolves #9329 (FR-3810)

## What
…')"
check 'jira_key takes the first key only' 'FR-3810' \
  "$(jira_key 'Resolves #9329 (FR-3810), relates to (FR-3811)')"
check 'jira_key is empty when the body names none' '' "$(jira_key 'no ticket here')"
# Not just empty — successful. `key=$(jira_key_for_pr ...)` runs under `set -e`,
# so a grep that exits 1 would abort advertising on the first key-less PR.
jira_key 'no ticket here' >/dev/null
check 'jira_key succeeds when the body names none' '0' "$?"

# ── boot record ───────────────────────────────────────────────────────────────
SERVED='[{"pr":9330,"branch":"feat/FR-3810","jiraKey":"FR-3810",
          "teamsThread":"https://teams.microsoft.com/l/message/x",
          "commentId":77,"commentUrl":"https://github.com/o/r/pull/9330#issuecomment-77"}]'
REC=$(boot_record fr-3810 "$URL" lablup/backend.ai-webui feat/FR-3810 4242 2026-08-31T00:00:00Z \
  "$SERVED" jongeun https://fr-3810.localhost:1357 /home/ubuntu/wt)
check 'boot record keys, in schema order' \
  'schemaVersion app box url localUrl repo branch worktree pid startedAt stoppedAt served' \
  "$(jq -r 'keys_unsorted | join(" ")' <<<"$REC")"
check 'boot record scalar fields' \
  '1 fr-3810 lablup/backend.ai-webui feat/FR-3810 4242 2026-08-31T00:00:00Z null' \
  "$(jq -r '[.schemaVersion, .app, .repo, .branch, .pid, .startedAt, .stoppedAt] | map(tostring) | join(" ")' <<<"$REC")"
check 'boot record optional context fields' \
  'jongeun https://fr-3810.localhost:1357 /home/ubuntu/wt' \
  "$(jq -r '[.box, .localUrl, .worktree] | join(" ")' <<<"$REC")"
check 'boot record served entry' \
  '9330 feat/FR-3810 FR-3810 https://teams.microsoft.com/l/message/x 77 https://github.com/o/r/pull/9330#issuecomment-77' \
  "$(jq -r '.served[0] | [.pr, .branch, .jiraKey, .teamsThread, .commentId, .commentUrl] | map(tostring) | join(" ")' <<<"$REC")"
check 'a PR with no Jira key, thread or comment records nulls' \
  'null null null null' \
  "$(boot_record a "$URL" r b '' 2026-08-31T00:00:00Z \
     '[{"pr":1,"branch":"b","jiraKey":null,"teamsThread":null,"commentId":null,"commentUrl":null}]' \
     | jq -r '.served[0] | [.jiraKey, .teamsThread, .commentId, .commentUrl] | map(tostring) | join(" ")')"
check 'an absent pid is null, not 0' 'null' "$(boot_record a b c d '' e '[]' | jq -r '.pid')"
check 'absent optional context fields are null, not ""' 'null null null' \
  "$(boot_record a b c d '' e '[]' | jq -r '[.box, .localUrl, .worktree] | map(tostring) | join(" ")')"
check 'the record carries no endpoint or credential key' 'clean' \
  "$(jq -r 'paths | join(".")' <<<"$REC" | grep -qiE 'endpoint|password|email|token|secret' && echo leak || echo clean)"

# ── record path (the pre-agreed BAI_REVIEW_BOOT_RECORD handoff) ───────────────
check 'record path is one file per app under the state dir' \
  '/tmp/fw-dev-servers/fr-3810-pr9330-advertise.json' \
  "$(record_path fr-3810-pr9330-advertise)"

# ── PRs that leave the served set ─────────────────────────────────────────────
OLD_REC='{"served":[{"pr":9328,"commentId":11},{"pr":9329,"commentId":22},
                    {"pr":9330,"commentId":33}]}'
check 'the PR the new served set dropped, with its comment id' \
  '9330	33' \
  "$(dropped_served "$OLD_REC" '[{"pr":9328},{"pr":9329}]')"
check 'nothing dropped when the served set is unchanged' '' \
  "$(dropped_served "$OLD_REC" '[{"pr":9328},{"pr":9329},{"pr":9330}]')"
check 'a served set that lost everything drops everything' \
  '9328	11
9329	22
9330	33' \
  "$(dropped_served "$OLD_REC" '[]')"
check 'a dropped PR whose comment was never written has no id to patch' \
  '9330	' \
  "$(dropped_served '{"served":[{"pr":9330,"commentId":null}]}' '[]')"
check 'a first run (no previous record) drops nothing' '' \
  "$(dropped_served '{}' '[{"pr":9330}]')"

# ── cmd_advertise end to end, with every network call stubbed ────────────────
# A,B,C were served last boot; this boot serves A,B only. C's comment must be
# edited to the stopped form, and the record must come back holding just A,B.
TMP=$(mktemp -d)
STATE_DIR="$TMP/state"
DEV_GW_CONFIG="$TMP/dev-gw.json"
printf '%s' '{"box":"testbox","share_base":"http://{app}.testbox.example.invalid"}' >"$DEV_GW_CONFIG"
mkdir -p "$STATE_DIR"
cat >"$STATE_DIR/testapp.json" <<'JSON'
{"schemaVersion":1,"app":"testapp","box":"testbox","url":"http://old","repo":"o/r",
 "branch":"c","pid":1,"startedAt":"2026-01-01T00:00:00Z","stoppedAt":null,
 "served":[{"pr":9328,"branch":"a","commentId":11},
           {"pr":9329,"branch":"b","commentId":22},
           {"pr":9330,"branch":"c","commentId":33}]}
JSON
missing_tools() { printf ''; }
probe_portless() { PROBE_STATUS=200; return 0; }
served_set() { printf '%s' '[{"pr":9328,"branch":"a"},{"pr":9329,"branch":"b"}]'; }
jira_key_for_pr() { printf ''; }
teams_thread_for_key() { printf ''; }
upsert_comment() { printf '%s\thttps://example.invalid/c/%s' "$2" "$2"; }
patch_stopped() { printf '%s\n' "$2" >>"$TMP/patched"; printf '%s' "$3" >"$TMP/patched-body"; }
( cmd_advertise --app testapp --branch b --repo o/r --pid 7 ) 2>/dev/null
check 'only the dropped PR had its comment patched' '33' "$(cat "$TMP/patched" 2>/dev/null)"
check 'the patch put it in the stopped form' \
  'Dev server on box `testbox`: stopped (was http://testapp.testbox.example.invalid)' \
  "$(sed -n 2p "$TMP/patched-body" 2>/dev/null)"
check 'the stopped comment carries this box marker, so `stop` still finds it' \
  '<!-- bai-dev-server box=testbox -->' "$(sed -n 1p "$TMP/patched-body" 2>/dev/null)"
check 'the record now holds only the PRs still served' '9328 9329' \
  "$(jq -r '[.served[].pr] | join(" ")' "$STATE_DIR/testapp.json")"
check 'the still-served PRs kept their comment ids' '9328 9329' \
  "$(jq -r '[.served[] | select(.commentId != null) | .pr] | join(" ")' "$STATE_DIR/testapp.json")"
check 'the boot time survives a re-advertise' '2026-01-01T00:00:00Z' \
  "$(jq -r '.startedAt' "$STATE_DIR/testapp.json")"

# A record already marked stopped belongs to a previous server on this app name.
jq '.stoppedAt = "2026-01-02T00:00:00Z"' "$STATE_DIR/testapp.json" >"$TMP/stopped.json"
mv "$TMP/stopped.json" "$STATE_DIR/testapp.json"
( cmd_advertise --app testapp --branch b --repo o/r --pid 7 ) 2>/dev/null
check 'a stopped record does not donate its boot time to the next server' 'new' \
  "$(case "$(jq -r '.startedAt' "$STATE_DIR/testapp.json")" in
       2026-01-01T00:00:00Z) echo stale ;; *) echo new ;; esac)"
check 'the fresh record is running again, not stopped' 'null' \
  "$(jq -r '.stoppedAt' "$STATE_DIR/testapp.json")"
rm -rf "$TMP"

# ── stop: a PR we never commented on gets no first comment at teardown ────────
TMP=$(mktemp -d)
STATE_DIR="$TMP/state"
DEV_GW_CONFIG="$TMP/dev-gw.json"
printf '%s' '{"box":"testbox","share_base":"http://{app}.testbox.example.invalid"}' >"$DEV_GW_CONFIG"
mkdir -p "$STATE_DIR"
cat >"$STATE_DIR/testapp.json" <<'JSON'
{"schemaVersion":1,"app":"testapp","box":"testbox","url":"http://u","repo":"o/r",
 "branch":"c","pid":1,"startedAt":"2026-01-01T00:00:00Z","stoppedAt":null,
 "served":[{"pr":9328,"branch":"a","commentId":11},
           {"pr":9329,"branch":"b","commentId":null}]}
JSON
missing_tools() { printf ''; }
patch_stopped() { printf '%s\n' "$2" >>"$TMP/patched"; }
upsert_comment() { printf '%s\n' "$2" >>"$TMP/created"; printf '1\thttps://x'; }
( cmd_stop --app testapp ) 2>/dev/null
check 'stop patches only the PR whose comment id we recorded' '11' \
  "$(cat "$TMP/patched" 2>/dev/null)"
check 'stop creates no comment on the PR we never reached' '' \
  "$(cat "$TMP/created" 2>/dev/null)"
check 'stop marks the record stopped' 'stopped' \
  "$(case "$(jq -r '.stoppedAt' "$STATE_DIR/testapp.json")" in
       null) echo running ;; *) echo stopped ;; esac)"
rm -rf "$TMP"

printf '\n%d passed, %d failed\n' "$PASS" "$FAIL"
[ "$FAIL" -eq 0 ]
