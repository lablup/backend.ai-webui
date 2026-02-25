#!/bin/bash
# scripts/jira.sh — Jira CLI wrapper for Claude Code agents
#
# Replaces Atlassian MCP with direct REST API calls.
# Handles custom fields, auth, and JSON construction internally
# so agents only need simple CLI arguments.
#
# Description fields accept Markdown, which is automatically converted
# to Atlassian Document Format (ADF) for proper rendering in Jira.
#
# Setup (one-time):
#   export ATLASSIAN_EMAIL="your@email.com"
#   export ATLASSIAN_API_TOKEN="your-api-token"
#   Or create ~/.config/atlassian/credentials with those two lines.
#
# Usage:
#   jira.sh create  --type Task --title "Title" [--desc "..."] [--labels "l1,l2"]
#   jira.sh get     FR-XXXX
#   jira.sh update  FR-XXXX [--assignee me] [--sprint current] [--desc "..."] [--comment "text"]
#   jira.sh search  "JQL query" [--limit 20]
#   jira.sh comment FR-XXXX "Comment text"
#   jira.sh myself

set -euo pipefail

# ── Project Config (hardcoded for backend.ai-webui) ─────────
SITE="lablup.atlassian.net"
PROJECT="FR"
API="https://${SITE}/rest/api/3"
GITHUB_REPO_FIELD_VALUE='{"id":"10232"}'  # customfield_10173

# ── Helpers ──────────────────────────────────────────────────
die() { echo "error: $*" >&2; exit 1; }

init_auth() {
  CRED_FILE="${ATLASSIAN_CRED_FILE:-$HOME/.config/atlassian/credentials}"
  if [[ -f "$CRED_FILE" ]]; then
    if [[ -z "${ATLASSIAN_EMAIL:-}" || -z "${ATLASSIAN_API_TOKEN:-}" ]]; then
      while IFS='=' read -r key value; do
        case "$key" in
          ATLASSIAN_EMAIL)     [[ -z "${ATLASSIAN_EMAIL:-}" ]] && ATLASSIAN_EMAIL=$value ;;
          ATLASSIAN_API_TOKEN) [[ -z "${ATLASSIAN_API_TOKEN:-}" ]] && ATLASSIAN_API_TOKEN=$value ;;
        esac
      done < <(grep -E '^\s*(export\s+)?(ATLASSIAN_EMAIL|ATLASSIAN_API_TOKEN)=' "$CRED_FILE" | sed 's/^[[:space:]]*//; s/^export[[:space:]]*//')
    fi
  fi
  : "${ATLASSIAN_EMAIL:?Set ATLASSIAN_EMAIL or create ${CRED_FILE}}"
  : "${ATLASSIAN_API_TOKEN:?Set ATLASSIAN_API_TOKEN or create ${CRED_FILE}}"
  AUTH=$(printf '%s:%s' "$ATLASSIAN_EMAIL" "$ATLASSIAN_API_TOKEN" | base64 | tr -d '\n')
}

api() {
  local method=$1 endpoint=$2; shift 2
  local tmp; tmp=$(mktemp)
  local code
  code=$(curl -s -o "$tmp" -w '%{http_code}' -X "$method" \
    "${API}${endpoint}" \
    -H "Authorization: Basic ${AUTH}" \
    -H "Content-Type: application/json" \
    "$@") || { rm -f "$tmp"; die "curl failed"; }
  local body; body=$(<"$tmp"); rm -f "$tmp"
  if (( code >= 400 )); then
    die "HTTP ${code}: ${body}"
  fi
  [[ -n "$body" ]] && printf '%s' "$body"
  return 0
}

require_jq() { command -v jq &>/dev/null || die "jq required: brew install jq"; }

