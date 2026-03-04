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

# ── Read all stdin once (can only be read once) ───────────
SESSION_JSON=$(cat)

# ── Extract model + token info ───────────────────────────
MODEL_PART=$(echo "$SESSION_JSON" | python3 -c '
import json, sys
try:
    data = json.load(sys.stdin)
    model = (data.get("model") or {}).get("display_name", "Unknown Model")
    cw = data.get("context_window") or {}
    used = cw.get("used_percentage")
    inp = (cw.get("current_usage") or {}).get("input_tokens")
    out = (cw.get("current_usage") or {}).get("output_tokens")

    model_str = f"\033[36m{model}\033[0m"

    if used is not None:
        used_int = round(used)
        color = "\033[31m" if used_int >= 80 else "\033[33m" if used_int >= 50 else "\033[32m"
        usage_str = f"{color}{used:.1f}% used\033[0m"
        token_detail = f" \033[90m(in:{inp} out:{out})\033[0m" if inp is not None and out is not None else ""
        print(f"{model_str} | Tokens: {usage_str}{token_detail}", end="")
    else:
        print(f"{model_str} | Tokens: \033[90mno data yet\033[0m", end="")
except Exception:
    pass
' 2>/dev/null) || true

# ── Extract workspace from session JSON ──────────────────
WORKSPACE=$(echo "$SESSION_JSON" | python3 -c '
import json, sys
try:
    data = json.load(sys.stdin)
    print(data.get("workspace", {}).get("current_dir", ""))
except Exception: pass
' 2>/dev/null) || true

# ── If no workspace, show only model/token ───────────────
if [[ -z "$WORKSPACE" ]]; then
  printf '%b' "$MODEL_PART"
  exit 0
fi

# ── Extract branch and repo info ──────────────────────────
BRANCH=$(git -C "$WORKSPACE" rev-parse --abbrev-ref HEAD 2>/dev/null) || { printf '%b' "$MODEL_PART"; exit 0; }
JIRA_KEY=$(echo "$BRANCH" | grep -oiE 'fr-[0-9]+' | head -1 | tr '[:lower:]' '[:upper:]') || true

# No Jira key on this branch → show only model/token
if [[ -z "$JIRA_KEY" ]]; then
  printf '%b' "$MODEL_PART"
  exit 0
fi

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
  # No cache → background pre-warm, show only model/token this cycle
  _refresh_pr "$BRANCH" "$PR_CACHE_FILE" "$GH_REPO"
  printf '%b' "$MODEL_PART"
  exit 0
fi

if [[ -z "$PR_URL" ]]; then
  printf '%b' "$MODEL_PART"
  exit 0
fi

# ── Jira fetch (non-blocking, stale-while-revalidate) ────
CACHE_FILE="${CACHE_DIR}/${JIRA_KEY}.json"

if [[ -f "$CACHE_FILE" ]]; then
  JIRA_CACHE_AGE=$(( $(date +%s) - $(file_mtime "$CACHE_FILE") ))
  (( JIRA_CACHE_AGE >= CACHE_TTL )) && _refresh_jira "$JIRA_KEY" "$CACHE_FILE"
else
  # No Jira cache → background pre-warm, show only model/token this cycle
  _refresh_jira "$JIRA_KEY" "$CACHE_FILE"
  printf '%b' "$MODEL_PART"
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

# ── Line 1: Links (Teams + Jira) ─────────────────────────
LINE1=""

if [[ -n "$TEAMS_URL" ]]; then
  LINE1+=$(link "$TEAMS_URL" "Teams")
  LINE1+="  "
fi

JIRA_URL="https://lablup.atlassian.net/browse/${JIRA_KEY}"
LINE1+=$(link "$JIRA_URL" "$JIRA_KEY")

if [[ -n "$JIRA_STATUS" ]]; then
  LINE1+=" (${JIRA_STATUS})"
fi

if [[ -n "$JIRA_SUMMARY" ]]; then
  if (( ${#JIRA_SUMMARY} > 45 )); then
    JIRA_SUMMARY="${JIRA_SUMMARY:0:42}..."
  fi
  LINE1+=": ${JIRA_SUMMARY}"
fi

# ── Line 2: Model + token info ────────────────────────────
printf '%b\n%b' "$LINE1" "$MODEL_PART"
