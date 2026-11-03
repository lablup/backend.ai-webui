#!/usr/bin/env bash
# PreToolUse hook: block Graphite (gt) CLI invocations.
#
# Graphite is banned in this repository (FR-3391) — stacked-PR work goes
# through GitHub Stacked PRs (`gh stack`; see .claude/skills/gh-stack/).
# The permissions deny rule in .claude/settings.json covers plain `gt ...`
# commands; this hook catches `gt` as the command word of any simple command:
# after `;`, `&&`, `|`, subshells, `$(…)` or backticks, behind assignments,
# `env`, `command`, `time`, `!`, `xargs`, `{`, `then`/`do`/`else`, or as a path (`/x/gt`).
# `-gt` numeric comparisons and substrings like `mgt` do not trigger it.

BLOCKED="Blocked: Graphite (gt) is banned in this repo (FR-3391). Use 'gh stack' instead — see .claude/skills/gh-stack/SKILL.md."

input=$(cat)
cmd=$(printf '%s' "$input" | python3 -c 'import json,sys; print(json.load(sys.stdin).get("tool_input", {}).get("command", ""))' 2>/dev/null) || exit 0

FIND=$(cat <<'PY'
import os, re, shlex, sys
cmd = sys.stdin.read()
keep, ends = [], []
for line in cmd.split('\n'):  # drop heredoc bodies: their lines are data, not commands
    if ends:
        if line.strip() == ends[0]:
            ends.pop(0)
        continue
    keep.append(line)
    ends += [m.group(2) for m in re.finditer(r'<<-?\s*([\'"]?)(\w+)\1', line)]
cmd = '\n'.join(keep)
PREFIX = {'env', 'command', 'time', 'nohup', 'exec', '!', '{', 'then', 'do', 'else', 'elif', 'if', 'while', 'until', 'xargs'}
text, n = re.sub(r'\\\n', ' ', cmd).replace('\n', ' ; '), 0
while '`' in text:
    text = text.replace('`', ' ( ' if n % 2 == 0 else ' ) ', 1)
    n += 1
lex = shlex.shlex(text, posix=True, punctuation_chars=';&|()<>')
lex.whitespace_split = True

def is_gt(c):
    while c and (re.match(r'^[A-Za-z_]\w*=', c[0]) or c[0] in PREFIX or (c[0].startswith('-') and c[0] != '-')):
        c = c[1:]  # also skips the options of env / xargs / time
    return bool(c) and os.path.basename(c[0]) == 'gt'

cur = []
for t in lex:
    if t and set(t) <= set(';&|()<>'):
        if is_gt(cur):
            print('gt'); sys.exit()
        cur = []
    else:
        cur.append(t)
print('gt' if is_gt(cur) else 'none')
PY
)
verdict=$(printf '%s' "$cmd" | python3 -c "$FIND" 2>/dev/null) || verdict=''
if [ -z "$verdict" ]; then
  # the tokenizer failed (unbalanced quotes, a heredoc): fall back to a plain match on the raw text
  printf '%s' "$cmd" | grep -qE '(^|[;&|({!]|\$\(|`|then|do|else|xargs|env|command|time)[[:space:]]*([A-Za-z_][A-Za-z0-9_]*=[^[:space:]]*[[:space:]]+)*([^[:space:]]*/)?gt([[:space:]]|$)' && verdict=gt
fi
if [ "$verdict" = gt ]; then
  echo "$BLOCKED" >&2
  exit 2
fi
exit 0
