#!/bin/bash
# Claude Code statusline: Teams thread + Jira issue (single line)
# Reads session JSON from stdin, extracts git branch, queries Jira with caching.
#
# Strategy: Stale-While-Revalidate
#   - Never blocks on network calls; always serves from cache instantly
#   - Stale cache → serve immediately + background refresh
#   - No cache (new branch) → show nothing + background pre-warm
#
# Docs: https://docs.anthropic.com/en/docs/claude-code/statusline
# Requires: ~/.config/atlassian/credentials (ATLASSIAN_EMAIL + ATLASSIAN_API_TOKEN)
# Jira fields: customfield_10176 = Teams thread URL

set -euo pipefail

CACHE_DIR="${HOME}/.cache/claude-statusline"
CACHE_TTL=300  # 5 minutes
mkdir -p "$CACHE_DIR"

# Cross-platform file modification time (seconds since epoch)
file_mtime() {
  if stat -f %m "$1" 2>/dev/null; then return; fi  # macOS
  stat -c %Y "$1" 2>/dev/null || echo 0             # Linux
}

# OSC 8 clickable link: link <url> <text>
link() { printf '\033]8;;%s\033\\%s\033]8;;\033\\' "$1" "$2"; }

# Background PR cache refresh: _refresh_pr <branch> <cache_file> <gh_repo>
_refresh_pr() {
  ( _url=$(gh pr view "$1" --repo "$3" --json url -q .url 2>/dev/null) || true
    echo "$_url" > "$2"
  ) &disown 2>/dev/null
}

# Background Jira cache refresh: _refresh_jira <jira_key> <cache_file>
_refresh_jira() {
  ( CRED_FILE="${ATLASSIAN_CRED_FILE:-$HOME/.config/atlassian/credentials}"
    [[ -f "$CRED_FILE" ]] && source "$CRED_FILE"
    if [[ -n "${ATLASSIAN_EMAIL:-}" && -n "${ATLASSIAN_API_TOKEN:-}" ]]; then
      AUTH=$(printf '%s:%s' "$ATLASSIAN_EMAIL" "$ATLASSIAN_API_TOKEN" | base64 | tr -d '\n')
      RESP=$(curl -s --max-time 3 \
        "https://lablup.atlassian.net/rest/api/3/issue/${1}?fields=summary,status,customfield_10176" \
        -H "Authorization: Basic ${AUTH}" \
        -H "Content-Type: application/json" 2>/dev/null) || RESP=""
      if [[ -n "$RESP" ]] && echo "$RESP" | python3 -c 'import json,sys; d=json.load(sys.stdin); assert "fields" in d' 2>/dev/null; then
        echo "$RESP" > "$2"
      fi
    fi
  ) &disown 2>/dev/null
}

# ── Extract workspace from session JSON ──────────────────
WORKSPACE=$(python3 -c '
import json, sys
try:
    data = json.load(sys.stdin)
    print(data.get("workspace", {}).get("current_dir", ""))
except Exception: pass
' 2>/dev/null) || true

[[ -z "$WORKSPACE" ]] && exit 0

# ── Extract branch and repo info ──────────────────────────
BRANCH=$(git -C "$WORKSPACE" rev-parse --abbrev-ref HEAD 2>/dev/null) || exit 0
JIRA_KEY=$(echo "$BRANCH" | grep -oiE 'fr-[0-9]+' | head -1 | tr '[:lower:]' '[:upper:]') || true
[[ -z "$JIRA_KEY" ]] && exit 0

# Derive GitHub owner/repo from origin remote
GH_REPO=$(git -C "$WORKSPACE" remote get-url origin 2>/dev/null \
  | sed -E 's#.*github\.com[:/]##; s/\.git$//' ) || true
[[ -z "$GH_REPO" ]] && exit 0

# ── PR check (non-blocking, stale-while-revalidate) ──────
PR_CACHE_FILE="${CACHE_DIR}/pr-${JIRA_KEY}.txt"

if [[ -f "$PR_CACHE_FILE" ]]; then
  PR_URL=$(cat "$PR_CACHE_FILE" 2>/dev/null) || true
  PR_CACHE_AGE=$(( $(date +%s) - $(file_mtime "$PR_CACHE_FILE") ))
  (( PR_CACHE_AGE >= CACHE_TTL )) && _refresh_pr "$BRANCH" "$PR_CACHE_FILE" "$GH_REPO"
else
  # No cache → background pre-warm, show nothing this cycle
  _refresh_pr "$BRANCH" "$PR_CACHE_FILE" "$GH_REPO"
  exit 0
fi

[[ -z "$PR_URL" ]] && exit 0

# ── Jira fetch (non-blocking, stale-while-revalidate) ────
CACHE_FILE="${CACHE_DIR}/${JIRA_KEY}.json"

if [[ -f "$CACHE_FILE" ]]; then
  JIRA_CACHE_AGE=$(( $(date +%s) - $(file_mtime "$CACHE_FILE") ))
  (( JIRA_CACHE_AGE >= CACHE_TTL )) && _refresh_jira "$JIRA_KEY" "$CACHE_FILE"
else
  # No Jira cache → background pre-warm, show nothing this cycle
  _refresh_jira "$JIRA_KEY" "$CACHE_FILE"
  exit 0
fi

# ── Parse all fields in a single python3 call ────────────
# Outputs tab-separated: summary \t status \t teams_url
PARSED=$(python3 -c '
import json, sys
try:
    d = json.load(sys.stdin)
    f = d.get("fields", {})
    summary = f.get("summary", "")
    status = (f.get("status") or {}).get("name", "")
    teams = f.get("customfield_10176", "") or ""
    summary = summary.replace("\t", " ")
    print(f"{summary}\t{status}\t{teams}")
except Exception:
    print("\t\t")
' < "$CACHE_FILE" 2>/dev/null) || true

IFS=$'\t' read -r JIRA_SUMMARY JIRA_STATUS TEAMS_URL <<< "$PARSED"

# ── Build single-line output: Teams | Jira ───────────────
LINE=""

if [[ -n "$TEAMS_URL" ]]; then
  LINE+=$(link "$TEAMS_URL" "Teams")
fi

[[ -n "$LINE" ]] && LINE+="  "
JIRA_URL="https://lablup.atlassian.net/browse/${JIRA_KEY}"
LINE+=$(link "$JIRA_URL" "$JIRA_KEY")

if [[ -n "$JIRA_STATUS" ]]; then
  LINE+=" (${JIRA_STATUS})"
fi

if [[ -n "$JIRA_SUMMARY" ]]; then
  if (( ${#JIRA_SUMMARY} > 45 )); then
    JIRA_SUMMARY="${JIRA_SUMMARY:0:42}..."
  fi
  LINE+=": ${JIRA_SUMMARY}"
fi

printf '%b' "$LINE"
