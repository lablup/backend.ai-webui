#!/usr/bin/env bash
# PreToolUse hook: refuse `gh pr create` / `gh stack submit` until the e2e-flow
# skill (.claude/skills/e2e-flow/SKILL.md) has recorded the current HEAD.
# `require-e2e-flow.sh --record` writes that record; the skill calls it.
#
# Registered with `if` filters in .claude/settings.json, which are best-effort,
# so the command is checked again here (also inside `&&`, `;`, pipes, `$(…)`).
# A denial is JSON on stdout with exit 0; anything unexpected exits 0 silently
# so the hook never blocks unrelated work.

{ read -r head; read -r dir; read -r branch; } < <(git rev-parse HEAD --path-format=absolute --git-common-dir --abbrev-ref HEAD 2>/dev/null)
[ -n "$branch" ] || exit 0
record="$dir/e2e-flow/${branch//\//__}"

if [ "$1" = "--record" ]; then
  mkdir -p "${record%/*}" && printf '%s\n' "$head" > "$record" && echo "$record"
  exit
fi

input=$(cat)
cmd=$(printf '%s' "$input" | python3 -c 'import json,sys; print(json.load(sys.stdin).get("tool_input", {}).get("command", ""))' 2>/dev/null) || exit 0

printf '%s' "$cmd" | grep -qE '(^|[;&|(]|\$\(|`)[[:space:]]*gh[[:space:]]+(pr[[:space:]]+create|stack[[:space:]]+submit)([^[:alnum:]_-]|$)' || exit 0

recorded=$(cat "$record" 2>/dev/null)
[ "$recorded" = "$head" ] && exit 0

if [ -z "$recorded" ]; then
  why="no e2e-flow record for branch '$branch'"
else
  why="the e2e-flow record for '$branch' is for ${recorded:0:10}, but HEAD is now ${head:0:10}"
fi

WHY="$why" python3 -c '
import json, os
why = os.environ["WHY"]
print(json.dumps({"hookSpecificOutput": {
    "hookEventName": "PreToolUse",
    "permissionDecision": "deny",
    "permissionDecisionReason": f"Blocked: {why}. Run the e2e-flow skill (.claude/skills/e2e-flow/SKILL.md) before opening the PR.",
    "additionalContext": "The e2e-flow skill compares the branch diff with the cases in e2e/ and e2e-agent/, asks about any changed user flow, writes the ## E2E flow PR body section, and records HEAD. Retry the same command after it finishes.",
}}))
' 2>/dev/null
exit 0