# Convert Markdown text to Atlassian Document Format (ADF) JSON.
# Handles: headings, bullet/ordered lists, code blocks, bold, inline code, paragraphs.
md_to_adf() {
  python3 -c '
import json, re, sys

text = sys.argv[1]
lines = text.split("\n")
content = []
in_code = False
code_lang = ""
code_lines = []
# Collect list items: (type, depth, text, number_or_none)
pending_list = []
# Track the last ordered list end number so a resumed list can set attrs.order
last_ordered_end = 0

def parse_inline(text):
    """Parse inline markdown (bold, code) into ADF inline nodes."""
    nodes = []
    pattern = r"(\*\*[^*]+\*\*|`[^`]+`)"
    parts = re.split(pattern, text)
    for part in parts:
        if not part:
            continue
        if part.startswith("**") and part.endswith("**"):
            nodes.append({"type": "text", "text": part[2:-2], "marks": [{"type": "strong"}]})
        elif part.startswith("`") and part.endswith("`"):
            nodes.append({"type": "text", "text": part[1:-1], "marks": [{"type": "code"}]})
        else:
            nodes.append({"type": "text", "text": part})
    return nodes if nodes else [{"type": "text", "text": text}]

def build_list_nodes(items, start_number=None):
    """Build nested ADF list nodes from flat (type, depth, text, num) items."""
    if not items:
        return [], 0
    result = []
    i = 0
    total_ordered_items = 0
    while i < len(items):
        list_type, depth, item_text, num = items[i]
        same_list = []
        first_num = num
        while i < len(items) and items[i][0] == list_type and items[i][1] == depth:
            _, _, txt, n = items[i]
            i += 1
            children = []
            while i < len(items) and items[i][1] > depth:
                children.append(items[i])
                i += 1
            same_list.append((txt, children))

        list_node = {"type": list_type, "content": []}
        # Set start number for ordered lists that dont start at 1
        if list_type == "orderedList" and first_num and first_num > 1:
            list_node["attrs"] = {"order": first_num}
        if list_type == "orderedList" and start_number and start_number > 1 and (not first_num or first_num <= 1):
            list_node["attrs"] = {"order": start_number}

        for txt, children in same_list:
            item_content = [{"type": "paragraph", "content": parse_inline(txt)}]
            child_nodes, _ = build_list_nodes(children)
            item_content.extend(child_nodes)
            list_node["content"].append({"type": "listItem", "content": item_content})

        if list_type == "orderedList":
            order_start = list_node.get("attrs", {}).get("order", 1)
            total_ordered_items = order_start + len(same_list) - 1
        result.append(list_node)
    return result, total_ordered_items

def flush_list():
    """Flush pending list items into nested ADF list nodes."""
    global pending_list, last_ordered_end
    if not pending_list:
        return
    nodes, end_num = build_list_nodes(pending_list)
    content.extend(nodes)
    if end_num > 0:
        last_ordered_end = end_num
    pending_list = []

for line in lines:
    # Code block toggle
    m = re.match(r"^```(\w*)$", line)
    if m:
        if not in_code:
            flush_list()
            code_lang = m.group(1) or None
            code_lines = []
            in_code = True
        else:
            node = {"type": "codeBlock", "content": [{"type": "text", "text": "\n".join(code_lines)}]}
            if code_lang:
                node["attrs"] = {"language": code_lang}
            content.append(node)
            in_code = False
        continue

    if in_code:
        code_lines.append(line)
        continue

    # Heading
    m = re.match(r"^(#{1,6})\s+(.*)", line)
    if m:
        flush_list()
        level = len(m.group(1))
        content.append({
            "type": "heading",
            "attrs": {"level": level},
            "content": parse_inline(m.group(2))
        })
        continue

    # Unordered list: "- item" or "  - item"
    m = re.match(r"^(\s*)[-*]\s+(.*)", line)
    if m:
        depth = len(m.group(1)) // 2
        if pending_list and depth == 0 and pending_list[0][0] != "bulletList":
            flush_list()
        pending_list.append(("bulletList", depth, m.group(2), None))
        continue

    # Ordered list: "1. item" or "   1. item"
    m = re.match(r"^(\s*)(\d+)\.\s+(.*)", line)
    if m:
        depth = len(m.group(1)) // 2
        num = int(m.group(2))
        if pending_list and depth == 0 and pending_list[0][0] != "orderedList":
            flush_list()
        pending_list.append(("orderedList", depth, m.group(3), num))
        continue

    # Non-list line: flush pending list, then handle
    flush_list()
    stripped = line.strip()
    if stripped:
        content.append({"type": "paragraph", "content": parse_inline(stripped)})

flush_list()

doc = {"type": "doc", "version": 1, "content": content if content else [{"type": "paragraph", "content": [{"type": "text", "text": " "}]}]}
print(json.dumps(doc, ensure_ascii=False))
' "$1"
}

