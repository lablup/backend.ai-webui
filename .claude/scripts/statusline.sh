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
  if mt=$(stat -f %m "$1" 2>/dev/null); then echo "$mt"; return; fi  # macOS
  stat -c %Y "$1" 2>/dev/null || echo 0                               # Linux
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

# ── VS Code link (⧉ VS Code → opens workspace in VS Code) ──
# URL scheme:
#   Remote (SSH): vscode://vscode-remote/ssh-remote+<host><path>
#     Host resolution (first match wins):
#       1. $CLAUDE_STATUSLINE_SSH_HOST — explicit override (ssh-config alias or public hostname),
#          useful when the server IP from SSH_CONNECTION isn't reachable from the client
#          (NAT, VPN, port forwarding) or when key-based auth is tied to a hostname.
#       2. `<whoami>@<server-ip>` from SSH_CONNECTION — zero-config default; the third field is
#          the exact address the client connected to, which is always reachable back.
#   Local (no SSH): vscode://file<path>
VSCODE_PART=""
if [[ -n "$WORKSPACE" ]]; then
  VSCODE_WS=$(find "$WORKSPACE" -maxdepth 1 -name '*.code-workspace' -print -quit 2>/dev/null) || true
  VSCODE_TARGET_RAW="${VSCODE_WS:-$WORKSPACE}"
  # %-encode path segments (preserve /) so spaces and reserved chars survive OSC 8 / URI parsing.
  VSCODE_TARGET=$(python3 -c 'import sys,urllib.parse;print(urllib.parse.quote(sys.argv[1], safe="/"))' "$VSCODE_TARGET_RAW" 2>/dev/null) || VSCODE_TARGET="$VSCODE_TARGET_RAW"
  VSCODE_URL=""
  if [[ -n "${SSH_CONNECTION:-}" ]]; then
    VSCODE_HOST="${CLAUDE_STATUSLINE_SSH_HOST:-}"
    if [[ -z "$VSCODE_HOST" ]]; then
      VSCODE_IP=$(awk '{print $3}' <<< "$SSH_CONNECTION")
      [[ -n "$VSCODE_IP" ]] && VSCODE_HOST="$(whoami)@${VSCODE_IP}"
    fi
    [[ -n "$VSCODE_HOST" ]] && VSCODE_URL="vscode://vscode-remote/ssh-remote+${VSCODE_HOST}${VSCODE_TARGET}"
  else
    VSCODE_URL="vscode://file${VSCODE_TARGET}"
  fi
  [[ -n "$VSCODE_URL" ]] && VSCODE_PART=$(link "$VSCODE_URL" "⧉ VS Code")
fi

# Fallback output when there is no Jira/Teams context:
#   line 1 = worktree info + VS Code link (if available), line 2 = model/tokens.
emit_fallback() {
  local line1=""
  if [[ -n "${WORKTREE_PART:-}" ]]; then
    line1+="$WORKTREE_PART"
  fi
  if [[ -n "$VSCODE_PART" ]]; then
    [[ -n "$line1" ]] && line1+="  "
    line1+="$VSCODE_PART"
  fi
  if [[ -n "$line1" ]]; then
    printf '%b\n%b' "$line1" "$MODEL_PART"
  else
    printf '%b' "$MODEL_PART"
  fi
}

# ── If no workspace, show only model/token ───────────────
if [[ -z "$WORKSPACE" ]]; then
  emit_fallback
  exit 0
fi

