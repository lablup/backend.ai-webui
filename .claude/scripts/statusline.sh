#!/bin/bash
# Claude Code statusline: Teams thread + Jira issue (single line)
# Reads session JSON from stdin, extracts git branch, queries Jira with caching.
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

# ── Extract workspace from session JSON ──────────────────
# Single python3 call parses stdin JSON
WORKSPACE=$(python3 -c '
import json, sys
try:
    data = json.load(sys.stdin)
    print(data.get("workspace", {}).get("current_dir", ""))
except Exception: pass
' 2>/dev/null) || true

[[ -z "$WORKSPACE" ]] && exit 0

# ── Extract Jira key from git branch ─────────────────────
BRANCH=$(git -C "$WORKSPACE" rev-parse --abbrev-ref HEAD 2>/dev/null) || exit 0
JIRA_KEY=$(echo "$BRANCH" | grep -oiE 'fr-[0-9]+' | head -1 | tr '[:lower:]' '[:upper:]') || true
[[ -z "$JIRA_KEY" ]] && exit 0

# ── Fetch Jira issue (with caching) ──────────────────────
CACHE_FILE="${CACHE_DIR}/${JIRA_KEY}.json"

if [[ -f "$CACHE_FILE" ]]; then
  CACHE_AGE=$(( $(date +%s) - $(file_mtime "$CACHE_FILE") ))
else
  CACHE_AGE=$((CACHE_TTL + 1))  # force fetch
fi

if (( CACHE_AGE >= CACHE_TTL )); then
  CRED_FILE="${ATLASSIAN_CRED_FILE:-$HOME/.config/atlassian/credentials}"
  [[ -f "$CRED_FILE" ]] && source "$CRED_FILE"

  if [[ -n "${ATLASSIAN_EMAIL:-}" && -n "${ATLASSIAN_API_TOKEN:-}" ]]; then
    AUTH=$(printf '%s:%s' "$ATLASSIAN_EMAIL" "$ATLASSIAN_API_TOKEN" | base64 | tr -d '\n')
    RESP=$(curl -s --max-time 3 \
      "https://lablup.atlassian.net/rest/api/3/issue/${JIRA_KEY}?fields=summary,status,customfield_10176" \
      -H "Authorization: Basic ${AUTH}" \
      -H "Content-Type: application/json" 2>/dev/null) || RESP=""

    # Only cache valid responses (must have "fields" key)
    if [[ -n "$RESP" ]] && echo "$RESP" | python3 -c 'import json,sys; d=json.load(sys.stdin); assert "fields" in d' 2>/dev/null; then
      echo "$RESP" > "$CACHE_FILE"
    fi
  fi
fi

[[ ! -f "$CACHE_FILE" ]] && exit 0

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