# Convert ADF JSON to readable Markdown text (for cmd_get output).
adf_to_text() {
  python3 -c '
import json, sys

def inline_to_text(nodes):
    result = ""
    for node in nodes:
        text = node.get("text", "")
        marks = node.get("marks", [])
        mark_types = [m["type"] for m in marks]
        if "code" in mark_types:
            text = f"`{text}`"
        if "strong" in mark_types:
            text = f"**{text}**"
        result += text
    return result

def node_to_text(node, depth=0):
    t = node.get("type", "")
    if t == "heading":
        level = node.get("attrs", {}).get("level", 2)
        return "#" * level + " " + inline_to_text(node.get("content", []))
    elif t == "paragraph":
        return inline_to_text(node.get("content", []))
    elif t == "codeBlock":
        lang = node.get("attrs", {}).get("language", "")
        code = inline_to_text(node.get("content", []))
        return f"```{lang}\n{code}\n```"
    elif t == "bulletList":
        items = []
        for item in node.get("content", []):
            inner = "\n".join(node_to_text(c, depth+1) for c in item.get("content", []))
            items.append("- " + inner)
        return "\n".join(items)
    elif t == "orderedList":
        items = []
        for i, item in enumerate(node.get("content", []), 1):
            inner = "\n".join(node_to_text(c, depth+1) for c in item.get("content", []))
            items.append(f"{i}. " + inner)
        return "\n".join(items)
    elif t == "text":
        return inline_to_text([node])
    else:
        # Fallback: recurse into content
        parts = [node_to_text(c, depth) for c in node.get("content", [])]
        return "\n".join(parts)

try:
    doc = json.loads(sys.argv[1])
    if isinstance(doc, str):
        # v2 plain text fallback
        print(doc)
    else:
        parts = [node_to_text(n) for n in doc.get("content", [])]
        print("\n\n".join(parts))
except (json.JSONDecodeError, TypeError):
    print(sys.argv[1])
' "$1"
}

get_my_account_id() {
  api GET "/myself" | jq -r '.accountId'
}

get_current_sprint_id() {
  local jql="project = ${PROJECT} AND sprint in openSprints()"
  local tmp; tmp=$(mktemp)
  local code
  code=$(curl -s -o "$tmp" -w '%{http_code}' -X GET \
    "${API}/search/jql?jql=$(python3 -c 'import sys, urllib.parse; print(urllib.parse.quote(sys.argv[1]))' "$jql")&maxResults=1&fields=customfield_10020" \
    -H "Authorization: Basic ${AUTH}" \
    -H "Content-Type: application/json") || { rm -f "$tmp"; return 1; }
  local body; body=$(<"$tmp"); rm -f "$tmp"
  if (( code >= 400 )); then return 1; fi
  # Sprint field: array of objects (Cloud) or number
  echo "$body" | jq -r '
    .issues[0].fields.customfield_10020
    | if type == "array" then .[0].id
      elif type == "number" then .
      else empty end
  ' 2>/dev/null
}

# ── Commands ─────────────────────────────────────────────────

cmd_create() {
  local type="Task" title="" desc="" labels=""
  while (( $# )); do
    case $1 in
      --type)   type=$2;   shift 2 ;;
      --title)  title=$2;  shift 2 ;;
      --desc)   desc=$2;   shift 2 ;;
      --labels) labels=$2; shift 2 ;;
      *) die "create: unknown flag $1" ;;
    esac
  done
  [[ -n "$title" ]] || die "create: --title required"

  local labels_json="[]"
  [[ -n "$labels" ]] && labels_json=$(echo "$labels" | tr ',' '\n' | jq -R . | jq -s .)

  # Convert markdown description to ADF
  local desc_json="null"
  if [[ -n "${desc:-}" ]]; then
    desc_json=$(md_to_adf "$desc")
  fi

  local payload
  payload=$(jq -n \
    --arg summary "$title" \
    --arg type "$type" \
    --arg project "$PROJECT" \
    --argjson desc "$desc_json" \
    --argjson labels "$labels_json" \
    --argjson repo "$GITHUB_REPO_FIELD_VALUE" \
    '{
      fields: {
        project: { key: $project },
        summary: $summary,
        description: $desc,
        issuetype: { name: $type },
        labels: $labels,
        customfield_10173: $repo
      }
    }')

  local result
  result=$(api POST "/issue" -d "$payload")
  local key; key=$(echo "$result" | jq -r '.key')
  echo "${key}"
  echo "https://${SITE}/browse/${key}"
}

