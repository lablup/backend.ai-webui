#!/usr/bin/env bash
# PreToolUse hook: refuse `gh pr create` / `gh stack submit` on lablup/backend.ai-webui
# until the e2e-flow skill (.claude/skills/e2e-flow/SKILL.md) has recorded the current HEAD.
# A PR command passes only when its target is known to be another repository; anything
# the resolver cannot settle (a heredoc, unparsable quoting, an unresolved cd) is checked.
# `require-e2e-flow.sh --record` writes that record; the skill calls it.
#
# Registered with `if` filters in .claude/settings.json, which are best-effort,
# so the command is checked again here (also inside `&&`, `;`, pipes, `$(…)`, backticks).
# A denial is JSON on stdout with exit 0; anything unexpected exits 0 silently
# so the hook never blocks unrelated work.

record_of() { # [dir] -> head, record path, branch
  { read -r head; read -r dir; read -r branch; } < <(git ${1:+-C "$1"} rev-parse HEAD --path-format=absolute --git-common-dir --abbrev-ref HEAD 2>/dev/null)
  [ -n "$branch" ] && record="$dir/e2e-flow/${branch//\//__}"
}

if [ "$1" = "--record" ]; then
  record_of || exit 0
  mkdir -p "${record%/*}" && printf '%s\n' "$head" > "$record" && echo "$record"
  exit
fi

# Prints `none` (no PR command), `skip` (every PR command targets another repository for certain)
# or `check <dir>` (the checkout whose record decides).
RESOLVE=$(cat <<'PY'
import json, os, re, shlex, subprocess, sys
WEBUI = 'lablup/backend.ai-webui'
inp = json.load(sys.stdin)
cmd = inp.get('tool_input', {}).get('command', '')
cwd = inp.get('cwd') or os.getcwd()
GATE = re.compile(r'(^|[;&|(`]|\$\()\s*(?:(?:env|command)\s+)?(?:[A-Za-z_]\w*=(?:"[^"]*"|\'[^\']*\'|\S*)\s+)*(?:\S*/)?gh\s+(?:pr\s+create|stack\s+submit)(?![\w-])', re.M)
# gh pr create flags that take a value: their value is never read as -R
VALUED = {'-t', '--title', '-b', '--body', '-F', '--body-file', '-B', '--base', '-H', '--head', '-a', '--assignee', '-l', '--label',
          '-m', '--milestone', '-p', '--project', '-r', '--reviewer', '-T', '--template', '--recover'}

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

def resolve():
    if '<<' in cmd:  # shlex cannot follow a heredoc body; never let its text decide
        return 'check ' + cwd
    text, n = re.sub(r'\\\n', ' ', cmd).replace('\n', ' ; '), 0
    while '`' in text:  # a backtick pair is a subshell
        text = text.replace('`', ' ( ' if n % 2 == 0 else ' ) ', 1)
        n += 1
    lex = shlex.shlex(text, posix=True, punctuation_chars=';&|()<>')
    lex.whitespace_split = True
    frames, cur, prs = [{'dir': cwd, 'stack': []}], [], []

    def run(c):
        env = {}
        while c and (re.match(r'^[A-Za-z_]\w*=', c[0]) or c[0] in ('env', 'command')):
            k, _, v = c.pop(0).partition('=')
            if _:
                env[k] = v
        if not c:
            return
        f = frames[-1]
        if c[0] in ('cd', 'pushd'):
            arg = c[1] if len(c) > 1 else '~'
            ok = f['dir'] is not None and len(c) <= 2 and arg != '-' and not re.search(r'[$`*?]', arg)
            p = os.path.normpath(os.path.join(f['dir'], os.path.expanduser(arg))) if ok else None
            if c[0] == 'pushd':
                f['stack'].append(f['dir'])
            f['dir'] = p if p and os.path.isdir(p) else None
        elif c[0] == 'popd':
            f['dir'] = f['stack'].pop() if f['stack'] else None
        elif re.match(r'^(\S*/)?gh$', c[0]) and c[1:3] in (['pr', 'create'], ['stack', 'submit']):
            args = c[3:]
            if '-h' in args or '--help' in args:
                return
            repo = None
            if c[1] == 'pr':  # gh stack submit has no --repo and ignores GH_REPO: only the checkout decides
                i = 0
                while i < len(args):
                    a = args[i]
                    if a == '--':
                        break
                    if a in ('-R', '--repo'):
                        repo = args[i + 1] if i + 1 < len(args) else ''
                        i += 2
                        continue
                    if a.startswith('--repo='):
                        repo = a[7:]
                    elif re.match(r'^-R.', a):
                        repo = a[2:]
                    elif a in VALUED:
                        i += 1
                    i += 1
                if repo is None and 'GH_REPO' in env:
                    repo = env['GH_REPO']
            if repo is not None:
                prs.append((slug(repo), None))
            else:
                d = f['dir']
                prs.append((remote_slug(d) if d else None, d))

    for t in lex:
        if t and set(t) <= set(';&|()<>'):
            run(cur)
            cur = []
            for ch in t:
                if ch == '(':
                    frames.append({'dir': frames[-1]['dir'], 'stack': list(frames[-1]['stack'])})
                elif ch == ')' and len(frames) > 1:
                    frames.pop()
        else:
            cur.append(t)
    run(cur)
    if not prs:
        return 'none'
    if all(s and s != WEBUI for s, _ in prs):
        return 'skip'
    ds = {d for s, d in prs if s == WEBUI and d}
    return 'check ' + (ds.pop() if len(ds) == 1 else cwd)

if not GATE.search(cmd):
    print('none')
else:
    try:
        print(resolve())
    except Exception:
        print('check ' + cwd)
PY
)
out=$(cat | python3 -c "$RESOLVE" 2>/dev/null) || exit 0
case "$out" in
  'check '*) record_of "${out#check }" || exit 0 ;;
  *) exit 0 ;;
esac

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