# ── Worktree & git safety indicator ──────────────────────
# Detects: worktree name, uncommitted changes, unpushed commits
# Output: WORKTREE_PART = colored string for status line
WORKTREE_PART=""
if [[ -n "$WORKSPACE" ]] && git -C "$WORKSPACE" rev-parse --git-dir >/dev/null 2>&1; then
  # Safety check: uncommitted changes or unpushed commits
  WT_DIRTY=0
  WT_DETAIL=""
  if ! git -C "$WORKSPACE" diff-index --quiet HEAD -- 2>/dev/null; then
    WT_DIRTY=1
    WT_DETAIL="uncommitted"
  elif [[ -n "$(git -C "$WORKSPACE" ls-files --others --exclude-standard 2>/dev/null | head -1)" ]]; then
    WT_DIRTY=1
    WT_DETAIL="untracked"
  fi

  WT_UNPUSHED=0
  if git -C "$WORKSPACE" rev-parse '@{u}' >/dev/null 2>&1; then
    WT_UNPUSHED=$(git -C "$WORKSPACE" rev-list --count '@{u}..HEAD' 2>/dev/null) || WT_UNPUSHED=0
  fi

  # Build indicator
  if (( WT_DIRTY )); then
    WT_ICON="\033[91m⚠ ${WT_DETAIL}\033[0m"  # red
  elif (( WT_UNPUSHED > 0 )); then
    WT_ICON="\033[93m↑${WT_UNPUSHED}\033[0m"  # yellow
  else
    WT_ICON="\033[32m✓\033[0m"  # green = safe to delete
  fi

  # Compose: safety indicator only (✓/⚠/↑N)
  WORKTREE_PART="$WT_ICON"
fi

# ── Extract branch and repo info ──────────────────────────
BRANCH=$(git -C "$WORKSPACE" rev-parse --abbrev-ref HEAD 2>/dev/null) || { emit_fallback; exit 0; }
JIRA_KEY=$(echo "$BRANCH" | grep -oiE 'fr-[0-9]+' | head -1 | tr '[:lower:]' '[:upper:]') || true

# No Jira key on this branch → show only VS Code + model/token
if [[ -z "$JIRA_KEY" ]]; then
  emit_fallback
  exit 0
fi

# Derive GitHub owner/repo from origin remote
GH_REPO=$(git -C "$WORKSPACE" remote get-url origin 2>/dev/null \
  | sed -E 's#.*github\.com[:/]##; s/\.git$//' ) || true
[[ -z "$GH_REPO" ]] && { emit_fallback; exit 0; }

# ── PR check (non-blocking, stale-while-revalidate) ──────
PR_CACHE_FILE="${CACHE_DIR}/pr-${JIRA_KEY}.txt"

if [[ -f "$PR_CACHE_FILE" ]]; then
  PR_URL=$(cat "$PR_CACHE_FILE" 2>/dev/null) || true
  PR_CACHE_AGE=$(( $(date +%s) - $(file_mtime "$PR_CACHE_FILE") ))
  (( PR_CACHE_AGE >= CACHE_TTL )) && _refresh_pr "$BRANCH" "$PR_CACHE_FILE" "$GH_REPO"
else
  # No cache → background pre-warm, show VS Code + model/token this cycle
  _refresh_pr "$BRANCH" "$PR_CACHE_FILE" "$GH_REPO"
  emit_fallback
  exit 0
fi

if [[ -z "$PR_URL" ]]; then
  emit_fallback
  exit 0
fi

# ── Jira fetch (non-blocking, stale-while-revalidate) ────
CACHE_FILE="${CACHE_DIR}/${JIRA_KEY}.json"

if [[ -f "$CACHE_FILE" ]]; then
  JIRA_CACHE_AGE=$(( $(date +%s) - $(file_mtime "$CACHE_FILE") ))
  (( JIRA_CACHE_AGE >= CACHE_TTL )) && _refresh_jira "$JIRA_KEY" "$CACHE_FILE"
else
  # No Jira cache → background pre-warm, show VS Code + model/token this cycle
  _refresh_jira "$JIRA_KEY" "$CACHE_FILE"
  emit_fallback
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

# ── Line 1: Worktree + Links (VS Code + Teams + Jira) ────
LINE1=""

if [[ -n "$WORKTREE_PART" ]]; then
  LINE1+="$WORKTREE_PART"
  LINE1+="  "
fi

if [[ -n "$VSCODE_PART" ]]; then
  LINE1+="$VSCODE_PART"
  LINE1+="  "
fi

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