cmd_get() {
  local key=${1:?get: issue key required}
  local raw
  raw=$(api GET "/issue/${key}?fields=summary,status,assignee,description,labels,customfield_10020,customfield_10170")

  # Extract description as raw JSON (may be ADF object or string)
  local desc_raw
  desc_raw=$(echo "$raw" | jq -r '.fields.description // ""')
  local desc_text
  desc_text=$(adf_to_text "$desc_raw")

  echo "$raw" | jq --arg desc "$desc_text" '{
    key: .key,
    summary: .fields.summary,
    status: .fields.status.name,
    assignee: (.fields.assignee.displayName // "Unassigned"),
    labels: .fields.labels,
    github_issue_url: (.fields.customfield_10170 // null),
    description: $desc
  }'
}

cmd_update() {
  local key=${1:?update: issue key required}; shift
  local fields="{}" comment="" desc=""

  while (( $# )); do
    case $1 in
      --assignee)
        local aid
        if [[ $2 == "me" ]]; then
          aid=$(get_my_account_id)
        else
          aid=$2
        fi
        fields=$(echo "$fields" | jq --arg id "$aid" '. + {assignee:{accountId:$id}}')
        shift 2 ;;
      --sprint)
        local sid
        if [[ $2 == "current" ]]; then
          sid=$(get_current_sprint_id)
          if [[ -z "$sid" || ! "$sid" =~ ^[0-9]+$ ]]; then
            die "update: no active sprint found for --sprint current"
          fi
        else
          sid=$2
          if [[ -z "$sid" || ! "$sid" =~ ^[0-9]+$ ]]; then
            die "update: invalid sprint id '$sid' (must be numeric)"
          fi
        fi
        fields=$(echo "$fields" | jq --argjson id "$sid" '. + {customfield_10020:$id}')
        shift 2 ;;
      --desc)
        desc=$2; shift 2 ;;
      --comment)
        comment=$2; shift 2 ;;
      *) die "update: unknown flag $1" ;;
    esac
  done

  if [[ -n "$desc" ]]; then
    local desc_adf
    desc_adf=$(md_to_adf "$desc")
    fields=$(echo "$fields" | jq --argjson d "$desc_adf" '. + {description:$d}')
  fi

  if [[ "$fields" != "{}" ]]; then
    api PUT "/issue/${key}" -d "$(jq -n --argjson f "$fields" '{fields:$f}')"
    echo "Updated ${key}"
  fi
  if [[ -n "$comment" ]]; then
    cmd_comment "$key" "$comment"
  fi
}

cmd_search() {
  local jql=${1:?search: JQL query required}; shift
  local limit=20
  while (( $# )); do
    case $1 in
      --limit) limit=$2; shift 2 ;;
      *) die "search: unknown flag $1" ;;
    esac
  done

  local tmp; tmp=$(mktemp)
  local code
  code=$(curl -s -o "$tmp" -w '%{http_code}' -G \
    "${API}/search/jql" \
    --data-urlencode "jql=${jql}" \
    --data-urlencode "maxResults=${limit}" \
    --data-urlencode "fields=summary,status,assignee,labels" \
    -H "Authorization: Basic ${AUTH}" \
    -H "Content-Type: application/json") || { rm -f "$tmp"; die "curl failed"; }
  local body; body=$(<"$tmp"); rm -f "$tmp"
  if (( code >= 400 )); then
    die "HTTP ${code}: ${body}"
  fi

  echo "$body" \
    | jq -r '.issues[] | [.key, .fields.status.name, (.fields.assignee.displayName // "-"), .fields.summary] | @tsv'
}

cmd_comment() {
  local key=${1:?comment: issue key required}
  local text=${2:?comment: text required}

  # Convert comment body to ADF
  local body_adf
  body_adf=$(md_to_adf "$text")

  api POST "/issue/${key}/comment" -d "$(jq -n --argjson b "$body_adf" '{body:$b}')" > /dev/null
  echo "Comment added to ${key}"
}

cmd_myself() {
  api GET "/myself" | jq '{accountId:.accountId, name:.displayName, email:.emailAddress}'
}

# ── Main ─────────────────────────────────────────────────────
require_jq
cmd=${1:-help}; shift 2>/dev/null || true

case $cmd in
  help|-h|--help)
    cat <<'USAGE'
Usage: jira.sh <command> [options]

Commands:
  create   --type Task --title "Title" [--desc "..."] [--labels "l1,l2"]
  get      FR-XXXX
  update   FR-XXXX [--assignee me] [--sprint current] [--desc "..."] [--comment "text"]
  search   "JQL query" [--limit 20]
  comment  FR-XXXX "Comment text"
  myself   Show current user info

Description and comment fields accept Markdown, which is automatically
converted to Atlassian Document Format (ADF) for proper Jira rendering.

Auth: ATLASSIAN_EMAIL + ATLASSIAN_API_TOKEN env vars
  or ~/.config/atlassian/credentials file
USAGE
    ;;
  *)
    init_auth
    case $cmd in
      create)  cmd_create "$@" ;;
      get)     cmd_get "$@" ;;
      update)  cmd_update "$@" ;;
      search)  cmd_search "$@" ;;
      comment) cmd_comment "$@" ;;
      myself)  cmd_myself ;;
      *) die "Unknown command: $cmd" ;;
    esac
    ;;
esac
