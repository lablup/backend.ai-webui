#!/usr/bin/env bash
# PreToolUse hook: refuse `gh pr create` / `gh stack submit` on lablup/backend.ai-webui
# until the e2e-flow skill (.claude/skills/e2e-flow/SKILL.md) has recorded the current HEAD.
# A PR command passes only when its target is known to be another repository; anything
# the resolver cannot settle is checked as before.
# `require-e2e-flow.sh --record` writes that record; the skill calls it.
#
# Registered with `if` filters in .claude/settings.json, which are best-effort,
# so the command is checked again here (also inside `&&`, `;`, pipes, `$(…)`).
# A denial is JSON on stdout with exit 0; anything unexpected exits 0 silently
# so the hook never blocks unrelated work.

record_of() { # [dir] -> head, record path, branch on three lines
  { read -r head; read -r dir; read -r branch; } < <(git ${1:+-C "$1"} rev-parse HEAD --path-format=absolute --git-common-dir --abbrev-ref HEAD 2>/dev/null)
  [ -n "$branch" ] && record="$dir/e2e-flow/${branch//\//__}"
}

if [ "$1" = "--record" ]; then
  record_of || exit 0
  mkdir -p "${record%/*}" && printf '%s\n' "$head" > "$record" && echo "$record"
  exit
fi

input=$(cat)
cmd=$(printf '%s' "$input" | python3 -c 'import json,sys; print(json.load(sys.stdin).get("tool_input", {}).get("command", ""))' 2>/dev/null) || exit 0

printf '%s' "$cmd" | grep -qE '(^|[;&|(]|\$\(|`)[[:space:]]*([A-Za-z_][A-Za-z0-9_]*=[^[:space:]]*[[:space:]]+)*gh[[:space:]]+(pr[[:space:]]+create|stack[[:space:]]+submit)([^[:alnum:]_-]|$)' || exit 0

# Prints `skip` when every PR command targets another repository for certain, else `check [<webui checkout>]`.
RESOLVE=$(cat <<'PY'
import json, os, re, shlex, subprocess, sys
WEBUI = 'lablup/backend.ai-webui'
inp = json.load(sys.stdin)
cmd = inp.get('tool_input', {}).get('command', '')
cwd = inp.get('cwd') or os.getcwd()

def slug(v):
    if not v or re.search(r'[$`*?]', v):
        return None
    parts = [p for p in re.split(r'[/:]', re.sub(r'\.git$', '', v.strip().rstrip('/'), flags=re.I)) if p]
    return '/'.join(parts[-2:]).lower() if len(parts) >= 2 else None

def remote_slug(d):
    r = subprocess.run(['git', '-C', d, 'remote', '-v'], capture_output=True, text=True)
    found = {slug(f[1]) for f in (l.split() for l in r.stdout.splitlines()) if len(f) >= 2} - {None}
    if r.returncode or not found:
        return None
    return WEBUI if WEBUI in found else sorted(found)[0]

heredoc = '<<' in cmd
lex = shlex.shlex(re.sub(r'\\\n', ' ', cmd).replace('\n', ' ; '), posix=True, punctuation_chars=';&|()<>')
lex.whitespace_split = True
dirs, cur, prs = [cwd], [], []

def run(c):
    env = {}
    while c and re.match(r'^[A-Za-z_]\w*=', c[0]):
        k, _, v = c.pop(0).partition('=')
        env[k] = v
    if not c:
        return
    if c[0] in ('cd', 'pushd'):
        arg = c[1] if len(c) > 1 else '~'
        base = dirs[-1]
        p = None if heredoc or base is None or re.search(r'[$`*?]', arg) or arg == '-' or len(c) > 2 \
            else os.path.normpath(os.path.join(base, os.path.expanduser(arg)))
        dirs[-1] = p if p and os.path.isdir(p) else None
    elif c[0] == 'gh' and c[1:3] in (['pr', 'create'], ['stack', 'submit']):
        repo = None
        for i, a in enumerate(c[3:], 3):
            if a in ('-R', '--repo'):
                repo = c[i + 1] if i + 1 < len(c) else ''
            elif a.startswith('--repo='):
                repo = a[7:]
            elif a.startswith('-R') and len(a) > 2:
                repo = a[2:]
        if repo is not None:
            prs.append((slug(repo), None))
        elif 'GH_REPO' in env:
            prs.append((slug(env['GH_REPO']), None))
        else:
            d = dirs[-1]
            prs.append((remote_slug(d) if d else None, d))

for t in lex:
    if t and set(t) <= set(';&|()<>'):
        run(cur)
        cur = []
        for ch in t:
            if ch == '(':
                dirs.append(dirs[-1])
            elif ch == ')' and len(dirs) > 1:
                dirs.pop()
    else:
        cur.append(t)
run(cur)

if prs and all(s and s != WEBUI for s, _ in prs):
    print('skip')
else:
    ds = {d for s, d in prs if s == WEBUI and d}
    print('check ' + (ds.pop() if len(ds) == 1 else ''))
PY
)
out=$(printf '%s' "$input" | python3 -c "$RESOLVE" 2>/dev/null) || out='check '
[ "$out" = skip ] && exit 0
record_of "${out#check }" || exit 0

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
