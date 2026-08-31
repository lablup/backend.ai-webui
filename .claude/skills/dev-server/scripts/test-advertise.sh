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

# ── Jira key from a PR body ───────────────────────────────────────────────────
check 'jira_key from Resolves line' 'FR-3810' \
  "$(jira_key 'Resolves #9329 (FR-3810)

## What
…')"
check 'jira_key takes the first key only' 'FR-3810' \
  "$(jira_key 'Resolves #9329 (FR-3810), relates to (FR-3811)')"
check 'jira_key is empty when the body names none' '' "$(jira_key 'no ticket here')"

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

printf '\n%d passed, %d failed\n' "$PASS" "$FAIL"
[ "$FAIL" -eq 0 ]
