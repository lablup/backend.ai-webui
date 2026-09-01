#!/usr/bin/env bash
# PreToolUse hook: block Graphite (gt) CLI invocations.
#
# Graphite is banned in this repository (FR-3391) — stacked-PR work goes
# through GitHub Stacked PRs (`gh stack`; see .claude/skills/gh-stack/).
# The permissions deny rule in .claude/settings.json covers plain `gt ...`
# commands; this hook also catches `gt` reached through pipes, `;`, `&&`,
# subshells, or backticks, which prefix-matching deny rules cannot see.
#
# Matches `gt` only as a command word — `-gt` numeric comparisons and
# substrings like `mgt` do not trigger it.

input=$(cat)
cmd=$(printf '%s' "$input" | python3 -c 'import json,sys; print(json.load(sys.stdin).get("tool_input", {}).get("command", ""))' 2>/dev/null) || exit 0

if printf '%s' "$cmd" | grep -qE '(^|[;&|]|\$\(|`)[[:space:]]*gt([[:space:]]|$)'; then
  echo "Blocked: Graphite (gt) is banned in this repo (FR-3391). Use 'gh stack' instead — see .claude/skills/gh-stack/SKILL.md." >&2
  exit 2
fi
exit 0
